import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ── palette matches e-Genzeb dark-green theme ──
const C = {
  INK:"#0B1A0F", PANEL:"#0F2014", PANEL2:"#152A1A", PANEL3:"#1C3623",
  PAPER:"#F0FDF4", GOLD:"#10B981", FAINT:"rgba(34,197,94,.12)",
  DIM:"#4ADE80", HI:"#F59E0B", LO:"#3B82F6", CRIT:"#EF4444", OK:"#22C55E",
  TEAL:"#10B981", MONO:"'IBM Plex Mono',monospace", SANS:"'Outfit','Noto Sans Ethiopic',sans-serif"
};
const SCORE = { green:"#22C55E", yellow:"#F59E0B", orange:"#F97316", red:"#EF4444", grey:"#4B5563" };
const DB_KEY = "dr_rebira_db_v1";

// ── LABS ──
const LABS = {
  total_chol:{name:"Total cholesterol",am:"ጠቅላላ ኮሌስትሮል",unit:"mmol/L",ref:[0,5.2],sys:"cardiovascular"},
  ldl:{name:"LDL cholesterol",am:"ኤልዲኤል",unit:"mmol/L",ref:[0,3.4],sys:"cardiovascular"},
  hdl:{name:"HDL cholesterol",am:"ኤችዲኤል",unit:"mmol/L",ref:[1.0,3.0],sys:"cardiovascular"},
  trig:{name:"Triglycerides",am:"ትራይግሊሰራይድ",unit:"mmol/L",ref:[0,1.7],sys:"cardiovascular"},
  hscrp:{name:"hs-CRP",am:"ኤችኤስ-ሲአርፒ",unit:"mg/L",ref:[0,3.0],sys:"cardiovascular"},
  troponin:{name:"Troponin T (hs)",am:"ትሮፖኒን ቲ",unit:"ng/L",ref:[0,14],sys:"cardiovascular"},
  bnp:{name:"NT-proBNP",am:"ኤንቲ-ፕሮ ቢኤንፒ",unit:"pg/mL",ref:[0,125],sys:"cardiovascular"},
  glucose:{name:"Fasting glucose",am:"የጾም የደም ስኳር",unit:"mmol/L",ref:[3.9,5.5],sys:"endocrine"},
  hba1c:{name:"HbA1c",am:"HbA1c",unit:"%",ref:[4.0,5.6],sys:"endocrine"},
  tsh:{name:"TSH",am:"ቲኤስኤች",unit:"mIU/L",ref:[0.4,4.0],sys:"endocrine"},
  ft4:{name:"Free T4",am:"ነጻ ቲ4",unit:"pmol/L",ref:[12,22],sys:"endocrine"},
  cortisol:{name:"Morning cortisol",am:"ኮርቲሶል",unit:"nmol/L",ref:[140,540],sys:"endocrine"},
  creatinine:{name:"Creatinine",am:"ክሬቲኒን",unit:"µmol/L",ref:[60,110],sys:"urinary"},
  egfr:{name:"eGFR",am:"eGFR",unit:"mL/min",ref:[90,200],sys:"urinary"},
  bun:{name:"Urea (BUN)",am:"ዩሪያ",unit:"mmol/L",ref:[2.5,7.1],sys:"urinary"},
  acr:{name:"Urine ACR",am:"ACR",unit:"mg/mmol",ref:[0,2.0],sys:"urinary"},
  potassium:{name:"Potassium",am:"ፖታስየም",unit:"mmol/L",ref:[3.5,5.1],sys:"urinary"},
  sodium:{name:"Sodium",am:"ሶዲየም",unit:"mmol/L",ref:[136,145],sys:"urinary"},
  hgb:{name:"Hemoglobin",am:"ሄሞግሎቢን",unit:"g/L",ref:[130,170],sys:"lymphatic"},
  wbc:{name:"White cells",am:"ነጭ ደም ሕዋሳት",unit:"x10⁹/L",ref:[4.0,11.0],sys:"lymphatic"},
  plt:{name:"Platelets",am:"ፕሌትሌትስ",unit:"x10⁹/L",ref:[150,400],sys:"lymphatic"},
  ferritin:{name:"Ferritin",am:"ፌሪቲን",unit:"µg/L",ref:[30,300],sys:"lymphatic"},
  alt:{name:"ALT",am:"ኤኤልቲ",unit:"U/L",ref:[0,41],sys:"digestive"},
  ast:{name:"AST",am:"ኤኤስቲ",unit:"U/L",ref:[0,40],sys:"digestive"},
  alp:{name:"ALP",am:"ኤኤልፒ",unit:"U/L",ref:[40,130],sys:"digestive"},
  bilirubin:{name:"Bilirubin",am:"ቢሊሩቢን",unit:"µmol/L",ref:[0,21],sys:"digestive"},
  albumin:{name:"Albumin",am:"አልቡሚን",unit:"g/L",ref:[35,50],sys:"digestive"},
  lipase:{name:"Lipase",am:"ሊፓዝ",unit:"U/L",ref:[0,60],sys:"digestive"},
  calcium:{name:"Calcium",am:"ካልሲየም",unit:"mmol/L",ref:[2.2,2.6],sys:"skeletal"},
  vitd:{name:"Vitamin D (25-OH)",am:"ቫይታሚን ዲ",unit:"nmol/L",ref:[75,200],sys:"skeletal"},
  ck:{name:"Creatine kinase",am:"ክሬቲን ካይኔዝ",unit:"U/L",ref:[30,200],sys:"muscular"},
  urate:{name:"Uric acid",am:"ዩሪክ አሲድ",unit:"µmol/L",ref:[200,430],sys:"muscular"},
  b12:{name:"Vitamin B12",am:"ቫይታሚን ቢ12",unit:"pmol/L",ref:[145,600],sys:"nervous"},
  testosterone:{name:"Testosterone",am:"ቴስቶስትሮን",unit:"nmol/L",ref:[8.0,29.0],sys:"reproductive"},
  psa:{name:"PSA",am:"ፒኤስኤ",unit:"µg/L",ref:[0,4.0],sys:"reproductive"},
};

const SYSTEMS = [
  {id:"nervous",name:"Nervous",am:"የነርቭ ሥርዓት",accent:"#E0C24B",pos:[100,40],brief:"Brain, cord, and nerves — senses, decides, and commands every other system.",briefAm:"አንጎል፣ ነርቮች - ሁሉንም ሥርዓቶች ያዛሉ።"},
  {id:"endocrine",name:"Endocrine",am:"የሆርሞን ሥርዓት",accent:"#9B59B6",pos:[100,72],brief:"Glands and hormones — regulates metabolism, growth, and mood.",briefAm:"እጢዎችና ሆርሞኖች - ሜታቦሊዝምን ይቆጣጠራሉ።"},
  {id:"respiratory",name:"Respiratory",am:"የመተንፈሻ ሥርዓት",accent:"#5FA8D3",pos:[62,100],brief:"Lungs and airways — moves oxygen in, carbon dioxide out.",briefAm:"ሳንባና አየር መተላለፊያ - ኦክስጅን ያስገባሉ።"},
  {id:"cardiovascular",name:"Cardiovascular",am:"የልብና ደም ሥርዓት",accent:"#E05A4A",pos:[100,104],brief:"Heart, vessels, and blood — delivers oxygen and clears waste.",briefAm:"ልብ፣ ደም ሥሮች - ኦክስጅን ያደርሳሉ።"},
  {id:"lymphatic",name:"Blood & Immune",am:"ደምና መከላከያ",accent:"#27AE83",pos:[140,104],brief:"Blood cells and immune system — oxygen transport and defence.",briefAm:"የደም ሕዋሳት፣ መከላከያ ሥርዓት።"},
  {id:"digestive",name:"Digestive",am:"የምግብ ሥርዓት",accent:"#D98C3F",pos:[100,140],brief:"Gut, liver, pancreas — breaks food into absorbable nutrients.",briefAm:"አንጀት፣ ጉበት፣ ቆሽት።"},
  {id:"urinary",name:"Renal & Urinary",am:"የኩላሊት ሥርዓት",accent:"#E0A93B",pos:[140,140],brief:"Kidneys and drainage — filters blood and balances salts.",briefAm:"ኩላሊትና ማስወገጃ።"},
  {id:"reproductive",name:"Reproductive",am:"የመራቢያ ሥርዓት",accent:"#D96BA0",pos:[100,196],brief:"Gonads and organs — hormonal health and fertility.",briefAm:"የመራቢያ አካላት።"},
  {id:"skeletal",name:"Skeletal",am:"የአጥንት ሥርዓት",accent:"#E6DCC3",pos:[60,196],brief:"Bones and joints — structure, minerals, and blood-cell factory.",briefAm:"አጥንቶች፣ መገጣጠሚያዎች።"},
  {id:"muscular",name:"Muscular",am:"የጡንቻ ሥርዓት",accent:"#C56A5C",pos:[60,150],brief:"Muscles converting energy into movement, posture, and heat.",briefAm:"ጡንቻዎች - እንቅስቃሴ፣ ቅርጽ።"},
  {id:"integumentary",name:"Integumentary",am:"የቆዳ ሥርዓት",accent:"#C99A6E",pos:[150,72],brief:"Skin, hair, nails — largest organ and first line of defence.",briefAm:"ቆዳ፣ ፀጉር፣ ጥፍር።"},
];

const EDGES = [
  {a:"nervous",b:"endocrine",rel:{en:"sleep and stress shift cortisol and insulin",am:"እንቅልፍና ጭንቀት ሆርሞኖችን ይቀይራሉ"}},
  {a:"endocrine",b:"cardiovascular",rel:{en:"metabolic stress drives vascular risk",am:"ሜታቦሊክ ጫና የደም ሥር ስጋት ይጨምራል"}},
  {a:"endocrine",b:"lymphatic",rel:{en:"thyroid and metabolism affect blood counts",am:"ታይሮይድ የደም ቆጠራን ይነካል"}},
  {a:"lymphatic",b:"cardiovascular",rel:{en:"inflammation accelerates artery plaque",am:"እብጠት ደም ሥር ንጣፍን ያፋጥናል"}},
  {a:"lymphatic",b:"nervous",rel:{en:"low iron causes fatigue and poor focus",am:"የብረት እጥረት ድካምና ትኩረት ማጣት ያስከትላል"}},
  {a:"digestive",b:"lymphatic",rel:{en:"gut health shapes immunity and absorption",am:"አንጀት ጤና መከላከያንና ምግብ መምጠጥን ይቀርጻል"}},
  {a:"digestive",b:"nervous",rel:{en:"the gut-brain axis links mood and digestion",am:"የአንጀት-አንጎል ዘንግ ስሜትንና መፍጨትን ያገናኛል"}},
  {a:"urinary",b:"cardiovascular",rel:{en:"kidney function and blood pressure move together",am:"የኩላሊት ሥራና ደም ግፊት አብረው ይንቀሳቀሳሉ"}},
  {a:"skeletal",b:"endocrine",rel:{en:"vitamin D and calcium are tied to hormones",am:"ቫይታሚን ዲና ካልሲየም ከሆርሞን ጋር ይተሳሰራሉ"}},
  {a:"cardiovascular",b:"respiratory",rel:{en:"heart and lungs share the oxygen task",am:"ልብና ሳንባ የኦክስጅን ሥራን ይጋራሉ"}},
  {a:"endocrine",b:"reproductive",rel:{en:"hormones govern reproductive function",am:"ሆርሞኖች የመራቢያ ሥራን ይመራሉ"}},
  {a:"muscular",b:"skeletal",rel:{en:"muscle and bone move and support together",am:"ጡንቻና አጥንት አብረው ይንቀሳቀሳሉ"}},
];

