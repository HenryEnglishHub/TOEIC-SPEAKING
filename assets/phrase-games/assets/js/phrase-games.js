/* TOEIC Speaking — Collocation practice games demo. Data isolated in assets/data/phrases.js */
(() => {
'use strict';
const TESTS=[...(window.PHRASE_DATA||[]),...(window.PHRASE_DATA_EXTRA||[])];
const groupLabel=t=>t?.kind==='topic'?'TOPIC':'TEST';
const ALL=TESTS.flatMap(t=>t.sections.flatMap(q=>q.items));
const BYID=new Map(ALL.map(x=>[x.id,x]));
const META=window.PHRASE_META||{};
const QUESTION_TEXT=window.PHRASE_QUESTION_TEXT||{};
const questionKey=(test,section)=>'t'+test.test+'q'+section.question;
const questionPrompt=(test,section)=>QUESTION_TEXT[questionKey(test,section)]||null;
const practiceTiming=question=>question===11?{prep:45,answer:60}:question===7||question===6?{prep:3,answer:30}:{prep:3,answer:15};
for(const item of ALL){const m=META[item.id]||{};item.category=m.category||'Word combination';item.example=m.example||'';}

const app=document.getElementById('app'),toastbox=document.getElementById('toast');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const rand=a=>a[Math.floor(Math.random()*a.length)];
const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();
const byID=id=>BYID.get(id);
const state={test:0,q:0,selected:new Set(),onlySelected:false,search:'',kind:'all',screen:'list',game:null};
try{const saved=JSON.parse(localStorage.getItem('toeic_phrase_game_selection_v1')||'[]');if(Array.isArray(saved))saved.forEach(id=>{if(BYID.has(id))state.selected.add(id)})}catch(e){}
let toastTimer=null,ttsSeq=0,recognition=null,flyFrame=0,flyActors=[];
let practiceTimer=null,practiceData=null,practiceRecorder=null,practiceStream=null,practiceChunks=[],practiceAudioUrl=null;
let audioContext=null;
function effectSound(kind='tap'){
  try{
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return;
    if(!audioContext)audioContext=new A();
    if(audioContext.state==='suspended')audioContext.resume();
    const t=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type=kind==='wrong'?'sawtooth':'sine';
    const notes={tap:[420,590,.075],right:[680,1020,.14],wrong:[270,185,.16]};
    const [start,end,sec]=notes[kind]||notes.tap;
    osc.frequency.setValueAtTime(start,t);osc.frequency.exponentialRampToValueAtTime(end,t+sec);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(kind==='wrong'?.045:.065,t+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,t+sec);
    osc.connect(gain).connect(audioContext.destination);osc.start(t);osc.stop(t+sec+.01);
  }catch(e){}
}
const ipaLine=x=>x?.ipa?`<span class="ipa">${safe(x.ipa)}</span>`:'';
const englishLine=(x,cls='en')=>`<div class="${cls}"><span>${safe(x.en)}</span>${ipaLine(x)}</div>`;
function stopFlying(){if(flyFrame)cancelAnimationFrame(flyFrame);flyFrame=0;flyActors=[]}

const persist=()=>{try{localStorage.setItem('toeic_phrase_game_selection_v1',JSON.stringify([...state.selected]));}catch(e){}};
const toast=msg=>{toastbox.textContent=msg;toastbox.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastbox.classList.remove('show'),2500)};
const getVoices=(lang)=>{const v=speechSynthesis.getVoices();return v.find(x=>x.lang.toLowerCase()===(lang==='vi'?'vi-vn':'en-gb'))||v.find(x=>x.lang.toLowerCase().startsWith(lang==='vi'?'vi':'en'))||null};
function cancelSound(){ttsSeq++;if('speechSynthesis' in window)speechSynthesis.cancel();if(recognition){try{recognition.abort()}catch(e){}recognition=null}}
function say(text,lang='en',rate=1){if(!('speechSynthesis' in window)){toast('Trình duyệt chưa hỗ trợ đọc văn bản.');return}cancelSound();const u=new SpeechSynthesisUtterance(text);u.lang=lang==='vi'?'vi-VN':'en-GB';u.rate=rate;const v=getVoices(lang);if(v)u.voice=v;speechSynthesis.speak(u)}
function saySequence(seq,status){if(!('speechSynthesis' in window)){toast('Trình duyệt không hỗ trợ đọc văn bản.');return}cancelSound();const token=ttsSeq;let i=0;function next(){if(token!==ttsSeq)return;if(i>=seq.length){if(status)status('Hoàn thành lượt nghe.');return}const item=seq[i++];if(status)status(item.note||'Đang phát âm...');const u=new SpeechSynthesisUtterance(item.text);u.lang=item.lang==='vi'?'vi-VN':'en-GB';u.rate=item.rate||1;const v=getVoices(item.lang);if(v)u.voice=v;u.onend=()=>{if(token===ttsSeq)setTimeout(next,window.__phraseEchoGapMs??230)};u.onerror=()=>{if(token===ttsSeq)setTimeout(next,window.__phraseEchoGapMs??230)};speechSynthesis.speak(u)}next()}
function stopPracticeTimer(){if(practiceTimer){clearInterval(practiceTimer);practiceTimer=null;}}
function stopPracticeMedia(){if(practiceRecorder&&practiceRecorder.state!=='inactive'){try{practiceRecorder.stop()}catch(e){}}if(practiceStream){practiceStream.getTracks().forEach(t=>t.stop());practiceStream=null;}}
function resetPractice(opts={}){stopPracticeTimer();stopPracticeMedia();if(!opts.keepAudio&&practiceAudioUrl){URL.revokeObjectURL(practiceAudioUrl);practiceAudioUrl=null;}practiceData=null;}
function practiceQuestionBlock(t,q){
  const full=questionPrompt(t,q);
  const timing=practiceTiming(q.question);
  return `<section id="questionPreview" class="practice-question practice-question-prominent" aria-label="Câu hỏi luyện nói Question ${q.question}">
    <div class="practice-question-copy">
      <div class="practice-eyebrow">📝 ${groupLabel(t)} ${String(t.test).padStart(2,'0')} · QUESTION ${q.question} — CÂU HỎI LUYỆN NÓI</div>
      <div class="practice-question-text" lang="en">${safe(full||q.title)}</div>
      <div class="practice-question-hint">${full?'Đọc câu hỏi, học các cụm từ gợi ý bên dưới, rồi luyện nói khi sẵn sàng.':'Đây là chủ điểm luyện nói; chưa có câu hỏi nguyên văn trong nguồn.'}</div>
      <div class="practice-question-time">⏱ Chuẩn bị ${timing.prep}s · Trả lời ${timing.answer}s</div>
    </div>
    <div class="practice-question-buttons">${full?'<button type="button" class="practice-secondary" data-action="read-question">🔊 Nghe câu hỏi</button>':''}<button type="button" class="practice-start" data-action="start-practice">⏱ Bắt đầu luyện nói</button></div>
  </section>`;
}
function mmss(sec){const n=Math.max(0,Math.ceil(sec));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function practiceMarkup(){
 const t=TESTS[state.test],q=currentSection(),p=practiceData,full=questionPrompt(t,q),selectedForQuestion=q.items.filter(x=>state.selected.has(x.id));
 const picks=selectedForQuestion.length?selectedForQuestion:q.items;
 const options=picks.slice(0,12).map(x=>`<div class="practice-phrase"><strong>${safe(x.en)}</strong><small>${safe(x.vi)}</small></div>`).join('');
 const stage=p.stage==='ready'?'SẴN SÀNG':p.stage==='prep'?'THỜI GIAN CHUẨN BỊ':p.stage==='answer'?'ĐANG TRẢ LỜI':'HOÀN THÀNH';
 const display=p.stage==='ready'?p.prep:p.remaining;
 return baseTop()+`<div class="container timed-practice-page"><div class="practice-back"><button class="btn" data-action="return-practice">← Quay lại học cụm từ</button></div><div class="timed-practice-card"><div class="practice-topline">⏱ TOEIC SPEAKING · LUYỆN NÓI CÓ ĐẾM GIỜ</div><div class="practice-current">${groupLabel(t)} ${String(t.test).padStart(2,'0')} · QUESTION ${q.question}</div><h2>${safe(full||q.title)}</h2>${full?'':`<div class="practice-source-note">Chưa có nguyên văn câu hỏi trong tài liệu TOPIC 11–34. Đây là tên chủ điểm, không phải câu hỏi gốc.</div>`}<div class="practice-clock-panel"><div class="clock-stage" id="clockStage">${stage}</div><div class="practice-clock" id="practiceClock" aria-live="off">${mmss(display)}</div><div class="practice-progress"><span id="practiceProgress" style="width:${p.stage==='done'?100:0}%"></span></div><div class="practice-presets">Chuẩn bị <b>${p.prep}s</b> · Trả lời <b>${p.answer}s</b> · Có thể điều chỉnh trước khi bắt đầu</div></div><div class="practice-settings"><label>Chuẩn bị (giây)<input type="number" min="0" max="180" step="1" data-action="practice-prep" value="${p.prep}" ${p.stage!=='ready'?'disabled':''}></label><label>Trả lời (giây)<input type="number" min="5" max="300" step="5" data-action="practice-answer" value="${p.answer}" ${p.stage!=='ready'?'disabled':''}></label></div><div class="practice-controls">${p.stage==='ready'?'<button class="btn orange" data-action="practice-go">▶ Bắt đầu tính giờ</button>':p.stage==='done'?'<button class="btn orange" data-action="practice-reset">↻ Luyện lại</button>':`<button class="btn orange" data-action="practice-pause">${p.paused?'▶ Tiếp tục':'⏸ Tạm dừng'}</button>`}<button class="btn" data-action="practice-reset">↻ Đặt lại</button>${full?'<button class="btn" data-action="read-question">🔊 Nghe câu hỏi</button>':''}<button class="btn" data-action="practice-next">Câu tiếp →</button></div><div class="practice-recording"><button class="btn" data-action="practice-record" id="recordBtn">🎙 Ghi âm (tùy chọn)</button><span id="recordStatus">Chỉ có thể ghi âm khi trình duyệt cho phép micro.</span><audio id="practiceAudio" controls hidden></audio></div></div><div class="practice-helpers"><h3>Gợi ý cụm từ cho Question ${q.question}</h3><p>${selectedForQuestion.length?'Những cụm bạn đã chọn trong Question này':'Các cụm từ gợi ý; có thể chọn trước ở màn hình danh sách'}</p><div class="practice-phrase-grid">${options}</div></div></div>`;
}
function renderPractice(){app.innerHTML=practiceMarkup();}
function practiceTick(){
 const p=practiceData;if(!p||p.paused||p.stage==='ready'||p.stage==='done')return;
 const now=Date.now();p.remaining=Math.max(0,Math.ceil((p.until-now)/1000));
 const d=document.getElementById('practiceClock'),label=document.getElementById('clockStage'),progress=document.getElementById('practiceProgress');
 if(d)d.textContent=mmss(p.remaining);if(progress)progress.style.width=(100*(1-p.remaining/Math.max(1,p.stage==='prep'?p.prep:p.answer)))+'%';
 if(p.remaining===0){effectSound('right');if(p.stage==='prep'){p.stage='answer';p.remaining=p.answer;p.until=Date.now()+p.answer*1000;renderPractice();}else{p.stage='done';stopPracticeTimer();stopPracticeMedia();renderPractice();}}
 else if(label)label.textContent=p.stage==='prep'?'THỜI GIAN CHUẨN BỊ':'ĐANG TRẢ LỜI';
}
function practiceGo(){const p=practiceData;if(!p)return;p.stage=p.prep>0?'prep':'answer';p.paused=false;p.remaining=p.prep>0?p.prep:p.answer;p.until=Date.now()+p.remaining*1000;stopPracticeTimer();practiceTimer=setInterval(practiceTick,180);renderPractice();}
function openPractice(){cancelSound();stopFlying();resetPractice();const q=currentSection(),t=practiceTiming(q.question);practiceData={stage:'ready',prep:t.prep,answer:t.answer,remaining:t.prep,paused:false,until:null};state.screen='timed';renderPractice();scrollTo(0,0);}
async function togglePracticeRecording(){
 const btn=document.getElementById('recordBtn'),status=document.getElementById('recordStatus'),player=document.getElementById('practiceAudio');
 if(practiceRecorder&&practiceRecorder.state==='recording'){practiceRecorder.stop();if(btn)btn.textContent='🎙 Ghi âm lại';if(status)status.textContent='Đã dừng ghi âm.';return}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){if(status)status.textContent='Thiết bị hoặc trình duyệt không hỗ trợ ghi âm.';return}
 try{stopPracticeMedia();practiceStream=await navigator.mediaDevices.getUserMedia({audio:true});practiceChunks=[];const recorder=new MediaRecorder(practiceStream);practiceRecorder=recorder;recorder.ondataavailable=e=>{if(e.data?.size)practiceChunks.push(e.data)};recorder.onstop=()=>{if(practiceChunks.length){if(practiceAudioUrl)URL.revokeObjectURL(practiceAudioUrl);practiceAudioUrl=URL.createObjectURL(new Blob(practiceChunks,{type:recorder.mimeType||'audio/webm'}));const a=document.getElementById('practiceAudio');if(a){a.src=practiceAudioUrl;a.hidden=false}}if(practiceStream){practiceStream.getTracks().forEach(t=>t.stop());practiceStream=null}const st=document.getElementById('recordStatus');if(st)st.textContent='Bấm Play để nghe lại bài nói.'};recorder.start();if(btn)btn.textContent='⏹ Dừng ghi âm';if(status)status.textContent='Đang ghi âm trên thiết bị...';}catch(e){if(status)status.textContent='Không bật được micro. Hãy cấp quyền trên trình duyệt.'}
}
function currentSection(){return TESTS[state.test].sections[state.q]}
function selectedItems(){return ALL.filter(x=>state.selected.has(x.id))}
function filtered(){let items=state.onlySelected?selectedItems():currentSection().items;const query=normalize(state.search);if(query)items=items.filter(x=>normalize(x.en).includes(query)||normalize(x.vi).includes(query)||normalize(x.example).includes(query));if(state.kind!=='all')items=items.filter(x=>x.category===state.kind);return items}
function baseTop(){const onList=state.screen==='list';return `<header class="topbar"><div class="logo"><span class="logo-icon">✦</span><div>TOEIC SPEAKING<small>PHRASE PRACTICE</small></div></div><div class="top-right"><button type="button" class="top-back" data-action="${onList?'return-hub':'home'}">${onList?'← TRANG CHÍNH':'← DANH SÁCH CỤM TỪ'}</button></div></header>`}
function overview(){return ''}
function render(){if(state.screen==='list'){renderList();requestAnimationFrame(()=>{const nav=document.querySelector('.sidebar'),btn=nav?.querySelector('.testbtn.active');if(nav&&btn)nav.scrollTop=Math.max(0,btn.offsetTop-nav.offsetTop-115)});return}if(state.screen==='menu')return renderMenu();if(state.screen==='timed')return renderPractice();return renderGame()}
function renderList(){
 const t=TESTS[state.test],q=currentSection(),list=filtered(),group=groupLabel(t);
 const options=TESTS.map((item,i)=>`<option value="${i}" ${i===state.test?'selected':''}>${groupLabel(item)} ${String(item.test).padStart(2,'0')} · ${safe(item.title)}</option>`).join('');
 const CATS=['all','Verb phrase','Collocation','Word combination','Time expression'];
 const tabs=[['flash','🗂️ Flashcard'],['quiz','✅ Trắc nghiệm'],['fly','🚀 Chữ bay'],['match','🧩 Ghép từ'],['echo','🔁 Word Echo'],['viquiz','🇻🇳 Việt → Chọn Anh'],['vispeak','🎤 Việt → Nói Anh'],['fill','✍️ Điền từ']];
 app.innerHTML=baseTop()+`<div class="container phrase-workspace">
  <section class="kb-hero"><div class="kb-kicker">✦ TOEIC SPEAKING · PHRASE KNOWLEDGE BANK</div><h1>Học cụm từ & luyện tập</h1><p>Chọn cụm từ có IPA, nghĩa và ví dụ, sau đó luyện qua các trò chơi ghi nhớ.</p></section>
  <main class="contentbox phrases-panel">
    <div class="kb-filters">
      <div class="topic-switch"><button class="topic-arrow" data-action="topic-prev" aria-label="Chủ đề trước" ${state.test===0?'disabled':''}>‹</button><label class="topic-select"><span>CHỌN BỘ ĐỀ / CHỦ ĐỀ</span><select id="topicPicker" data-action="test-select" aria-label="Chọn bộ đề hoặc chủ đề">${options}</select></label><button class="topic-arrow" data-action="topic-next" aria-label="Chủ đề sau" ${state.test===TESTS.length-1?'disabled':''}>›</button></div>
      <label class="search-wrap"><span class="search-icon">⌕</span><input id="phraseSearch" class="search" type="search" autocomplete="off" placeholder="Tìm cụm từ, IPA, nghĩa hoặc ví dụ..." value="${safe(state.search)}"></label>
      <div class="filter-buttons"><button class="btn flat" data-action="select-visible">✓ Chọn tất cả</button><button class="btn flat" data-action="clear-visible">Bỏ chọn</button><label class="toggle"><input type="checkbox" data-action="only-selected" ${state.onlySelected?'checked':''}> Chỉ từ đã chọn</label></div>
    </div>
    <div class="topic-identity"><div class="identity-main"><span class="topic-eyebrow">${group} ${String(t.test).padStart(2,'0')}</span><h2>${safe(t.title)}</h2></div><div class="selected-inline"><strong id="selCount">${state.selected.size} cụm đã chọn</strong><button class="mini-clear" data-action="clear-all">Bỏ chọn tất cả</button></div></div>
    <div class="question-tabs" role="group" aria-label="Chọn câu hỏi">${t.sections.map((s,i)=>`<button class="qtab ${state.q===i&&!state.onlySelected?'active':''}" data-action="q" data-index="${i}">QUESTION ${s.question}</button>`).join('')}</div>
    ${practiceQuestionBlock(t,q)}
    <div class="kb-game-tabs"><button class="kb-learn-tab active" type="button" data-action="learn-only">📚 Học cụm từ</button>${tabs.map(([mode,label])=>`<button type="button" data-action="start-game" data-mode="${mode}">${label}</button>`).join('')}</div>
    <div class="kb-cards-heading"><div><h3>${state.onlySelected?'CÁC CỤM TỪ ĐÃ CHỌN':`QUESTION ${q.question} – ${safe(q.title)}`}</h3><p>Chạm cả thẻ để chọn học · nút 🔊 để nghe phát âm Anh Anh.</p></div><span class="section-count">${list.length} cụm từ</span></div>
    <div class="category-bar"><span>PHÂN LOẠI:</span>${CATS.map(c=>`<button data-action="kind" data-kind="${c}" class="category-filter ${state.kind===c?'active':''}">${c==='all'?'Tất cả':c}</button>`).join('')}</div>
    <div class="phrase-list" id="phraseList">${wordRows(list)}</div>
  </main>
 </div>`;
}
function wordRows(list){return list.length?list.map(x=>`<div class="wordrow ${state.selected.has(x.id)?'selected':''}" data-row="${x.id}" data-action="row-select" role="group" aria-label="${safe(x.en)}"><label class="check-cell"><input type="checkbox" data-action="toggle" data-id="${x.id}" aria-label="Chọn ${safe(x.en)}" ${state.selected.has(x.id)?'checked':''}></label><div class="phrase-card-body"><div class="en">${safe(x.en)}${ipaLine(x)}</div><div class="vi">${safe(x.vi)}</div><div class="example"><span class="example-label">EXAMPLE</span> ${safe(x.example)}</div></div><span class="phrase-type">${safe(x.category)}</span><button class="listen" data-action="speak" data-id="${x.id}" title="Nghe phát âm">🔊</button></div>`).join(''):`<div class="empty">Không có cụm từ phù hợp. Hãy thử bộ lọc khác.</div>`}
function pickbar(){return ''}
function refreshRows(){const pane=document.getElementById('phraseList');if(pane)pane.innerHTML=wordRows(filtered());const el=document.getElementById('selCount');if(el)el.textContent=state.selected.size+' cụm đã chọn';const count=document.querySelector('.kb-cards-heading .section-count');if(count)count.textContent=filtered().length+' cụm từ'}

const MODES=[['flash','🃏','Flashcard','Lật thẻ Anh – Việt để ghi nhớ'],['match','🧩','Ghép từ','Ghép đúng cụm từ với nghĩa'],['quiz','✅','Trắc nghiệm','Đọc tiếng Anh, chọn nghĩa đúng'],['viquiz','🇻🇳','Việt → Chọn Anh','Nghe/đọc nghĩa và chọn cụm từ'],['vispeak','🎤','Việt → Nói Anh','Nhìn nghĩa, tự nói lại tiếng Anh'],['fill','✍️','Điền từ','Chọn từ còn thiếu trong cụm'],['fly','🚀','Chữ bay','Nghe Anh hoặc Việt, chạm đúng cụm'],['echo','🔁','Word Echo','Nghe nhanh → chậm, luyện nhắc lại']];
function renderMenu(){app.innerHTML=baseTop()+`<div class="container"><div class="game-shell"><button class="backlink" data-action="home">← Quay lại chọn cụm từ</button><section class="game-intro"><div class="game-intro-header"><div><span class="eyebrow">🎮 IELTS-STYLE VOCABULARY GAMES</span><h2>Chọn trò chơi ghi nhớ</h2><p>Đã chọn <b>${state.selected.size}</b> cụm từ. Mỗi game chỉ sử dụng những cụm từ bạn đã chọn.</p></div><span class="topic-count">8 GAME</span></div><div class="mode-grid">${MODES.map(m=>`<button class="mode" data-action="start-game" data-mode="${m[0]}"><span class="mode-icon">${m[1]}</span><strong>${m[2]}</strong><small>${m[3]}</small></button>`).join('')}</div></section><p class="footer-tip">Các trò chơi sử dụng đúng những cụm từ bạn đã chọn.</p></div></div>`}
function startGame(mode){const deck=selectedItems();if(!deck.length){state.screen='list';render();toast('Hãy chọn ít nhất 1 cụm từ trước khi chơi.');return}if(mode==='match'&&deck.length<2){toast('Game Ghép từ cần chọn ít nhất 2 cụm từ.');return}cancelSound();state.screen='game';const g={mode,deck:shuffle(deck),i:0,score:0,answered:false,choice:null,flipped:false,round:0,lang:'en',speed:1.65,repeats:5,startRate:3,endRate:1,gapMs:400,autoPlay:true,recognitionResult:'',showAnswer:false,playing:false};state.game=g;if(mode==='match')setupMatch();if(mode==='fill')g.fillQuestion=makeFillQ(g.deck[0]);if(mode==='fly')setupFly();renderGame();if(mode==='fly'){setTimeout(()=>{if(state.screen==='game'&&state.game===g)flySpeak()},250)}else if(mode==='flash'){say(g.deck[g.i].en)}}
function gameTitle(){return MODES.find(m=>m[0]===state.game.mode)?.[2]||'Game'}
function gameStep(){const g=state.game;return `${Math.min(g.i+1,g.deck.length)} / ${g.deck.length}`}
function renderGame(){
 const g=state.game;stopFlying();
 if(g.mode==='fly'){
   app.innerHTML=flyFullScreenMarkup();
   if(!g.finished){placeFlyingWords();setTimeout(()=>{if(state.game===g&&state.screen==='game')flySpeak()},250);}
   return;
 }
 if(g.mode==='echo'){
   app.innerHTML=`<div class="word-echo-host"><iframe class="word-echo-frame" id="echoFrame" title="Word Echo – TOEIC Speaking" allow="autoplay"></iframe><button class="word-echo-exit" data-action="home">← Danh sách cụm từ</button></div>`;
   const f=document.getElementById('echoFrame');
   try{
     const encoded=window.TOEIC_WORD_ECHO_B64||'';
     const template=new TextDecoder().decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)));
     const words=g.deck.map(x=>({en:x.en,vi:x.vi,ipa:x.ipa||'',pos:x.category||'Cụm từ',cefr:'',example:x.example||'',exampleVI:''}));
     const json=JSON.stringify(words).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
     const pattern=/const words=\[[\s\S]*?\];(?=\s*const \$=id)/;
     if(!pattern.test(template))throw Error('No Word Echo data slot');
     f.srcdoc=template.replace(pattern,()=>`const words=${json};`);
   }catch(err){console.error('Word Echo source unavailable',err);app.innerHTML=baseTop()+`<main class="container"><p>Không tải được Word Echo. Vui lòng thử mở trang trên Chrome hoặc Edge.</p><button class="btn orange" data-action="home">← Quay lại</button></main>`}
   return;
 }
 app.innerHTML=baseTop()+`<div class="container"><div class="game-shell"><button class="backlink" data-action="home">← Danh sách cụm từ</button><div class="game-nav"><div><h2>${MODES.find(m=>m[0]===g.mode)[1]} ${gameTitle()}</h2><p>${g.deck.length} cụm từ đã chọn</p></div><div class="score" id="gameScore">⭐ ${g.score} ĐIỂM</div></div><main class="game-area" id="gameArea">${gameMarkup()}</main></div></div>`;
}
function stage(){const g=state.game;if(g.mode==='fly'||g.mode==='echo'){renderGame();return}const e=document.getElementById('gameArea');if(e)e.innerHTML=gameMarkup();const score=document.getElementById('gameScore');if(score)score.textContent='⭐ '+g.score+' ĐIỂM'}

