import { useState } from "react";
import HakimOS from "./HakimOS.jsx";

const EMERGENCY_KEYWORDS = [
  "chest pain","chest pressure","heart attack","cardiac arrest",
  "can't breathe","cannot breathe","not breathing","difficulty breathing",
  "stroke","face drooping","arm weakness","slurred speech",
  "overdose","poisoning","unconscious","unresponsive",
  "suicidal","want to die","kill myself","end my life","self-harm",
  "uncontrolled bleeding","severe bleeding","anaphylaxis","throat swelling"
];

const css = `
  :root {
    --bg:#0B1A0F; --bg2:#0F2014; --card:#152A1A; --cardH:#1C3623;
    --teal:#10B981; --tealG:rgba(16,185,129,.18); --tealD:rgba(16,185,129,.08);
    --g1:#22C55E; --g2:#16A34A;
    --red:#EF4444; --orange:#F59E0B;
    --txt:#F0FDF4; --txt2:#86EFAC; --txtM:#2E7D46;
    --bdr:rgba(34,197,94,.1);
    --font:'Outfit','Noto Sans Ethiopic',sans-serif;
    --mono:'IBM Plex Mono',monospace;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:var(--bg);font-family:var(--font);color:var(--txt);-webkit-font-smoothing:antialiased}
  .hakim-shell{display:flex;flex-direction:column;height:100vh;max-width:500px;margin:0 auto;background:var(--bg);position:relative;overflow:hidden}

  /* header */
  .hk-hdr{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--bdr);flex-shrink:0;background:var(--bg2);z-index:10}
  .hk-logo{display:flex;align-items:baseline;gap:6px;flex:1}
  .hk-logo-en{font-size:22px;font-weight:700;color:var(--teal);letter-spacing:-.01em}
  .hk-logo-am{font-family:'Noto Sans Ethiopic';font-size:18px;font-weight:700;color:var(--txt2)}
  .hk-logo-sub{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--txtM);margin-left:2px}
  .hk-hbtn{width:32px;height:32px;border-radius:8px;background:var(--card);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--txt2);font-size:13px;transition:all .2s;font-family:var(--font)}
  .hk-hbtn:hover{background:var(--cardH);color:var(--txt)}
  .hk-online{display:inline-flex;align-items:center;gap:4px;font-size:9px;color:var(--teal);font-weight:600;letter-spacing:.05em}
  .hk-online::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--teal);box-shadow:0 0 5px var(--teal)}

  /* api key panel */
  .hk-key{padding:10px 14px;background:var(--card);border-bottom:1px solid var(--bdr);animation:hkFu .2s ease-out;flex-shrink:0}
  .hk-key h4{font-size:11px;font-weight:600;margin-bottom:2px;color:var(--txt)}
  .hk-key p{font-size:10px;color:var(--txt2);margin-bottom:7px;line-height:1.4}
  .hk-key-row{display:flex;gap:6px}
  .hk-key-inp{flex:1;padding:7px 10px;background:var(--bg);border:1px solid var(--bdr);border-radius:8px;color:var(--txt);font-family:var(--mono);font-size:11px;outline:none;min-width:0;transition:border .2s}
  .hk-key-inp:focus{border-color:var(--teal)}
  .hk-key-btn{padding:7px 13px;background:var(--teal);border:none;border-radius:8px;color:#0B1A0F;font-family:var(--font);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0}
  .hk-key-btn:hover{filter:brightness(1.08)}
  .hk-key-btn:disabled{opacity:.4;cursor:not-allowed}

  /* emergency */
  .hk-emerg{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(239,68,68,.1);border-bottom:1px solid rgba(239,68,68,.3);flex-shrink:0;animation:hkFu .3s ease-out}
  .hk-emerg-txt{flex:1;font-size:11px;color:var(--red);font-weight:500;line-height:1.4}
  .hk-emerg-btns{display:flex;gap:5px}
  .hk-ecbtn{padding:5px 10px;border-radius:6px;border:none;font-family:var(--font);font-size:10px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
  .hk-ecbtn.r{background:var(--red);color:#fff}
  .hk-ecbtn.t{background:var(--card);color:var(--txt2);border:1px solid var(--bdr)}

  /* toast */
  .hk-toast{position:fixed;top:52px;left:50%;transform:translateX(-50%);background:var(--teal);color:#0B1A0F;padding:7px 16px;border-radius:20px;font-size:11px;font-weight:700;z-index:200;animation:hkTi .3s ease-out,hkTo .3s ease-in 1.7s forwards;box-shadow:0 4px 14px var(--tealG);pointer-events:none}
  @keyframes hkFu{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes hkTi{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes hkTo{from{opacity:1}to{opacity:0;transform:translateX(-50%) translateY(-12px)}}
`;

