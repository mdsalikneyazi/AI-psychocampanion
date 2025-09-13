(function(){
const app=document.getElementById('app');
app.innerHTML=
`<div class="container">
  <div class="header">
    <div class="brand"> Mitra</div>
    <div class="sub">Your AI Companion for Psychological First-Aid</div>
  </div>
  <div id="chat" class="chat"></div>
  <div class="composer">
    <input id="input" placeholder="Type a message..."/>
    <button id="send">Send</button>
  </div>
  <div class="footer">
    <div>Private: runs locally in your browser</div>
    <div id="lang" class="lang-toggle">EN</div>
  </div>
</div>`;

const chat=document.getElementById('chat');
const input=document.getElementById('input');
const send=document.getElementById('send');
const langBtn=document.getElementById('lang');

// lightweight conversation history for AI context
const convo=[]; // { role: 'user' | 'assistant', content: string }
// Resolve API base: if opened via file://, fallback to localhost:3000
const apiBase = /^https?:/i.test(location.origin) ? location.origin : 'http://localhost:3000';

const i18n={
  EN:{hello:"Hi, I'm Mitra. Would you like quick coping or a brief wellbeing check?", options:["Quick coping","Wellbeing check"], crisisHint:"If you're in danger or thinking about self-harm, type 'help'."},
  HI:{hello:"नमस्ते, मैं मित्रा हूँ। क्या आप त्वरित मदद चाहते हैं या एक छोटा वेलबीइंग चेक?", options:["त्वरित मदद","वेलबीइंग चेक"], crisisHint:"यदि आप संकट में हैं या आत्म-नुकसान के विचार आ रहे हैं, 'help' लिखें।"}
};
let lang=(localStorage.getItem('mitra_lang')||'EN');
langBtn.textContent=lang;
langBtn.onclick=()=>{lang=lang==='EN'?'HI':'EN';localStorage.setItem('mitra_lang',lang);langBtn.textContent=lang;};

function addMsg(text,who='bot'){const div=document.createElement('div');div.className=`msg ${who==='me'?'me':'bot'}`;div.textContent=text;chat.appendChild(div);chat.scrollTop=chat.scrollHeight;}
function addChips(labels,handler){const wrap=document.createElement('div');wrap.className='chips';labels.forEach((label,i)=>{const b=document.createElement('button');b.className='chip';b.textContent=label;b.onclick=()=>{wrap.remove();handler(i,label)};wrap.appendChild(b);});chat.appendChild(wrap);chat.scrollTop=chat.scrollHeight;return wrap;}

const crisisKeywords=[/suicide/i,/self\s*-?harm/i,/kill myself/i,/end my life/i,/hopeless/i,/no way out/i];
function detectCrisis(t){return crisisKeywords.some(r=>r.test(t));}

const state={mode:null,screen:{phq2:[],gad2:[]},history:JSON.parse(localStorage.getItem('mitra_history')||'[]')};
function saveResult(result){state.history.push({...result,t:Date.now()});localStorage.setItem('mitra_history',JSON.stringify(state.history));}

function start(){addMsg(i18n[lang].hello);convo.push({role:'assistant',content:i18n[lang].hello});addChips(i18n[lang].options,(i,label)=>{addMsg(label,'me');convo.push({role:'user',content:label}); if(i===0) return quickCoping(); if(i===1) return startScreeningMenu();});addMsg(i18n[lang].crisisHint);}

function quickCoping(){addMsg(lang==='EN'?"What would help right now?":"अभी क्या मदद करेगा?");const opts=lang==='EN'?['Breathing','Grounding','Reframe thought','Motivation']:['सांस व्यायाम','ग्राउंडिंग','सोच को नया रूप','प्रेरणा'];addChips(opts,(i,l)=>{addMsg(l,'me'); if(i===0) return breathingMenu(); if(i===1) return grounding(); if(i===2) return reframing(); if(i===3) return motivation();});}

function startScreening(){addMsg(lang==='EN'?"We'll do a short 4-question check (PHQ-2, GAD-2).":"हम 4 छोटे प्रश्न करेंगे (PHQ-2, GAD-2)।");askPHQ2(0);}
function startScreeningMenu(){const labels=lang==='EN'?['Brief check (PHQ-2 + GAD-2)','PHQ-9 (depression)','GHQ-12 (general health)']:['संक्षिप्त जाँच (PHQ-2 + GAD-2)','PHQ-9','GHQ-12'];addMsg(lang==='EN'?"Choose a screening:":"स्क्रीनिंग चुनें:");addChips(labels,(i,label)=>{addMsg(label,'me'); if(i===0) return startScreening(); if(i===1) return askPHQ9(0); if(i===2) return askGHQ12(0);});}
const likertEN=['Not at all','Several days','More than half the days','Nearly every day'];
const likertHI=['बिल्कुल नहीं','कुछ दिन','आधे से ज्यादा दिन','लगभग हर दिन'];
function askPHQ2(idx){const qsEN=["Little interest or pleasure in doing things?","Feeling down, depressed, or hopeless? "];const qsHI=["कामों में रुचि की कमी?","उदास, निराश महसूस करना? "];const qs=lang==='EN'?qsEN:qsHI; if(idx>=2) return askGAD2(0); addMsg(qs[idx]); addChips(lang==='EN'?likertEN:likertHI,(i)=>{state.screen.phq2[idx]=i; askPHQ2(idx+1);});}
function askGAD2(idx){const qsEN=["Feeling nervous, anxious, or on edge?","Not being able to stop or control worrying?"];const qsHI=["घबराहट/बेचैनी महसूस होना?","चिंता को रोक न पाना?"];const qs=lang==='EN'?qsEN:qsHI; if(idx>=2) return scoreAndClassify(); addMsg(qs[idx]); addChips(lang==='EN'?likertEN:likertHI,(i)=>{state.screen.gad2[idx]=i; askGAD2(idx+1);});}
function scoreAndClassify(){const phq2=state.screen.phq2.reduce((a,b)=>a+b,0);const gad2=state.screen.gad2.reduce((a,b)=>a+b,0);const total=phq2+gad2; let risk='mild'; if(total>=6) risk='moderate'; if(total>=8||state.screen.phq2[1]>=2) risk='severe'; const summary=lang==='EN'?`Scores → PHQ-2: ${phq2}, GAD-2: ${gad2}. Risk: ${risk}.`:`स्कोर → PHQ-2: ${phq2}, GAD-2: ${gad2}. जोखिम: ${risk}.`; addMsg(summary); addColorBar(total, 8, 'PHQ-2 + GAD-2'); saveResult({phq2,gad2,risk}); if(risk==='severe'){escalate();} else {postAssessmentSupport(risk);} }
// PHQ-9
const phq9QsEN=['Little interest or pleasure in doing things','Feeling down, depressed, or hopeless','Trouble falling or staying asleep, or sleeping too much','Feeling tired or having little energy','Poor appetite or overeating','Feeling bad about yourself — or that you are a failure or have let yourself or your family down','Trouble concentrating on things, such as reading or watching television','Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual','Thoughts that you would be better off dead, or of hurting yourself'];
function askPHQ9(idx){ if(!state.screen.phq9) state.screen.phq9=[]; if(idx>=9) return scorePHQ9(); addMsg(lang==='EN'?`Over the last 2 weeks, how often have you been bothered by: ${phq9QsEN[idx]}?`:`पिछले 2 हफ्तों में: ${phq9QsEN[idx]}?`); addChips(lang==='EN'?likertEN:likertHI,(i)=>{state.screen.phq9[idx]=i; askPHQ9(idx+1);});}
function scorePHQ9(){ const phq9=state.screen.phq9.reduce((a,b)=>a+b,0); let sev='minimal'; if(phq9>=5) sev='mild'; if(phq9>=10) sev='moderate'; if(phq9>=15) sev='moderately severe'; if(phq9>=20) sev='severe'; addMsg(lang==='EN'?`PHQ-9 total: ${phq9} (${sev}).`:`PHQ-9 कुल: ${phq9} (${sev}).`); addColorBar(phq9, 27, 'PHQ-9'); saveResult({phq9,sev}); if(phq9>=20 || state.screen.phq9[8]>=2){escalate();} else {postAssessmentSupport(phq9>=10?'moderate':'mild');} }
// GHQ-12 (0-0-1-1 scoring)
const ghq12QsEN=['Able to concentrate on what you are doing','Lost much sleep over worry','Felt that you are playing a useful part in things','Felt capable of making decisions about things','Felt constantly under strain','Felt you could not overcome your difficulties','Been able to enjoy your normal day-to-day activities','Been able to face up to your problems','Been feeling unhappy and depressed','Been losing confidence in yourself','Been thinking of yourself as a worthless person','Been feeling reasonably happy, all things considered'];
const ghqOptsEN=['Better than usual','Same as usual','Less than usual','Much less than usual'];
function ghqScore(choice){return choice<=1?0:1;}
function askGHQ12(idx){ if(!state.screen.ghq12) state.screen.ghq12=[]; if(idx>=12) return scoreGHQ12(); addMsg(lang==='EN'?`Over the last few weeks: ${ghq12QsEN[idx]}?`:`पिछले कुछ हफ्तों में: ${ghq12QsEN[idx]}?`); addChips(lang==='EN'?ghqOptsEN:ghqOptsEN,(i)=>{state.screen.ghq12[idx]=ghqScore(i); askGHQ12(idx+1);});}
function scoreGHQ12(){ const ghq=state.screen.ghq12.reduce((a,b)=>a+b,0); let band='low'; if(ghq>=4) band='moderate'; if(ghq>=7) band='high'; addMsg(lang==='EN'?`GHQ-12 total: ${ghq} (${band} distress).`:`GHQ-12 कुल: ${ghq} (${band} तनाव).`); addColorBar(ghq, 12, 'GHQ-12'); saveResult({ghq12:ghq,band}); if(ghq>=7){postAssessmentSupport('moderate');} else {postAssessmentSupport('mild');} }

function escalate(){
  // Add crisis mode styling to chat
  chat.classList.add('crisis-mode');
  
  addMsg(lang==='EN'?"It sounds really tough. You don't have to go through this alone.":"यह बहुत कठिन लगता है। आपको अकेले नहीं जाना है।");
  addMsg(lang==='EN'?"If you're in danger now, please call emergency services.":"यदि आप अभी खतरे में हैं, कृपया आपातकालीन सेवा कॉल करें।");
  
  // Show crisis color bar
  addCrisisColorBar();
  
  resources();
}
function resources(){const msg=lang==='EN'?"India Helpline: 9152987821 / 1800-599-0019. You can also connect to your campus counselor.":"भारत हेल्पलाइन: 9152987821 / 1800-599-0019। आप अपने कैंपस काउंसलर से भी जुड़ सकते हैं।";addMsg(msg);addChips(lang==='EN'?['Book a confidential call','See coping options']:['गोपनीय कॉल बुक करें','मदद विकल्प देखें'],(i)=>{if(i===0){addMsg(lang==='EN'?"(Demo) Booking link opened.":"(डेमो) बुकिंग लिंक खुला।");} else {quickCoping();}});}
function postAssessmentSupport(risk){const txt={mild:lang==='EN'?"Mild distress. Let's build coping skills.":"हल्का तनाव। चलिए मददगार कौशल बनाते हैं।",moderate:lang==='EN'?"Moderate distress. Let's use coping now and consider speaking to a professional if it continues.":"मध्यम तनाव। अभी मदद का उपयोग करें और आवश्यकता हो तो विशेषज्ञ से बात करें।",severe:lang==='EN'?"Severe distress. Support and professional help recommended.":"गंभीर तनाव। सहायता और विशेषज्ञ मदद की सलाह।"}; addMsg(txt[risk]); quickCoping();}

function breathingMenu(){const opts=lang==='EN'?['4-7-8 Breathing','Box Breathing (4-4-4-4)','One-minute timer']:['4-7-8 श्वास','बॉक्स ब्रीदिंग (4-4-4-4)','एक मिनट टाइमर']; addMsg(lang==='EN'?"Choose a breathing exercise:":"सांस व्यायाम चुनें:"); addChips(opts,(i)=>{if(i===0) return breathe478(); if(i===1) return boxBreathing(); if(i===2) return oneMinute();});}
function breathe478(){guide([["Inhale",4],["Hold",7],["Exhale",8]],4);}
function boxBreathing(){guide([["Inhale",4],["Hold",4],["Exhale",4],["Hold",4]],3);}
function oneMinute(){addMsg(lang==='EN'?"Starting a 60s calm timer. Breathe naturally.":"60 सेकंड शांत टाइमर शुरू। सामान्य सांस लें।"); setTimeout(()=>addMsg(lang==='EN'?"Done. How do you feel?":"समाप्त। अब कैसा महसूस हो रहा है?"),60000);}
function guide(phases,cycles){let count=0; const wrap=document.createElement('div'); wrap.className='msg bot'; chat.appendChild(wrap); function step(){const [label,secs]=phases[count%phases.length]; wrap.textContent=`${label}… ${secs}s`; if(count/ phases.length >= cycles){wrap.textContent=lang==='EN'?"Done. How do you feel?":"समाप्त। अब कैसा महसूस हो रहा है?"; return;} count++; setTimeout(step,phases[count%phases.length?count%phases.length-1:phases.length-1]?.[1]*1000||1000);} step();}

function grounding(){addMsg(lang==='EN'?"5-4-3-2-1 Grounding: name 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste.":"5-4-3-2-1 ग्राउंडिंग: 5 देखी चीजें, 4 छूने योग्य, 3 सुनी, 2 सुगंध, 1 स्वाद।");}
function reframing(){addMsg(lang==='EN'?"What thought is bothering you? Try finishing: 'A more helpful way to see this is…'":"कौन सा विचार परेशान कर रहा है? इसे पूरा करें: 'इसे देखने का अधिक सहायक तरीका है…'");}
function motivation(){const msgsEN=["You're doing your best in a tough moment.","Small steps count.","You matter, and help is available."];const msgsHI=["आप कठिन समय में अपनी पूरी कोशिश कर रहे हैं।","छोटे कदम मायने रखते हैं।","आप महत्वपूर्ण हैं, और मदद उपलब्ध है।"]; addMsg((lang==='EN'?msgsEN:msgsHI)[Math.floor(Math.random()*3)]);}

send.onclick=()=>handleInput(); input.addEventListener('keydown',e=>{if(e.key==='Enter') handleInput();});
async function handleInput(){const text=input.value.trim(); if(!text) return; addMsg(text,'me'); convo.push({role:'user',content:text}); input.value=''; if(detectCrisis(text)){return escalate();} if(/help/i.test(text)){return resources();}
  
  // Check if user agrees to wellbeing check
  if(checkWellbeingAgreement(text)){return startScreeningMenu();}
  
  try{
    const resp=await fetch(`${apiBase}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:convo.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content})),language:lang})});
    if(!resp.ok){console.error('AI proxy error', resp.status); throw new Error('bad_status');}
    const data=await resp.json(); if(data&&data.text){addMsg(data.text); convo.push({role:'assistant',content:data.text}); return;}
  }catch(err){console.error('AI call failed', err); addMsg(lang==='EN'?"AI is unavailable. Using buttons for now.":"AI उपलब्ध नहीं है। अभी विकल्पों का उपयोग करें।");}
  addMsg(lang==='EN'?"Choose an option above, or say 'help'.":"ऊपर विकल्प चुनें, या 'help' लिखें।");}

// Check if user agrees to take wellbeing check
function checkWellbeingAgreement(text){
  const agreementKeywords = [
    /yes/i, /sure/i, /ok/i, /okay/i, /i'd like to/i, /i want to/i, /let's do/i,
    /check/i, /assessment/i, /evaluation/i, /test/i, /quiz/i,
    /wellbeing/i, /well-being/i, /mental health/i, /screening/i
  ];
  return agreementKeywords.some(keyword => keyword.test(text));
}

// Add color bar visualization for scores
function addColorBar(score, maxScore, testName) {
  const percentage = (score / maxScore) * 100;
  let color, label, severity;
  
  if (testName === 'PHQ-2 + GAD-2') {
    if (score <= 2) { color = '#4CAF50'; label = 'Low'; severity = 'low'; }
    else if (score <= 4) { color = '#FFEB3B'; label = 'Mild'; severity = 'mild'; }
    else if (score <= 6) { color = '#FF9800'; label = 'Moderate'; severity = 'moderate'; }
    else { color = '#F44336'; label = 'High'; severity = 'severe'; }
  } else if (testName === 'PHQ-9') {
    if (score <= 4) { color = '#4CAF50'; label = 'Minimal'; severity = 'low'; }
    else if (score <= 9) { color = '#FFEB3B'; label = 'Mild'; severity = 'mild'; }
    else if (score <= 14) { color = '#FF9800'; label = 'Moderate'; severity = 'moderate'; }
    else if (score <= 19) { color = '#FF5722'; label = 'Moderately Severe'; severity = 'severe'; }
    else { color = '#F44336'; label = 'Severe'; severity = 'crisis'; }
  } else if (testName === 'GHQ-12') {
    if (score <= 3) { color = '#4CAF50'; label = 'Low'; severity = 'low'; }
    else if (score <= 6) { color = '#FFEB3B'; label = 'Moderate'; severity = 'moderate'; }
    else { color = '#F44336'; label = 'High'; severity = 'severe'; }
  }
  
  const barContainer = document.createElement('div');
  barContainer.className = 'score-bar-container';
  barContainer.innerHTML = `
    <div class="score-info">
      <span class="test-name">${testName}</span>
      <span class="score-value">${score}/${maxScore}</span>
    </div>
    <div class="color-bar">
      <div class="color-fill" style="width: ${percentage}%; background-color: ${color};"></div>
    </div>
    <div class="severity-label" style="color: ${color};">${label}</div>
  `;
  
  chat.appendChild(barContainer);
  chat.scrollTop = chat.scrollHeight;
  
  // If severe/crisis, show immediate help options
  if (severity === 'severe' || severity === 'crisis') {
    setTimeout(() => {
      addMsg(lang === 'EN' ? 
        "Your score indicates you may need additional support. Would you like to connect with a professional?" : 
        "आपके स्कोर से पता चलता है कि आपको अतिरिक्त सहायता की आवश्यकता हो सकती है। क्या आप एक पेशेवर से जुड़ना चाहेंगे?");
      const chips = addChips(lang === 'EN' ? 
        ['Connect with professional', 'Try coping techniques'] : 
        ['पेशेवर से जुड़ें', 'मदद तकनीक आजमाएं'], 
        (i) => {
          if (i === 0) {
            addMsg(lang === 'EN' ? 
              "Connecting you with professional help..." : 
              "आपको पेशेवर मदद से जोड़ा जा रहा है...");
            resources();
          } else {
            quickCoping();
          }
        });
      
      // Add special styling to professional help chip
      if (chips) {
        const professionalChip = chips.querySelector('.chip:first-child');
        if (professionalChip) {
          professionalChip.classList.add('professional');
        }
        const copingChip = chips.querySelector('.chip:last-child');
        if (copingChip) {
          copingChip.classList.add('coping');
        }
      }
    }, 1000);
  }
}

// Special crisis color bar
function addCrisisColorBar() {
  const barContainer = document.createElement('div');
  barContainer.className = 'score-bar-container crisis-mode';
  barContainer.innerHTML = `
    <div class="score-info">
      <span class="test-name">🚨 CRISIS ALERT</span>
      <span class="score-value">IMMEDIATE HELP NEEDED</span>
    </div>
    <div class="color-bar">
      <div class="color-fill" style="width: 100%; background: linear-gradient(90deg, #F44336, #FF5722); animation: crisis-flash 1s infinite;"></div>
    </div>
    <div class="severity-label" style="color: #F44336; animation: crisis-flash 1s infinite;">CRISIS - SEEK HELP NOW</div>
  `;
  
  chat.appendChild(barContainer);
  chat.scrollTop = chat.scrollHeight;
}

start();
})();