function progress(i,total){return `<div class="game-top"><span class="step">CỤM TỪ ${i+1} / ${total}</span><span class="step">${Math.round((i/total)*100)}% HOÀN THÀNH</span></div><div class="progress-track"><div class="progress-fill" style="width:${i/total*100}%"></div></div>`}
function gameMarkup(){const g=state.game;if(g.finished)return resultMarkup();if(g.mode==='flash')return flashMarkup();if(g.mode==='quiz'||g.mode==='viquiz')return quizMarkup();if(g.mode==='fill')return fillMarkup();if(g.mode==='match')return matchMarkup();if(g.mode==='vispeak')return speakMarkup();if(g.mode==='fly')return flyMarkup();if(g.mode==='echo')return echoMarkup();return ''}
function finish(){stopFlying();cancelSound();state.game.finished=true;stage()}
function resultMarkup(){const g=state.game;return `<div class="result"><div class="trophy">🏆</div><span class="eyebrow">HOÀN THÀNH</span><h2>Giỏi lắm! Bạn đã hoàn thành.</h2><p>${safe(gameTitle())} · ${g.deck.length} cụm từ</p><div class="finalscore">⭐ ${g.score} điểm</div><div class="game-actions"><button class="btn navy" data-action="replay-game">↻ Chơi lại</button><button class="btn orange" data-action="menu">🎮 Game khác</button><button class="btn" data-action="home">📚 Chọn thêm cụm từ</button></div></div>`}
function flashMarkup(){const g=state.game,x=g.deck[g.i];return progress(g.i,g.deck.length)+`<button class="flashcard ${g.flipped?'reversed':''}" data-action="flip"><small>${g.flipped?'NGHĨA TIẾNG VIỆT':safe(x.category)}</small><b>${safe(g.flipped?x.vi:x.en)}</b>${g.flipped?`<strong class="flash-back-english">${safe(x.en)}</strong>`:''}${ipaLine(x)}<span>Chạm để lật ↻ · Mỗi lần lật sẽ đọc tiếng Anh</span></button><div class="game-actions"><button class="btn" data-action="flash-prev" ${g.i===0?'disabled':''}>← Trước</button><button class="btn" data-action="speak" data-id="${x.id}">🔊 Nghe tiếng Anh</button><button class="btn orange" data-action="flash-next">${g.i===g.deck.length-1?'Hoàn thành ✓':'Tiếp theo →'}</button></div>`}