const SCREENINGS = [
  {id:"pap",name:"Pap test",am:"ፓፕ ምርመራ",sexes:["F"],minAge:25,maxAge:65,intervalYrs:3,desc:"Cervical cancer screening (every 3 years)",descAm:"የማህፀን ጫፍ ካንሰር ምርመራ"},
  {id:"mammo",name:"Mammogram",am:"ማሞግራፊ",sexes:["F"],minAge:50,maxAge:74,intervalYrs:2,desc:"Breast cancer screening (every 2 years)",descAm:"የጡት ካንሰር ምርመራ"},
  {id:"colon",name:"Colorectal screening (FIT)",am:"የቧንቧ ካንሰር",sexes:["M","F"],minAge:50,maxAge:74,intervalYrs:2,desc:"Bowel cancer screening (every 2 years)",descAm:"የቧንቧ ካንሰር ምርመራ"},
  {id:"bp",name:"Blood pressure check",am:"ደም ግፊት ምርመራ",sexes:["M","F"],minAge:18,maxAge:999,intervalYrs:1,desc:"Annual hypertension check",descAm:"ዓመታዊ ደም ግፊት ምርመራ"},
  {id:"diabetes",name:"Diabetes screen",am:"የስኳር ምርመራ",sexes:["M","F"],minAge:40,maxAge:999,intervalYrs:3,desc:"Fasting glucose or HbA1c (every 3 years)",descAm:"የጾም ደም ስኳር ወይም HbA1c"},
  {id:"chol",name:"Cholesterol (lipid panel)",am:"ኮሌስትሮል",sexes:["M","F"],minAge:40,maxAge:999,intervalYrs:5,desc:"Cardiovascular risk assessment",descAm:"የልብ ሥጋት ምርመራ"},
  {id:"dexa_f",name:"Bone density (DEXA)",am:"አጥንት ጥንካሬ",sexes:["F"],minAge:65,maxAge:999,intervalYrs:5,desc:"Osteoporosis screening for women 65+",descAm:"ለሴቶች 65+ የአጥንት ምርመራ"},
  {id:"dexa_m",name:"Bone density (DEXA)",am:"አጥንት ጥንካሬ",sexes:["M"],minAge:70,maxAge:999,intervalYrs:5,desc:"Osteoporosis screening for men 70+",descAm:"ለወንዶች 70+ የአጥንት ምርመራ"},
  {id:"flu",name:"Influenza vaccine",am:"ጉንፋን ክትባት",sexes:["M","F"],minAge:0,maxAge:999,intervalYrs:1,desc:"Annual flu shot (Health Canada)",descAm:"ዓመታዊ ጉንፋን ክትባት"},
  {id:"covid",name:"COVID booster",am:"ኮቪድ ክትባት",sexes:["M","F"],minAge:5,maxAge:999,intervalYrs:1,desc:"Per Health Canada current schedule",descAm:"በጤና ካናዳ መርሃ ግብር"},
  {id:"shingles",name:"Shingles vaccine (Shingrix)",am:"ሽንግልስ ክትባት",sexes:["M","F"],minAge:50,maxAge:999,intervalYrs:999,desc:"Two doses; recommended 50+ in Canada",descAm:"ከ50 ዓመት በላይ ሁለት ዶዝ"},
  {id:"colorectal50",name:"Colonoscopy",am:"ኮሎኖስኮፒ",sexes:["M","F"],minAge:50,maxAge:75,intervalYrs:10,desc:"Every 10 years or per physician",descAm:"በ10 ዓመት አንዴ ወይም በሐኪም ምክር"},
];

const INTAKE = [
  {id:"sleep",q:{en:"Sleep quality (1 poor – 5 excellent)",am:"የእንቅልፍ ጥራት"}},
  {id:"stress",q:{en:"Stress level (1 low – 5 very high)",am:"የጭንቀት ደረጃ"}},
  {id:"nutrition",q:{en:"Nutrition quality (1 poor – 5 excellent)",am:"የአመጋገብ ጥራት"}},
  {id:"activity",q:{en:"Physical activity (1 none – 5 very active)",am:"የአካል እንቅስቃሴ"}},
];

const CHILD_DOMAINS = [
  {id:"speech",label:{en:"Speech & language",am:"ንግግርና ቋንቋ"}},
  {id:"hearing",label:{en:"Hearing & listening",am:"መስማትና ማዳመጥ"}},
  {id:"social",label:{en:"Social & emotional",am:"ማህበራዊና ስሜታዊ"}},
  {id:"motor",label:{en:"Motor & coordination",am:"እንቅስቃሴና ቅንጅት"}},
  {id:"attention",label:{en:"Attention & focus",am:"ትኩረት"}},
  {id:"sleepc",label:{en:"Sleep",am:"እንቅልፍ"}},
  {id:"learning",label:{en:"Learning & play",am:"መማርና ጨዋታ"}},
  {id:"sensory",label:{en:"Sensory responses",am:"የስሜት ምላሽ"}},
];

const STATUS_KEY = {normal:{en:"normal",am:"መደበኛ"},low:{en:"low",am:"ዝቅተኛ"},high:{en:"high",am:"ከፍተኛ"},"crit-lo":{en:"critical low",am:"አደገኛ ዝቅተኛ"},"crit-hi":{en:"critical high",am:"አደገኛ ከፍተኛ"},na:{en:"—",am:"—"}};
const SCORE_LABEL = {green:{en:"Stable",am:"የተረጋጋ"},yellow:{en:"Watch",am:"ክትትል"},orange:{en:"Concern",am:"ስጋት"},red:{en:"Urgent",am:"አስቸኳይ"},grey:{en:"No data",am:"መረጃ የለም"}};

// ── helpers ──
function statusOf(id,v){const L=LABS[id];if(!L||v==null)return"na";const[lo,hi]=L.ref;if(v<lo)return v<lo*0.7?"crit-lo":"low";if(v>hi)return v>hi*1.6?"crit-hi":"high";return"normal";}
const latest=s=>s&&s.length?s[s.length-1].v:null;
const trendArrow=s=>!s||s.length<2?"":s[s.length-1].v>s[0].v?"↑":s[s.length-1].v<s[0].v?"↓":"→";
const worsening=(id,s)=>{if(!s||s.length<2)return false;const a=statusOf(id,s[0].v),b=statusOf(id,s[s.length-1].v);const rank={normal:0,low:1,high:1,"crit-lo":2,"crit-hi":2,na:0};return rank[b]>rank[a];};
function labsForSystem(s){return Object.entries(LABS).filter(([,L])=>L.sys===s).map(([id,L])=>({id,...L}));}
const clone=o=>JSON.parse(JSON.stringify(o));

function scoreSystem(patient,sysId){
  const rows=labsForSystem(sysId).map(L=>{const ser=patient.labs?.[L.id];const v=latest(ser);return{id:L.id,v,st:statusOf(L.id,v),worse:worsening(L.id,ser)};}).filter(r=>r.v!=null);
  const imgs=(patient.imaging||[]).filter(i=>i.sys===sysId);
  let crit=0,abn=0,worse=0;
  rows.forEach(r=>{if(r.st==="crit-lo"||r.st==="crit-hi")crit++;else if(r.st!=="normal")abn++;if(r.worse)worse++;});
  if(patient.intake){const k=patient.intake;
    if(sysId==="nervous"){if((k.sleep||5)<=2)abn++;if((k.stress||1)>=4)abn++;}
    if(sysId==="endocrine"){if((k.nutrition||5)<=2)abn++;if((k.activity||5)<=2)abn++;}}
  if(rows.length===0&&imgs.length===0)return{level:"grey",abn:0,crit:0,worse,imgN:0,measured:0};
  let level="green";
  if(crit>0)level="red";
  else if(abn>=3||(abn>=2&&worse>0))level="orange";
  else if(abn>=1)level=(abn>=2||worse>0)?"orange":"yellow";
  return{level,abn,crit,worse,imgN:imgs.length,measured:rows.length};
}
function overallScore(patient){
  const levels=SYSTEMS.map(s=>scoreSystem(patient,s.id).level);
  if(levels.includes("red"))return"red";
  if(levels.filter(l=>l==="orange").length>0)return"orange";
  if(levels.includes("yellow"))return"yellow";
  if(levels.every(l=>l==="grey"))return"grey";
  return"green";
}
function abnormalSummary(patient){
  return SYSTEMS.map(s=>{const rows=labsForSystem(s.id).map(L=>{const ser=patient.labs?.[L.id];const v=latest(ser);return{...L,value:v,status:statusOf(L.id,v),arrow:trendArrow(ser)};}).filter(r=>r.value!=null&&r.status!=="normal");
    const imgs=(patient.imaging||[]).filter(i=>i.sys===s.id);const sc=scoreSystem(patient,s.id);
    const parts=[...rows.map(r=>`${r.name} ${r.value}${r.unit} (${STATUS_KEY[r.status].en}${r.arrow?", trend "+r.arrow:""})`), ...imgs.map(i=>`${i.name}: ${i.finding}`)];
    return parts.length?`[${s.name}, ${sc.level}] ${parts.join("; ")}`:null;}).filter(Boolean).join("  ");
}
function lifestyleSummary(patient){if(!patient.intake)return"not recorded";const k=patient.intake;return `sleep ${k.sleep}/5, stress ${k.stress}/5, nutrition ${k.nutrition}/5, activity ${k.activity}/5`;}

// ── storage ──
function loadDb(){try{const s=localStorage.getItem(DB_KEY);return s?JSON.parse(s):null;}catch{return null;}}
function saveDb(db){try{localStorage.setItem(DB_KEY,JSON.stringify(db));}catch{}}

function defaultPatient(){
  return{id:"self",name:"",age:0,sex:"M",history:"",intake:{sleep:3,stress:3,nutrition:3,activity:3},labs:{},imaging:[],screeningDates:{},setupDone:false};
}

// ── AI engine ──
const SAFETY = `You are Dr. Rebira, a compassionate AI Healthcare Assistant for Canadian residents. You provide educational health guidance only. You never diagnose. You always recommend professional care. You are warm, specific, and clear. Never use em dashes. For emergencies (chest pain, stroke, overdose, suicidal ideation) immediately direct to 911 or 811.`;

