"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type EntryKind = "Activity" | "Expense" | "Crop damage";
type Entry = {
  id: string;
  kind: EntryKind;
  text: string;
  amount?: number;
  createdAt: string;
  photoName?: string;
};
type SpeechRecognitionResultLike = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const LANGUAGES = [
  { label: "हिन्दी", value: "hi-IN", greeting: "नमस्ते! आज खेत में क्या काम हुआ?" },
  { label: "English", value: "en-IN", greeting: "Hello! What happened in your field today?" },
  { label: "ਪੰਜਾਬੀ", value: "pa-IN", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਖੇਤ ਵਿੱਚ ਕੀ ਕੰਮ ਹੋਇਆ?" },
  { label: "हरियाणवी (Hindi)", value: "hi-IN", greeting: "राम राम! आज खेत में के काम होया?" },
  { label: "मराठी", value: "mr-IN", greeting: "नमस्कार! आज शेतात काय काम झाले?" },
  { label: "বাংলা", value: "bn-IN", greeting: "নমস্কার! আজ জমিতে কী কাজ হয়েছে?" },
  { label: "ગુજરાતી", value: "gu-IN", greeting: "નમસ્તે! આજે ખેતરમાં શું કામ થયું?" },
  { label: "தமிழ்", value: "ta-IN", greeting: "வணக்கம்! இன்று வயலில் என்ன வேலை நடந்தது?" },
  { label: "తెలుగు", value: "te-IN", greeting: "నమస్కారం! ఈరోజు పొలంలో ఏ పని జరిగింది?" },
  { label: "ಕನ್ನಡ", value: "kn-IN", greeting: "ನಮಸ್ಕಾರ! ಇಂದು ಹೊಲದಲ್ಲಿ ಏನು ಕೆಲಸ ನಡೆಯಿತು?" },
  { label: "മലയാളം", value: "ml-IN", greeting: "നമസ്കാരം! ഇന്ന് കൃഷിയിടത്തിൽ എന്ത് ജോലിയാണ് നടന്നത്?" },
  { label: "ଓଡ଼ିଆ", value: "or-IN", greeting: "ନମସ୍କାର! ଆଜି ଜମିରେ କଣ କାମ ହେଲା?" },
  { label: "অসমীয়া", value: "as-IN", greeting: "নমস্কাৰ! আজি পথাৰত কি কাম হ'ল?" },
  { label: "اردو", value: "ur-IN", greeting: "السلام علیکم! آج کھیت میں کیا کام ہوا؟" },
];

const STORAGE_KEY = "khet-ka-saathi.entries.v1";

function guessKind(text: string): EntryKind {
  const value = text.toLowerCase();
  if (/damage|damaged|hail|storm|rain|कीड़ा|कीट|ओला|बारिश से खराब|नुकसान|फसल खराब|ਖਰਾਬ|ਨੁਕਸਾਨ/.test(value)) return "Crop damage";
  if (/₹|rupee|rupees|spent|paid|cost|expense|खर्च|रुपये|रुपए|दिए|भुगतान/.test(value)) return "Expense";
  return "Activity";
}

function extractAmount(text: string): number | undefined {
  const match = text.match(/(?:₹\s*)?(\d+(?:,\d{3})*(?:\.\d{1,2})?)(?:\s*(?:rupees?|rs\.?|रुपये|रुपए|रु))?/i);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : undefined;
}

export default function Home() {
  const [language, setLanguage] = useState("hi-IN");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("आप बोलकर अपनी खेती का रिकॉर्ड बना सकते हैं।");
  const [kind, setKind] = useState<EntryKind>("Activity");
  const [photoName, setPhotoName] = useState("");
  const [reportText, setReportText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = useMemo(
    () => LANGUAGES.find((item) => item.value === language) ?? LANGUAGES[0],
    [language]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved) as Entry[]);
    } catch {
      setStatus("Saved records could not be loaded in this browser.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      setStatus("Browser storage is full. Please remove an old photo/report and try again.");
    }
  }, [entries]);

  function speak(message: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setStatus("इस browser में voice typing उपलब्ध नहीं है। Chrome में खोलें या नीचे लिखकर रिकॉर्ड करें।");
      speak("Voice input is not available in this browser. Please type your record.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setDraft(transcript.trim());
    };
    recognition.onerror = (event) => {
      setListening(false);
      const message = event.error === "not-allowed"
        ? "माइक्रोफ़ोन की अनुमति नहीं मिली। Browser settings में microphone allow करें।"
        : "आवाज़ साफ़ नहीं सुनाई दी। कृपया फिर कोशिश करें या लिखकर बताएं।";
      setStatus(message);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setStatus("सुन रहा हूँ… अपनी बात पूरी करके रुकें।");
    } catch {
      setListening(false);
      setStatus("माइक्रोफ़ोन शुरू नहीं हो पाया। कृपया दोबारा कोशिश करें।");
    }
  }

  function saveDraft() {
    const clean = draft.trim();
    if (!clean) {
      setStatus("पहले अपनी बात बोलें या लिखें।");
      return;
    }
    const detectedKind = kind === "Activity" ? guessKind(clean) : kind;
    const amount = detectedKind === "Expense" ? extractAmount(clean) : undefined;
    const entry: Entry = {
      id: crypto.randomUUID(),
      kind: detectedKind,
      text: clean,
      amount,
      createdAt: new Date().toISOString(),
    };
    setEntries((current) => [entry, ...current]);
    setDraft("");
    setKind("Activity");
    const confirmation = language === "en-IN"
      ? "Your record has been saved."
      : "आपकी बात रिकॉर्ड में सेव कर दी गई है।";
    setStatus(confirmation);
    speak(confirmation);
  }

  function saveDamageReport() {
    if (!reportText.trim()) {
      setStatus("पहले फसल के नुकसान के बारे में बताएं।");
      return;
    }
    const entry: Entry = {
      id: crypto.randomUUID(),
      kind: "Crop damage",
      text: reportText.trim(),
      photoName: photoName || undefined,
      createdAt: new Date().toISOString(),
    };
    setEntries((current) => [entry, ...current]);
    setReportText("");
    setPhotoName("");
    setShowReport(false);
    setStatus("फसल नुकसान की जानकारी सेव कर दी गई है। यह रिकॉर्ड है, आधिकारिक बीमा दावा नहीं।");
    speak("फसल नुकसान की जानकारी सेव कर दी गई है।");
  }

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPhotoName(file.name);
  }

  const totalExpenses = entries
    .filter((entry) => entry.kind === "Expense" && typeof entry.amount === "number")
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Khet Ka Saathi home">
          <span className="brand-mark">🌾</span>
          <span><strong>खेत का साथी</strong><small>KHET KA SAATHI</small></span>
        </a>
        <div className="topbar-right"><span className="online-dot" /> आपका खेती साथी</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">आपकी खेती, आपकी भाषा, आपका साथी</span>
          <h1>खेती की हर बात,<br /><em>अब बोलकर लिखें।</em></h1>
          <p>खर्च, खेत के काम और फसल के नुकसान का रिकॉर्ड — एक आसान जगह पर।</p>
          <div className="language-picker">
            <label htmlFor="language">अपनी भाषा चुनें</label>
            <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {LANGUAGES.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="sun" /><div className="field field-one" /><div className="field field-two" /><div className="field field-three" /><span className="art-leaf">🌱</span></div>
      </section>

      <section className="content-grid">
        <div className="main-column">
          <section className="voice-card">
            <div className="section-heading">
              <div><span className="eyebrow">VOICE FARM DIARY</span><h2>आज खेत में क्या हुआ?</h2></div>
              <span className="mic-hint">🎙️ बोलकर बताएं</span>
            </div>
            <p className="prompt-line">{selectedLanguage.greeting}</p>
            <button className={listening ? "mic-button listening" : "mic-button"} onClick={startListening} aria-label={listening ? "Stop recording" : "Start voice recording"}>
              <span>{listening ? "■" : "🎙"}</span>
              <strong>{listening ? "सुनना बंद करें" : "बोलना शुरू करें"}</strong>
            </button>
            <div className="status-line" role="status">{status}</div>
            <label className="field-label" htmlFor="voice-draft">आपकी बात (सेव करने से पहले जांच लें)</label>
            <textarea id="voice-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="जैसे: आज गेहूं के खेत में पानी लगाया या खाद पर 500 रुपये खर्च हुए…" rows={3} />
            <div className="form-footer">
              <select aria-label="Record type" value={kind} onChange={(event) => setKind(event.target.value as EntryKind)}>
                <option>Activity</option><option>Expense</option><option>Crop damage</option>
              </select>
              <button className="primary-button" onClick={saveDraft}>रिकॉर्ड सेव करें <span>→</span></button>
            </div>
            <p className="privacy-note">सेव करने से पहले रिकॉर्ड जांचें। जानकारी इसी browser में सेव होती है।</p>
          </section>

          <section className="records-card">
            <div className="section-heading"><div><span className="eyebrow">YOUR FIELD HISTORY</span><h2>खेत की डायरी</h2></div><span className="count-pill">{entries.length} रिकॉर्ड</span></div>
            {entries.length === 0 ? (
              <div className="empty-state"><span>📒</span><strong>अभी कोई रिकॉर्ड नहीं है</strong><p>अपनी पहली खेती की बात बोलकर सेव करें।</p></div>
            ) : (
              <div className="entry-list">
                {entries.slice(0, 8).map((entry) => (
                  <article className="entry" key={entry.id}>
                    <div className="entry-icon">{entry.kind === "Expense" ? "₹" : entry.kind === "Crop damage" ? "🌧️" : "🌱"}</div>
                    <div className="entry-body"><div className="entry-meta"><strong>{entry.kind === "Expense" ? "खर्च" : entry.kind === "Crop damage" ? "फसल नुकसान" : "खेत का काम"}</strong><time>{new Date(entry.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div><p>{entry.text}</p>{entry.photoName && <small>📷 {entry.photoName}</small>}</div>
                    {entry.amount !== undefined && <strong className="entry-amount">₹{entry.amount.toLocaleString("en-IN")}</strong>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="side-column">
          <section className="stat-card"><span className="stat-icon">🧾</span><span className="eyebrow">RECORDED EXPENSES</span><strong className="stat-value">₹{totalExpenses.toLocaleString("en-IN")}</strong><p>सेव किए गए खर्चों का कुल योग</p></section>
          <section className="damage-card"><span className="eyebrow">CROP DAMAGE RECORD</span><h2>फसल को नुकसान हुआ?</h2><p>घटना का विवरण और फोटो जोड़कर अपने रिकॉर्ड में सुरक्षित रखें।</p><button className="secondary-button" onClick={() => setShowReport((value) => !value)}>{showReport ? "बंद करें" : "नुकसान दर्ज करें"} <span>→</span></button>
            {showReport && <div className="damage-form"><label className="field-label" htmlFor="damage-text">क्या हुआ?</label><textarea id="damage-text" rows={4} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="जैसे: कल रात ओले पड़े और गेहूं की फसल को नुकसान हुआ…" /><label className="upload-label"><input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhotoChange} />📷 {photoName || "फसल की फोटो चुनें"}</label><button className="primary-button full-width" onClick={saveDamageReport}>रिपोर्ट सेव करें</button></div>}
          </section>
          <section className="help-card"><span className="help-icon">💬</span><div><strong>आसान भाषा में बात करें</strong><p>बात साफ़ न सुनाई दे तो दोबारा बोलें या लिखकर बताएं। सेव करने से पहले हर रिकॉर्ड जांचें।</p></div></section>
          <section className="summary-card"><div className="summary-head"><strong>आज का सारांश</strong><span>इस browser में</span></div><div className="summary-row"><span>खेत के काम</span><strong>{entries.filter((entry) => entry.kind === "Activity").length}</strong></div><div className="summary-row"><span>खर्च के रिकॉर्ड</span><strong>{entries.filter((entry) => entry.kind === "Expense").length}</strong></div><div className="summary-row"><span>नुकसान रिपोर्ट</span><strong>{entries.filter((entry) => entry.kind === "Crop damage").length}</strong></div></section>
        </aside>
      </section>
      <footer className="footer"><span>🌾 खेत का साथी</span><span>आपके खेत का रिकॉर्ड, आपकी अपनी भाषा में।</span></footer>
    </main>
  );
}