function makeOptions(correct,field){const pool=shuffle(ALL.filter(x=>x.id!==correct.id&&x[field]!==correct[field]));let choices=[correct,...pool.slice(0,3)];return shuffle(choices)}
function quizMarkup(){const g=state.game,x=g.deck[g.i],vi=g.mode==='viquiz';if(!g.choices)g.choices=makeOptions(x,vi?'en':'vi');const val=vi?'en':'vi';return progress(g.i,g.deck.length)+`<div class="prompt"><div class="prompt-label">${vi?'NGHĨA TIẾNG VIỆT':'CỤM TỪ TIẾNG ANH'}</div><h2>${safe(vi?x.vi:x.en)}</h2>${!vi?ipaLine(x):''}${vi?'<p>Chọn cụm từ tiếng Anh phù hợp nhất.</p>':'<p>Chọn nghĩa tiếng Việt phù hợp nhất.</p>'}</div><div class="answer-grid">${g.choices.map(c=>`<button class="answer ${g.answered?(c.id===x.id?'right':c.id===g.choice?'wrong':''):''}" data-action="quiz-answer" data-id="${c.id}" ${g.answered?'disabled':''}>${safe(c[val])}${vi?ipaLine(c):''}</button>`).join('')}</div><div class="feedback">${g.answered?`<span>${g.choice===x.id?'✅ Chính xác!':'💡 Đáp án đúng:'}</span><strong class="answer-english">${safe(x.en)}</strong>${ipaLine(x)}`:''}</div><div class="game-actions">${vi?`<button class="btn" data-action="say-vi">🔊 Nghe nghĩa tiếng Việt</button>`:`<button class="btn" data-action="speak" data-id="${x.id}">🔊 Phát âm</button>`}${g.answered?`<button class="btn orange" data-action="next-quiz">${g.i===g.deck.length-1?'Xem kết quả →':'Câu tiếp theo →'}</button>`:''}</div>`}
const STOP=new Set('my the a an and to of in on for or at with from more how this that their is are as do be it can I you me we'.toLowerCase().split(' '));
function makeFillQ(x){const tokens=x.en.split(/\s+/);let sorted=tokens.map((word,i)=>({word:word.replace(/[.,!?]/g,''),i})).filter(k=>k.word.length>=4&&!STOP.has(k.word.toLowerCase()));let chosen=sorted.length?sorted.sort((a,b)=>b.word.length-a.word.length)[0]:{word:tokens[tokens.length-1].replace(/[.,!?]/g,''),i:tokens.length-1};let blank=tokens.map((s,i)=>i===chosen.i?'________':s).join(' ');let distractors=new Set();let trylist=shuffle(ALL.filter(w=>w.id!==x.id).flatMap(w=>w.en.split(/\s+/).map(s=>s.replace(/[.,!?]/g,''))).filter(w=>w.length>=4&&!STOP.has(w.toLowerCase())));for(const w of trylist){if(w.toLowerCase()!==chosen.word.toLowerCase())distractors.add(w);if(distractors.size===3)break}return {blank,word:chosen.word,options:shuffle([chosen.word,...distractors])}}
function fillMarkup(){const g=state.game,x=g.deck[g.i],f=g.fillQuestion;return progress(g.i,g.deck.length)+`<div class="prompt"><div class="prompt-label">CHỌN TỪ CÒN THIẾU</div><h2>${safe(f.blank)}</h2><p>${safe(x.vi)}</p></div><div class="answer-grid">${f.options.map(k=>`<button class="answer ${g.answered?(k===f.word?'right':k===g.choice?'wrong':''):''}" data-action="fill-answer" data-word="${safe(k)}" ${g.answered?'disabled':''}>${safe(k)}</button>`).join('')}</div><div class="feedback">${g.answered?`<span>${g.choice===f.word?'✅ Chính xác!':'💡 Từ đúng: '+safe(f.word)}</span><strong class="answer-english">${safe(x.en)}</strong>${ipaLine(x)}`:''}</div><div class="game-actions"><button class="btn" data-action="speak" data-id="${x.id}">🔊 Nghe cụm từ</button>${g.answered?`<button class="btn orange" data-action="next-fill">${g.i===g.deck.length-1?'Xem kết quả →':'Tiếp theo →'}</button>`:''}</div>`}
function setupMatch(){const g=state.game;g.matchChunk=g.deck.slice(g.round*10,g.round*10+10);g.matchLeft=shuffle(g.matchChunk);g.matchRight=shuffle(g.matchChunk);g.matchSelected=null;g.matchDone=new Set();g.matchNotice='Chạm một cụm tiếng Anh và nghĩa tiếng Việt tương ứng.'}
function matchMarkup(){const g=state.game;if(g.round*10>=g.deck.length){g.finished=true;return resultMarkup()}const done=g.matchDone.size;return `<div class="game-top"><span class="step">NHÓM ${g.round+1} / ${Math.ceil(g.deck.length/10)}</span><span class="step">ĐÃ GHÉP ${done} / ${g.matchChunk.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${(g.round*10+done)/g.deck.length*100}%"></div></div><div class="match-grid"><div class="match-side"><span class="step">TIẾNG ANH</span>${g.matchLeft.map(x=>`<button class="match-item ${g.matchSelected===x.id?'active':''} ${g.matchDone.has(x.id)?'done':''}" data-action="match-left" data-id="${x.id}" ${g.matchDone.has(x.id)?'disabled':''}>${safe(x.en)}${ipaLine(x)}</button>`).join('')}</div><div class="match-side"><span class="step">TIẾNG VIỆT</span>${g.matchRight.map(x=>`<button class="match-item ${g.matchDone.has(x.id)?'done':''}" data-action="match-right" data-id="${x.id}" ${g.matchDone.has(x.id)?'disabled':''}>${safe(x.vi)}</button>`).join('')}</div></div><p class="game-note">${safe(g.matchNotice)}</p>${done===g.matchChunk.length?`<div class="game-actions"><button class="btn orange" data-action="next-match">${(g.round+1)*10>=g.deck.length?'Xem kết quả →':'Nhóm tiếp theo →'}</button></div>`:''}`}
function speakMarkup(){const g=state.game,x=g.deck[g.i];return progress(g.i,g.deck.length)+`<div class="prompt-label" style="text-align:center;margin-top:22px">NHÌN NGHĨA – NÓI TIẾNG ANH</div><div class="speaking-vi">${safe(x.vi)}</div><div class="game-actions"><button class="btn navy" data-action="speak-record">🎙️ Bắt đầu nói</button><button class="btn" data-action="speak-answer">${g.showAnswer?'🙈 Ẩn đáp án':'👁 Hiện đáp án'}</button><button class="btn" data-action="speak" data-id="${x.id}">🔊 Nghe mẫu</button></div><div class="speech-result" id="speechResult">${g.recognitionResult?safe(g.recognitionResult):'Chạm micro để nhận diện giọng nói (nếu trình duyệt hỗ trợ), hoặc tự nói và bấm Hiện đáp án.'}${g.showAnswer?`<div style="font-weight:900;color:var(--navy);margin-top:13px;font-size:19px">${safe(x.en)}${ipaLine(x)}</div>`:''}</div><div class="game-actions"><button class="btn orange" data-action="next-speak">${g.i===g.deck.length-1?'Hoàn thành →':'Cụm tiếp theo →'}</button></div><p class="game-note">Chế độ này hỗ trợ nhận diện lời nói trên trình duyệt, không phải hệ thống chấm phát âm bằng AI.</p>`}
function setupFly(){
 const g=state.game;g.flyPage=0;g.flyPageSize=innerWidth<=520?10:(innerWidth<=820?16:20);
 g.flyBatch=g.deck.slice(0,g.flyPageSize);g.flyDone=new Set();g.flyTarget=g.flyBatch[0]?.id||null;
 g.flyLocked=false;g.flyMisses=0;
}
function flySpeak(){const g=state.game;if(g?.mode!=='fly'||!g.flyTarget||g.flyLocked)return;const x=byID(g.flyTarget);say(g.lang==='vi'?x.vi:x.en,g.lang);}
function flyFullScreenMarkup(){
 const g=state.game;
 if(g.finished)return `<section class="fly-screen fly-screen-v2"><span class="fly-bubble b1"></span><span class="fly-bubble b2"></span><div class="fly-finish"><div class="fly-score-caption">FINISHED!</div><h2>DỌN SẠCH BẦU TRỜI!</h2><div class="fly-final-number">${g.score}</div><p>Đã ôn ${g.deck.length} cụm từ · ${g.flyMisses} lượt chọn chưa đúng</p><div class="fly-finish-actions"><button data-action="replay-game">↻ Chơi lại</button><button data-action="home">← Danh sách cụm từ</button></div></div></section>`;
 const size=g.flyBatch.length, done=g.flyDone.size;
 return `<section class="fly-screen fly-screen-v2" role="application" aria-label="Game Chữ bay giống IELTS Speaking">
   <span class="fly-bubble b1"></span><span class="fly-bubble b2"></span><span class="fly-bubble b3"></span><span class="fly-bubble b4"></span>
   <div class="fly-top"><div class="fly-scoreboard"><div class="fly-score-caption">SCORE</div><div class="fly-score-big" id="flyPoints">${g.score}</div></div><div class="fly-head-middle"><div class="fly-listen-label">LISTEN & TAP THE RIGHT WORD</div><button type="button" class="fly-replay" data-action="fly-hear">🔊 Replay</button></div><button class="fly-close" data-action="home" aria-label="Đóng game">×</button></div>
   <div class="fly-message" id="flyNotice" role="status" aria-live="polite">Nghe rồi chạm đúng cụm đang bay. Chọn đúng được +10 điểm.</div>
   <div class="fly-sky" id="flySky" aria-label="Các cụm đang bay">${g.flyBatch.map(x=>g.flyDone.has(x.id)?'':`<button type="button" class="fly-target" data-action="fly-pick" data-id="${x.id}" aria-label="Chọn ${safe(x.en)}">${safe(x.en)}</button>`).join('')}</div>
   <div class="fly-bottom"><span>MÀN ${g.flyPage+1} / ${Math.ceil(g.deck.length/g.flyPageSize)}</span><span id="flyRemain">CÒN ${size-done} CỤM</span><span id="flyProgress">TỔNG ${g.flyPage*g.flyPageSize+done} / ${g.deck.length}</span></div>
   <div class="fly-lang-control"><select aria-label="Ngôn ngữ đọc" data-action="fly-lang"><option value="en" ${g.lang==='en'?'selected':''}>🔊 English</option><option value="vi" ${g.lang==='vi'?'selected':''}>🔊 Tiếng Việt</option></select><label>Tốc độ <input aria-label="Tốc độ chữ bay" data-action="fly-speed" type="range" min="1" max="3" value="${g.speed}" step="0.25"></label></div>
 </section>`;
}
function placeFlyingWords(){
 stopFlying();const g=state.game;const sky=document.getElementById('flySky');if(!sky||!g||g.mode!=='fly')return;
 const buttons=[...sky.querySelectorAll('.fly-target')],W=sky.clientWidth,H=sky.clientHeight;
 if(W<100||H<80)return;
 const cols=W<=520?2:(W<=820?3:(W<=1200?4:5)),rows=Math.ceil(buttons.length/cols);
 const cellW=W/cols,cellH=H/rows,slots=shuffle(Array.from({length:buttons.length},(_,i)=>i));
 const rand=(a,b)=>a+Math.random()*(b-a);
 for(let i=0;i<buttons.length;i++){
  const el=buttons[i],slot=slots[i],c=slot%cols,r=Math.floor(slot/cols),w=el.offsetWidth,h=el.offsetHeight;
  const roomX=Math.max(0,cellW-w-10),roomY=Math.max(0,cellH-h-8);
  const ampX=Math.min(W<=520?12:34,roomX/2),ampY=Math.min(W<=520?7:22,roomY/2);
  const anchorX=c*cellW+(cellW-w)/2,anchorY=r*cellH+(cellH-h)/2;
  const phaseX=rand(0,Math.PI*2),phaseY=rand(0,Math.PI*2),phaseRot=rand(0,Math.PI*2);
  const a={el,id:el.dataset.id,active:true,anchorX,anchorY,ampX,ampY,phaseX,phaseY,phaseRot,
   speedX:rand(.00075,.00155),speedY:rand(.00065,.00135),start:performance.now(),pausedAt:null,pausedTotal:0};
  flyActors.push(a);
  el.addEventListener('pointerenter',()=>{if(a.active&&a.pausedAt===null)a.pausedAt=performance.now()});
  el.addEventListener('pointerleave',()=>{if(a.pausedAt!==null){a.pausedTotal+=performance.now()-a.pausedAt;a.pausedAt=null}});
  el.style.transform=`translate(${anchorX+Math.sin(phaseX)*ampX}px,${anchorY+Math.cos(phaseY)*ampY}px)`;
 }
 const step=now=>{
  if(state.game!==g||g.mode!=='fly'||!sky.isConnected||state.screen!=='game')return;
  for(const a of flyActors){if(!a.active||!a.el.isConnected)continue;
   const time=Math.max(0,(a.pausedAt===null?now:a.pausedAt)-a.start-a.pausedTotal)*g.speed;
   const x=a.anchorX+Math.sin(time*a.speedX+a.phaseX)*a.ampX;
   const y=a.anchorY+Math.cos(time*a.speedY+a.phaseY)*a.ampY;
   a.el.style.transform=`translate(${x}px,${y}px) rotate(${Math.sin(time*.0009+a.phaseRot)*1.5}deg)`;
  }flyFrame=requestAnimationFrame(step);
 };flyFrame=requestAnimationFrame(step);
}
function chooseFlying(id,btn){
 const g=state.game;if(!g||g.mode!=='fly'||g.flyLocked||g.flyDone.has(id))return;
 const notice=document.getElementById('flyNotice');
 if(id!==g.flyTarget){g.flyMisses++;effectSound('wrong');if(btn){btn.classList.add('is-incorrect');setTimeout(()=>btn.classList.remove('is-incorrect'),450)}if(notice)notice.textContent='Chưa đúng rồi. Bấm Replay để nghe lại!';return}
 g.flyLocked=true;g.flyDone.add(id);g.score+=10;effectSound('right');
 const actor=flyActors.find(a=>a.id===id);if(actor)actor.active=false;
 if(btn){btn.classList.add('is-correct');btn.style.pointerEvents='none';setTimeout(()=>btn.classList.add('is-vanish'),60)}
 const score=document.getElementById('flyPoints');if(score)score.textContent=g.score;
 const rem=document.getElementById('flyRemain');if(rem)rem.textContent=`CÒN ${g.flyBatch.length-g.flyDone.size} CỤM`;
 const p=document.getElementById('flyProgress');if(p)p.textContent=`TỔNG ${g.flyPage*g.flyPageSize+g.flyDone.size} / ${g.deck.length}`;
 if(notice)notice.textContent='✓ Chính xác! +10 điểm';
 // Correct answer is repeated aloud once; the next prompt follows afterwards.
 say(byID(id).en);
 setTimeout(()=>{
  if(state.game!==g||g.mode!=='fly'||state.screen!=='game')return;
  btn?.remove();g.flyLocked=false;
  const next=g.flyBatch.find(x=>!g.flyDone.has(x.id));
  if(next){g.flyTarget=next.id;flySpeak();return}
  const start=(g.flyPage+1)*g.flyPageSize;
  if(start>=g.deck.length){finish();return}
  g.flyPage++;g.flyBatch=g.deck.slice(start,start+g.flyPageSize);g.flyDone=new Set();g.flyTarget=g.flyBatch[0]?.id;renderGame();
 },610);
}