async function callModel(system,user,expectJSON,maxTok,apiKey){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":apiKey,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:maxTok>1200?"claude-sonnet-4-6":"claude-haiku-4-5-20251001",max_tokens:maxTok||1200,system,messages:[{role:"user",content:user}]})});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const data=await res.json();
  let text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n").trim();
  if(expectJSON){text=text.replace(/```json/gi,"").replace(/```/g,"").trim();const s=text.indexOf("{"),e=text.lastIndexOf("}");if(s>=0&&e>=0)text=text.slice(s,e+1);return JSON.parse(text);}
  return text;
}
const langLine=lang=>lang==="am"?" Respond ENTIRELY in natural Amharic (አማርኛ).":" Respond in English.";

async function evaluateSystem(patient,sys,labRows,images,lang,apiKey){
  const labText=labRows.map(r=>`${r.name}: ${r.value??"NA"} ${r.unit} (ref ${r.ref[0]}-${r.ref[1]}, ${STATUS_KEY[r.status].en}${r.trendNote?", "+r.trendNote:""})`).join("; ");
  const imgText=images.length?images.map(i=>`${i.name} (${i.d}): ${i.finding}`).join(" | "):"none";
  const sp=SAFETY+langLine(lang)+` Evaluate the ${sys.name} system for this person. Be specific and educational. Respond ONLY with JSON, keys: "assessment" (2-3 sentences), "findings" (array of {"item","reads"}, max 5), "correlation" (1-2 sentences), "watch" (array max 3), "next" (array max 4). Keys English; values in response language.`;
  return callModel(sp,`Person: ${patient.age}y ${patient.sex}. History: ${patient.history||"none"}. Lifestyle: ${lifestyleSummary(patient)}.\n\n${sys.name} labs: ${labText||"none"}\n\nImaging: ${imgText}\n\nReturn JSON.`,true,1400,apiKey);
}
async function synthesize(patient,all,lang,apiKey){
  return callModel(SAFETY+langLine(lang)+` Whole-person synthesis across all body systems. 3 short paragraphs: the story these findings tell together, the likely root driver, and the priority direction for care.`,
    `Person: ${patient.age}y ${patient.sex}. History: ${patient.history||"none"}. Lifestyle: ${lifestyleSummary(patient)}.\n\nFindings: ${all||"No abnormal findings."}`,false,1400,apiKey);
}
async function buildTreatmentPlan(patient,all,lang,apiKey){
  const sp=SAFETY+langLine(lang)+` Design a SYSTEM-HEALING wellness plan treating the body as connected systems. Respond ONLY with JSON, keys: "rootSystem" (root driver system name), "rootWhy" (2-3 sentences), "sequence" (array of 3-5 steps, each {"treats","relieves","action"}), "monitor" (array 3-4 strings). Keys English; values in response language. Educational only, no drug doses.`;
  return callModel(sp,`Person: ${patient.age}y ${patient.sex}. History: ${patient.history||"none"}. Lifestyle: ${lifestyleSummary(patient)}.\n\nFindings: ${all||"No abnormal findings."}\n\nReturn JSON.`,true,1900,apiKey);
}
async function childAssess(childAge,domains,lang,apiKey){
  const dtxt=domains.map(d=>`${d.label}: ${d.level}`).join("; ");
  const sp=SAFETY+langLine(lang)+` You are guiding a family. You NEVER diagnose a child. Map which formal assessments may help. Respond ONLY with JSON, keys: "framing" (1-2 sentences — guidance not diagnosis), "assessments" (array {"need","who"}), "supports" (array 2-4 steps), "caution" (1 sentence). Keys English; values in response language.`;
  return callModel(sp,`Child age: ${childAge} years. Concerns by domain: ${dtxt}\n\nReturn JSON.`,true,1400,apiKey);
}
async function explainLab(labName,value,unit,refRange,context,lang,apiKey){
  return callModel(SAFETY+langLine(lang)+` Explain one lab result in plain language a patient understands. 2-3 short paragraphs. What does this test measure, what does this result mean, what should this person do next.`,
    `Lab: ${labName}. Result: ${value} ${unit}. Reference range: ${refRange[0]}-${refRange[1]} ${unit}. Context: ${context||"general adult"}.`,false,800,apiKey);
}
async function screeningAdvice(screenings,patient,lang,apiKey){
  const due=screenings.filter(s=>s.isDue).map(s=>s.name).join(", ")||"none currently due";
  return callModel(SAFETY+langLine(lang)+` Give personalized preventive screening advice for a Canadian resident. Explain why each due screening matters, how to book it in Canada (family doctor, walk-in, or provincial program), and what to expect. 3-4 short paragraphs. Be encouraging and practical.`,
    `Person: ${patient.age}y ${patient.sex}. Due screenings: ${due}. Completed: ${Object.keys(patient.screeningDates||{}).join(", ")||"none recorded"}.`,false,1000,apiKey);
}

// ── SVG atoms ──
const Dot=({c,glow})=><span style={{width:9,height:9,borderRadius:"50%",background:c,display:"inline-block",flexShrink:0,boxShadow:glow?`0 0 7px ${c}`:"none"}}/>;
function Spark({series,refRange,accent,w=70,h=22}){
  if(!series||series.length<2)return null;
  const vs=series.map(p=>p.v),mn=Math.min(...vs,refRange[0]),mx=Math.max(...vs,refRange[1]);
  const rng=mx-mn||1,px=i=>4+i*(w-8)/(series.length-1),py=v=>h-3-((v-mn)/rng)*(h-6);
  const d=series.map((p,i)=>`${i?"L":"M"}${px(i).toFixed(1)} ${py(p.v).toFixed(1)}`).join(" ");
  return<svg width={w} height={h}><path d={d} fill="none" stroke={accent} strokeWidth="1.6"/>{series.map((p,i)=><circle key={i} cx={px(i)} cy={py(p.v)} r={i===series.length-1?2.6:1.6} fill={i===series.length-1?accent:"#4B5563"}/>)}</svg>;
}
function TrendChart({series,refRange,accent,unit}){
  const W=460,H=160,pad={l:40,r:12,t:12,b:28};
  const vs=series.map(p=>p.v),mn=Math.min(...vs,refRange[0]),mx=Math.max(...vs,refRange[1]);
  const rng=(mx-mn)||1,lo=mn-rng*0.08,hi=mx+rng*0.08,span=hi-lo;
  const px=i=>pad.l+i*(W-pad.l-pad.r)/Math.max(1,series.length-1);
  const py=v=>pad.t+(1-(v-lo)/span)*(H-pad.t-pad.b);
  const bt=py(Math.min(refRange[1],hi)),bb=py(Math.max(refRange[0],lo));
  const d=series.map((p,i)=>`${i?"L":"M"}${px(i).toFixed(1)} ${py(p.v).toFixed(1)}`).join(" ");
  return<svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{maxWidth:W}}>
    <rect x={pad.l} y={bt} width={W-pad.l-pad.r} height={Math.max(0,bb-bt)} fill={C.OK} opacity="0.08"/>
    <line x1={pad.l} y1={py(refRange[1])} x2={W-pad.r} y2={py(refRange[1])} stroke={C.OK} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.5"/>
    <line x1={pad.l} y1={py(refRange[0])} x2={W-pad.r} y2={py(refRange[0])} stroke={C.OK} strokeWidth="0.7" strokeDasharray="3 3" opacity="0.5"/>
    <text x={pad.l-4} y={py(refRange[1])+3} textAnchor="end" fill={C.DIM} fontSize="9" fontFamily={C.MONO}>{refRange[1]}</text>
    <text x={pad.l-4} y={py(refRange[0])+3} textAnchor="end" fill={C.DIM} fontSize="9" fontFamily={C.MONO}>{refRange[0]}</text>
    <path d={d} fill="none" stroke={accent} strokeWidth="2"/>
    {series.map((p,i)=>{const col=p.v<refRange[0]||p.v>refRange[1]?C.HI:C.OK;return<g key={i}><circle cx={px(i)} cy={py(p.v)} r="4" fill={col} stroke={C.INK} strokeWidth="1"/><text x={px(i)} y={py(p.v)-8} textAnchor="middle" fill={C.PAPER} fontSize="9" fontFamily={C.MONO}>{p.v}</text><text x={px(i)} y={H-8} textAnchor="middle" fill={C.DIM} fontSize="9" fontFamily={C.MONO}>{p.d}</text></g>;})}
    <text x={pad.l-4} y={pad.t+4} textAnchor="end" fill={C.DIM} fontSize="9" fontFamily={C.MONO}>{unit}</text>
  </svg>;
}

const REGION=(sysId,accent,op=1)=>({
  cardiovascular:<path d="M96 96 q-14 -12 -22 2 q-7 14 22 30 q29 -16 22 -30 q-7 -14 -22 -2Z" fill={accent} opacity={0.9*op}/>,
  respiratory:<g><path d="M84 100 Q64 106 66 142 Q68 158 88 152Z" fill={accent} opacity={0.5*op}/><path d="M116 100 Q136 106 134 142 Q132 158 112 152Z" fill={accent} opacity={0.5*op}/></g>,
  nervous:<g><ellipse cx="100" cy="38" rx="14" ry="16" fill={accent} opacity={0.85*op}/><line x1="100" y1="54" x2="100" y2="150" stroke={accent} strokeWidth="2.4" opacity={op}/></g>,
  digestive:<path d="M100 104 q26 6 22 30 q-2 26 -24 24 q-22 -2 -18 -26 q2 -20 20 -28Z" fill={accent} opacity={0.55*op}/>,
  urinary:<g><ellipse cx="82" cy="138" rx="8" ry="11" fill={accent} opacity={0.8*op}/><ellipse cx="118" cy="138" rx="8" ry="11" fill={accent} opacity={0.8*op}/></g>,
  endocrine:<g><circle cx="100" cy="64" r="5" fill={accent} opacity={op}/><circle cx="100" cy="118" r="6" fill={accent} opacity={0.8*op}/><circle cx="100" cy="44" r="4" fill={accent} opacity={op}/></g>,
  lymphatic:<g>{[[80,78],[120,78],[72,124],[128,124],[100,150]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4.5" fill={accent} opacity={0.85*op}/>)}</g>,
  skeletal:<g><ellipse cx="100" cy="40" rx="14" ry="17" fill="none" stroke={accent} strokeWidth="2.4" opacity={op}/><line x1="100" y1="58" x2="100" y2="150" stroke={accent} strokeWidth="2.4" opacity={op}/>{[0,1,2,3].map(i=><path key={i} d={`M74 ${96+i*12} Q100 ${104+i*12} 126 ${96+i*12}`} fill="none" stroke={accent} strokeWidth="2.4" opacity={op}/>)}</g>,
  muscular:<path d="M72 86 Q100 80 128 86 L132 150 Q100 160 68 150Z" fill={accent} opacity={0.3*op} stroke={accent}/>,
  reproductive:<ellipse cx="100" cy="196" rx="18" ry="11" fill={accent} opacity={0.7*op}/>,
  integumentary:<path d="M62 70 Q100 60 138 70 L142 200 Q100 222 58 200Z" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="2 4" opacity={op}/>,
})[sysId];

function BodyOutline({op=0.4}){const o={fill:"none",stroke:C.TEAL,strokeWidth:1.2,opacity:op};return<g>
  <circle cx="100" cy="40" r="20" {...o}/><path d="M70 84 Q100 74 130 84 L138 150 Q100 162 62 150Z" {...o}/>
  <path d="M70 84 Q52 110 46 152 L56 156 Q66 116 78 96" {...o}/><path d="M130 84 Q148 110 154 152 L144 156 Q134 116 122 96" {...o}/>
  <path d="M70 150 Q72 210 82 272 L96 272 Q98 210 98 158" {...o}/><path d="M130 150 Q128 210 118 272 L104 272 Q102 210 102 158" {...o}/>
</g>;}

function BodyMapFull({patient,onPick}){
  return<svg width="100%" viewBox="0 0 200 300" style={{maxWidth:220}}>
    <BodyOutline/>
    {SYSTEMS.map(s=>{const sc=scoreSystem(patient,s.id);const col=SCORE[sc.level];const node=REGION(s.id,col,sc.level==="grey"?0.2:0.9);
      return<g key={s.id} style={{cursor:"pointer"}} onClick={()=>onPick(s.id)}>{node}</g>;})}
  </svg>;
}

function KnowledgeGraph({patient,onPick}){
  const byId=Object.fromEntries(SYSTEMS.map(s=>[s.id,s]));
  const scoreOf=id=>scoreSystem(patient,id).level;
  const isAbn=id=>{const l=scoreOf(id);return l==="yellow"||l==="orange"||l==="red";};
  return<svg width="100%" viewBox="0 0 200 300" style={{maxWidth:280}}>
    {EDGES.map((e,i)=>{const A=byId[e.a],B=byId[e.b];const live=isAbn(e.a)&&isAbn(e.b);
      return<line key={i} x1={A.pos[0]} y1={A.pos[1]} x2={B.pos[0]} y2={B.pos[1]} stroke={live?C.GOLD:C.FAINT} strokeWidth={live?2:0.8} opacity={live?0.9:0.35}/>;})}
    {SYSTEMS.map(s=>{const col=SCORE[scoreOf(s.id)];return<g key={s.id} style={{cursor:"pointer"}} onClick={()=>onPick(s.id)}>
      <circle cx={s.pos[0]} cy={s.pos[1]} r="8" fill={col} stroke={C.INK} strokeWidth="1.5"/>
    </g>;})}
  </svg>;
}

function EngineRunning({accent,label}){return<div style={{padding:"20px 0"}}>
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
    <Dot c={accent} glow/>
    <span style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.DIM,animation:"drBlink 1.2s infinite"}}>Working</span>
  </div>
  <div style={{height:3,background:C.PANEL2,borderRadius:3,overflow:"hidden",position:"relative"}}>
    <div style={{position:"absolute",height:"100%",width:"33%",background:accent,animation:"drSweep 1.1s linear infinite",borderRadius:3}}/>
  </div>
  {label&&<p style={{fontSize:12,color:C.DIM,marginTop:8,fontStyle:"italic"}}>{label}</p>}
</div>;}

