import { useState, useEffect, useRef } from "react";
import DrRebira from "./DrRebira";

// ─── DR. REBIRA SYSTEM PROMPT ───
const DR_REBIRA_PROMPT = `You are Dr. Rebira, a warm and compassionate AI Healthcare Assistant designed for Canadian residents, with particular cultural sensitivity to Ethiopian and African diaspora communities.

Your core purpose: Provide safe, evidence-based health guidance aligned with Canadian healthcare standards, while encouraging appropriate care-seeking.

PERSONALITY & TONE:
- Warm, calm, and reassuring — never alarming
- Professional and evidence-based
- Culturally sensitive and inclusive
- Clear, plain language — avoid jargon unless explained
- Non-judgmental and stigma-free

CRITICAL SAFETY RULES:
1. NEVER give a definitive diagnosis
2. IMMEDIATELY escalate these emergencies — tell users to call 911 or go to the nearest ER:
   • Chest pain, pressure, or tightness
   • Difficulty breathing or shortness of breath
   • Stroke signs (face drooping, arm weakness, speech difficulty — FAST)
   • Severe allergic reaction (throat swelling, hives + breathing difficulty)
   • Overdose or poisoning
   • Suicidal thoughts or self-harm intentions
   • Loss of consciousness
   • Severe head injury
   • Uncontrolled bleeding
3. Avoid speculation beyond available evidence
4. Acknowledge uncertainty — say "I'm not certain" when appropriate
5. Maintain respectful, stigma-free language around mental health and sensitive topics

CANADIAN HEALTHCARE ALIGNMENT:
- Reference Health Canada and provincial health authority guidance
- Recommend provincial telehealth lines: 811 (most provinces), Telehealth Ontario: 1-866-797-0000
- Preventive screening: Pap tests every 3 years (ages 21–65), mammograms, colorectal screening starting age 50
- Canadian vaccination schedule (influenza annually, COVID boosters, shingles 50+, etc.)
- Walk-in clinics, family physicians, specialist referrals, and ER triage guidance

MENTAL HEALTH RESOURCES (Canada):
- Crisis Services Canada: 1-833-456-4566 (24/7)
- Kids Help Phone: 1-800-668-6868
- CAMH (Centre for Addiction and Mental Health)
- Wellness Together Canada: wellnesstogether.ca

CORE CAPABILITIES:
1. Symptom triage (non-diagnostic) — help users understand urgency and care pathway
2. Lab/imaging result explanation in plain language
3. Lifestyle coaching (sleep, nutrition, physical activity, stress management)
4. Care pathway guidance (when to choose family doctor vs walk-in vs ER)
5. Mental health support direction
6. Medical document summarization

RESPONSE STYLE:
- Concise and focused (2–5 sentences for simple questions, short paragraphs for complex ones)
- Use bullet points for lists of symptoms or steps
- Ask follow-up questions only when they meaningfully change your guidance

Always end every response with: "I'm here to help guide you, but this doesn't replace care from a licensed professional. If your symptoms worsen or you're unsure, it's best to seek medical attention."`;

// ─── EMERGENCY KEYWORDS ───
const EMERGENCY_KEYWORDS = [
  "chest pain","chest pressure","chest tightness","heart attack","cardiac arrest",
  "can't breathe","cannot breathe","not breathing","difficulty breathing","shortness of breath",
  "stroke","face drooping","arm weakness","slurred speech",
  "overdose","poisoning","unconscious","unresponsive","passed out",
  "severe allergic","anaphylaxis","throat swelling",
  "suicidal","want to die","kill myself","end my life","self-harm","hurt myself",
  "uncontrolled bleeding","severe bleeding","head injury"
];

// ─── LOCALIZATION ───
const L = {
  en: {
    app: "e-Genzeb", appAm: "e-ገንዘብ",
    tagline: "Your money, your way",
    taglineAm: "ገንዘብዎ፣ በእርስዎ መንገድ",
    balance: "Available Balance",
    send: "Send", save: "Save", book: "Book", call: "Call", shop: "Shop",
    deposit: "Deposit", remit: "Remit", payBill: "Pay Bill", request: "Request",
    quickSend: "Quick Send", seeAll: "See All", recentActivity: "Recent Activity",
    activity: "Activity", allTx: "All Transactions",
    analytics: "Analytics", thisWeek: "This Week", spending: "Spending", byCategory: "By Category",
    bills: "Bills & Payments", upcoming: "Upcoming", pay: "Pay",
    profile: "Profile", settings: "Settings",
    sendMoney: "Send Money", to: "To", amount: "Amount", note: "Note (optional)", whatsFor: "What's this for?",
    depositFunds: "Deposit Funds", requestMoney: "Request Money", from: "From", message: "Message", sendRequest: "Send Request",
    remitMoney: "Send to Ethiopia", youSend: "You Send (CAD)", theyReceive: "They Receive (ETB)",
    deliverTo: "Deliver To", recipient: "Recipient Name", phone: "Phone (+251)",
    rate: "Exchange Rate", fee: "Transfer Fee", total: "Total", confirm: "Confirm Transfer",
    kyc: "Verify Identity", kycTitle: "Identity Verification", kycSub: "Required to send & receive money",
    fullName: "Full Name", idType: "ID Type", idNumber: "ID Number",
    uploadFront: "Upload ID (Front)", uploadSelfie: "Take Selfie", submit: "Submit for Review",
    step: "Step", of: "of",
    online: "Online", offline: "Offline", pending: "Pending",
    language: "Language", verified: "Verified", unverified: "Not Verified", verifyNow: "Verify Now",
    namePhone: "Name or phone number",
    bankTransfer: "Bank Transfer", instant: "Instant", within30: "Within 30 mins", days13: "1-3 business days",
    selectMethod: "Select delivery method",
    kycStep1: "Personal Info", kycStep2: "Document Upload", kycStep3: "Selfie Verification",
    next: "Next", back: "Back", capture: "Capture Photo", chooseFile: "Choose File",
    fayda: "Fayda Digital ID", kebele: "Kebele ID", passport: "Passport",
    etDate: "Ethiopian Date",
    saveTitle: "Savings Goals", newGoal: "New Goal", goalName: "Goal Name", target: "Target Amount",
    saved: "Saved", createGoal: "Create Goal",
    bookTitle: "Book Services", flights: "Flights", hotels: "Hotels", bus: "Bus", events: "Events",
    callTitle: "Airtime & Bundles", topup: "Top Up", buyBundle: "Buy Bundle", phoneNum: "Phone Number",
    ethioTel: "Ethio Telecom", safaricom: "Safaricom ET",
    shopTitle: "Marketplace", comingSoon: "Coming Soon",
    partners: "Payment Partners",
    health: "Health",
    drRebiraDesc: "AI Healthcare Assistant · Canada",
    drRebiraOnline: "Online · Evidence-based",
    emergencyDetected: "Emergency symptoms detected — seek care immediately",
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-api...",
    connect: "Connect",
    connected: "Connected",
    setupTitle: "Connect Dr. Rebira",
    setupSub: "Enter your Anthropic API key to enable AI-powered health guidance.",
    chatPlaceholder: "Describe your symptoms or ask a health question...",
    sendMsg: "Send",
    disclaimer: "Not a substitute for professional medical care",
    suggested: "Suggested questions",
    thinking: "Dr. Rebira is thinking...",
    connError: "Connection error. Please check your API key and try again.",
    suggestions: [
      "I have a headache — what could it be?",
      "When should I go to the ER vs a walk-in?",
      "How do I find a family doctor in my province?",
      "What vaccines should I get as an adult in Canada?"
    ]
  },
  am: {
    app: "e-Genzeb", appAm: "e-ገንዘብ",
    tagline: "Your money, your way",
    taglineAm: "ገንዘብዎ፣ በእርስዎ መንገድ",
    balance: "ያለው ቀሪ ሂሳብ",
    send: "ላክ", save: "ቁጠብ", book: "ቦታ ያዝ", call: "ደውል", shop: "ግዛ",
    deposit: "አስቀምጥ", remit: "ላክ", payBill: "ክፈል", request: "ጠይቅ",
    quickSend: "ፈጣን ማስተላለፊያ", seeAll: "ሁሉንም ይመልከቱ", recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
    activity: "እንቅስቃሴ", allTx: "ሁሉም ግብይቶች",
    analytics: "ትንተና", thisWeek: "ይህ ሳምንት", spending: "ወጪ", byCategory: "በምድብ",
    bills: "ክፍያዎች", upcoming: "መጪ", pay: "ክፈል",
    profile: "መገለጫ", settings: "ቅንብሮች",
    sendMoney: "ገንዘብ ላክ", to: "ለ", amount: "መጠን", note: "ማስታወሻ (አማራጭ)", whatsFor: "ለምንድን ነው?",
    depositFunds: "ገንዘብ አስቀምጥ", requestMoney: "ገንዘብ ጠይቅ", from: "ከ", message: "መልእክት", sendRequest: "ጥያቄ ላክ",
    remitMoney: "ወደ ኢትዮጵያ ላክ", youSend: "የሚላኩት (CAD)", theyReceive: "የሚቀበሉት (ብር)",
    deliverTo: "ማድረሻ", recipient: "የተቀባይ ስም", phone: "ስልክ (+251)",
    rate: "የምንዛሬ ተመን", fee: "የማስተላለፊያ ክፍያ", total: "ጠቅላላ", confirm: "ያረጋግጡ",
    kyc: "ማንነት ያረጋግጡ", kycTitle: "የማንነት ማረጋገጫ", kycSub: "ገንዘብ ለመላክ እና ለመቀበል ያስፈልጋል",
    fullName: "ሙሉ ስም", idType: "የመታወቂያ ዓይነት", idNumber: "የመታወቂያ ቁጥር",
    uploadFront: "መታወቂያ ስቀል (ፊት)", uploadSelfie: "ሴልፊ ያንሱ", submit: "ለግምገማ አስገባ",
    step: "ደረጃ", of: "ከ",
    online: "ተገናኝቷል", offline: "ከመስመር ውጭ", pending: "በመጠባበቅ",
    language: "ቋንቋ", verified: "ተረጋግጧል", unverified: "አልተረጋገጠም", verifyNow: "አሁን ያረጋግጡ",
    namePhone: "ስም ወይም ስልክ ቁጥር",
    bankTransfer: "የባንክ ዝውውር", instant: "ወዲያውኑ", within30: "በ30 ደቂቃ ውስጥ", days13: "1-3 የስራ ቀናት",
    selectMethod: "የማድረሻ ዘዴ ይምረጡ",
    kycStep1: "የግል መረጃ", kycStep2: "ሰነድ ስቀላ", kycStep3: "የሴልፊ ማረጋገጫ",
    next: "ቀጥል", back: "ተመለስ", capture: "ፎቶ ያንሱ", chooseFile: "ፋይል ይምረጡ",
    fayda: "ፋይዳ ዲጂታል መታወቂያ", kebele: "የቀበሌ መታወቂያ", passport: "ፓስፖርት",
    etDate: "የኢትዮጵያ ቀን",
    saveTitle: "የቁጠባ ግቦች", newGoal: "አዲስ ግብ", goalName: "የግብ ስም", target: "የታለመ መጠን",
    saved: "የተቆጠበ", createGoal: "ግብ ፍጠር",
    bookTitle: "አገልግሎት ይያዙ", flights: "በረራዎች", hotels: "ሆቴሎች", bus: "አውቶቡስ", events: "ዝግጅቶች",
    callTitle: "ካርድ እና ባንድል", topup: "ሙላ", buyBundle: "ባንድል ግዛ", phoneNum: "ስልክ ቁጥር",
    ethioTel: "ኢትዮ ቴሌኮም", safaricom: "ሳፋሪኮም ኢት",
    shopTitle: "ገበያ", comingSoon: "በቅርቡ",
    partners: "የክፍያ አጋሮች",
    health: "ጤና",
    drRebiraDesc: "AI የጤና ረዳት · ካናዳ",
    drRebiraOnline: "ኦንላይን · ማስረጃ ላይ የተመሰረተ",
    emergencyDetected: "ድንገተኛ ምልክቶች ተገኝተዋል — አሁኑኑ ሕክምና ይፈልጉ",
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-api...",
    connect: "ተጀምር",
    connected: "ተገናኝቷል",
    setupTitle: "ዶ/ር ረቢራን ያገናኙ",
    setupSub: "AI-የጤና ምክር ለማግኘት Anthropic API ቁልፍዎን ያስገቡ።",
    chatPlaceholder: "ምልክቶችዎን ይናገሩ ወይም የጤና ጥያቄ ይጠይቁ...",
    sendMsg: "ላክ",
    disclaimer: "ሙያዊ የሕክምና ምክር ተተኪ አይደለም",
    suggested: "የሚጠቁሙ ጥያቄዎች",
    thinking: "ዶ/ር ረቢራ እያሰቡ ነው...",
    connError: "የግንኙነት ስህተት። API ቁልፍዎን ያረጋግጡ እና እንደገና ይሞክሩ።",
    suggestions: [
      "ራስ ምታት አለኝ — ምን ሊሆን ይችላል?",
      "መቼ ER መሄድ አለብኝ፣ Walk-in ሳይሆን?",
      "በክልሌ ሃኪም ቤት እንዴት አገኛለሁ?",
      "በካናዳ አዋቂ ሆኜ ምን ክትባቶች ልወስድ?"
    ]
  }
};