function echoMarkup(){const g=state.game,x=g.deck[g.i];return progress(g.i,g.deck.length)+`<div class="echo-main"><div class="echo-icon">🎧</div><span class="prompt-label">LISTEN • REPEAT • REMEMBER</span>${englishLine(x)}<div class="vi">${safe(x.vi)}</div><div class="echo-settings"><label class="setting">Tốc độ đầu <select data-action="echo-setting" data-key="startRate">${[1,1.25,1.5,1.75,2,2.25,2.5,2.75,3].map(v=>`<option value="${v}" ${g.startRate===v?'selected':''}>${v}×</option>`).join('')}</select></label><label class="setting">Tốc độ cuối <select data-action="echo-setting" data-key="endRate">${[1,1.25,1.5,1.75,2,2.25,2.5,2.75,3].map(v=>`<option value="${v}" ${g.endRate===v?'selected':''}>${v}×</option>`).join('')}</select></label><label class="setting">Lặp lại <select data-action="echo-setting" data-key="repeats">${Array.from({length:15},(_,i)=>i+1).map(v=>`<option value="${v}" ${g.repeats===v?'selected':''}>${v} lần</option>`).join('')}</select></label><label class="setting">Khoảng nghỉ <select data-action="echo-setting" data-key="gapMs">${[0,250,400,650,1000].map(v=>`<option value="${v}" ${g.gapMs===v?'selected':''}>${v/1000}s</option>`).join('')}</select></label><label class="setting">Tự chuyển <input type="checkbox" data-action="echo-auto" ${g.autoPlay?'checked':''}></label></div><div class="game-actions"><button class="btn navy" data-action="echo-play">▶ Nghe & nhắc lại</button><button class="btn" data-action="echo-stop">■ Dừng</button><button class="btn orange" data-action="echo-next">${g.i===g.deck.length-1?'Hoàn thành →':'Cụm tiếp theo →'}</button></div><div class="echo-status" id="echoStatus">Nghe cụm tiếng Anh từ nhanh đến chậm, sau đó nghe nghĩa tiếng Việt.</div></div>`}
function next(mode){const g=state.game;cancelSound();g.i++;g.answered=false;g.choice=null;g.showAnswer=false;g.recognitionResult='';g.choices=null;g.flipped=false;if(g.i>=g.deck.length)finish();else{if(mode==='fill')g.fillQuestion=makeFillQ(g.deck[g.i]);stage();if(mode==='flash')say(g.deck[g.i].en)}}
function handleSpeech(){const g=state.game,x=g.deck[g.i],C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C){g.recognitionResult='Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Bạn có thể tự nói rồi bấm Hiện đáp án.';stage();return}cancelSound();const r=new C();recognition=r;r.lang='en-GB';r.interimResults=false;r.maxAlternatives=1;g.recognitionResult='🎙️ Đang nghe...';stage();r.onresult=e=>{const heard=e.results[0][0].transcript||'';const a=normalize(heard),b=normalize(x.en);const same=a===b||a.replace(/'/g,'')===b.replace(/'/g,'');g.recognitionResult=`Bạn vừa nói: “${heard}”. ${same?'✅ Trùng khớp với cụm từ.':'📖 Cụm đề xuất: '+x.en}`;g.showAnswer=true;stage();effectSound(same?'right':'wrong');say(x.en);recognition=null};r.onerror=e=>{g.recognitionResult='Không nhận diện được giọng nói ('+e.error+'). Bạn có thể tự luyện và xem đáp án.';stage();recognition=null};try{r.start()}catch(e){g.recognitionResult='Không thể bật micro. Hãy kiểm tra quyền micro.';stage();recognition=null}}
function onClick(e){const btn=e.target.closest('[data-action]');if(!btn)return;const a=btn.dataset.action;const id=btn.dataset.id;const g=state.game;
if(a==='return-hub'){resetPractice();stopFlying();cancelSound();if(window.parent!==window){window.parent.postMessage({type:'HENRY_TOEIC_RETURN_HOME'},'*')}else{state.screen='list';state.onlySelected=false;state.search='';render()}return}
if(a==='home'){resetPractice();stopFlying();cancelSound();state.screen='list';state.onlySelected=false;state.search='';render();return}
if(a==='start-practice'){openPractice();return}
if(a==='read-question'){const t=TESTS[state.test],q=currentSection(),str=questionPrompt(t,q);if(str)say(str);return}
if(a==='return-practice'){resetPractice();state.screen='list';render();return}
if(a==='practice-go'){practiceGo();return}
if(a==='practice-pause'){if(!practiceData)return;if(practiceData.paused){practiceData.paused=false;practiceData.until=Date.now()+practiceData.remaining*1000;}else{practiceData.paused=true;practiceData.remaining=Math.max(0,Math.ceil((practiceData.until-Date.now())/1000));}renderPractice();return}
if(a==='practice-reset'){openPractice();return}
if(a==='practice-next'){if(state.q<TESTS[state.test].sections.length-1)state.q++;else if(state.test<TESTS.length-1){state.test++;state.q=0}else{state.test=0;state.q=0}openPractice();return}
if(a==='practice-record'){togglePracticeRecording();return}
if(a==='topic-prev'||a==='topic-next'){state.test=Math.min(TESTS.length-1,Math.max(0,state.test+(a==='topic-next'?1:-1)));state.q=0;state.search='';state.onlySelected=false;render();return}
if(a==='test'){state.test=+btn.dataset.index;state.q=0;state.search='';state.onlySelected=false;render();return}
if(a==='q'){state.q=+btn.dataset.index;state.onlySelected=false;state.search='';render();return}
if(a==='row-select'){if(e.target.closest('label,input,button,a'))return;const box=btn.querySelector('input[data-action=toggle]');if(box){box.checked=!box.checked;box.dispatchEvent(new Event('change',{bubbles:true}))}return}
if(a==='speak'){const x=byID(id);if(x)say(x.en);return}
if(a==='say-vi'){say(g.deck[g.i].vi,'vi');return}
if(a==='learn-only'){toast('Hãy chọn cụm từ rồi chọn trò chơi ở phía trên nhé.');return}
if(a==='kind'){state.kind=btn.dataset.kind;document.querySelectorAll('.category-filter').forEach(b=>b.classList.toggle('active',b.dataset.kind===state.kind));refreshRows();return}
if(a==='select-visible'){filtered().forEach(x=>state.selected.add(x.id));persist();refreshRows();return}
if(a==='clear-visible'){filtered().forEach(x=>state.selected.delete(x.id));persist();refreshRows();return}
if(a==='clear-all'){state.selected.clear();persist();refreshRows();return}
if(a==='menu'){stopFlying();cancelSound();if(state.selected.size===0){toast('Chọn ít nhất 1 cụm từ trước nhé.');state.screen='list';render();return}state.screen='menu';render();scrollTo(0,0);return}
if(a==='start-game'){startGame(btn.dataset.mode);scrollTo(0,0);return}
if(a==='replay-game'){startGame(g.mode);return}
if(state.screen!=='game')return;
if(a==='flip'){g.flipped=!g.flipped;stage();effectSound('tap');say(g.deck[g.i].en);return}
if(a==='flash-prev'){if(g.i>0){g.i--;g.flipped=false;stage();say(g.deck[g.i].en)}return}
if(a==='flash-next'){g.score+=10;next('flash');return}
if(a==='quiz-answer'&&!g.answered){g.choice=id;g.answered=true;if(g.deck[g.i].id===id)g.score+=10;stage();effectSound(id===g.deck[g.i].id?'right':'wrong');say(g.deck[g.i].en);return}
if(a==='next-quiz'){next(g.mode);return}
if(a==='fill-answer'&&!g.answered){g.choice=btn.dataset.word;g.answered=true;if(g.choice===g.fillQuestion.word)g.score+=10;stage();effectSound(g.choice===g.fillQuestion.word?'right':'wrong');say(g.deck[g.i].en);return}
if(a==='next-fill'){next('fill');return}
if(a==='match-left'){g.matchSelected=id;g.matchNotice='Hãy chọn nghĩa tương ứng ở cột bên phải.';stage();effectSound('tap');say(byID(id).en);return}
if(a==='match-right'){
 effectSound('tap');
 if(!g.matchSelected){say(byID(id).vi,'vi');toast('Hãy chọn một cụm tiếng Anh bên trái trước.');return}
 const good=g.matchSelected===id,answer=byID(g.matchSelected);
 if(good){g.matchDone.add(id);g.matchNotice='✅ Ghép chính xác!';g.score+=10}
 else g.matchNotice='Chưa đúng. Thử lại nhé!';
 g.matchSelected=null;stage();effectSound(good?'right':'wrong');
 if(good)saySequence([{text:byID(id).vi,lang:'vi',rate:1},{text:answer.en,lang:'en',rate:1}]);
 else say(byID(id).vi,'vi');
 return
}
if(a==='next-match'){if((g.round+1)*10>=g.deck.length)finish();else{g.round++;setupMatch();stage()}return}
if(a==='speak-answer'){g.showAnswer=!g.showAnswer;stage();if(g.showAnswer){effectSound('tap');say(g.deck[g.i].en)}return}
if(a==='speak-record'){handleSpeech();return}
if(a==='next-speak'){g.score+=10;next('vispeak');return}
if(a==='fly-hear'){flySpeak();return}
if(a==='fly-pick'){if(e.detail===0)chooseFlying(id,btn);return}
if(a==='echo-play'){const x=g.deck[g.i];const seq=[];for(let j=0;j<g.repeats;j++){const rate=g.repeats===1?g.endRate:g.startRate+(g.endRate-g.startRate)*j/(g.repeats-1);seq.push({text:x.en,lang:'en',rate:Math.max(.7,rate),note:`🔊 Tiếng Anh lần ${j+1}/${g.repeats} — tốc độ ${rate.toFixed(1)}×`})}seq.push({text:x.vi,lang:'vi',rate:1,note:'🇻🇳 Đang đọc nghĩa tiếng Việt'});window.__phraseEchoGapMs=g.gapMs;saySequence(seq,s=>{const el=document.getElementById('echoStatus');if(el)el.textContent=s;if(s==='Hoàn thành lượt nghe.'&&g.autoPlay&&state.screen==='game'&&state.game===g){setTimeout(()=>{if(state.screen==='game'&&state.game===g&&!g.finished){g.score+=10;next('echo');if(!g.finished){setTimeout(()=>{const play=document.querySelector('[data-action=\"echo-play\"]');if(play&&state.game===g)play.click()},420)}}},g.gapMs)}});return}
if(a==='echo-stop'){cancelSound();const el=document.getElementById('echoStatus');if(el)el.textContent='Đã dừng. Có thể phát lại hoặc chuyển cụm khác.';return}
if(a==='echo-next'){g.score+=10;next('echo');return}
}
function onChange(e){const t=e.target;let a=t.dataset.action;
if(a==='toggle'){if(t.checked)state.selected.add(t.dataset.id);else state.selected.delete(t.dataset.id);persist();const row=t.closest('.wordrow');row?.classList.toggle('selected',t.checked);if(state.onlySelected)refreshRows();const s=document.getElementById('selCount');if(s)s.textContent=state.selected.size+' cụm đã chọn';return}
if(a==='only-selected'){state.onlySelected=t.checked;refreshRows();const heading=document.querySelector('.kb-cards-heading h3');if(heading)heading.textContent=state.onlySelected?'CÁC CỤM TỪ ĐÃ CHỌN':`QUESTION ${currentSection().question} – ${currentSection().title}`;return}
if(a==='test-select'){state.test=+t.value;state.q=0;state.onlySelected=false;state.search='';render();return}
if(state.screen==='timed'){if(a==='practice-prep'&&practiceData?.stage==='ready'){practiceData.prep=Math.max(0,Math.min(180,parseInt(t.value)||0));practiceData.remaining=practiceData.prep;const n=document.getElementById('practiceClock');if(n)n.textContent=mmss(practiceData.prep)}if(a==='practice-answer'&&practiceData?.stage==='ready'){practiceData.answer=Math.max(5,Math.min(300,parseInt(t.value)||15))}return}if(state.screen!=='game')return;const g=state.game;
if(a==='fly-lang'){g.lang=t.value;flySpeak();return}
if(a==='fly-speed'){g.speed=+t.value;const el=document.getElementById('flySpeedLabel');if(el)el.textContent=g.speed+'×';return}
if(a==='echo-setting'){g[t.dataset.key]=+t.value;return}if(a==='echo-auto'){g.autoPlay=t.checked;return}}
app.addEventListener('pointerdown',e=>{
 const b=e.target.closest('[data-action="fly-pick"]');if(!b||state.screen!=='game'||state.game?.mode!=='fly')return;
 if(e.button!==undefined&&e.button!==0)return;
 e.preventDefault();chooseFlying(b.dataset.id,b);
});
app.addEventListener('click',onClick);app.addEventListener('change',onChange);app.addEventListener('input',e=>{if(e.target.id==='phraseSearch'){state.search=e.target.value;refreshRows()}});
window.addEventListener('beforeunload',()=>{resetPractice();stopFlying();cancelSound()});
window.addEventListener('message',e=>{if(e.data&&e.data.type==='HENRY_TOEIC_PAUSE'){stopPracticeTimer();stopPracticeMedia();stopFlying();cancelSound()}});
render();
})();