// ── SETUP VIEW ──
function SetupView({patient,onSave,lang}){
  const [name,setName]=useState(patient.name||"");
  const [age,setAge]=useState(patient.age||"");
  const [sex,setSex]=useState(patient.sex||"M");
  const [history,setHistory]=useState(patient.history||"");
  const ok=name.trim()&&age&&Number(age)>0&&Number(age)<120;
  const fld={background:C.INK,border:`1px solid ${C.FAINT}`,borderRadius:8,color:C.PAPER,padding:"9px 11px",fontSize:13,width:"100%",fontFamily:C.SANS,outline:"none"};
  const lbl={fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.DIM,display:"block",margin:"12px 0 5px"};
  return<div style={{padding:"24px 16px",maxWidth:440,margin:"0 auto"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:4}}>Dr. Rebira</div>
    <h2 style={{fontSize:22,fontWeight:700,color:C.PAPER,margin:"0 0 4px"}}>Your Health Profile</h2>
    <p style={{fontSize:13,color:C.DIM,marginBottom:20,lineHeight:1.5}}>This stays on your device only — never shared. It powers your body map and screenings.</p>
    <label style={lbl}>Your name</label>
    <input style={fld} value={name} onChange={e=>setName(e.target.value)} placeholder="First name"/>
    <div style={{display:"flex",gap:10,marginTop:0}}>
      <div style={{flex:1}}><label style={lbl}>Age</label><input style={fld} type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="35"/></div>
      <div style={{flex:1}}><label style={lbl}>Sex assigned at birth</label>
        <select style={fld} value={sex} onChange={e=>setSex(e.target.value)}>
          <option value="M">Male</option><option value="F">Female</option>
        </select>
      </div>
    </div>
    <label style={lbl}>Health history (optional)</label>
    <textarea style={{...fld,resize:"vertical"}} rows={3} value={history} onChange={e=>setHistory(e.target.value)} placeholder="e.g. Type 2 diabetes, hypertension, family history of heart disease..."/>
    <button disabled={!ok} onClick={()=>onSave({name:name.trim(),age:Number(age),sex,history:history.trim(),setupDone:true})}
      style={{marginTop:16,width:"100%",padding:"13px",background:ok?C.TEAL:"#1C3623",border:"none",borderRadius:10,color:ok?"#fff":C.DIM,fontFamily:C.SANS,fontSize:14,fontWeight:600,cursor:ok?"pointer":"not-allowed",transition:"all .2s"}}>
      {lang==="am"?"ይቀጥሉ →":"Continue →"}
    </button>
  </div>;
}