// Ethiopian calendar
function toEthiopian(d) {
  const jdn = Math.floor(d.getTime() / 86400000 + 2440587.5);
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const y = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const m = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  const months = ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];
  return `${months[m-1]} ${day}, ${y}`;
}
const ET_DATE = toEthiopian(new Date());
const CAD_ETB = 113.45;

const CONTACTS = [
  { id:1, n:"Abeba T.", a:"አበባ ጥ.", av:"አ", c:"#2D9CDB" },
  { id:2, n:"Dawit M.", a:"ዳዊት ም.", av:"ዳ", c:"#27AE60" },
  { id:3, n:"Meron K.", a:"ሜሮን ከ.", av:"ሜ", c:"#EB5757" },
  { id:4, n:"Yonas B.", a:"ዮናስ ብ.", av:"ዮ", c:"#F2994A" },
  { id:5, n:"Tigist A.", a:"ትግስት አ.", av:"ት", c:"#9B51E0" },
  { id:6, n:"Henok G.", a:"ሄኖክ ገ.", av:"ሄ", c:"#219653" },
];

const TXS = [
  { id:1,n:"Abeba T.",a:"አበባ ጥ.",t:"in",amt:4500,d:"Today",da:"ዛሬ",cat:"Transfer",ca:"ዝውውር" },
  { id:2,n:"DSTV",a:"DSTV",t:"out",amt:899,d:"Today",da:"ዛሬ",cat:"Entertainment",ca:"መዝናኛ" },
  { id:3,n:"Dawit M.",a:"ዳዊት ም.",t:"out",amt:2300,d:"Yesterday",da:"ትናንት",cat:"Transfer",ca:"ዝውውር" },
  { id:4,n:"Delivery",a:"ዴሊቨሪ",t:"out",amt:180,d:"Yesterday",da:"ትናንት",cat:"Food",ca:"ምግብ" },
  { id:5,n:"Salary",a:"ደመወዝ",t:"in",amt:45000,d:"Meskerem 25",da:"መስከረም 25",cat:"Deposit",ca:"ተቀማጭ" },
  { id:6,n:"Rent",a:"ኪራይ",t:"out",amt:12000,d:"Meskerem 25",da:"መስከረም 25",cat:"Bills",ca:"ክፍያ" },
  { id:7,n:"Meron K.",a:"ሜሮን ከ.",t:"in",amt:1500,d:"Meskerem 23",da:"መስከረም 23",cat:"Transfer",ca:"ዝውውር" },
  { id:8,n:"Ethio Telecom",a:"ኢትዮ ቴሌኮም",t:"out",amt:500,d:"Meskerem 20",da:"መስከረም 20",cat:"Bills",ca:"ክፍያ" },
];

const SPEND = [{l:"Mon",la:"ሰኞ",v:1200},{l:"Tue",la:"ማክ",v:3400},{l:"Wed",la:"ረቡ",v:2100},{l:"Thu",la:"ሐሙ",v:5600},{l:"Fri",la:"አርብ",v:4200},{l:"Sat",la:"ቅዳ",v:2400},{l:"Sun",la:"እሁ",v:900}];
const CATS = [{n:"Food",a:"ምግብ",amt:8500,p:32,c:"#EB5757"},{n:"Bills",a:"ክፍያ",amt:12500,p:38,c:"#2D9CDB"},{n:"Transfer",a:"ዝውውር",amt:2300,p:14,c:"#27AE60"},{n:"Entertainment",a:"መዝናኛ",amt:899,p:8,c:"#F2994A"},{n:"Other",a:"ሌላ",amt:2100,p:8,c:"#9B51E0"}];

