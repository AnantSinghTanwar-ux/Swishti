import { Severity } from './types';

type MobilenetPrediction = {
  className: string;
  probability: number;
};

type MobilenetModel = {
  classify: (imageElement: HTMLImageElement, topK?: number) => Promise<MobilenetPrediction[]>;
  infer: (imageElement: HTMLImageElement, embedding?: boolean) => EmbeddingTensor;
};

type EmbeddingTensor = {
  dataSync: () => ArrayLike<number>;
  dispose: () => void;
};

export type ImageScreenResult = {
  blocked: boolean;
  reason?: string;
  similarity?: number;
};

// Waste-related ImageNet class keywords
const HIGH_SEVERITY_KEYWORDS = [
  'garbage', 'trash', 'waste', 'dump', 'landfill', 'junkyard',
  'dumpster', 'debris', 'pollution', 'sewer', 'swill',
];

const MEDIUM_SEVERITY_KEYWORDS = [
  'plastic bag', 'bottle', 'can', 'carton', 'container',
  'bucket', 'crate', 'basket', 'bag', 'packet',
  'cardboard', 'paper', 'box', 'wrapper',
];

const LOW_SEVERITY_KEYWORDS = [
  'cup', 'mug', 'plate', 'napkin', 'tissue',
  'straw', 'lid', 'cork', 'cap',
];

let modelPromise: Promise<MobilenetModel | null> | null = null;
const embeddingCache = new Map<string, Float32Array>();

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const mobilenet = await import('@tensorflow-models/mobilenet');
        await tf.ready();
        return (await mobilenet.load({ version: 2, alpha: 0.5 })) as unknown as MobilenetModel;
      } catch (e) {
        console.warn('AI Model failed to load, skipping severity suggestion:', e);
        return null;
      }
    })();
  }
  return modelPromise;
}

export async function suggestSeverity(imageElement: HTMLImageElement): Promise<Severity | null> {
  try {
    const model = await loadModel();
    if (!model) return null;

    const predictions = await model.classify(imageElement, 10);

    let score = 0;
    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      const confidence = pred.probability;

      for (const kw of HIGH_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 3;
      }
      for (const kw of MEDIUM_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 2;
      }
      for (const kw of LOW_SEVERITY_KEYWORDS) {
        if (className.includes(kw)) score += confidence * 1;
      }
    }

    if (score > 1.5) return 'high';
    if (score > 0.5) return 'medium';
    if (score > 0) return 'low';

    // Fallback heuristic: if many objects detected with high confidence, assume medium
    const totalConfidence = predictions.reduce((sum, p) => sum + p.probability, 0);
    if (totalConfidence > 3) return 'medium';
    if (totalConfidence > 1.5) return 'low';

    return null;
  } catch {
    return null;
  }
}

function cosineSimilarity(left: Float32Array, right: Float32Array): number {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index];
    const rightValue = right[index];
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  if (denominator === 0) return 0;
  return dot / denominator;
}

async function loadImageElement(sourceUrl: string): Promise<HTMLImageElement | null> {
  return await new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = sourceUrl;
  });
}

async function getEmbedding(imageElement: HTMLImageElement): Promise<Float32Array | null> {
  const model = await loadModel();
  if (!model) return null;

  const tensor = model.infer(imageElement, true);
  try {
    return Float32Array.from(tensor.dataSync());
  } finally {
    tensor.dispose();
  }
}

async function getCachedEmbedding(sourceUrl: string): Promise<Float32Array | null> {
  const cached = embeddingCache.get(sourceUrl);
  if (cached) return cached;

  const image = await loadImageElement(sourceUrl);
  if (!image) return null;

  const embedding = await getEmbedding(image);
  if (!embedding) return null;

  embeddingCache.set(sourceUrl, embedding);
  return embedding;
}

export async function screenImageForDuplicateOrCopiedContent(
  imageElement: HTMLImageElement,
  referenceImageUrls: string[]
): Promise<ImageScreenResult> {
  try {
    const model = await loadModel();
    if (!model) {
      return { blocked: false };
    }

    const targetEmbedding = await getEmbedding(imageElement);
    if (!targetEmbedding) {
      return { blocked: false };
    }

    let maxSimilarity = 0;
    for (const url of referenceImageUrls) {
      const referenceEmbedding = await getCachedEmbedding(url);
      if (!referenceEmbedding) continue;

      const similarity = cosineSimilarity(targetEmbedding, referenceEmbedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    // Strong duplicate / copied-image signal. This is a best-effort AI gate,
    // not a perfect anti-internet-image detector.
    if (maxSimilarity >= 0.965) {
      return {
        blocked: true,
        similarity: maxSimilarity,
        reason: "This image looks too similar to an existing hotspot image. Please use a different real-world photo.",
      };
    }

    return {
      blocked: false,
      similarity: maxSimilarity,
    };
  } catch {
    return { blocked: false };
  }
}

// Pre-warm the model on idle
export function preloadModel() {
  if (typeof window !== 'undefined') {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => {
        void loadModel();
      });
    } else {
      setTimeout(() => {
        void loadModel();
      }, 3000);
    }
  }
}