// ── MAP VIEW ──
function MapView({patient,lang,onPick}){
  const overall=overallScore(patient);
  const am=lang==="am";
  return<div style={{padding:"16px",overflowY:"auto",height:"100%"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:2}}>{am?"የሰውነት ካርታ":"Body Map"}</div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <span style={{fontSize:16,fontWeight:700,color:C.PAPER}}>{patient.name}</span>
      <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:C.DIM}}>
        <Dot c={SCORE[overall]} glow/>{SCORE_LABEL[overall][lang]} · {patient.age}y {patient.sex}
      </span>
    </div>
    <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:12,padding:"10px",display:"flex",justifyContent:"center",flexShrink:0}}>
        <BodyMapFull patient={patient} onPick={onPick}/>
      </div>
      <div style={{flex:1,minWidth:180,display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {SYSTEMS.map(s=>{const sc=scoreSystem(patient,s.id);return<button key={s.id} onClick={()=>onPick(s.id)}
          style={{textAlign:"left",cursor:"pointer",background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderLeft:`3px solid ${SCORE[sc.level]}`,borderRadius:8,padding:"8px 9px",color:C.PAPER,fontFamily:C.SANS,transition:"all .15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <Dot c={SCORE[sc.level]}/>
            <span style={{fontSize:9,color:SCORE[sc.level],textTransform:"uppercase",letterSpacing:.8}}>{SCORE_LABEL[sc.level][lang]}</span>
          </div>
          <div style={{fontSize:11,fontWeight:600,lineHeight:1.2}}>{am?s.am:s.name}</div>
          {(sc.abn+sc.crit)>0&&<div style={{fontSize:9,color:C.HI,marginTop:3}}>{sc.abn+sc.crit} {am?"ምልክት":"flagged"}</div>}
        </button>;})}
      </div>
    </div>
    <div style={{marginTop:12,fontSize:11,color:C.DIM,lineHeight:1.5}}>
      {am?"ሥርዓቱን ለመክፈት ይንኩ።":"Tap any system to open it. Scores update automatically as you add labs."}
    </div>
  </div>;
}

// ── SYSTEMS VIEW ──
function SystemsView({patient,lang,apiKey}){
  const [sysId,setSysId]=useState("cardiovascular");
  const [tab,setTab]=useState("labs");
  const [evals,setEvals]=useState({});
  const [evalBusy,setEvalBusy]=useState(false);
  const [expanded,setExpanded]=useState(null);
  const [askThread,setAskThread]=useState({});
  const [askInput,setAskInput]=useState("");
  const [askBusy,setAskBusy]=useState(false);
  const askRef=useRef(null);
  const am=lang==="am";
  const sys=SYSTEMS.find(s=>s.id===sysId);
  const key=`${sysId}:${lang}`;

  const labRows=useMemo(()=>labsForSystem(sysId).map(L=>{const series=patient.labs?.[L.id]||[];const value=latest(series);
    let trendNote="";if(series.length>1){const dir=value>series[0].v?"rising":value<series[0].v?"falling":"stable";trendNote=`trend ${dir} over ${series.length} readings`;}
    return{...L,series,value,status:statusOf(L.id,value),trendNote};}
  ),[sysId,patient]);
  const measured=labRows.filter(r=>r.value!=null);
  const abnormal=measured.filter(r=>r.status!=="normal");
  const sysImages=(patient.imaging||[]).filter(i=>i.sys===sysId);

  useEffect(()=>{if(askRef.current)askRef.current.scrollTop=askRef.current.scrollHeight;},[askThread,askBusy,key]);

  async function runEval(){
    if(!apiKey){alert("Connect your API key in the Chat tab first.");return;}
    setEvalBusy(true);
    try{const data=await evaluateSystem(patient,sys,measured,sysImages,lang,apiKey);setEvals(e=>({...e,[key]:{data}}));}
    catch(err){setEvals(e=>({...e,[key]:{error:true,msg:err.message}}));}
    finally{setEvalBusy(false);}
  }
  async function sendAsk(){
    const q=askInput.trim();if(!q||askBusy||!apiKey)return;
    setAskInput("");const base=askThread[key]||[];
    setAskThread(t=>({...t,[key]:[...base,{role:"user",text:q}]}));setAskBusy(true);
    try{const sp=SAFETY+langLine(lang)+` Answer a question about the ${sys.name} system. 2-3 short paragraphs. This person's data: ${lifestyleSummary(patient)}.`;
      const a=await callModel(sp,q,false,800,apiKey);
      setAskThread(t=>({...t,[key]:[...base,{role:"user",text:q},{role:"dr",text:a}]}));}
    catch{setAskThread(t=>({...t,[key]:[...base,{role:"user",text:q},{role:"dr",text:"Sorry, I couldn't process that. Please try again."}]}));}
    finally{setAskBusy(false);}
  }

  const ev=evals[key];
  const sc=scoreSystem(patient,sysId);
  const colFld={background:C.INK,border:`1px solid ${C.FAINT}`,borderRadius:7,color:C.PAPER,padding:"7px 9px",fontSize:12,fontFamily:C.SANS};

  return<div style={{display:"flex",height:"100%",overflow:"hidden"}}>
    {/* system rail */}
    <div style={{width:44,background:C.INK,borderRight:`1px solid ${C.FAINT}`,overflowY:"auto",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:6,gap:2}}>
      {SYSTEMS.map(s=>{const ssc=scoreSystem(patient,s.id);const on=s.id===sysId;return<button key={s.id} onClick={()=>{setSysId(s.id);setTab("labs");}} title={am?s.am:s.name}
        style={{width:36,height:36,borderRadius:8,border:`1px solid ${on?s.accent:C.FAINT}`,background:on?C.PANEL3:C.INK,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all .15s",flexShrink:0}}>
        <Dot c={SCORE[ssc.level]} glow={on}/>
        {(ssc.abn+ssc.crit)>0&&<span style={{position:"absolute",top:2,right:2,width:7,height:7,borderRadius:"50%",background:SCORE[ssc.level],fontSize:0}}/>}
      </button>;})}
    </div>
    {/* main */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* system header */}
      <div style={{padding:"10px 14px 0",borderBottom:`1px solid ${C.FAINT}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
          <span style={{fontSize:15,fontWeight:700,color:sys.accent}}>{am?sys.am:sys.name}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10,color:C.DIM}}>
            <Dot c={SCORE[sc.level]} glow/>{SCORE_LABEL[sc.level][lang]}
          </span>
          <span style={{fontSize:10,color:C.DIM}}>{measured.length} {am?"ምርመራ":"labs"}{abnormal.length>0?` · ${abnormal.length} ${am?"ምልክት":"flagged"}`:""}</span>
        </div>
        <p style={{fontSize:11,color:C.DIM,margin:"0 0 6px",lineHeight:1.4}}>{am?sys.briefAm:sys.brief}</p>
        {/* tabs */}
        <div style={{display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["labs",am?"ምርመራ":"Labs"],["eval",am?"ግምገማ":"Evaluate"],["ask",am?"ጠይቅ":"Ask"]].map(([id,lbl])=>
            <button key={id} onClick={()=>setTab(id)} style={{border:"none",background:"none",cursor:"pointer",fontFamily:C.SANS,padding:"6px 12px",fontSize:12,color:tab===id?sys.accent:C.DIM,borderBottom:tab===id?`2px solid ${sys.accent}`:"2px solid transparent",whiteSpace:"nowrap"}}>{lbl}</button>
          )}
        </div>
      </div>
      {/* tab content */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px 20px"}}>
        {tab==="labs"&&<div>
          {labRows.length===0?<p style={{color:C.DIM,fontSize:13}}>No labs mapped to this system yet.</p>:
          <div>
            {labRows.map(r=>{const col=r.status==="crit-lo"||r.status==="crit-hi"?C.CRIT:r.status==="low"||r.status==="high"?C.HI:r.status==="normal"?C.OK:C.DIM;const open=expanded===r.id&&r.series.length>1;
              return<div key={r.id}>
                <div onClick={()=>r.series.length>1&&setExpanded(open?null:r.id)} style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 70px 80px",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.PANEL3}`,cursor:r.series.length>1?"pointer":"default",gap:4}}>
                  <div style={{fontSize:12}}>{am?(r.am||r.name):r.name}{r.series.length>1&&<span style={{color:C.DIM,marginLeft:4,fontSize:10}}>{open?"▾":"▸"}</span>}</div>
                  <div style={{textAlign:"right",fontFamily:C.MONO,fontSize:12,color:r.value==null?C.DIM:col,fontWeight:r.status!=="normal"&&r.value!=null?700:400}}>{r.value??"-"}</div>
                  <div style={{textAlign:"right",fontFamily:C.MONO,fontSize:10,color:C.DIM}}>{r.ref[0]}–{r.ref[1]} {r.unit}</div>
                  <div style={{display:"flex",justifyContent:"center"}}><Spark series={r.series} refRange={r.ref} accent={sys.accent}/></div>
                  <div style={{textAlign:"right"}}>{r.value!=null&&<span style={{fontSize:9,color:col,border:`1px solid ${col}`,borderRadius:20,padding:"2px 7px"}}>{STATUS_KEY[r.status][lang]}</span>}</div>
                </div>
                {open&&<div style={{padding:"10px 0 14px"}}><TrendChart series={r.series} refRange={r.ref} accent={sys.accent} unit={r.unit}/></div>}
              </div>;
            })}
          </div>}
        </div>}
        {tab==="eval"&&<div style={{maxWidth:600}}>
          {!ev&&!evalBusy&&<div style={{textAlign:"center",padding:"24px 0"}}>
            <p style={{color:C.DIM,fontSize:13,lineHeight:1.55,marginBottom:14}}>Dr. Rebira will read your {am?sys.am:sys.name} labs and give you a personalised explanation.</p>
            <button onClick={runEval} style={{background:sys.accent,color:C.INK,border:"none",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{am?"ይህን ሥርዓት ገምግም":"Evaluate this system"}</button>
          </div>}
          {evalBusy&&<EngineRunning accent={sys.accent} label={am?"ምርመራዎችን በማንበብ ላይ…":"Reading your labs…"}/>}
          {ev?.error&&<div style={{color:C.CRIT,fontSize:13}}>{ev.msg||"Could not get a response."} <button onClick={runEval} style={{marginLeft:8,background:"none",border:`1px solid ${C.FAINT}`,color:C.PAPER,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11}}>Retry</button></div>}
          {ev?.data&&<EvalView d={ev.data} accent={sys.accent} lang={lang} onRerun={runEval}/>}
        </div>}
        {tab==="ask"&&<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div ref={askRef} style={{flex:1,overflowY:"auto",minHeight:120,marginBottom:10}}>
            {(!askThread[key]||askThread[key].length===0)&&<p style={{color:C.DIM,fontSize:12,lineHeight:1.5}}>Ask anything about your {am?sys.am:sys.name} system. Dr. Rebira will answer with your data in view.</p>}
            {(askThread[key]||[]).map((m,i)=><div key={i} style={{marginBottom:10,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"90%",background:m.role==="user"?C.PANEL3:"transparent",border:m.role==="dr"?`1px solid ${C.FAINT}`:"none",borderLeft:m.role==="dr"?`3px solid ${sys.accent}`:"none",borderRadius:m.role==="user"?10:4,padding:"8px 11px",fontSize:12,lineHeight:1.55,whiteSpace:"pre-wrap"}}>
                {m.role==="dr"&&<div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:sys.accent,marginBottom:4}}>Dr. Rebira</div>}
                {m.text}
              </div>
            </div>)}
            {askBusy&&<div style={{fontSize:12,color:C.DIM,fontStyle:"italic"}}>Thinking…</div>}
          </div>
          <div style={{display:"flex",gap:7}}>
            <input value={askInput} disabled={askBusy} onChange={e=>setAskInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAsk()} placeholder={am?"ጠይቅ…":"Ask about this system…"} style={{...colFld,flex:1}}/>
            <button onClick={sendAsk} disabled={askBusy||!askInput.trim()||!apiKey} style={{background:sys.accent,color:C.INK,border:"none",borderRadius:7,padding:"0 14px",fontSize:13,fontWeight:600,cursor:"pointer",opacity:askBusy||!askInput.trim()||!apiKey?0.4:1}}>{am?"ላክ":"Ask"}</button>
          </div>
          {!apiKey&&<p style={{fontSize:10,color:C.HI,marginTop:6}}>Connect API key in Chat tab to enable AI responses.</p>}
        </div>}
      </div>
    </div>
  </div>;
}

function EvalView({d,accent,lang,onRerun}){
  const S=({title,children})=><div style={{marginBottom:14}}><div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:accent,marginBottom:6}}>{title}</div><div>{children}</div></div>;
  return<div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
      <button onClick={onRerun} style={{background:"none",border:`1px solid ${C.FAINT}`,color:C.DIM,borderRadius:6,padding:"3px 9px",fontSize:10,cursor:"pointer"}}>Re-run</button>
    </div>
    <S title="Assessment"><p style={{margin:0,fontSize:13,lineHeight:1.6}}>{d.assessment}</p></S>
    {Array.isArray(d.findings)&&d.findings.length>0&&<S title="What Dr. Rebira noticed">
      {d.findings.map((f,i)=><div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.PANEL3}`}}>
        <span style={{width:6,flexShrink:0}}><span style={{display:"block",width:6,height:6,borderRadius:"50%",background:accent,marginTop:5}}/></span>
        <div><div style={{fontSize:12,fontWeight:600}}>{f.item}</div><div style={{fontSize:11,color:C.DIM,lineHeight:1.45,marginTop:2}}>{f.reads}</div></div>
      </div>)}
    </S>}
    {d.correlation&&<S title="How they connect"><div style={{background:C.PANEL2,borderLeft:`3px solid ${accent}`,padding:"9px 12px",fontSize:12,lineHeight:1.55}}>{d.correlation}</div></S>}
    {Array.isArray(d.watch)&&d.watch.length>0&&<S title="Watch for">{d.watch.map((w,i)=><div key={i} style={{fontSize:12,padding:"3px 0"}}>· {w}</div>)}</S>}
    {Array.isArray(d.next)&&d.next.length>0&&<S title="Suggested next steps">
      {d.next.map((n,i)=><div key={i} style={{fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.PANEL3}`}}><span style={{fontFamily:C.MONO,color:accent,marginRight:6}}>{String(i+1).padStart(2,"0")}</span>{n}</div>)}
    </S>}
    <p style={{fontSize:10,color:C.DIM,fontStyle:"italic",marginTop:8}}>Educational guidance only — not a substitute for professional care.</p>
  </div>;
}