const BILLS = [
  {n:"Ethio Telecom",a:"ኢትዮ ቴሌኮም",d:"Tikimt 5",da:"ጥቅምት 5",amt:500,ico:"📡"},
  {n:"EELPA Electric",a:"ኢ.ኤል.ፒ.ኤ",d:"Tikimt 10",da:"ጥቅምት 10",amt:890,ico:"⚡"},
  {n:"Water Utility",a:"ውሃ ባለሥልጣን",d:"Tikimt 12",da:"ጥቅምት 12",amt:245,ico:"💧"},
  {n:"DSTV",a:"DSTV",d:"Tikimt 15",da:"ጥቅምት 15",amt:899,ico:"📺"},
  {n:"Internet",a:"ኢንተርኔት",d:"Tikimt 20",da:"ጥቅምት 20",amt:1200,ico:"🌐"},
];

const SAVINGS = [
  {id:1,n:"Emergency Fund",a:"የድንገተኛ ፈንድ",target:50000,saved:32500,c:"#27AE60"},
  {id:2,n:"New Phone",a:"አዲስ ስልክ",target:25000,saved:8200,c:"#2D9CDB"},
  {id:3,n:"Wedding Gift",a:"የሰርግ ስጦታ",target:10000,saved:10000,c:"#F2994A"},
];

// ─── SVG TRIANGLE PATTERN ───
const TriBg = () => (
  <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.08,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="tri" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <polygon points="0,40 20,0 40,40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
        <polygon points="20,0 40,40 0,40" fill="currentColor" opacity="0.03"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tri)" />
  </svg>
);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  --bg:#0B1A0F; --bg2:#0F1F14; --card:#152A1A; --cardH:#1C3623; --elev:#1E3D28;
  --g1:#22C55E; --g2:#16A34A; --g3:#15803D; --gGlow:rgba(34,197,94,.22); --gSoft:rgba(34,197,94,.1);
  --blue:#3B82F6; --blueS:rgba(59,130,246,.12);
  --red:#EF4444; --redS:rgba(239,68,68,.12);
  --orange:#F59E0B; --orangeS:rgba(245,158,11,.12);
  --purple:#A855F7; --purpleS:rgba(168,85,247,.12);
  --teal:#10B981; --tealS:rgba(16,185,129,.12); --tealGlow:rgba(16,185,129,.25);
  --txt:#F0FDF4; --txt2:#86EFAC; --txt3:#4ADE80; --txtM:#2E7D46;
  --bdr:rgba(34,197,94,.1);
  --r:16px; --rs:10px;
  --font:'Outfit','Noto Sans Ethiopic',sans-serif; --mono:'IBM Plex Mono',monospace;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);font-family:var(--font);color:var(--txt);-webkit-font-smoothing:antialiased}
.shell{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}

.screen{position:relative;z-index:1;padding:0 0 100px;animation:fu .3s ease-out}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes si{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}

/* Status */
.sbar{display:flex;justify-content:space-between;align-items:center;padding:12px 16px 0;font-size:11px;color:var(--txt2)}
.sdot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px}
.sdot.on{background:var(--g1);box-shadow:0 0 6px var(--g1)}.sdot.off{background:var(--red);box-shadow:0 0 6px var(--red)}
.ltog{background:var(--card);border:1px solid var(--bdr);border-radius:16px;padding:2px 8px;font-size:10px;color:var(--txt2);cursor:pointer;font-family:var(--font);transition:all .2s}
.ltog:hover{background:var(--cardH);color:var(--txt)}

/* Logo area */
.logo-area{padding:16px 16px 0;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:baseline;gap:2px}
.logo-e{font-size:24px;font-weight:300;color:var(--g1);letter-spacing:-.02em}
.logo-dash{color:var(--g1);font-size:24px;font-weight:300;margin:0 1px}
.logo-am{font-family:'Noto Sans Ethiopic';font-size:22px;font-weight:700;color:var(--txt);letter-spacing:.02em}
.logo-r{display:flex;gap:6px}
.ibtn{width:36px;height:36px;border-radius:50%;background:var(--card);border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:var(--txt2);font-size:15px}
.ibtn:hover{background:var(--cardH);color:var(--txt);transform:scale(1.05)}

/* Balance card */
.balc{margin:16px 16px 20px;padding:22px 20px;background:linear-gradient(135deg,#0C2818 0%,#153D22 50%,#0D2E18 100%);border-radius:20px;border:1px solid rgba(34,197,94,.15);position:relative;overflow:hidden}
.balc::after{content:'';position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(34,197,94,.12) 0%,transparent 70%);pointer-events:none}
.bal-l{font-size:11px;color:var(--txt2);font-weight:500;text-transform:uppercase;letter-spacing:.04em}
.bal-a{font-family:var(--mono);font-size:32px;font-weight:500;margin:6px 0 3px;letter-spacing:-.02em;color:var(--txt)}
.bal-ch{font-size:11px;color:var(--g1);font-weight:500}
.bal-et{font-size:10px;color:var(--txtM);margin-top:6px}

/* 5-Feature Grid */
.feat5{display:flex;gap:0;padding:0 16px;margin-bottom:22px}
.f5btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 4px 12px;cursor:pointer;transition:all .2s;background:var(--card);border:1px solid var(--bdr);color:var(--txt);font-family:var(--font);position:relative;overflow:hidden}
.f5btn:first-child{border-radius:var(--r) 0 0 var(--r)}
.f5btn:last-child{border-radius:0 var(--r) var(--r) 0}
.f5btn:not(:last-child){border-right:none}
.f5btn:hover{background:var(--cardH);z-index:1}
.f5btn:active{transform:scale(.96)}
.f5ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#fff}
.f5btn span{font-size:10px;font-weight:600;color:var(--txt2);text-transform:uppercase;letter-spacing:.06em}

/* Secondary actions */
.sec-acts{display:flex;gap:8px;padding:0 16px;margin-bottom:22px}
.sabtn{flex:1;padding:10px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .2s;color:var(--txt);font-family:var(--font);font-size:12px;font-weight:500}
.sabtn:hover{background:var(--cardH);border-color:rgba(34,197,94,.2)}

/* Partners strip */
.pstrip{padding:0 16px;margin-bottom:22px}
.pstrip-t{font-size:10px;color:var(--txtM);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:8px}
.plogos{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.plogos::-webkit-scrollbar{display:none}
.plogo{height:32px;padding:4px 12px;background:rgba(255,255,255,.06);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--txt2);white-space:nowrap;border:1px solid var(--bdr);flex-shrink:0}

/* Section */
.sec{padding:0 16px;margin-bottom:22px}
.sec-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.sec-t{font-size:14px;font-weight:600}
.sec-lk{font-size:11px;color:var(--g1);cursor:pointer;border:none;background:none;font-family:var(--font);font-weight:500}
.crow{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.crow::-webkit-scrollbar{display:none}
.cchip{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;min-width:48px}
.cavt{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;color:#fff;transition:transform .2s;font-family:'Noto Sans Ethiopic',sans-serif}
.cchip:hover .cavt{transform:scale(1.1)}
.cchip>span{font-size:9px;color:var(--txt2);font-weight:500}

/* KYC banner */
.kycb{margin:0 16px 20px;padding:12px 14px;background:var(--orangeS);border:1px solid rgba(245,158,11,.2);border-radius:var(--rs);display:flex;align-items:center;gap:10px;cursor:pointer}
.kycb:hover{background:rgba(245,158,11,.15)}

/* Transactions */
.txl{padding:0 16px}
.txi{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr);cursor:pointer;transition:background .15s;border-radius:6px;margin:0 -6px;padding-left:6px;padding-right:6px}
.txi:hover{background:var(--card)}.txi:last-child{border-bottom:none}
.txic{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0}
.txic.i{background:var(--gSoft);color:var(--g1)}.txic.o{background:var(--redS);color:var(--red)}
.txd{flex:1;min-width:0}.txn{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txm{font-size:10px;color:var(--txtM);margin-top:1px}
.txa{font-family:var(--mono);font-size:12px;font-weight:500;text-align:right}.txa.i{color:var(--g1)}.txa.o{color:var(--txt)}

/* Chart */
.cht{margin:0 16px 14px;padding:14px;background:var(--card);border-radius:var(--r);border:1px solid var(--bdr)}
.bars{display:flex;align-items:flex-end;gap:5px;height:90px;margin-top:10px}
.barcol{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
.bar{width:100%;border-radius:4px;background:var(--gSoft);min-height:3px;transition:all .4s ease-out}
.bar.act{background:linear-gradient(180deg,var(--g1) 0%,rgba(34,197,94,.35) 100%);box-shadow:0 3px 8px var(--gGlow)}
.barlbl{font-size:8px;color:var(--txtM);font-weight:500}

.catrow{display:flex;align-items:center;gap:8px;padding:6px 0}
.catdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.catinfo{flex:1}.catn{font-size:11px;font-weight:500}
.catbg{height:3px;background:var(--elev);border-radius:2px;margin-top:4px;overflow:hidden}
.catfill{height:100%;border-radius:2px;transition:width .6s ease-out}
.catamt{font-family:var(--mono);font-size:11px;color:var(--txt2)}

/* Bills */
.bill{display:flex;align-items:center;gap:10px;padding:12px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);margin-bottom:8px;cursor:pointer;transition:all .2s}
.bill:hover{border-color:rgba(34,197,94,.2);background:var(--cardH)}
.billico{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--gSoft)}
.billinf{flex:1}.billn{font-size:12px;font-weight:600}.billd{font-size:10px;color:var(--txtM);margin-top:1px}
.billa{font-family:var(--mono);font-size:12px;font-weight:500}
.billpay{padding:4px 10px;background:var(--g2);border:none;border-radius:5px;color:#fff;font-size:10px;font-weight:600;cursor:pointer;font-family:var(--font);margin-top:2px;transition:all .15s}
.billpay:hover{filter:brightness(1.1)}

/* Savings */
.sgoal{padding:14px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);margin-bottom:8px}
.sgoal-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.sgoal-n{font-size:13px;font-weight:600}
.sgoal-pct{font-size:11px;font-weight:600;color:var(--g1)}
.sgoal-bar{height:6px;background:var(--elev);border-radius:3px;overflow:hidden}
.sgoal-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--g2),var(--g1));transition:width .6s ease-out}
.sgoal-info{display:flex;justify-content:space-between;font-size:10px;color:var(--txtM);margin-top:6px}

