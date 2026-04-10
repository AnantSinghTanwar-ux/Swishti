"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { generateId } from "./utils";

function guessExtension(file: File): string {
  const nameExt = file.name.split(".").pop();
  if (nameExt && nameExt.length <= 5) return nameExt.toLowerCase();
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Upload an image to Firebase Storage and return a public download URL.
 * The returned URL is safe to store in Firestore for real-time sharing.
 */
export async function uploadImageToStorage(options: {
  file: File;
  folder: string; // e.g. 'reports/before' or `reports/${reportId}/after`
}): Promise<string> {
  const { file, folder } = options;
  const ext = guessExtension(file);
  const objectId = generateId();
  const storageRef = ref(storage, `${folder}/${Date.now()}-${objectId}.${ext}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "public,max-age=31536000",
  });

  return getDownloadURL(storageRef);
}