export default function App() {
  const [lang, setLang] = useState("en");
  const [apiKey, setApiKey] = useState(() => { try { return sessionStorage.getItem("hakim_key") || ""; } catch { return ""; } });
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [toast, setToast] = useState(null);
  const am = lang === "am";

  function connectKey() {
    const k = keyInput.trim();
    if (!k) return;
    try { sessionStorage.setItem("hakim_key", k); } catch {}
    setApiKey(k);
    setShowKey(false);
    setToast(am ? "ሐኪም ተገናኝቷል!" : "Hakim connected!");
    setTimeout(() => setToast(null), 2200);
  }

  function handleEmergency(text) {
    const lower = (text || "").toLowerCase();
    if (EMERGENCY_KEYWORDS.some(kw => lower.includes(kw))) setEmergency(true);
  }

  return (
    <>
      <style>{css}</style>
      <div className="hakim-shell">
        {toast && <div className="hk-toast">✓ {toast}</div>}

        {/* HEADER */}
        <div className="hk-hdr">
          <div className="hk-logo">
            <span className="hk-logo-en">Hakim</span>
            <span className="hk-logo-am">ሐኪም</span>
            <span className="hk-logo-sub">Health OS</span>
          </div>
          <span className="hk-online">{am ? "ኦንላይን" : "Online"}</span>
          <button className="hk-hbtn" onClick={() => setShowKey(v => !v)} title="API key">⚙️</button>
          <button className="hk-hbtn" onClick={() => setLang(l => l === "en" ? "am" : "en")} style={{fontWeight:700,fontSize:11}}>
            {am ? "EN" : "አማ"}
          </button>
        </div>

        {/* API KEY PANEL */}
        {showKey && (
          <div className="hk-key">
            <h4>{am ? "Anthropic API ቁልፍ" : "Anthropic API Key"}</h4>
            <p>{am ? "AI ምክር ለማግኘት ቁልፍዎን ያስገቡ። በዚህ መሳሪያ ላይ ብቻ ይቀመጣል።" : "Enter your key to enable AI guidance. Stored on this device only."}</p>
            <div className="hk-key-row">
              <input
                className="hk-key-inp"
                type="password"
                placeholder="sk-ant-api..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && connectKey()}
              />
              <button className="hk-key-btn" disabled={!keyInput.trim()} onClick={connectKey}>
                {am ? "ተጀምር" : "Connect"}
              </button>
            </div>
            {apiKey && <div style={{fontSize:9,color:"var(--teal)",marginTop:5}}>✓ {am ? "ተገናኝቷል" : "Connected"}</div>}
          </div>
        )}

        {/* EMERGENCY BANNER */}
        {emergency && (
          <div className="hk-emerg">
            <span style={{fontSize:18,flexShrink:0}}>🚨</span>
            <div className="hk-emerg-txt">
              {am ? "ድንገተኛ ምልክቶች — አሁኑኑ ሕክምና ይፈልጉ" : "Emergency symptoms detected — seek care immediately"}
            </div>
            <div className="hk-emerg-btns">
              <a href="tel:911" className="hk-ecbtn r">911</a>
              <a href="tel:811" className="hk-ecbtn t">811</a>
            </div>
          </div>
        )}

        {/* MAIN HEALTH OS */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <HakimOS lang={lang} apiKey={apiKey} onEmergency={handleEmergency} />
        </div>
      </div>
    </>
  );
}