/* Service grid */
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px}
.sgrid-item{padding:20px 14px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all .2s;text-align:center}
.sgrid-item:hover{background:var(--cardH);border-color:rgba(34,197,94,.2);transform:translateY(-2px)}
.sgrid-ico{font-size:28px}
.sgrid-n{font-size:13px;font-weight:600}
.sgrid-d{font-size:10px;color:var(--txtM)}

/* Profile */
.profc{margin:0 16px 14px;padding:18px;background:var(--card);border-radius:var(--r);border:1px solid var(--bdr);display:flex;align-items:center;gap:12px}
.profavt{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--g2),var(--blue));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff}
.profinf h3{font-size:15px;font-weight:600}
.profinf p{font-size:11px;color:var(--txt2);margin-top:1px}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:8px;font-size:9px;font-weight:600;margin-top:3px}
.badge.v{background:var(--gSoft);color:var(--g1)}.badge.uv{background:var(--orangeS);color:var(--orange)}
.profm{padding:0 16px}
.profi{display:flex;align-items:center;gap:10px;padding:12px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);margin-bottom:6px;cursor:pointer;transition:all .2s}
.profi:hover{background:var(--cardH)}
.profi .pico{font-size:16px;width:28px;text-align:center}
.profi .ptxt{flex:1;font-size:12px;font-weight:500}
.profi .parr{color:var(--txtM);font-size:12px}

/* Modal */
.mov{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);z-index:100;display:flex;align-items:flex-end;justify-content:center;animation:fi .2s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.msh{width:100%;max-width:430px;background:var(--bg2);border-radius:18px 18px 0 0;padding:14px 18px 32px;animation:su .3s ease-out;max-height:85vh;overflow-y:auto}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mh{width:30px;height:3px;background:var(--txtM);border-radius:2px;margin:0 auto 14px}
.mt{font-size:17px;font-weight:700;margin-bottom:14px}

.ig{margin-bottom:12px}
.il{font-size:10px;color:var(--txt2);font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;display:block}
.inf{width:100%;padding:10px 12px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);color:var(--txt);font-family:var(--font);font-size:13px;outline:none;transition:border .2s}
.inf:focus{border-color:var(--g1)}
.inf.amtf{font-family:var(--mono);font-size:22px;text-align:center;padding:14px}

.sbtn{width:100%;padding:12px;background:var(--g2);border:none;border-radius:var(--rs);color:#fff;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:4px}
.sbtn:hover{filter:brightness(1.1);transform:translateY(-1px)}
.sbtn:active{transform:scale(.98)}
.sbtn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.sbtn.sec{background:var(--card);color:var(--txt)}

.dopt{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.doi{display:flex;align-items:center;gap:10px;padding:12px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);cursor:pointer;transition:all .2s;color:var(--txt);font-family:var(--font)}
.doi:hover{border-color:var(--g1);background:var(--cardH)}
.doi.sel{border-color:var(--g1);background:var(--gSoft)}
.doico{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:15px;background:var(--gSoft)}
.dotxt strong{display:block;font-size:12px;font-weight:600}
.dotxt span{font-size:10px;color:var(--txtM)}

.ratebox{background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);padding:10px 12px;margin-bottom:12px}
.rr{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}
.rr .rl{color:var(--txt2)}.rr .rv{font-family:var(--mono);font-weight:500}

.kycs{display:flex;gap:6px;margin-bottom:16px}
.kycs-s{flex:1;height:3px;border-radius:2px;background:var(--elev)}
.kycs-s.done{background:var(--g1)}.kycs-s.act{background:var(--blue)}
.kyc-up{width:100%;padding:28px 14px;border:2px dashed var(--bdr);border-radius:var(--rs);display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:all .2s;margin-bottom:12px;color:var(--txt2)}
.kyc-up:hover{border-color:var(--g1);color:var(--g1)}
.ido{display:flex;gap:6px;margin-bottom:12px}
.ido-i{flex:1;padding:8px 6px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);text-align:center;cursor:pointer;font-size:10px;font-weight:500;color:var(--txt2);transition:all .2s;font-family:var(--font)}
.ido-i:hover{border-color:var(--g1)}.ido-i.sel{border-color:var(--g1);background:var(--gSoft);color:var(--g1)}