// ── ADD LABS VIEW ──
function AddLabsView({patient,onAdd,lang}){
  const am=lang==="am";
  const today=new Date().toISOString().slice(0,7);
  const allLabs=Object.entries(LABS).map(([id,L])=>({id,...L}));
  const [labId,setLabId]=useState(allLabs[0].id);
  const [labVal,setLabVal]=useState("");
  const [labDate,setLabDate]=useState(today);
  const [saved,setSaved]=useState(false);
  const [imgSys,setImgSys]=useState("cardiovascular");
  const [imgName,setImgName]=useState("");
  const [imgFind,setImgFind]=useState("");
  const [imgDate,setImgDate]=useState(today);
  const [imgSaved,setImgSaved]=useState(false);
  const fld={background:C.INK,border:`1px solid ${C.FAINT}`,borderRadius:7,color:C.PAPER,padding:"8px 10px",fontSize:12,width:"100%",fontFamily:C.SANS,outline:"none"};
  const lbl={fontSize:10,letterSpacing:1.2,textTransform:"uppercase",color:C.DIM,display:"block",margin:"10px 0 4px"};
  const card={background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:10,padding:"14px 14px 16px",marginBottom:12};
  return<div style={{padding:"12px 14px",overflowY:"auto",height:"100%"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:12}}>{am?"ውጤቶች ጨምር":"Add Results"}</div>
    <div style={card}>
      <div style={{fontSize:11,fontWeight:600,marginBottom:10,color:C.PAPER}}>{am?"የላብራቶሪ ውጤት":"Lab Result"}</div>
      <label style={lbl}>{am?"ምርመራ ምረጥ":"Select test"}</label>
      <select style={fld} value={labId} onChange={e=>setLabId(e.target.value)}>
        {allLabs.map(L=><option key={L.id} value={L.id}>{am?(L.am||L.name):L.name} ({L.unit})</option>)}
      </select>
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1}}><label style={lbl}>{am?"ውጤት":"Value"}</label><input style={fld} type="number" value={labVal} onChange={e=>setLabVal(e.target.value)} placeholder={`${LABS[labId].ref[0]}–${LABS[labId].ref[1]}`}/></div>
        <div style={{flex:1}}><label style={lbl}>{am?"ቀን":"Date (YYYY-MM)"}</label><input style={fld} value={labDate} onChange={e=>setLabDate(e.target.value)} placeholder="2026-06"/></div>
      </div>
      <button disabled={!labVal} onClick={()=>{onAdd("lab",{id:labId,value:labVal,date:labDate});setLabVal("");setSaved(true);setTimeout(()=>setSaved(false),1800);}}
        style={{marginTop:12,width:"100%",padding:"9px",background:labVal?C.TEAL:"#1C3623",border:"none",borderRadius:7,color:labVal?"#0B1A0F":C.DIM,fontFamily:C.SANS,fontSize:12,fontWeight:600,cursor:labVal?"pointer":"not-allowed"}}>
        {saved?"✓ Saved":"Save Lab"}
      </button>
    </div>
    <div style={card}>
      <div style={{fontSize:11,fontWeight:600,marginBottom:10,color:C.PAPER}}>{am?"የምስል ምርመራ":"Imaging Study"}</div>
      <label style={lbl}>{am?"ሥርዓት":"System"}</label>
      <select style={fld} value={imgSys} onChange={e=>setImgSys(e.target.value)}>
        {SYSTEMS.map(s=><option key={s.id} value={s.id}>{am?s.am:s.name}</option>)}
      </select>
      <label style={lbl}>{am?"የምርመራ ዓይነት":"Study name"}</label>
      <input style={fld} value={imgName} onChange={e=>setImgName(e.target.value)} placeholder="e.g. Chest X-ray, Echocardiogram"/>
      <label style={lbl}>{am?"ግኝት":"Finding"}</label>
      <textarea style={{...fld,resize:"vertical"}} rows={2} value={imgFind} onChange={e=>setImgFind(e.target.value)} placeholder="Paste report text or summarise finding"/>
      <label style={lbl}>{am?"ቀን":"Date (YYYY-MM)"}</label>
      <input style={fld} value={imgDate} onChange={e=>setImgDate(e.target.value)} placeholder="2026-06"/>
      <button disabled={!imgFind.trim()||!imgName.trim()} onClick={()=>{onAdd("image",{sys:imgSys,name:imgName.trim(),finding:imgFind.trim(),date:imgDate});setImgFind("");setImgName("");setImgSaved(true);setTimeout(()=>setImgSaved(false),1800);}}
        style={{marginTop:12,width:"100%",padding:"9px",background:imgFind.trim()?C.TEAL:"#1C3623",border:"none",borderRadius:7,color:imgFind.trim()?"#0B1A0F":C.DIM,fontFamily:C.SANS,fontSize:12,fontWeight:600,cursor:imgFind.trim()?"pointer":"not-allowed"}}>
        {imgSaved?"✓ Saved":"Save Imaging"}
      </button>
    </div>
  </div>;
}

