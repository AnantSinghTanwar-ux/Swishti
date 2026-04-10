"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

// ─── Translation Dictionaries ───────────────────────────────────────────────

const translations = {
  en: {
    // Navbar
    home: "Home",
    reportSpot: "Report Spot",
    dashboard: "Dashboard",
    leaderboard: "Leaderboard",
    login: "Login",
    logout: "Logout",
    user: "User",

    // Home
    badge: "AI-Powered Civic Tech Platform",
    heroLine1: "Keep Your City",
    heroClean: "CLEAN",
    heroTogether: "TOGETHER",
    heroDesc: "Report garbage hotspots, track cleanup progress, and coordinate with volunteers — all in real time. Powered by AI severity detection and live dashboard analytics.",
    reportSpotBtn: "REPORT SPOT",
    viewReports: "VIEW REPORTS",
    liveStats: "LIVE PLATFORM STATS",
    totalReports: "Total Reports",
    inProgress: "In Progress",
    cleaned: "Cleaned",
    highSeverity: "High Severity",
    instantReporting: "Instant Reporting",
    instantReportingDesc: "Drop a pin or use GPS — submit a report in under 30 seconds with AI-assisted severity detection.",
    volunteerCoordination: "Volunteer Coordination",
    volunteerCoordinationDesc: "Claim spots for cleanup, track progress live, and mark areas as cleaned — all without page reloads.",
    smartDashboard: "Smart Dashboard",
    smartDashboardDesc: "Real-time analytics, mapped severity, and live activity feeds for complete civic awareness.",

    // Dashboard
    dashboardTitle: "DASHBOARD",
    dashboardSubtitle: "REAL-TIME GARBAGE HOTSPOT MONITORING & VOLUNTEER COORDINATION",
    liveMap: "LIVE MAP",
    reports: "REPORTS",
    reportDetails: "REPORT DETAILS",
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    activityHub: "ACTIVITY HUB",
    events: "EVENTS",
    topVolunteers: "TOP VOLUNTEERS",
    points: "pts",
    cleanups: "cleanups",
    activeVolunteers: "Active Volunteers",
    mostAffected: "Most Affected Area",

    // Report
    pickLocation: "Pick Location",
    pickLocationDesc: "Use your current GPS location or tap on the map to drop a pin.",
    useMyLocation: "Use My Location",
    autoDetectGPS: "Auto-detect via GPS",
    pickOnMap: "Pick on Map",
    clickToDropPin: "Click to drop a pin",
    change: "Change",
    uploadPhoto: "Upload Photo",
    uploadPhotoDesc: "Take a photo or upload an image of the garbage hotspot.",
    dropImageHere: "Drop image here or upload",
    imageFormat: "JPG, PNG, WebP — max 10MB",
    aiAnalyzing: "AI analyzing image...",
    imageUploaded: "IMAGE UPLOADED SUCCESSFULLY",
    uploadFailed: "UPLOAD FAILED — PLEASE TRY AGAIN",
    selectSeverity: "Select Severity",
    howSerious: "How serious is this garbage hotspot?",
    aiSuggests: "AI suggests",
    aiSuggested: "AI Suggested",
    back: "BACK",
    continue: "CONTINUE",
    submitReport: "SUBMIT REPORT",
    reportSubmitted: "REPORT SUBMITTED!",
    reportSubmittedDesc: "Your garbage hotspot report has been logged. Track its status on the dashboard.",
    viewDashboard: "VIEW DASHBOARD",
    reportAnother: "REPORT ANOTHER",

    // Severity levels
    severityLow: "Low",
    severityLowDesc: "Minor litter, small items",
    severityMedium: "Medium",
    severityMediumDesc: "Moderate waste, multiple items",
    severityHigh: "High",
    severityHighDesc: "Major dumping, hazardous waste",

    // Map Popup
    reported: "REPORTED",
    inProgressStatus: "IN PROGRESS",
    pendingProof: "PENDING PROOF",
    cleanedStatus: "CLEANED",
    claimForCleanup: "Claim for Cleanup",
    markCleaned: "Mark as Cleaned",
    uploadProof: "Upload Proof Photo",
    lockedToClaimer: "LOCKED TO CLAIMER",
    claimedBy: "CLAIMED",
    by: "BY",
    beforeImage: "Before",
    afterImage: "After",

    // Proof Modal
    proofTitle: "UPLOAD CLEANUP PROOF",
    proofDesc: "Upload an after-photo to verify this spot has been cleaned.",
    beforeLabel: "BEFORE",
    afterLabel: "AFTER",
    chooseFile: "Choose File or Drop",
    submitting: "SUBMITTING...",
    uploading: "UPLOADING...",
    submitProof: "SUBMIT PROOF",
    cancel: "CANCEL",

    // Leaderboard
    leaderboardTitle: "LEADERBOARD",
    rank: "RANK",
    volunteer: "VOLUNTEER",
    score: "SCORE",
    cleans: "CLEANS",
    noVolunteers: "No volunteers yet — be the first!",
    topCleaner: "Top Cleaner",
    risingStar: "Rising Star",

    // Login
    swishti: "Swishti",
    tagline: "Collaborating for a cleaner community",
    email: "Email",
    password: "Password",
    signIn: "SIGN IN",
    or: "OR",
    createAccount: "CREATE NEW ACCOUNT",

    // Alerts
    pleaseLogin: "Please login first",

    // Activity types
    actReportCreated: "New report submitted",
    actReportClaimed: "Report claimed for cleanup",
    actProofUploaded: "Cleanup proof uploaded",
    actReportCleaned: "Report marked as cleaned",

    // Language
    language: "EN",

    // Nearby duplicate detection
    nearbyDuplicateTitle: "Nearby hotspot already reported",
    nearbyDuplicateBody: "This area already has a reported garbage hotspot.",
    nearbyDuplicateCount: "Already reported {count} time(s) nearby",
    nearbyDuplicateNearest: "Nearest: {severity} • {distance}",
    nearbyDuplicateNonBlocking: "You can still submit if this is a different spot.",
  },

  ta: {
    // Navbar
    home: "முகப்பு",
    reportSpot: "புகார் செய்",
    dashboard: "டாஷ்போர்டு",
    leaderboard: "லீடர்போர்டு",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    user: "பயனர்",

    // Home
    badge: "AI-இயக்கும் குடிமக்கள் தொழில்நுட்ப தளம்",
    heroLine1: "உங்கள் நகரை",
    heroClean: "சுத்தமாக",
    heroTogether: "சேர்ந்து",
    heroDesc: "குப்பை நிலையங்களைப் புகாரளியுங்கள், சுத்தம் செய்யும் முன்னேற்றத்தைக் கண்காணியுங்கள், தொண்டர்களுடன் ஒருங்கிணையுங்கள் — அனைத்தும் நிகழ் நேரத்தில்.",
    reportSpotBtn: "புகார் செய்",
    viewReports: "அறிக்கைகள் பார்",
    liveStats: "நிகழ்நேர புள்ளிவிவரங்கள்",
    totalReports: "மொத்த புகார்கள்",
    inProgress: "நடப்பில்",
    cleaned: "சுத்தம் செய்யப்பட்டது",
    highSeverity: "அதிக தீவிரம்",
    instantReporting: "உடனடி புகார்",
    instantReportingDesc: "GPS பயன்படுத்தி 30 விநாடிகளில் புகாரளியுங்கள்.",
    volunteerCoordination: "தொண்டர் ஒருங்கிணைப்பு",
    volunteerCoordinationDesc: "சுத்தம் செய்ய இடங்களைக் கோருங்கள், நிகழ்நேரத்தில் கண்காணியுங்கள்.",
    smartDashboard: "ஸ்மார்ட் டாஷ்போர்டு",
    smartDashboardDesc: "நிகழ்நேர பகுப்பாய்வு, வரைபட தீவிரம் மற்றும் நிகழ்நேர செயல்பாட்டு ஊட்டம்.",

    // Dashboard
    dashboardTitle: "டாஷ்போர்டு",
    dashboardSubtitle: "நிகழ்நேர குப்பை கண்காணிப்பு & தொண்டர் ஒருங்கிணைப்பு",
    liveMap: "நிகழ்நேர வரைபடம்",
    reports: "அறிக்கைகள்",
    reportDetails: "அறிக்கை விவரங்கள்",
    low: "குறைவு",
    medium: "நடுத்தர",
    high: "அதிக",
    activityHub: "செயல்பாட்டு மையம்",
    events: "நிகழ்வுகள்",
    topVolunteers: "சிறந்த தொண்டர்கள்",
    points: "புள்ளிகள்",
    cleanups: "சுத்தம்",
    activeVolunteers: "செயலில் உள்ள தொண்டர்கள்",
    mostAffected: "அதிக பாதிப்பு பகுதி",

    // Report
    pickLocation: "இடத்தைத் தேர்வுசெய்",
    pickLocationDesc: "உங்கள் GPS இருப்பிடத்தைப் பயன்படுத்துங்கள் அல்லது வரைபடத்தில் குத்துங்கள்.",
    useMyLocation: "என் இருப்பிடம்",
    autoDetectGPS: "GPS மூலம் கண்டறி",
    pickOnMap: "வரைபடத்தில் தேர்வுசெய்",
    clickToDropPin: "குத்தீடு போட கிளிக் செய்யவும்",
    change: "மாற்று",
    uploadPhoto: "படம் பதிவேற்று",
    uploadPhotoDesc: "குப்பை இடத்தின் புகைப்படத்தை எடுங்கள் அல்லது பதிவேற்றுங்கள்.",
    dropImageHere: "படத்தை இங்கே போடுங்கள்",
    imageFormat: "JPG, PNG, WebP — அதிகபட்சம் 10MB",
    aiAnalyzing: "AI படத்தை பகுப்பாய்வு செய்கிறது...",
    imageUploaded: "படம் வெற்றிகரமாக பதிவேற்றப்பட்டது",
    uploadFailed: "பதிவேற்றம் தோல்வி — மீண்டும் முயற்சிக்கவும்",
    selectSeverity: "தீவிரத்தை தேர்வுசெய்",
    howSerious: "இந்த குப்பை எவ்வளவு தீவிரமானது?",
    aiSuggests: "AI பரிந்துரை",
    aiSuggested: "AI பரிந்துரைத்தது",
    back: "பின்",
    continue: "தொடர்",
    submitReport: "புகார் அனுப்பு",
    reportSubmitted: "புகார் சமர்ப்பிக்கப்பட்டது!",
    reportSubmittedDesc: "உங்கள் குப்பை புகார் பதிவு செய்யப்பட்டது. டாஷ்போர்டில் நிலையைக் கண்காணியுங்கள்.",
    viewDashboard: "டாஷ்போர்டு பார்",
    reportAnother: "மீண்டும் புகார் செய்",

    // Severity
    severityLow: "குறைவு",
    severityLowDesc: "சிறிய குப்பை",
    severityMedium: "நடுத்தர",
    severityMediumDesc: "பல பொருட்கள், மிதமான கழிவு",
    severityHigh: "அதிக",
    severityHighDesc: "பெரிய குப்பைக் கொட்டல்",

    // Map Popup
    reported: "புகாரளிக்கப்பட்டது",
    inProgressStatus: "நடப்பில்",
    pendingProof: "ஆதாரம் நிலுவை",
    cleanedStatus: "சுத்தம் செய்யப்பட்டது",
    claimForCleanup: "சுத்தம் செய்ய கோரு",
    markCleaned: "சுத்தம் செய்யப்பட்டது எனக் குறி",
    uploadProof: "ஆதார புகைப்படம் பதிவேற்று",
    lockedToClaimer: "கோரியவருக்கு மட்டும்",
    claimedBy: "கோரியவர்",
    by: "புகாரளித்தவர்",
    beforeImage: "முன்",
    afterImage: "பின்",

    // Proof Modal
    proofTitle: "சுத்தம் ஆதாரம் பதிவேற்று",
    proofDesc: "இந்த இடம் சுத்தம் செய்யப்பட்டதை உறுதிப்படுத்த புகைப்படம் பதிவேற்றுங்கள்.",
    beforeLabel: "முன்",
    afterLabel: "பின்",
    chooseFile: "கோப்பைத் தேர்வுசெய்",
    submitting: "சமர்ப்பிக்கிறது...",
    uploading: "பதிவேற்றுகிறது...",
    submitProof: "ஆதாரம் சமர்ப்பி",
    cancel: "ரத்துசெய்",

    // Leaderboard
    leaderboardTitle: "லீடர்போர்டு",
    rank: "தரவரிசை",
    volunteer: "தொண்டர்",
    score: "புள்ளிகள்",
    cleans: "சுத்தம்",
    noVolunteers: "இன்னும் தொண்டர்கள் இல்லை — முதல்வராக இருங்கள்!",
    topCleaner: "சிறந்த சுத்தமிடுபவர்",
    risingStar: "உயரும் நட்சத்திரம்",

    // Login
    swishti: "ஸ்விஷ்டி",
    tagline: "சுத்தமான சமூகத்திற்காக ஒன்றிணைவோம்",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    signIn: "உள்நுழை",
    or: "அல்லது",
    createAccount: "புதிய கணக்கு உருவாக்கு",

    // Alerts
    pleaseLogin: "முதலில் உள்நுழையவும்",

    // Activity types
    actReportCreated: "புதிய புகார் சமர்ப்பிக்கப்பட்டது",
    actReportClaimed: "சுத்தம் செய்ய புகார் கோரப்பட்டது",
    actProofUploaded: "சுத்தம் ஆதாரம் பதிவேற்றப்பட்டது",
    actReportCleaned: "புகார் சுத்தம் செய்யப்பட்டது",

    // Language
    language: "தமிழ்",

    // Nearby duplicate detection
    nearbyDuplicateTitle: "அருகில் ஏற்கனவே புகாரளிக்கப்பட்டுள்ளது",
    nearbyDuplicateBody: "இந்த பகுதியில் ஏற்கனவே ஒரு குப்பை நிலையம் புகாரளிக்கப்பட்டுள்ளது.",
    nearbyDuplicateCount: "இந்த பகுதியில் {count} முறை புகாரளிக்கப்பட்டது",
    nearbyDuplicateNearest: "அருகில்: {severity} • {distance}",
    nearbyDuplicateNonBlocking: "இது வேறு இடமாக இருந்தால் நீங்கள் இன்னும் சமர்ப்பிக்கலாம்.",
  },

  hi: {
    // Navbar
    home: "होम",
    reportSpot: "रिपोर्ट करें",
    dashboard: "डैशबोर्ड",
    leaderboard: "लीडरबोर्ड",
    login: "लॉगिन",
    logout: "लॉगआउट",
    user: "यूज़र",

    // Home
    badge: "AI-संचालित सिविक टेक प्लेटफॉर्म",
    heroLine1: "अपने शहर को",
    heroClean: "साफ़",
    heroTogether: "मिलकर",
    heroDesc:
      "कचरा हॉटस्पॉट रिपोर्ट करें, सफाई प्रगति ट्रैक करें, और स्वयंसेवकों के साथ समन्वय करें — सब कुछ रीयल-टाइम में। AI severity detection और लाइव डैशबोर्ड एनालिटिक्स के साथ।",
    reportSpotBtn: "रिपोर्ट करें",
    viewReports: "रिपोर्ट देखें",
    liveStats: "लाइव प्लेटफॉर्म आँकड़े",
    totalReports: "कुल रिपोर्ट",
    inProgress: "प्रगति में",
    cleaned: "साफ़ किया गया",
    highSeverity: "उच्च गंभीरता",
    instantReporting: "तुरंत रिपोर्टिंग",
    instantReportingDesc:
      "पिन ड्रॉप करें या GPS इस्तेमाल करें — AI सहायता के साथ 30 सेकंड में रिपोर्ट सबमिट करें।",
    volunteerCoordination: "स्वयंसेवक समन्वय",
    volunteerCoordinationDesc:
      "सफाई के लिए स्पॉट क्लेम करें, प्रगति लाइव देखें, और बिना रीलोड के साफ़ चिह्नित करें।",
    smartDashboard: "स्मार्ट डैशबोर्ड",
    smartDashboardDesc:
      "रीयल-टाइम एनालिटिक्स, severity मैपिंग, और लाइव एक्टिविटी फ़ीड।",

    // Dashboard
    dashboardTitle: "डैशबोर्ड",
    dashboardSubtitle: "रीयल-टाइम कचरा हॉटस्पॉट मॉनिटरिंग और स्वयंसेवक समन्वय",
    liveMap: "लाइव मैप",
    reports: "रिपोर्ट",
    reportDetails: "रिपोर्ट विवरण",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    activityHub: "एक्टिविटी हब",
    events: "इवेंट्स",
    topVolunteers: "टॉप स्वयंसेवक",
    points: "अंक",
    cleanups: "सफाई",
    activeVolunteers: "सक्रिय स्वयंसेवक",
    mostAffected: "सबसे प्रभावित क्षेत्र",

    // Report
    pickLocation: "लोकेशन चुनें",
    pickLocationDesc: "अपना GPS लोकेशन लें या मैप पर टैप करके पिन ड्रॉप करें।",
    useMyLocation: "मेरा लोकेशन",
    autoDetectGPS: "GPS से ऑटो-डिटेक्ट",
    pickOnMap: "मैप पर चुनें",
    clickToDropPin: "पिन डालने के लिए क्लिक करें",
    change: "बदलें",
    uploadPhoto: "फ़ोटो अपलोड करें",
    uploadPhotoDesc: "कचरा हॉटस्पॉट की फ़ोटो लें या अपलोड करें।",
    dropImageHere: "यहाँ इमेज ड्रॉप करें या अपलोड करें",
    imageFormat: "JPG, PNG, WebP — अधिकतम 10MB",
    aiAnalyzing: "AI इमेज का विश्लेषण कर रहा है...",
    imageUploaded: "इमेज सफलतापूर्वक अपलोड हुई",
    uploadFailed: "अपलोड विफल — कृपया फिर से कोशिश करें",
    selectSeverity: "गंभीरता चुनें",
    howSerious: "यह कचरा हॉटस्पॉट कितना गंभीर है?",
    aiSuggests: "AI सुझाव",
    aiSuggested: "AI द्वारा सुझाया गया",
    back: "पीछे",
    continue: "आगे",
    submitReport: "रिपोर्ट सबमिट करें",
    reportSubmitted: "रिपोर्ट सबमिट हो गई!",
    reportSubmittedDesc:
      "आपकी रिपोर्ट दर्ज हो गई है। डैशबोर्ड पर इसकी स्थिति ट्रैक करें।",
    viewDashboard: "डैशबोर्ड देखें",
    reportAnother: "नई रिपोर्ट करें",

    // Severity levels
    severityLow: "कम",
    severityLowDesc: "हल्का कचरा, कम आइटम",
    severityMedium: "मध्यम",
    severityMediumDesc: "मध्यम कचरा, कई आइटम",
    severityHigh: "उच्च",
    severityHighDesc: "बड़ा डंप, खतरनाक कचरा",

    // Map Popup
    reported: "रिपोर्टेड",
    inProgressStatus: "प्रगति में",
    pendingProof: "प्रूफ़ लंबित",
    cleanedStatus: "साफ़",
    claimForCleanup: "सफाई के लिए क्लेम",
    markCleaned: "साफ़ के रूप में चिह्नित करें",
    uploadProof: "प्रूफ़ फ़ोटो अपलोड करें",
    lockedToClaimer: "केवल क्लेमर",
    claimedBy: "क्लेम किया",
    by: "द्वारा",
    beforeImage: "पहले",
    afterImage: "बाद में",

    // Proof Modal
    proofTitle: "सफाई का प्रूफ़ अपलोड करें",
    proofDesc: "इस जगह के साफ़ होने की पुष्टि के लिए after-photo अपलोड करें।",
    beforeLabel: "पहले",
    afterLabel: "बाद में",
    chooseFile: "फ़ाइल चुनें या ड्रॉप करें",
    submitting: "सबमिट हो रहा है...",
    uploading: "अपलोड हो रहा है...",
    submitProof: "प्रूफ़ सबमिट करें",
    cancel: "रद्द करें",

    // Leaderboard
    leaderboardTitle: "लीडरबोर्ड",
    rank: "रैंक",
    volunteer: "स्वयंसेवक",
    score: "स्कोर",
    cleans: "सफाई",
    noVolunteers: "अभी कोई स्वयंसेवक नहीं — पहले बनें!",
    topCleaner: "टॉप क्लीनर",
    risingStar: "राइजिंग स्टार",

    // Login
    swishti: "Swishti",
    tagline: "स्वच्छ समुदाय के लिए साथ मिलकर",
    email: "ईमेल",
    password: "पासवर्ड",
    signIn: "साइन इन",
    or: "या",
    createAccount: "नया अकाउंट बनाएं",

    // Alerts
    pleaseLogin: "कृपया पहले लॉगिन करें",

    // Activity types
    actReportCreated: "नई रिपोर्ट सबमिट हुई",
    actReportClaimed: "रिपोर्ट सफाई के लिए क्लेम हुई",
    actProofUploaded: "सफाई प्रूफ़ अपलोड हुआ",
    actReportCleaned: "रिपोर्ट साफ़ के रूप में चिह्नित हुई",

    // Language
    language: "हिन्दी",

    // Nearby duplicate detection
    nearbyDuplicateTitle: "आसपास पहले से रिपोर्ट है",
    nearbyDuplicateBody: "इस क्षेत्र में पहले से एक कचरा हॉटस्पॉट रिपोर्टेड है।",
    nearbyDuplicateCount: "आसपास {count} बार रिपोर्टेड",
    nearbyDuplicateNearest: "सबसे नज़दीक: {severity} • {distance}",
    nearbyDuplicateNonBlocking: "अगर यह अलग जगह है तो आप फिर भी सबमिट कर सकते हैं।",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

// ─── Context ────────────────────────────────────────────────────────────────

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

// ─── Provider ───────────────────────────────────────────────────────────────
function persistLang(newLang: Language) {
  try {
    localStorage.setItem("swishti-lang", newLang);
  } catch {
    // ignore
  }

  // Keep a server-readable cookie so SSR and client agree on first render.
  // 1 year max-age.
  document.cookie = `swishti-lang=${newLang}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  const serverLang: Language = initialLang && translations[initialLang] ? initialLang : "en";
  const [lang, setLangState] = useState<Language>(serverLang);

  // Keep localStorage/cookie aligned with the server-provided language.
  useEffect(() => {
    persistLang(serverLang);
  }, [serverLang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    persistLang(newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[lang]?.[key] || translations.en[key] || key;
    };
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTranslation() {
  return useContext(I18nContext);
}