.toast{position:fixed;top:52px;left:50%;transform:translateX(-50%);background:var(--g2);color:#fff;padding:8px 18px;border-radius:20px;font-size:12px;font-weight:600;z-index:200;animation:ti .3s ease-out,to .3s ease-in 1.7s forwards;box-shadow:0 5px 16px rgba(34,197,94,.3)}
@keyframes ti{from{opacity:0;transform:translateX(-50%) translateY(-14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes to{from{opacity:1}to{opacity:0;transform:translateX(-50%) translateY(-14px)}}

.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(15,31,20,.95);backdrop-filter:blur(14px);border-top:1px solid var(--bdr);display:flex;padding:5px 0 24px;z-index:50}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 0;cursor:pointer;border:none;background:none;font-family:var(--font);transition:all .2s;color:var(--txtM)}
.ni.act{color:var(--g1)}
.ni:hover{color:var(--txt2)}
.nico{font-size:18px}.nlbl{font-size:8px;font-weight:600;letter-spacing:.04em}
.ndot{width:3px;height:3px;border-radius:50%;background:var(--g1)}

/* ─── DR. REBIRA HEALTH CHAT ─── */
.health-screen{display:flex;flex-direction:column;height:calc(100vh - 68px);position:relative;z-index:1;animation:fu .3s ease-out}
.health-hdr{padding:10px 16px 8px;flex-shrink:0}
.health-brand{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#0A2D1E,#0D3D27);border-radius:var(--r);border:1px solid rgba(16,185,129,.2);position:relative;overflow:hidden;margin-bottom:8px}
.health-brand::after{content:'';position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:radial-gradient(circle,rgba(16,185,129,.15) 0%,transparent 70%);pointer-events:none}
.health-avt{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#059669,#10B981);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 0 14px var(--tealGlow)}
.health-inf{flex:1}
.health-inf h2{font-size:15px;font-weight:700;color:var(--txt)}
.health-inf p{font-size:10px;color:var(--txt2);margin-top:1px}
.health-st{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;background:rgba(16,185,129,.12);border-radius:8px;font-size:9px;font-weight:600;color:var(--teal);margin-top:3px}
.health-st::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--teal);box-shadow:0 0 5px var(--teal);flex-shrink:0}

.key-setup{padding:12px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);margin-bottom:8px;animation:fu .2s ease-out}
.key-setup h4{font-size:12px;font-weight:600;margin-bottom:3px}
.key-setup p{font-size:10px;color:var(--txt2);margin-bottom:8px;line-height:1.4}
.key-row{display:flex;gap:6px;align-items:center}
.key-inp{flex:1;padding:8px 10px;background:var(--bg);border:1px solid var(--bdr);border-radius:var(--rs);color:var(--txt);font-family:var(--mono);font-size:11px;outline:none;transition:border .2s;min-width:0}
.key-inp:focus{border-color:var(--teal)}
.key-btn{padding:8px 14px;background:#059669;border:none;border-radius:var(--rs);color:#fff;font-family:var(--font);font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0}
.key-btn:hover{filter:brightness(1.1)}
.key-btn:disabled{opacity:.4;cursor:not-allowed}

.emerg-banner{display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:var(--rs);margin-bottom:8px;animation:fu .3s ease-out}
.emerg-txt{flex:1;font-size:11px;color:var(--red);font-weight:500;line-height:1.4}
.emerg-btns{display:flex;gap:5px;flex-shrink:0}
.ecbtn{padding:5px 10px;border-radius:6px;border:none;font-family:var(--font);font-size:10px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;transition:all .15s}
.ecbtn.r{background:var(--red);color:#fff}
.ecbtn.t{background:var(--card);color:var(--txt2);border:1px solid var(--bdr)}

.chat-msgs{flex:1;overflow-y:auto;padding:4px 16px 10px;scrollbar-width:none}
.chat-msgs::-webkit-scrollbar{display:none}

.msg-row{display:flex;align-items:flex-end;gap:7px;margin-bottom:10px;animation:fu .25s ease-out}
.msg-row.u{flex-direction:row-reverse}
.msg-avt{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.msg-avt.dr{background:linear-gradient(135deg,#059669,#10B981)}
.msg-avt.u{background:var(--g2);font-size:10px;font-weight:700;color:#fff}
.msg-bbl{max-width:80%;padding:9px 12px;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.msg-bbl.dr{background:var(--card);border:1px solid var(--bdr);border-radius:12px 12px 12px 3px;color:var(--txt)}
.msg-bbl.u{background:var(--g2);border-radius:12px 12px 3px 12px;color:#fff}
.msg-bbl.loading{color:var(--txt2);font-size:20px;letter-spacing:4px;padding:6px 14px}
.msg-time{font-size:9px;color:var(--txtM);padding:0 2px;margin-top:2px}
.msg-time.u{text-align:right}

.sug-wrap{margin-bottom:10px}
.sug-lbl{font-size:10px;color:var(--txtM);text-transform:uppercase;letter-spacing:.05em;font-weight:600;margin-bottom:6px}
.sug-btn{display:block;width:100%;text-align:left;padding:8px 11px;background:var(--card);border:1px solid var(--bdr);border-radius:var(--rs);font-family:var(--font);font-size:11px;color:var(--txt2);cursor:pointer;margin-bottom:4px;transition:all .2s}
.sug-btn:hover{border-color:rgba(16,185,129,.4);color:var(--txt);background:var(--cardH)}

.chat-bar{flex-shrink:0;padding:8px 16px 10px;background:rgba(11,26,15,.96);backdrop-filter:blur(14px);border-top:1px solid var(--bdr)}
.chat-row{display:flex;gap:7px;align-items:flex-end}
.chat-ta{flex:1;padding:9px 12px;background:var(--card);border:1px solid var(--bdr);border-radius:14px;color:var(--txt);font-family:var(--font);font-size:12px;outline:none;resize:none;line-height:1.4;max-height:80px;overflow-y:auto;scrollbar-width:none}
.chat-ta:focus{border-color:rgba(16,185,129,.5)}
.chat-ta::placeholder{color:var(--txtM)}
.chat-send{width:34px;height:34px;background:#059669;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;transition:all .2s;flex-shrink:0;margin-bottom:1px}
.chat-send:hover{filter:brightness(1.1);transform:scale(1.05)}
.chat-send:disabled{opacity:.35;cursor:not-allowed;transform:none}
.chat-disc{text-align:center;font-size:9px;color:var(--txtM);margin-top:5px}
`;

export default function App() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [balance, setBalance] = useState(187450.75);
  const [online, setOnline] = useState(true);
  const [kycDone, setKycDone] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [depMethod, setDepMethod] = useState(null);
  const [depAmt, setDepAmt] = useState("");
  const [remitAmt, setRemitAmt] = useState("");
  const [remitTo, setRemitTo] = useState("");
  const [remitPhone, setRemitPhone] = useState("");
  const [remitMethod, setRemitMethod] = useState(null);
  const [kycStep, setKycStep] = useState(1);
  const [kycName, setKycName] = useState("");
  const [kycIdType, setKycIdType] = useState(null);
  const [kycIdNum, setKycIdNum] = useState("");
  const [topupAmt, setTopupAmt] = useState("");
  const [topupPhone, setTopupPhone] = useState("");
  const [topupProvider, setTopupProvider] = useState(null);

  // ─── DR. REBIRA STATE ───
  const [healthMode, setHealthMode] = useState("chat");
  const welcomeMsg = {
    role: "assistant",
    content: "Hello! I'm Dr. Rebira, your AI Healthcare Assistant focused on Canadian health guidance.\n\nI can help with symptom triage, understanding lab results, lifestyle coaching, and navigating the Canadian healthcare system.\n\nI'm here to help guide you, but this doesn't replace care from a licensed professional. If your symptoms worsen or you're unsure, it's best to seek medical attention.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
  const [healthMsgs, setHealthMsgs] = useState([welcomeMsg]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [drApiKey, setDrApiKey] = useState(() => {
    try { return sessionStorage.getItem("dr_rebira_key") || ""; } catch { return ""; }
  });
  const [keyInput, setKeyInput] = useState("");
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const chatRef = useRef(null);

  const t = L[lang]; const am = lang === "am";
  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const etb = n => `ብር ${n.toLocaleString("en-US",{minimumFractionDigits:2})}`;
  const resetM = () => { setSendTo(""); setSendAmt(""); setDepMethod(null); setDepAmt(""); setRemitAmt(""); setRemitTo(""); setRemitPhone(""); setRemitMethod(null); setKycStep(1); setKycName(""); setKycIdType(null); setKycIdNum(""); setTopupAmt(""); setTopupPhone(""); setTopupProvider(null); };
  const closeM = () => { setModal(null); resetM(); };
  const maxSp = Math.max(...SPEND.map(d => d.v));

  useEffect(() => { const iv = setInterval(() => setOnline(Math.random() > 0.06), 10000); return () => clearInterval(iv); }, []);

  // Auto-scroll chat on new messages
  useEffect(() => {
    if (chatRef.current && tab === "health") {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [healthMsgs, chatLoading, tab]);

  // ─── SEND HEALTH MESSAGE ───
  const sendHealthMessage = async text => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", content: trimmed, time: ts };
    const nextMsgs = [...healthMsgs, userMsg];
    setHealthMsgs(nextMsgs);
    setChatInput("");

    const lower = trimmed.toLowerCase();
    if (EMERGENCY_KEYWORDS.some(kw => lower.includes(kw))) setEmergency(true);

    if (!drApiKey) {
      setHealthMsgs(prev => [...prev, {
        role: "assistant",
        content: "Please connect your Anthropic API key first (tap ⚙️) to enable AI-powered responses.\n\nI'm here to help guide you, but this doesn't replace care from a licensed professional. If your symptoms worsen or you're unsure, it's best to seek medical attention.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      return;
    }

    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": drApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: DR_REBIRA_PROMPT,
          messages: nextMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm sorry, I couldn't process that. Please try again.";
      const replyLower = reply.toLowerCase();
      if (EMERGENCY_KEYWORDS.some(kw => replyLower.includes(kw))) setEmergency(true);
      setHealthMsgs(prev => [...prev, {
        role: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } catch {
      setHealthMsgs(prev => [...prev, {
        role: "assistant",
        content: t.connError,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const connectKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    try { sessionStorage.setItem("dr_rebira_key", k); } catch {}
    setDrApiKey(k);
    setShowKeySetup(false);
    showToast("Dr. Rebira connected!");
  };

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <TriBg />
        {toast && <div className="toast">✓ {toast}</div>}

        {/* STATUS */}
        <div className="sbar">
          <div><span className={`sdot ${online?"on":"off"}`}/>{online ? t.online : t.offline}{!online && <span style={{color:"var(--orange)",marginLeft:4,fontSize:9}}>• 2 {t.pending}</span>}</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:9,color:"var(--txtM)"}}>{ET_DATE}</span>
            <button className="ltog" onClick={() => setLang(l => l==="en"?"am":"en")}>{am?"EN":"አማ"}</button>
          </div>
        </div>

        {/* ===== HOME ===== */}
        {tab === "home" && (
          <div className="screen" key="home">
            <div className="logo-area">
              <div className="logo">
                <span className="logo-e">e</span>
                <span className="logo-dash">-</span>
                <span className="logo-am">ገንዘብ</span>
              </div>
              <div className="logo-r">
                <button className="ibtn">🔔</button>
                <button className="ibtn" onClick={() => setTab("profile")}>👤</button>
              </div>
            </div>

            <div className="balc">
              <div className="bal-l">{t.balance}</div>
              <div className="bal-a">{etb(balance)}</div>
              <div className="bal-ch">▲ 3.2% {am ? "ካለፈው ወር" : "from last month"}</div>
              <div className="bal-et">{ET_DATE}</div>
            </div>

            {/* 5 CORE FEATURES */}
            <div className="feat5">
              {[
                {k:"send",ico:"✈",bg:"linear-gradient(135deg,#2D9CDB,#3B82F6)",label:t.send},
                {k:"save",ico:"🐷",bg:"linear-gradient(135deg,#F59E0B,#F97316)",label:t.save},
                {k:"book",ico:"🎫",bg:"linear-gradient(135deg,#8B5CF6,#A855F7)",label:t.book},
                {k:"call",ico:"📞",bg:"linear-gradient(135deg,#EF4444,#F87171)",label:t.call},
                {k:"shop",ico:"🛒",bg:"linear-gradient(135deg,#22C55E,#16A34A)",label:t.shop},
              ].map(f => (
                <button key={f.k} className="f5btn" onClick={() => setModal(f.k === "send" ? "send" : f.k)}>
                  <div className="f5ico" style={{background:f.bg}}>{f.ico}</div>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="sec-acts">
              <button className="sabtn" onClick={() => setModal("deposit")}>↓ {t.deposit}</button>
              <button className="sabtn" onClick={() => setModal("remit")}>🌍 {t.remit}</button>
              <button className="sabtn" onClick={() => setTab("bills")}>📄 {t.payBill}</button>
            </div>

            {/* PARTNERS */}
            <div className="pstrip">
              <div className="pstrip-t">{t.partners}</div>
              <div className="plogos">
                {["telebirr","CBE Birr","M-PESA","Amole","HelloCash","E-Birr","Hibir Temari","EthioPay"].map(p => (
                  <div key={p} className="plogo">{p}</div>
                ))}
              </div>
            </div>

            {/* QUICK SEND */}
            <div className="sec">
              <div className="sec-h"><span className="sec-t">{t.quickSend}</span><button className="sec-lk">{t.seeAll}</button></div>
              <div className="crow">
                {CONTACTS.map(c => (
                  <div key={c.id} className="cchip" onClick={() => { setSendTo(am ? c.a : c.n); setModal("send"); }}>
                    <div className="cavt" style={{background:c.c}}>{c.av}</div>
                    <span>{(am ? c.a : c.n).split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* KYC BANNER */}
            {!kycDone && (
              <div className="kycb" onClick={() => setModal("kyc")}>
                <span style={{fontSize:18}}>🛡</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--orange)"}}>{t.kyc}</div>
                  <div style={{fontSize:10,color:"var(--txt2)",marginTop:1}}>{t.kycSub}</div>
                </div>
                <span style={{color:"var(--orange)",fontSize:13}}>→</span>
              </div>
            )}

            {/* RECENT */}
            <div className="txl">
              <div className="sec-h"><span className="sec-t">{t.recentActivity}</span><button className="sec-lk" onClick={() => setTab("activity")}>{t.seeAll}</button></div>
              {TXS.slice(0,5).map(tx => (
                <div key={tx.id} className="txi">
                  <div className={`txic ${tx.t === "in"?"i":"o"}`}>{tx.t==="in"?"↓":"↑"}</div>
                  <div className="txd">
                    <div className="txn">{am?tx.a:tx.n}</div>
                    <div className="txm">{am?tx.ca:tx.cat} · {am?tx.da:tx.d}</div>
                  </div>
                  <div className={`txa ${tx.t==="in"?"i":"o"}`}>{tx.t==="in"?"+":"−"}ብር {tx.amt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <div className="screen" key="act">
            <div style={{padding:"16px 16px 0"}}><div style={{fontSize:12,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".04em"}}>{t.allTx}</div><h1 style={{fontSize:20,fontWeight:700}}>{t.activity}</h1></div>
            <div className="txl" style={{marginTop:12}}>
              {TXS.map((tx,i) => (
                <div key={tx.id} className="txi" style={{animation:`si .3s ease-out ${i*.04}s backwards`}}>
                  <div className={`txic ${tx.t==="in"?"i":"o"}`}>{tx.t==="in"?"↓":"↑"}</div>
                  <div className="txd"><div className="txn">{am?tx.a:tx.n}</div><div className="txm">{am?tx.ca:tx.cat} · {am?tx.da:tx.d}</div></div>
                  <div className={`txa ${tx.t==="in"?"i":"o"}`}>{tx.t==="in"?"+":"−"}ብር {tx.amt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === "analytics" && (
          <div className="screen" key="ana">
            <div style={{padding:"16px 16px 0"}}><div style={{fontSize:12,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".04em"}}>{t.thisWeek}</div><h1 style={{fontSize:20,fontWeight:700}}>{t.analytics}</h1></div>
            <div className="cht" style={{marginTop:12}}>
              <div className="sec-h" style={{marginBottom:0}}><span className="sec-t">{t.spending}</span><span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--txt2)"}}>ብር 19,800</span></div>
              <div className="bars">{SPEND.map((d,i) => (<div key={d.l} className="barcol"><div className={`bar ${i===3?"act":""}`} style={{height:`${(d.v/maxSp)*100}%`}}/><span className="barlbl">{am?d.la:d.l}</span></div>))}</div>
            </div>
            <div style={{padding:"0 16px"}}>
              <div className="sec-h"><span className="sec-t">{t.byCategory}</span></div>
              {CATS.map(c => (<div key={c.n} className="catrow"><div className="catdot" style={{background:c.c}}/><div className="catinfo"><div className="catn">{am?c.a:c.n}</div><div className="catbg"><div className="catfill" style={{width:`${c.p}%`,background:c.c}}/></div></div><span className="catamt">ብር {c.amt.toLocaleString()}</span></div>))}
            </div>
          </div>
        )}

        {/* BILLS */}
        {tab === "bills" && (
          <div className="screen" key="bills">
            <div style={{padding:"16px 16px 0"}}><div style={{fontSize:12,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".04em"}}>{t.upcoming}</div><h1 style={{fontSize:20,fontWeight:700}}>{t.bills}</h1></div>
            <div style={{padding:"12px 16px 0"}}>
              {BILLS.map(b => (
                <div key={b.n} className="bill">
                  <div className="billico">{b.ico}</div>
                  <div className="billinf"><div className="billn">{am?b.a:b.n}</div><div className="billd">{am?b.da:b.d}</div></div>
                  <div style={{textAlign:"right"}}><div className="billa">ብር {b.amt.toLocaleString()}</div><button className="billpay" onClick={() => { setBalance(bl => bl - b.amt); showToast(`${am?b.a:b.n} — ብር ${b.amt.toLocaleString()}`); }}>{t.pay}</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div className="screen" key="prof">
            <div style={{padding:"16px 16px 0"}}><div style={{fontSize:12,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".04em"}}>{t.settings}</div><h1 style={{fontSize:20,fontWeight:700}}>{t.profile}</h1></div>
            <div className="profc" style={{marginTop:12}}>
              <div className="profavt">ዳ</div>
              <div className="profinf"><h3>Dav Nega</h3><p>+251 9XX XXX XXXX</p><div className={`badge ${kycDone?"v":"uv"}`}>{kycDone?`✓ ${t.verified}`:`⚠ ${t.unverified}`}</div></div>
            </div>
            <div className="profm">
              {!kycDone && <div className="profi" onClick={() => setModal("kyc")}><span className="pico">🛡</span><span className="ptxt" style={{color:"var(--orange)"}}>{t.verifyNow}</span><span className="parr">→</span></div>}
              <div className="profi" onClick={() => setLang(l => l==="en"?"am":"en")}><span className="pico">🌐</span><span className="ptxt">{t.language}: {am?"አማርኛ":"English"}</span><span className="parr">→</span></div>
              {[{i:"💳",t:am?"የተገናኙ ሂሳቦች":"Linked Accounts"},{i:"🔔",t:am?"ማሳወቂያዎች":"Notifications"},{i:"🔒",t:am?"ደህንነት":"Security"},{i:"📊",t:am?"የግብይት ገደቦች":"Transaction Limits"},{i:"❓",t:am?"እርዳታ":"Help & Support"}].map(x => (
                <div key={x.t} className="profi"><span className="pico">{x.i}</span><span className="ptxt">{x.t}</span><span className="parr">→</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ===== DR. REBIRA — HEALTH TAB ===== */}
        {tab === "health" && (
            <div className="health-screen" key="health">
              {/* sub-tab toggle */}
              <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--bdr)",background:"var(--bg2)",flexShrink:0}}>
                {[["chat","💬 " + (am ? "ቻት" : "Chat")],["os","🩺 " + (am ? "ጤና OS" : "Health OS")]].map(([id,lbl]) => (
                  <button key={id} onClick={() => setHealthMode(id)} style={{flex:1,border:"none",background:"none",cursor:"pointer",fontFamily:"var(--font)",padding:"9px 0",fontSize:12,fontWeight:600,color:healthMode===id?"var(--teal)":"var(--txtM)",borderBottom:healthMode===id?"2px solid var(--teal)":"2px solid transparent"}}>
                    {lbl}
                  </button>
                ))}
              </div>

              {/* CHAT MODE */}
              {healthMode === "chat" && <>
                {/* HEADER */}
                <div className="health-hdr">
                  <div className="health-brand">
                    <div className="health-avt">🩺</div>
                    <div className="health-inf">
                      <h2>Dr. Rebira</h2>
                      <p>{t.drRebiraDesc}</p>
                      <div className="health-st">{t.drRebiraOnline}</div>
                    </div>
                    <button
                      className="ibtn"
                      style={{marginLeft:"auto",flexShrink:0}}
                      onClick={() => setShowKeySetup(v => !v)}
                      title={t.setupTitle}
                    >⚙️</button>
                  </div>

                  {showKeySetup && (
                    <div className="key-setup">
                      <h4>{t.setupTitle}</h4>
                      <p>{t.setupSub}</p>
                      <div className="key-row">
                        <input
                          className="key-inp"
                          type="password"
                          placeholder={t.apiKeyPlaceholder}
                          value={keyInput}
                          onChange={e => setKeyInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && connectKey()}
                        />
                        <button className="key-btn" disabled={!keyInput.trim()} onClick={connectKey}>
                          {t.connect}
                        </button>
                      </div>
                      {drApiKey && <div style={{fontSize:9,color:"var(--teal)",marginTop:5}}>✓ {t.connected}</div>}
                    </div>
                  )}

                  {emergency && (
                    <div className="emerg-banner">
                      <span style={{fontSize:18,flexShrink:0}}>🚨</span>
                      <div className="emerg-txt">{t.emergencyDetected}</div>
                      <div className="emerg-btns">
                        <a href="tel:911" className="ecbtn r">911</a>
                        <a href="tel:811" className="ecbtn t">811</a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-msgs" ref={chatRef}>
                  {healthMsgs.length === 1 && (
                    <div className="sug-wrap">
                      <div className="sug-lbl">{t.suggested}</div>
                      {t.suggestions.map(q => (
                        <button key={q} className="sug-btn" onClick={() => sendHealthMessage(q)}>{q}</button>
                      ))}
                    </div>
                  )}
                  {healthMsgs.map((msg, i) => (
                    <div key={i} className={`msg-row ${msg.role === "user" ? "u" : ""}`}>
                      <div className={`msg-avt ${msg.role === "user" ? "u" : "dr"}`}>
                        {msg.role === "user" ? "U" : "🩺"}
                      </div>
                      <div>
                        <div className={`msg-bbl ${msg.role === "user" ? "u" : "dr"}`}>{msg.content}</div>
                        {msg.time && <div className={`msg-time ${msg.role === "user" ? "u" : ""}`}>{msg.time}</div>}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="msg-row">
                      <div className="msg-avt dr">🩺</div>
                      <div className="msg-bbl dr loading">···</div>
                    </div>
                  )}
                </div>

                <div className="chat-bar">
                  <div className="chat-row">
                    <textarea
                      className="chat-ta"
                      placeholder={t.chatPlaceholder}
                      value={chatInput}
                      rows={1}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendHealthMessage(chatInput); } }}
                    />
                    <button className="chat-send" disabled={!chatInput.trim() || chatLoading} onClick={() => sendHealthMessage(chatInput)}>↑</button>
                  </div>
                  <div className="chat-disc">{t.disclaimer}</div>
                </div>
              </>}

              {/* HEALTH OS MODE */}
              {healthMode === "os" && (
                <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <DrRebira
                    lang={lang}
                    apiKey={drApiKey}
                    onRequestKeySetup={() => setShowKeySetup(true)}
                  />
                </div>
              )}
            </div>
        )}

        {/* ===== MODALS ===== */}

        {/* SEND */}
        {modal === "send" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.sendMoney}</div>
            <div className="ig"><label className="il">{t.to}</label><input className="inf" placeholder={t.namePhone} value={sendTo} onChange={e=>setSendTo(e.target.value)}/></div>
            <div className="ig"><label className="il">{t.amount} (ብር)</label><input className="inf amtf" placeholder="ብር 0.00" type="number" value={sendAmt} onChange={e=>setSendAmt(e.target.value)}/></div>
            <div className="ig"><label className="il">{t.note}</label><input className="inf" placeholder={t.whatsFor}/></div>
            <button className="sbtn" disabled={!sendAmt||!sendTo} onClick={() => { setBalance(b=>b-parseFloat(sendAmt)); closeM(); showToast(`${etb(parseFloat(sendAmt))} sent`); }}>{t.send} {sendAmt?etb(parseFloat(sendAmt)):""}</button>
          </div></div>
        )}

        {/* DEPOSIT */}
        {modal === "deposit" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.depositFunds}</div>
            <div className="dopt">
              {[{k:"telebirr",i:"📱",l:"telebirr",s:t.instant},{k:"cbe",i:"🏦",l:"CBE Birr",s:t.instant},{k:"mpesa",i:"🟢",l:"M-PESA",s:t.instant},{k:"amole",i:"💳",l:"Amole",s:t.within30},{k:"hellocash",i:"📞",l:"HelloCash",s:t.instant},{k:"bank",i:"🏛",l:t.bankTransfer,s:t.days13}].map(o => (
                <button key={o.k} className={`doi ${depMethod===o.k?"sel":""}`} onClick={()=>setDepMethod(o.k)}>
                  <div className="doico">{o.i}</div><div className="dotxt"><strong>{o.l}</strong><span>{o.s}</span></div>
                </button>
              ))}
            </div>
            <div className="ig"><label className="il">{t.amount} (ብር)</label><input className="inf amtf" placeholder="ብር 0.00" type="number" value={depAmt} onChange={e=>setDepAmt(e.target.value)}/></div>
            <button className="sbtn" disabled={!depAmt||!depMethod} onClick={() => { setBalance(b=>b+parseFloat(depAmt)); closeM(); showToast(`${etb(parseFloat(depAmt))} deposited`); }}>{t.deposit}</button>
          </div></div>
        )}

        {/* REMIT */}
        {modal === "remit" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.remitMoney}</div>
            <div className="ig"><label className="il">{t.youSend}</label><input className="inf amtf" placeholder="CAD $0.00" type="number" value={remitAmt} onChange={e=>setRemitAmt(e.target.value)}/></div>
            {remitAmt && <div className="ratebox">
              <div className="rr"><span className="rl">{t.theyReceive}</span><span className="rv" style={{color:"var(--g1)"}}>ብር {(parseFloat(remitAmt||0)*CAD_ETB).toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>
              <div className="rr"><span className="rl">{t.rate}</span><span className="rv">1 CAD = {CAD_ETB} ETB</span></div>
              <div className="rr"><span className="rl">{t.fee}</span><span className="rv">CAD $3.99</span></div>
              <div style={{borderTop:"1px solid var(--bdr)",marginTop:4,paddingTop:4}}><div className="rr"><span className="rl" style={{fontWeight:600,color:"var(--txt)"}}>{t.total}</span><span className="rv">CAD ${(parseFloat(remitAmt||0)+3.99).toFixed(2)}</span></div></div>
            </div>}
            <div className="il" style={{marginBottom:6}}>{t.selectMethod}</div>
            <div className="dopt">
              {[{k:"telebirr",i:"📱",l:"telebirr"},{k:"mpesa",i:"🟢",l:"M-PESA"},{k:"bank",i:"🏦",l:am?"የባንክ ሂሳብ":"Bank Account"}].map(o => (
                <button key={o.k} className={`doi ${remitMethod===o.k?"sel":""}`} onClick={()=>setRemitMethod(o.k)}>
                  <div className="doico">{o.i}</div><div className="dotxt"><strong>{o.l}</strong></div>
                </button>
              ))}
            </div>
            <div className="ig"><label className="il">{t.recipient}</label><input className="inf" placeholder={am?"ሙሉ ስም":"Full name"} value={remitTo} onChange={e=>setRemitTo(e.target.value)}/></div>
            <div className="ig"><label className="il">{t.phone}</label><input className="inf" placeholder="+251 9XX XXX XXXX" value={remitPhone} onChange={e=>setRemitPhone(e.target.value)}/></div>
            <button className="sbtn" disabled={!remitAmt||!remitMethod||!remitTo} onClick={() => { closeM(); showToast(`CAD $${remitAmt} → ${etb(parseFloat(remitAmt)*CAD_ETB)}`); }}>{t.confirm}</button>
          </div></div>
        )}

        {/* SAVE */}
        {modal === "save" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.saveTitle}</div>
            {SAVINGS.map(s => {
              const pct = Math.round((s.saved/s.target)*100);
              return (
                <div key={s.id} className="sgoal">
                  <div className="sgoal-h"><span className="sgoal-n">{am?s.a:s.n}</span><span className="sgoal-pct">{pct}%</span></div>
                  <div className="sgoal-bar"><div className="sgoal-fill" style={{width:`${pct}%`}}/></div>
                  <div className="sgoal-info"><span>{t.saved}: ብር {s.saved.toLocaleString()}</span><span>{t.target}: ብር {s.target.toLocaleString()}</span></div>
                </div>
              );
            })}
            <button className="sbtn" style={{marginTop:8}} onClick={() => { closeM(); showToast(am?"አዲስ ግብ ተፈጥሯል!":"New goal created!"); }}>+ {t.createGoal}</button>
          </div></div>
        )}

        {/* BOOK */}
        {modal === "book" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.bookTitle}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{i:"✈️",n:t.flights,d:am?"ቀጥሎ በቅርቡ":"Coming soon"},{i:"🏨",n:t.hotels,d:am?"ቀጥሎ በቅርቡ":"Coming soon"},{i:"🚌",n:t.bus,d:am?"ቀጥሎ በቅርቡ":"Coming soon"},{i:"🎭",n:t.events,d:am?"ቀጥሎ በቅርቡ":"Coming soon"}].map(x => (
                <div key={x.n} className="sgrid-item" onClick={() => { closeM(); showToast(t.comingSoon); }}>
                  <div className="sgrid-ico">{x.i}</div><div className="sgrid-n">{x.n}</div><div className="sgrid-d">{x.d}</div>
                </div>
              ))}
            </div>
          </div></div>
        )}

        {/* CALL (Airtime) */}
        {modal === "call" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.callTitle}</div>
            <div className="il" style={{marginBottom:6}}>{am?"አገልግሎት ሰጪ":"Provider"}</div>
            <div className="dopt">
              {[{k:"ethio",i:"📡",l:t.ethioTel},{k:"safari",i:"🟢",l:t.safaricom}].map(o => (
                <button key={o.k} className={`doi ${topupProvider===o.k?"sel":""}`} onClick={()=>setTopupProvider(o.k)}>
                  <div className="doico">{o.i}</div><div className="dotxt"><strong>{o.l}</strong></div>
                </button>
              ))}
            </div>
            <div className="ig"><label className="il">{t.phoneNum}</label><input className="inf" placeholder="+251 9XX XXX XXXX" value={topupPhone} onChange={e=>setTopupPhone(e.target.value)}/></div>
            <div className="ig"><label className="il">{t.amount} (ብር)</label><input className="inf amtf" placeholder="ብር 0.00" type="number" value={topupAmt} onChange={e=>setTopupAmt(e.target.value)}/></div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[25,50,100,200,500,1000].map(v => (
                <button key={v} style={{padding:"6px 12px",background:topupAmt===String(v)?"var(--gSoft)":"var(--card)",border:`1px solid ${topupAmt===String(v)?"var(--g1)":"var(--bdr)"}`,borderRadius:6,color:topupAmt===String(v)?"var(--g1)":"var(--txt2)",fontFamily:"var(--mono)",fontSize:11,cursor:"pointer",fontWeight:500}} onClick={()=>setTopupAmt(String(v))}>ብር {v}</button>
              ))}
            </div>
            <button className="sbtn" disabled={!topupAmt||!topupPhone||!topupProvider} onClick={() => { setBalance(b=>b-parseFloat(topupAmt)); closeM(); showToast(`${etb(parseFloat(topupAmt))} ${t.topup}`); }}>{t.topup}</button>
          </div></div>
        )}

        {/* SHOP */}
        {modal === "shop" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.shopTitle}</div>
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--txtM)"}}>
              <div style={{fontSize:48,marginBottom:12}}>🛒</div>
              <div style={{fontSize:16,fontWeight:600,color:"var(--txt)",marginBottom:4}}>{t.comingSoon}</div>
              <div style={{fontSize:12}}>{am?"ገበያ በቅርቡ ይመጣል":"Marketplace launching soon"}</div>
            </div>
          </div></div>
        )}

        {/* KYC */}
        {modal === "kyc" && (
          <div className="mov" onClick={closeM}><div className="msh" onClick={e=>e.stopPropagation()}>
            <div className="mh"/><div className="mt">{t.kycTitle}</div>
            <div style={{fontSize:11,color:"var(--txt2)",marginBottom:12}}>{t.step} {kycStep} {t.of} 3 — {kycStep===1?t.kycStep1:kycStep===2?t.kycStep2:t.kycStep3}</div>
            <div className="kycs"><div className={`kycs-s ${kycStep>1?"done":kycStep===1?"act":""}`}/><div className={`kycs-s ${kycStep>2?"done":kycStep===2?"act":""}`}/><div className={`kycs-s ${kycStep===3?"act":""}`}/></div>
            {kycStep === 1 && <>
              <div className="ig"><label className="il">{t.fullName}</label><input className="inf" placeholder={am?"ዳዊት ነጋ":"Dawit Nega"} value={kycName} onChange={e=>setKycName(e.target.value)}/></div>
              <label className="il">{t.idType}</label>
              <div className="ido">{[{k:"fayda",l:t.fayda},{k:"kebele",l:t.kebele},{k:"passport",l:t.passport}].map(o => <button key={o.k} className={`ido-i ${kycIdType===o.k?"sel":""}`} onClick={()=>setKycIdType(o.k)}>{o.l}</button>)}</div>
              <div className="ig"><label className="il">{t.idNumber}</label><input className="inf" placeholder="FYD-XXXXXX" value={kycIdNum} onChange={e=>setKycIdNum(e.target.value)}/></div>
              <button className="sbtn" disabled={!kycName||!kycIdType||!kycIdNum} onClick={()=>setKycStep(2)}>{t.next} →</button>
            </>}
            {kycStep === 2 && <>
              <div className="kyc-up"><div style={{fontSize:24}}>📸</div><div style={{fontSize:12,fontWeight:500}}>{t.uploadFront}</div><div style={{fontSize:10}}>{t.chooseFile}</div></div>
              <div style={{display:"flex",gap:6}}><button className="sbtn sec" onClick={()=>setKycStep(1)}>← {t.back}</button><button className="sbtn" onClick={()=>setKycStep(3)}>{t.next} →</button></div>
            </>}
            {kycStep === 3 && <>
              <div className="kyc-up" style={{borderColor:"rgba(59,130,246,.3)"}}><div style={{fontSize:24}}>🤳</div><div style={{fontSize:12,fontWeight:500}}>{t.uploadSelfie}</div><div style={{fontSize:10}}>{t.capture}</div></div>
              <div style={{display:"flex",gap:6}}><button className="sbtn sec" onClick={()=>setKycStep(2)}>← {t.back}</button><button className="sbtn" onClick={()=>{setKycDone(true);closeM();showToast(am?"ማረጋገጫ ተልኳል!":"Verification submitted!")}}>{t.submit}</button></div>
            </>}
          </div></div>
        )}

        {/* NAV */}
        <div className="nav">
          {[
            {k:"home",    i:"🏠", l:am?"ዋና":"Home"},
            {k:"activity",i:"📋", l:t.activity},
            {k:"health",  i:"🩺", l:t.health},
            {k:"bills",   i:"📄", l:am?"ክፍያ":"Bills"},
            {k:"profile", i:"👤", l:t.profile},
          ].map(n => (
            <button key={n.k} className={`ni ${tab===n.k?"act":""}`} onClick={()=>setTab(n.k)}>
              <span className="nico">{n.i}</span><span className="nlbl">{n.l}</span>{tab===n.k && <div className="ndot"/>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