// ── SCREENINGS VIEW ──
function ScreeningsView({patient,lang,apiKey,onToggleDone}){
  const am=lang==="am";
  const [advice,setAdvice]=useState(null);
  const [adviceBusy,setAdviceBusy]=useState(false);

  const applicable=SCREENINGS.filter(s=>s.sexes.includes(patient.sex)&&patient.age>=s.minAge&&patient.age<=s.maxAge);
  const withDue=applicable.map(s=>{const lastDate=patient.screeningDates?.[s.id];let isDue=true;if(lastDate&&s.intervalYrs<900){const last=new Date(lastDate+"-01");const nextDue=new Date(last);nextDue.setFullYear(nextDue.getFullYear()+s.intervalYrs);isDue=new Date()>=nextDue;}return{...s,lastDate,isDue};});
  const dueCount=withDue.filter(s=>s.isDue).length;

  async function getAdvice(){
    if(!apiKey){alert("Connect API key in Chat tab.");return;}
    setAdviceBusy(true);
    try{const a=await screeningAdvice(withDue,patient,lang,apiKey);setAdvice(a);}
    catch{setAdvice("Could not load advice. Please try again.");}
    finally{setAdviceBusy(false);}
  }

  return<div style={{padding:"12px 14px",overflowY:"auto",height:"100%"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:4}}>{am?"የካናዳ ምርመራ መርሃ ግብር":"Canadian Preventive Screenings"}</div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <span style={{fontSize:14,fontWeight:600,color:C.PAPER}}>{patient.name} · {patient.age}y {patient.sex}</span>
      <span style={{background:dueCount>0?"rgba(239,68,68,.15)":"rgba(34,197,94,.1)",border:`1px solid ${dueCount>0?C.CRIT:C.OK}`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:600,color:dueCount>0?C.CRIT:C.OK}}>{dueCount} {am?"የሚገባ":"due"}</span>
    </div>
    {withDue.map(s=>{const done=!s.isDue;return<div key={s.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px",background:C.PANEL2,border:`1px solid ${s.isDue?`rgba(239,68,68,.2)`:C.FAINT}`,borderLeft:`3px solid ${s.isDue?C.CRIT:C.OK}`,borderRadius:9,marginBottom:7,cursor:"pointer"}}
      onClick={()=>onToggleDone(s.id)}>
      <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${done?C.OK:C.CRIT}`,background:done?`rgba(34,197,94,.15)`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
        {done&&<span style={{fontSize:9,color:C.OK}}>✓</span>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:C.PAPER}}>{am?s.am:s.name}</div>
        <div style={{fontSize:11,color:C.DIM,marginTop:2,lineHeight:1.4}}>{am?s.descAm:s.desc}</div>
        {s.lastDate&&<div style={{fontSize:10,color:C.OK,marginTop:3}}>Last: {s.lastDate}</div>}
        {s.isDue&&<div style={{fontSize:10,color:C.CRIT,marginTop:3}}>Due now</div>}
      </div>
    </div>;})}
    <p style={{fontSize:10,color:C.DIM,margin:"8px 0 12px",lineHeight:1.5}}>Tap a screening to mark it done. Based on Health Canada / CTFPHC guidelines.</p>
    {!advice&&!adviceBusy&&<button onClick={getAdvice} style={{width:"100%",padding:"10px",background:C.TEAL,border:"none",borderRadius:9,color:C.INK,fontFamily:C.SANS,fontSize:13,fontWeight:600,cursor:"pointer"}}>
      {am?"ምክር ያግኙ":"Get personalised advice from Dr. Rebira"}
    </button>}
    {adviceBusy&&<EngineRunning accent={C.TEAL} label="Reviewing your screening profile…"/>}
    {advice&&<div style={{marginTop:8,background:C.PANEL2,borderLeft:`3px solid ${C.TEAL}`,padding:"12px 14px",fontSize:12,lineHeight:1.65,whiteSpace:"pre-wrap",borderRadius:4}}>
      <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:6}}>Dr. Rebira</div>
      {advice}
      <button onClick={getAdvice} style={{display:"block",marginTop:10,background:"none",border:`1px solid ${C.FAINT}`,color:C.DIM,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>Refresh</button>
    </div>}
  </div>;
}

// ── WELLNESS VIEW ──
function WellnessView({patient,lang,apiKey,onSetIntake}){
  const am=lang==="am";
  const [synth,setSynth]=useState(null);
  const [synthBusy,setSynthBusy]=useState(false);
  const [plan,setPlan]=useState(null);
  const [planBusy,setPlanBusy]=useState(false);
  const [childData,setChildData]=useState(null);
  const [childBusy,setChildBusy]=useState(false);
  const [childAge,setChildAge]=useState("4");
  const [childLevels,setChildLevels]=useState(()=>Object.fromEntries(CHILD_DOMAINS.map(d=>[d.id,"none"])));
  const [wview,setWview]=useState("lifestyle");
  const k=Object.assign({sleep:3,stress:3,nutrition:3,activity:3},patient.intake);
  const fld={background:C.INK,border:`1px solid ${C.FAINT}`,borderRadius:7,color:C.PAPER,padding:"8px 10px",fontSize:12,fontFamily:C.SANS,outline:"none"};

  async function runSynth(){
    if(!apiKey){alert("Connect API key in Chat tab.");return;}
    setSynthBusy(true);
    try{const x=await synthesize(patient,abnormalSummary(patient),lang,apiKey);setSynth(x);}
    catch{setSynth("Could not load. Please try again.");}
    finally{setSynthBusy(false);}
  }
  async function runPlan(){
    if(!apiKey){alert("Connect API key in Chat tab.");return;}
    setPlanBusy(true);
    try{const d=await buildTreatmentPlan(patient,abnormalSummary(patient),lang,apiKey);setPlan(d);}
    catch{setPlan({error:true});}
    finally{setPlanBusy(false);}
  }
  async function runChild(){
    if(!apiKey){alert("Connect API key in Chat tab.");return;}
    setChildBusy(true);
    try{const d=await childAssess(childAge,CHILD_DOMAINS.map(d=>({label:d.label.en,level:childLevels[d.id]})),lang,apiKey);setChildData(d);}
    catch{setChildData({error:true});}
    finally{setChildBusy(false);}
  }

  return<div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
    <div style={{padding:"8px 14px 0",borderBottom:`1px solid ${C.FAINT}`,flexShrink:0,display:"flex",gap:0,overflowX:"auto",scrollbarWidth:"none"}}>
      {[["lifestyle",am?"አኗኗር":"Lifestyle"],["synthesis",am?"ትንተና":"Synthesis"],["plan",am?"እቅድ":"Wellness Plan"],["child",am?"ህጻናት":"Child"]].map(([id,lbl])=>
        <button key={id} onClick={()=>setWview(id)} style={{border:"none",background:"none",cursor:"pointer",fontFamily:C.SANS,padding:"7px 12px",fontSize:12,color:wview===id?C.TEAL:C.DIM,borderBottom:wview===id?`2px solid ${C.TEAL}`:"2px solid transparent",whiteSpace:"nowrap"}}>{lbl}</button>
      )}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
      {wview==="lifestyle"&&<div>
        <p style={{fontSize:12,color:C.DIM,marginBottom:14,lineHeight:1.5}}>{am?"እነዚህ ግብዓቶች የነርቭና ሜታቦሊክ ነጥቦቾን ይቀርጻሉ።":"These lifestyle inputs shape your nervous and metabolic system scores. Rate yourself honestly."}</p>
        {INTAKE.map(item=><div key={item.id} style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:10,padding:"12px 13px",marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600}}>{item.q[lang]}</span>
            <span style={{fontFamily:C.MONO,fontSize:14,color:C.TEAL}}>{k[item.id]}/5</span>
          </div>
          <div style={{display:"flex",gap:5}}>
            {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onSetIntake(item.id,n)} style={{flex:1,border:`1px solid ${k[item.id]===n?C.TEAL:C.FAINT}`,background:k[item.id]===n?C.TEAL:"transparent",color:k[item.id]===n?C.INK:C.DIM,borderRadius:7,padding:"7px 0",fontSize:13,fontWeight:600,cursor:"pointer"}}>{n}</button>)}
          </div>
        </div>)}
        <p style={{fontSize:10,color:C.DIM,marginTop:6}}>Saves automatically.</p>
      </div>}

      {wview==="synthesis"&&<div style={{maxWidth:600}}>
        <p style={{fontSize:12,color:C.DIM,marginBottom:14,lineHeight:1.5}}>{am?"ሁሉንም ሥርዓቶች አጣምረህ ትንተና።":"Dr. Rebira reads all your systems together and tells the story they tell as a whole."}</p>
        {!synth&&!synthBusy&&<button onClick={runSynth} style={{background:C.TEAL,color:C.INK,border:"none",borderRadius:9,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Synthesise my health picture</button>}
        {synthBusy&&<EngineRunning accent={C.TEAL} label="Reading all your systems…"/>}
        {synth&&<div>
          <div style={{background:C.PANEL2,borderLeft:`3px solid ${C.TEAL}`,padding:"14px",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",borderRadius:4}}>{synth}</div>
          <button onClick={runSynth} style={{marginTop:8,background:"none",border:`1px solid ${C.FAINT}`,color:C.DIM,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>Re-run</button>
        </div>}
      </div>}

      {wview==="plan"&&<div style={{maxWidth:600}}>
        <p style={{fontSize:12,color:C.DIM,marginBottom:14,lineHeight:1.5}}>{am?"ሥርዓቶቹ እርስ በርስ እንዴት እንደሚሰሩ ዕቅድ።":"A whole-system wellness plan that treats the root driver first, then shows how fixing it relieves the others."}</p>
        {!plan&&!planBusy&&<button onClick={runPlan} style={{background:C.TEAL,color:C.INK,border:"none",borderRadius:9,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Design my wellness plan</button>}
        {planBusy&&<EngineRunning accent={C.TEAL} label="Designing your system-healing plan…"/>}
        {plan?.error&&<div style={{color:C.CRIT,fontSize:12}}>Could not generate plan. <button onClick={runPlan} style={{background:"none",border:`1px solid ${C.FAINT}`,color:C.PAPER,borderRadius:6,padding:"2px 7px",cursor:"pointer",fontSize:11}}>Retry</button></div>}
        {plan&&!plan.error&&<div>
          <div style={{background:C.PANEL2,border:`1px solid ${C.TEAL}`,borderRadius:10,padding:"13px 14px",marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:4}}>Root driver</div>
            <div style={{fontSize:16,fontWeight:700,color:C.TEAL,marginBottom:6}}>{plan.rootSystem}</div>
            <p style={{fontSize:12,lineHeight:1.55,margin:0}}>{plan.rootWhy}</p>
          </div>
          {Array.isArray(plan.sequence)&&<div style={{marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:8}}>Healing sequence</div>
            {plan.sequence.map((step,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.TEAL,color:C.INK,fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:9,padding:"10px 12px"}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:5,fontSize:10}}>
                  <span style={{background:C.PANEL3,borderRadius:5,padding:"2px 7px"}}>Targets: <b style={{color:C.PAPER}}>{step.treats}</b></span>
                  <span style={{background:C.PANEL3,borderRadius:5,padding:"2px 7px",color:C.OK}}>Relieves: {step.relieves}</span>
                </div>
                <div style={{fontSize:12,lineHeight:1.5}}>{step.action}</div>
              </div>
            </div>)}
          </div>}
          {Array.isArray(plan.monitor)&&plan.monitor.length>0&&<div>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:6}}>Monitor</div>
            {plan.monitor.map((m,i)=><div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.PANEL3}`}}>· {m}</div>)}
          </div>}
          <button onClick={runPlan} style={{marginTop:10,background:"none",border:`1px solid ${C.FAINT}`,color:C.DIM,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>Re-run</button>
        </div>}
      </div>}

      {wview==="child"&&<div style={{maxWidth:600}}>
        <p style={{fontSize:12,color:C.DIM,marginBottom:10,lineHeight:1.5}}>{am?"ለህጻን ጥንቃቄ የሞላው ምርመራ — ምርመራ አይደለም።":"A guarded developmental screen for children. Dr. Rebira never diagnoses a child."}</p>
        <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)",borderRadius:9,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#FCD34D",lineHeight:1.55}}>
          {am?"ይህ ለቤተሰብ መምሪያ ነው። ህጻን ወደ አንድ መለያ አንቀንስም።":"This guidance is for a care team, not a diagnosis. No child is reduced to a single label."}
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div><div style={{fontSize:10,letterSpacing:1.2,textTransform:"uppercase",color:C.DIM,marginBottom:4}}>{am?"ዕድሜ (ዓ)":"Child age (years)"}</div><input style={{...fld,width:100}} type="number" value={childAge} onChange={e=>setChildAge(e.target.value)}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8,marginBottom:14}}>
          {CHILD_DOMAINS.map(d=><div key={d.id} style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:9,padding:"10px 11px"}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:7}}>{d.label[lang]}</div>
            <div style={{display:"flex",gap:4}}>
              {[["none",am?"የለም":"None"],["mild",am?"ቀላል":"Mild"],["clear",am?"ግልጽ":"Clear"]].map(([v,lbl])=>
                <button key={v} onClick={()=>setChildLevels(s=>({...s,[d.id]:v}))} style={{flex:1,border:`1px solid ${childLevels[d.id]===v?C.TEAL:C.FAINT}`,background:childLevels[d.id]===v?C.TEAL:"transparent",color:childLevels[d.id]===v?C.INK:C.DIM,borderRadius:6,padding:"5px 0",fontSize:10,fontWeight:600,cursor:"pointer"}}>{lbl}</button>
              )}
            </div>
          </div>)}
        </div>
        <button disabled={childBusy||!childAge} onClick={runChild} style={{background:C.TEAL,color:C.INK,border:"none",borderRadius:9,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer",opacity:childBusy||!childAge?0.4:1}}>
          {am?"የግምገማ ፍላጎቶችን ካርታ":"Map assessment needs"}
        </button>
        {childBusy&&<EngineRunning accent={C.TEAL} label="Mapping assessment needs…"/>}
        {childData?.error&&<div style={{color:C.CRIT,fontSize:12,marginTop:10}}>Could not generate. Please try again.</div>}
        {childData&&!childData.error&&<div style={{marginTop:14}}>
          <div style={{background:C.PANEL2,borderLeft:`3px solid ${C.TEAL}`,padding:"10px 13px",fontSize:12,lineHeight:1.6,fontStyle:"italic",marginBottom:10}}>{childData.framing}</div>
          {Array.isArray(childData.assessments)&&childData.assessments.length>0&&<div style={{marginBottom:10}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:6}}>Assessments to consider</div>
            {childData.assessments.map((a,i)=><div key={i} style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:8,padding:"9px 11px",marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:600}}>{a.need}</div>
              <div style={{fontSize:11,color:C.DIM,marginTop:3}}>{a.who}</div>
            </div>)}
          </div>}
          {Array.isArray(childData.supports)&&childData.supports.length>0&&<div style={{marginBottom:10}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:6}}>Supports to begin now</div>
            {childData.supports.map((s,i)=><div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.PANEL3}`}}>· {s}</div>)}
          </div>}
          {childData.caution&&<div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:8,padding:"9px 12px",fontSize:11,color:"#FCD34D",lineHeight:1.5,marginTop:6}}>{childData.caution}</div>}
        </div>}
      </div>}
    </div>
  </div>;
}

// ── GRAPH VIEW ──
function GraphView({patient,lang,onPick}){
  const am=lang==="am";
  const byId=Object.fromEntries(SYSTEMS.map(s=>[s.id,s]));
  const live=EDGES.filter(e=>{const a=scoreSystem(patient,e.a).level,b=scoreSystem(patient,e.b).level;const abn=l=>l==="yellow"||l==="orange"||l==="red";return abn(a)&&abn(b);});
  return<div style={{padding:"12px 14px",overflowY:"auto",height:"100%"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:4}}>{am?"የሥርዓቶች ካርታ":"System Connections"}</div>
    <p style={{fontSize:12,color:C.DIM,marginBottom:12,lineHeight:1.5}}>{am?"ሥርዓቶች እርስ በርስ እንዴት እንደሚነኩ ያሳያል።":"How your body systems influence each other. Bright links are active — both connected systems are flagged in your data."}</p>
    <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderRadius:12,padding:"10px",flexShrink:0}}>
        <KnowledgeGraph patient={patient} onPick={onPick}/>
      </div>
      <div style={{flex:1,minWidth:160}}>
        {live.length===0?<p style={{fontSize:12,color:C.DIM}}>No two connected systems are flagged at the same time right now.</p>:
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {live.map((e,i)=><div key={i} style={{background:C.PANEL2,border:`1px solid ${C.FAINT}`,borderLeft:`3px solid ${C.TEAL}`,borderRadius:9,padding:"10px 12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,flexWrap:"wrap"}}>
              <Dot c={SCORE[scoreSystem(patient,e.a).level]}/>{am?byId[e.a].am:byId[e.a].name}
              <span style={{color:C.TEAL}}>↔</span>
              <Dot c={SCORE[scoreSystem(patient,e.b).level]}/>{am?byId[e.b].am:byId[e.b].name}
            </div>
            <div style={{fontSize:11,color:C.DIM,marginTop:4,lineHeight:1.45}}>{e.rel[lang]}</div>
          </div>)}
        </div>}
      </div>
    </div>
  </div>;
}

// ── REPORTS VIEW ──
function ReportsView({patient,lang,apiKey}){
  const am=lang==="am";
  const [report,setReport]=useState(null);
  const [busy,setBusy]=useState(false);
  const [mode,setMode]=useState("patient");
  const flagged=[];Object.entries(LABS).forEach(([id,L])=>{const ser=patient.labs?.[id];const v=latest(ser);const st=statusOf(id,v);if(v!=null&&st!=="normal")flagged.push({id,...L,value:v,status:st,arrow:trendArrow(ser)});});

  async function genReport(){
    if(!apiKey){alert("Connect API key in Chat tab.");return;}
    setBusy(true);setReport(null);
    try{
      const all=abnormalSummary(patient);
      let sp,rpt;
      if(mode==="patient"){
        sp=SAFETY+langLine(lang)+` Write a PATIENT-FACING whole-health report in plain language. No jargon. Warm and encouraging but honest. JSON only: "headline" (1 friendly sentence), "systems" (array {"name","status","text"} status = Stable/Watch/Concern/Urgent), "plan" (array 3-5 plain steps). Keys English, values in response language.`;
        rpt=await callModel(sp,`Person: ${patient.age}y ${patient.sex}. History: ${patient.history||"none"}. Lifestyle: ${lifestyleSummary(patient)}.\n\nFindings: ${all||"None."}\n\nReturn JSON.`,true,1500,apiKey);
      }else{
        sp=SAFETY+langLine(lang)+` Write a whole-system health summary. JSON only: "summary" (1 paragraph), "systems" (array {"name","status","text"} 2-3 sentences each), "recommendations" (array 3-5 strings). Keys English, values in response language.`;
        rpt=await callModel(sp,`Person: ${patient.age}y ${patient.sex}. History: ${patient.history||"none"}. Lifestyle: ${lifestyleSummary(patient)}.\n\nFindings: ${all||"None."}\n\nReturn JSON.`,true,1500,apiKey);
      }
      setReport({mode,data:rpt});
    }catch{setReport({error:true});}
    finally{setBusy(false);}
  }

  const statusColor=s=>{const sl=s?.toLowerCase()||"";if(sl.includes("urgent")||sl.includes("አስቸኳይ"))return C.CRIT;if(sl.includes("concern")||sl.includes("ስጋት"))return C.HI;if(sl.includes("watch")||sl.includes("ክትትል"))return"#F59E0B";return C.OK;};

  return<div style={{padding:"12px 14px",overflowY:"auto",height:"100%"}}>
    <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.TEAL,marginBottom:4}}>{am?"ሪፖርት":"Health Report"}</div>
    <p style={{fontSize:12,color:C.DIM,marginBottom:12,lineHeight:1.5}}>{am?"ሙሉ ጤና ሪፖርት ያግኙ።":"Generate a whole-system health report from your current data."}</p>
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      {[["patient",am?"ለእኔ":"Patient view"],["clinical",am?"ዝርዝር":"Clinical view"]].map(([v,lbl])=>
        <button key={v} onClick={()=>setMode(v)} style={{border:`1px solid ${mode===v?C.TEAL:C.FAINT}`,background:mode===v?`rgba(16,185,129,.1)`:"transparent",color:mode===v?C.TEAL:C.DIM,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:C.SANS}}>{lbl}</button>
      )}
    </div>
    <button onClick={genReport} disabled={busy} style={{background:C.TEAL,color:C.INK,border:"none",borderRadius:9,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:busy?"wait":"pointer",opacity:busy?0.6:1,marginBottom:14}}>
      {am?"ሪፖርት አመንጭ":"Generate report"}
    </button>
    {busy&&<EngineRunning accent={C.TEAL} label="Composing your health report…"/>}
    {report?.error&&<div style={{color:C.CRIT,fontSize:12}}>Could not generate report. Please try again.</div>}
    {report?.data&&<div style={{background:"#fff",color:"#1A2E22",borderRadius:10,padding:"18px",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
      <div style={{borderBottom:"2px solid #1F6E43",paddingBottom:8,marginBottom:12}}>
        <div style={{fontSize:9,letterSpacing:2,color:"#6B8F71",textTransform:"uppercase"}}>e-Genzeb · Dr. Rebira Health OS</div>
        <div style={{fontSize:18,fontWeight:700,color:"#1A2E22",marginTop:2}}>Health Report</div>
        <div style={{fontSize:11,color:"#555",marginTop:2}}>{patient.name} · {patient.age}y {patient.sex} · {new Date().toLocaleDateString()}</div>
      </div>
      {report.mode==="patient"?<>
        {report.data.headline&&<p style={{fontSize:15,fontWeight:600,marginBottom:12,lineHeight:1.5,color:"#1A2E22"}}>{report.data.headline}</p>}
        {Array.isArray(report.data.systems)&&report.data.systems.map((s,i)=><div key={i} style={{marginBottom:8,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:statusColor(s.status),flexShrink:0,marginTop:4}}/>
          <div><span style={{fontWeight:700,fontSize:13}}>{s.name}</span><span style={{fontSize:11,color:"#777",marginLeft:6}}>{s.status}</span><span style={{fontSize:12,lineHeight:1.55}}> — {s.text}</span></div>
        </div>)}
        {Array.isArray(report.data.plan)&&<div style={{background:"#F4F9F5",border:"1px solid #D1E8D7",borderRadius:7,padding:"10px 12px",marginTop:10}}>
          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#1F6E43",marginBottom:6}}>Your plan</div>
          {report.data.plan.map((p,i)=><div key={i} style={{fontSize:12,lineHeight:1.65,paddingLeft:16,textIndent:-16}}>✓ {p}</div>)}
        </div>}
      </>:<>
        {report.data.summary&&<p style={{fontSize:13,lineHeight:1.6,marginBottom:12}}>{report.data.summary}</p>}
        {Array.isArray(report.data.systems)&&report.data.systems.map((s,i)=><div key={i} style={{marginBottom:8}}>
          <span style={{fontWeight:700,fontSize:13}}>{s.name}</span>
          <span style={{fontSize:10,fontWeight:700,color:"#fff",background:statusColor(s.status),borderRadius:20,padding:"1px 8px",marginLeft:6}}>{s.status}</span>
          <span style={{fontSize:12,lineHeight:1.55,marginLeft:4}}>{s.text}</span>
        </div>)}
        {Array.isArray(report.data.recommendations)&&<div style={{marginTop:10}}>
          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#1F6E43",marginBottom:6}}>Recommendations</div>
          {report.data.recommendations.map((r,i)=><div key={i} style={{fontSize:12,lineHeight:1.6,paddingLeft:16,textIndent:-16}}>{i+1}. {r}</div>)}
        </div>}
      </>}
      {flagged.length>0&&<div style={{marginTop:12,borderTop:"1px solid #DCE5DD",paddingTop:10}}>
        <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#1F6E43",marginBottom:6}}>Flagged results</div>
        {flagged.map((r,i)=><div key={r.id} style={{fontSize:11,padding:"3px 0",borderBottom:"1px solid #EEF2EE"}}><b>{r.name}</b>: {r.value} {r.unit} (ref {r.ref[0]}–{r.ref[1]}) — {STATUS_KEY[r.status].en} {r.arrow}</div>)}
      </div>}
      <p style={{fontSize:9,color:"#888",marginTop:12,lineHeight:1.5}}>Educational guidance only. This is not a medical document and must not be used for clinical decisions. Always consult a licensed healthcare professional.</p>
    </div>}
  </div>;
}

// ── CHAT VIEW (passes through to parent) ──
function ChatView({apiKey,drApiKey,lang,onRequestKeySetup}){
  const am=lang==="am";
  return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"24px"}}>
    <div style={{fontSize:30,marginBottom:12}}>💬</div>
    <div style={{fontSize:14,fontWeight:600,color:C.PAPER,marginBottom:6}}>{am?"ዶ/ር ረቢራ ጋር ያናግሩ":"Chat with Dr. Rebira"}</div>
    <p style={{fontSize:12,color:C.DIM,textAlign:"center",lineHeight:1.6,marginBottom:16,maxWidth:280}}>
      {am?"ወደ ዋናው ቻት ለመሄድ ወደ ቤት ይሂዱ።":"Your AI health chat is in the main Health tab. Use the bottom navigation to switch views."}
    </p>
    {!apiKey&&<button onClick={onRequestKeySetup} style={{background:C.TEAL,color:C.INK,border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
      {am?"API ቁልፍ ያስገቡ":"Connect API key"}
    </button>}
  </div>;
}

// ── MAIN DrRebira component ──
export default function DrRebira({ lang, apiKey, onRequestKeySetup }) {
  const [db, setDb] = useState(null);
  const [view, setView] = useState("map");
  const saveTimer = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    const stored = loadDb();
    if (stored && stored.setupDone) {
      setDb(stored);
    } else {
      setDb(defaultPatient());
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current || !db) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDb(db), 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [db]);

  function handleSaveProfile(updates) {
    setDb(prev => ({ ...prev, ...updates }));
    setView("map");
  }

  function handleAddData(type, payload) {
    setDb(prev => {
      const n = clone(prev);
      if (type === "lab") {
        const arr = n.labs[payload.id] || (n.labs[payload.id] = []);
        arr.push({ d: payload.date, v: Number(payload.value) });
        arr.sort((a, b) => a.d.localeCompare(b.d));
      } else {
        if (!n.imaging) n.imaging = [];
        n.imaging.push({ sys: payload.sys, name: payload.name, finding: payload.finding, d: payload.date });
      }
      return n;
    });
  }

  function handleSetIntake(key, val) {
    setDb(prev => ({ ...prev, intake: { ...prev.intake, [key]: val } }));
  }

  function handleToggleScreening(id) {
    setDb(prev => {
      const dates = { ...(prev.screeningDates || {}) };
      if (dates[id]) { delete dates[id]; }
      else { dates[id] = new Date().toISOString().slice(0, 7); }
      return { ...prev, screeningDates: dates };
    });
  }

  if (!db) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.DIM, fontSize: 12 }}>
      <span>Loading…</span>
    </div>
  );

  if (!db.setupDone) return <SetupView patient={db} onSave={handleSaveProfile} lang={lang} />;

  const NAV = [
    ["map", "🗺️", lang === "am" ? "ካርታ" : "Map"],
    ["systems", "🔬", lang === "am" ? "ሥርዓቶች" : "Systems"],
    ["screenings", "📋", lang === "am" ? "ምርመራ" : "Screenings"],
    ["wellness", "🌱", lang === "am" ? "ጤናማነት" : "Wellness"],
    ["graph", "🕸️", lang === "am" ? "ካርታ" : "Graph"],
    ["add", "➕", lang === "am" ? "ጨምር" : "Add"],
    ["reports", "📊", lang === "am" ? "ሪፖርት" : "Reports"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.INK, color: C.PAPER, fontFamily: C.SANS }}>
      <style>{`
        @keyframes drBlink{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes drSweep{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
        .drBtn:hover{opacity:.85!important}
        .drBtn:focus-visible{outline:2px solid ${C.TEAL};outline-offset:2px}
      `}</style>

      {/* inner nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.FAINT}`, background: C.PANEL, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {NAV.map(([id, ico, lbl]) => (
          <button key={id} className="drBtn" onClick={() => setView(id)} style={{
            border: "none", background: "none", cursor: "pointer", fontFamily: C.SANS,
            padding: "8px 10px", fontSize: 10, color: view === id ? C.TEAL : C.DIM,
            borderBottom: view === id ? `2px solid ${C.TEAL}` : "2px solid transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            whiteSpace: "nowrap", flexShrink: 0, minWidth: 46,
          }}>
            <span style={{ fontSize: 14 }}>{ico}</span>
            <span style={{ fontWeight: view === id ? 600 : 400 }}>{lbl}</span>
          </button>
        ))}
        <button className="drBtn" onClick={() => handleSaveProfile({ ...db, setupDone: false })} style={{
          marginLeft: "auto", border: "none", background: "none", cursor: "pointer",
          fontFamily: C.SANS, padding: "8px 10px", fontSize: 10, color: C.DIM, flexShrink: 0,
        }}>⚙️<br /><span style={{ fontSize: 9 }}>Profile</span></button>
      </div>

      {/* view */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "map" && <MapView patient={db} lang={lang} onPick={id => { setView("systems"); }} />}
        {view === "systems" && <SystemsView patient={db} lang={lang} apiKey={apiKey} />}
        {view === "screenings" && <ScreeningsView patient={db} lang={lang} apiKey={apiKey} onToggleDone={handleToggleScreening} />}
        {view === "wellness" && <WellnessView patient={db} lang={lang} apiKey={apiKey} onSetIntake={handleSetIntake} />}
        {view === "graph" && <GraphView patient={db} lang={lang} onPick={id => setView("systems")} />}
        {view === "add" && <AddLabsView patient={db} lang={lang} onAdd={handleAddData} />}
        {view === "reports" && <ReportsView patient={db} lang={lang} apiKey={apiKey} />}
      </div>
    </div>
  );
}
