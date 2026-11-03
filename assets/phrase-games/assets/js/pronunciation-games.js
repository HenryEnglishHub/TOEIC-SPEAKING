/* HENRY ENGLISH | PRONUNCIATION AND WORD-GAMES; ALL DATA EMBEDDED OFFLINE */
const VX = {mode:'learn', cat:'all',search:'',onlySelected:false,hotOnly:false,page:0,selected:new Set(),flash:null,quiz:null,fly:null,match:null};
const VX_HOT = {
 'Itinerary':'Nhiều âm tiết, dễ đọc thiếu âm',
 'Complimentary':'Trọng âm chính vào “men”',
 'Concierge':'Chú ý âm /ʒ/ cuối từ',
 'Entrepreneur':'Trọng âm chính ở âm tiết cuối',
 'Receipt':'Chữ p câm',
 'Questionnaire':'Trọng âm ở âm tiết cuối',
 'Maintenance':'Trọng âm âm tiết đầu',
 'Reimbursement':'Luyện âm /ɜː/ và trọng âm chính',
 'Consignment':'Chữ g câm',
 'Buffet':'Chú ý sự khác biệt phát âm theo từ loại',
 'Mortgage':'Chữ t câm',
 'Archaeology':'Nhiều âm tiết và trọng âm khó',
 'Rehabilitation':'Chú ý số âm tiết',
 'Biodiversity':'Có trọng âm phụ và chính',
 'Sustainability':'Trọng âm chính vào /bɪl/'
};
const vx$=id=>document.getElementById(id);
const vxEsc=s=>escapeHTML(String(s));
const vxShuffle=a=>{const z=a.slice();for(let i=z.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[z[i],z[j]]=[z[j],z[i]]}return z};
const vxPct=(n,total)=>total>0?Math.round(n*100/total):0;
let vxSpeechToken=0;
function vxAudioStop(){vxSpeechToken++;try{window.speechSynthesis?.cancel()}catch(e){}}
function vxSpeak(eng,repeats=1){vxAudioStop();if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){vxNotice('Trình duyệt này không hỗ trợ phát âm tự động.');return}
 let token=vxSpeechToken,iteration=0,word=String(eng).replace(/\s*\(n\.\)/i,'');const synth=window.speechSynthesis;
 const play=()=>{if(token!==vxSpeechToken)return;let u=new SpeechSynthesisUtterance(word);u.lang='en-GB';u.rate=.86;u.pitch=1;let voices=synth.getVoices();u.voice=voices.find(v=>/^en[-_]GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
 u.onend=()=>{if(token!==vxSpeechToken)return;iteration++;if(iteration<repeats)window.setTimeout(play,130)};u.onerror=()=>{if(token!==vxSpeechToken)return;iteration++;if(iteration<repeats)window.setTimeout(play,130)};try{synth.speak(u)}catch(e){}};
 play();}
function vxClickTone(kind='tap'){try{let ctx=new(window.AudioContext||window.webkitAudioContext)();let o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=kind==='wrong'?290:kind==='good'?830:630;g.gain.value=.028;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.11);o.onended=()=>ctx.close()}catch(e){}}
function vxNotice(msg){const e=vx$('vxAnnounce');if(e)e.textContent=msg}
function vxPersist(){try{localStorage.setItem('henry_toeic_200_selected_v1',JSON.stringify([...VX.selected]))}catch(e){}}
function vxInitSelection(){try{let val=JSON.parse(localStorage.getItem('henry_toeic_200_selected_v1'));if(Array.isArray(val)){VX.selected=new Set(val.filter(id=>Number.isInteger(id)&&id>=1&&id<=200));return}}catch(e){}VX.selected=new Set(VOCAB.map(w=>w.id))}
function vxTitle(cat){return cat==='all'?'Tất cả 20 chủ đề':V_CATS[Number(cat)]||'Chủ đề';}
function vxVisible(){let term=VX.search.trim().toLocaleLowerCase('vi');return VOCAB.filter(w=>(VX.cat==='all'||w.cat===+VX.cat)&&(!VX.hotOnly||VX_HOT[w.w])&&(!VX.onlySelected||VX.selected.has(w.id))&&(!term||`${w.w} ${w.ipa} ${w.vi}`.toLocaleLowerCase('vi').includes(term)))}
function vxPool(){return VOCAB.filter(w=>VX.selected.has(w.id)&&(VX.cat==='all'||w.cat===+VX.cat)&&(!VX.hotOnly||VX_HOT[w.w]));}
function vxUpdateCounts(){vx$('vxSelectionCount').textContent=VX.selected.size;vx$('vxActiveCount').textContent=vxPool().length;vx$('vxVisibleCount').textContent=vxVisible().length;vx$('vxCatLabel').textContent=vxTitle(VX.cat);}
function vxSetMode(mode){vxAudioStop();VX.mode=mode;document.querySelectorAll('[data-vx-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.vxMode===mode);b.setAttribute('aria-pressed',b.dataset.vxMode===mode)});VX.page=0;vxRenderMode(true);vxUpdateCounts()}
function vxOpenBranch(kind){vxAudioStop();try{speechSynthesis.cancel()}catch(e){};if(typeof resetTimer==='function')resetTimer();vx$('examApp').hidden=kind==='vocab';vx$('vocabApp').hidden=kind!=='vocab';vx$('modeExam').classList.toggle('active',kind==='exam');vx$('modeVocab').classList.toggle('active',kind==='vocab');vx$('modeExam').setAttribute('aria-pressed',kind==='exam');vx$('modeVocab').setAttribute('aria-pressed',kind==='vocab');if(kind==='vocab')vxRenderMode(true);window.scrollTo(0,0);}
function vxStage(html){vx$('vxStage').innerHTML=html;}
function vxError(required){vxStage(`<div class="vx-empty"><h2>Chọn từ trước khi chơi</h2><p>Game này cần ít nhất ${required} từ trong chủ đề hiện tại.</p><button class="vx-btn primary" data-vx-act="learn">← Quay lại chọn từ</button></div>`)}
function vxBar(done,total){return `<div class="vx-progressbar" role="progressbar" aria-label="Tiến độ" aria-valuenow="${done}" aria-valuemax="${total}"><div style="width:${vxPct(done,total)}%"></div></div>`}
function vxRenderLearn(){let records=vxVisible(),perPage=20,pages=Math.max(1,Math.ceil(records.length/perPage));VX.page=Math.min(VX.page,pages-1);
 let begin=VX.page*perPage,show=records.slice(begin,begin+perPage);
 vxStage(`<div class="vx-head"><div><h2>📚 Học từ vựng và luyện phát âm</h2><p>200 từ · 20 chủ đề · IPA Anh–Anh (UK) · Chọn từng từ để ôn bằng game</p></div><span class="vx-count">${records.length} từ hiển thị</span></div>
 <div class="vx-gameinfo">Bấm 🔊 để nghe từ, chú ý trọng âm được đánh dấu bằng <b>ˈ</b> trong IPA. Tích chọn từ muốn học; các game dùng từ đã chọn của chủ đề hiện tại.</div>
 ${show.length?`<div class="vx-wordgrid">${show.map(w=>`<div class="vx-wordcard ${VX.selected.has(w.id)?'is-selected':''}"><input class="vx-word-select" type="checkbox" aria-label="Chọn từ ${vxEsc(w.w)}" data-vx-check="${w.id}" ${VX.selected.has(w.id)?'checked':''}><div class="vx-wordtext"><div class="vx-word">${vxEsc(w.w)}</div><div class="vx-ipa">${vxEsc(w.ipa)} · UK</div><div class="vx-meaning">${vxEsc(w.vi)}</div>${VX_HOT[w.w]?`<span class="vx-note">★ ${vxEsc(VX_HOT[w.w])}</span>`:''}</div><button class="vx-speak" title="Nghe phát âm Anh–Anh" aria-label="Nghe phát âm ${vxEsc(w.w)}" data-vx-act="say" data-id="${w.id}">🔊</button></div>`).join('')}</div>`:'<div class="vx-empty">Không tìm thấy từ phù hợp. Thử chủ đề khác hoặc tắt bộ lọc.</div>'}
 <div class="vx-pagination"><button class="vx-btn" data-vx-act="pageprev" ${VX.page===0?'disabled':''}>← Trang trước</button><b>${VX.page+1} / ${pages}</b><button class="vx-btn" data-vx-act="pagenext" ${VX.page>=pages-1?'disabled':''}>Trang sau →</button></div>`);
}
function vxStartFlash(){let pool=vxPool();if(!pool.length)return vxError(1);VX.flash={deck:vxShuffle(pool),index:0,back:false};vxRenderFlash(true)}
function vxRenderFlash(autoplay=false){let f=VX.flash;if(!f||!f.deck.length)return vxStartFlash();let w=f.deck[f.index];
 vxStage(`<div class="vx-head"><div><h2>🗂️ Flashcard – Anh ↔ Việt</h2><p>Chạm vào thẻ để lật mặt; mỗi lần hiện hoặc đổi mặt, hệ thống đọc từ tiếng Anh.</p></div><span class="vx-count">Thẻ ${f.index+1} / ${f.deck.length}</span></div>${vxBar(f.index+1,f.deck.length)}
 <button class="vx-flash ${f.back?'back':''}" type="button" data-vx-act="flip" aria-label="Lật mặt flashcard"><div class="vx-side">${f.back?'Mặt sau · Nghĩa tiếng Việt':'Mặt trước · Từ tiếng Anh'}</div>${f.back?`<div class="vx-flashmeaning">${vxEsc(w.vi)}</div><div class="vx-flashipa">${vxEsc(w.w)} · ${vxEsc(w.ipa)}</div>`:`<div class="vx-flashword">${vxEsc(w.w)}</div><div class="vx-flashipa">${vxEsc(w.ipa)}</div>`}<small>Chạm để lật thẻ · 🔊 Tự đọc từ tiếng Anh</small></button>
 <div class="vx-centered"><button class="vx-btn" data-vx-act="flashprev" ${f.index===0?'disabled':''}>← Thẻ trước</button><button class="vx-btn" data-vx-act="flashrepeat">🔊 Nghe lại</button><button class="vx-btn primary" data-vx-act="flashnext">${f.index===f.deck.length-1?'Học lại từ đầu ↻':'Thẻ tiếp theo →'}</button><button class="vx-btn" data-vx-act="flashshuffle">Trộn thẻ</button></div>`);
 if(autoplay)vxSpeak(w.w);
}
function vxStartQuiz(){let pool=vxPool();if(pool.length<4||new Set(pool.map(w=>w.vi.trim().toLocaleLowerCase('vi'))).size<4)return vxError(4);VX.quiz={deck:vxShuffle(pool),index:0,score:0,locked:false,choices:[]};vxQuizOptions();vxRenderQuiz(true)}
function vxQuizOptions(){let q=VX.quiz,w=q.deck[q.index];let choices=vxShuffle(q.deck.filter(x=>x.id!==w.id && x.vi.trim().toLowerCase()!==w.vi.trim().toLowerCase()));let unique=[],seen=new Set([w.vi.trim().toLowerCase()]);for(let x of choices){let key=x.vi.trim().toLowerCase();if(!seen.has(key)){unique.push(x);seen.add(key)}if(unique.length===3)break}
 q.choices=vxShuffle([w,...unique]);}
function vxRenderQuiz(autoplay=false){let q=VX.quiz;if(!q)return vxStartQuiz();if(q.index>=q.deck.length){vxStage(`<div class="vx-end"><h3>🎉 Hoàn thành phần trắc nghiệm</h3><div class="score">${q.score}/${q.deck.length}</div><p>Bạn đã làm đủ ${q.deck.length} câu, tính điểm một lần cho mỗi câu.</p><button class="vx-btn primary" data-vx-act="quizrestart">Làm lại & đảo câu hỏi</button></div>`);return}
 let w=q.deck[q.index];vxStage(`<div class="vx-head"><div><h2>✅ Trắc nghiệm nghĩa tiếng Việt</h2><p>Nghe hoặc nhìn từ tiếng Anh rồi chọn một trong bốn nghĩa.</p></div><span class="vx-count">Đúng ${q.score} · ${q.index+1}/${q.deck.length}</span></div>${vxBar(q.index,q.deck.length)}
 <div class="vx-quizword">${vxEsc(w.w)}</div><div class="vx-quizipa">${vxEsc(w.ipa)}</div><div class="vx-centered" style="margin-bottom:20px"><button class="vx-btn navy" data-vx-act="quizsay">🔊 Nghe phát âm</button></div>
 <div class="vx-choices">${q.choices.map((x,i)=>`<button class="vx-choice" data-vx-act="quizanswer" data-choice="${x.id}" ${q.locked?'disabled':''}>${String.fromCharCode(65+i)}. ${vxEsc(x.vi)}</button>`).join('')}</div>
 <div id="vxQuizFeedback" class="vx-feedback" aria-live="polite"></div><div class="vx-centered"><button class="vx-btn primary" id="vxQuizNext" data-vx-act="quiznext" ${q.locked?'':'disabled'}>${q.index===q.deck.length-1?'Xem kết quả':'Câu tiếp theo →'}</button></div>`);
 if(autoplay)vxSpeak(w.w);
}
function vxChooseAnswer(id){let q=VX.quiz;if(!q||q.locked)return;let cur=q.deck[q.index],isCorrect=cur.id===id;q.locked=true;if(isCorrect)q.score++;vxClickTone(isCorrect?'good':'wrong');vxAudioStop();document.querySelectorAll('[data-vx-act="quizanswer"]').forEach(b=>{const n=+b.dataset.choice;b.disabled=true;if(n===cur.id)b.classList.add('good');else if(n===id)b.classList.add('bad')});let e=vx$('vxQuizFeedback');e.className='vx-feedback '+(isCorrect?'good':'bad');e.textContent=isCorrect?`✓ Đúng! ${cur.w} = ${cur.vi}`:`✕ Chưa đúng. ${cur.w} = ${cur.vi}`;vx$('vxQuizNext').disabled=false;}
function vxStartFly(){let pool=vxPool();if(!pool.length)return vxError(1);VX.fly={queue:vxShuffle(pool),cursor:0,round:[],target:null,remaining:[],correct:0,wrong:0,locked:false,finished:false};vxNextFlyRound()}
function vxNextFlyRound(){let f=VX.fly;if(!f)return vxStartFly();f.round=f.queue.slice(f.cursor,f.cursor+10);f.cursor+=f.round.length;f.remaining=f.round.slice();f.target=null;f.locked=false;vxFlyTarget(true)}
function vxFlyTarget(auto=false){let f=VX.fly;if(!f)return;f.target=vxShuffle(f.remaining)[0]||null;f.locked=false;vxRenderFly(auto)}
function vxRenderFly(auto=false){let f=VX.fly;if(!f)return vxStartFly();if(f.finished){vxStage(`<div class="vx-end"><h3>🚀 Hoàn thành game Chữ bay!</h3><div class="score">${f.correct}/${f.queue.length}</div><p>Đã chọn đúng ${f.correct} từ, nhấn nhầm ${f.wrong} lần.</p><button class="vx-btn primary" data-vx-act="flyrestart">Chơi lại / Trộn từ</button></div>`);return}
 let roundDone=f.remaining.length===0;
 let iRound=Math.max(1,Math.ceil(f.cursor/10));let allRound=Math.ceil(f.queue.length/10);
 vxStage(`<div class="vx-head"><div><h2>🚀 Chữ bay – Nghe rồi chọn từ</h2><p>Các từ chuyển động nhẹ; hệ thống đọc từ mục tiêu 3 lần. Chạm chính xác vào từ bạn nghe.</p></div><span class="vx-count">Đúng ${f.correct}/${f.queue.length} · Sai ${f.wrong}</span></div>${vxBar(f.correct,f.queue.length)}
 <div class="vx-gamebar"><span>Lượt ${iRound} / ${allRound} · ${roundDone?'Đã hoàn tất lượt':`Còn ${f.remaining.length} từ`}</span><button class="vx-btn navy" data-vx-act="flyrepeat" ${roundDone?'disabled':''}>🔊 Nghe lại 3 lần</button></div>
 <div class="vx-flyboard" aria-label="Các chữ đang bay">${f.round.map((w,i)=>{let gone=!f.remaining.some(x=>x.id===w.id);return gone?`<div aria-hidden="true"></div>`:`<button class="vx-flychip" data-vx-act="flytap" data-id="${w.id}" style="--dur:${2.6+(i%4)*.45}s;--delay:-${(i%5)*.37}s">${vxEsc(w.w)}</button>`}).join('')}</div>
 <div id="vxFlyFeedback" class="vx-feedback" aria-live="polite"></div>${roundDone?`<div class="vx-centered"><button class="vx-btn primary" data-vx-act="flynext">${f.cursor<f.queue.length?'Chơi lượt tiếp theo →':'Xem tổng kết 🎉'}</button></div>`:''}`);
 if(auto&&!roundDone&&f.target)vxSpeak(f.target.w,3);
}
function vxFlyTap(id){let f=VX.fly;if(!f||f.locked||!f.target)return;let b=document.querySelector(`[data-vx-act="flytap"][data-id="${id}"]`);if(id===f.target.id){f.locked=true;f.correct++;f.remaining=f.remaining.filter(w=>w.id!==id);vxClickTone('good');vxAudioStop();if(b){b.classList.add('good');b.disabled=true}vxNotice(`Đúng: ${f.target.w} — ${f.target.vi}`);vx$('vxFlyFeedback').className='vx-feedback good';vx$('vxFlyFeedback').textContent=`✓ Đúng! ${f.target.w} — ${f.target.vi}`;
 window.setTimeout(()=>{if(VX.mode!=='fly'||VX.fly!==f)return;vxFlyTarget(true)},850);
 }else{f.wrong++;vxClickTone('wrong');if(b){b.classList.add('bad');window.setTimeout(()=>b.classList.remove('bad'),560)}vx$('vxFlyFeedback').className='vx-feedback bad';vx$('vxFlyFeedback').textContent='✕ Chưa đúng. Nghe lại và chọn từ khác!';}
}
function vxStartMatch(){let pool=vxPool();if(!pool.length)return vxError(1);VX.match={queue:vxShuffle(pool),round:[],matched:new Set(),left:null,right:null,locked:false,correct:0,wrong:0,orderL:[],orderR:[]};vxNextMatchRound()}
function vxNextMatchRound(){let m=VX.match;if(!m)return vxStartMatch();let list=[],uniq=new Set();for(let i=0;i<m.queue.length&&list.length<8;){let w=m.queue[i],meaning=w.vi.trim().toLowerCase();if(!uniq.has(meaning)){list.push(w);uniq.add(meaning);m.queue.splice(i,1)}else i++}
 m.round=list;m.matched=new Set();m.left=null;m.right=null;m.locked=false;m.orderL=vxShuffle(list);m.orderR=vxShuffle(list);vxRenderMatch();}
function vxRenderMatch(){let m=VX.match;if(!m)return vxStartMatch();let total=m.correct+m.queue.length+m.round.length-m.matched.size;
 let done=m.round.length===m.matched.size;
 vxStage(`<div class="vx-head"><div><h2>🧩 Ghép từ dựa trên nghĩa</h2><p>Chọn một từ tiếng Anh rồi chọn nghĩa tiếng Việt tương ứng; hoàn thành toàn bộ từ đã chọn.</p></div><span class="vx-count">Đúng ${m.correct} · Sai ${m.wrong}</span></div>${vxBar(m.correct,m.correct+m.queue.length+m.round.length-m.matched.size)}
 <div class="vx-gamebar"><span>${done?'Hoàn thành lượt':`Đã ghép ${m.matched.size} / ${m.round.length} cặp`}</span><button class="vx-btn" data-vx-act="matchrestart">Trộn và chơi lại</button></div>
 <div class="vx-matchgrid"><div class="vx-matchcol"><h3>ENGLISH · Chọn từ</h3>${m.orderL.map(w=>`<button class="vx-match-item en ${m.matched.has(w.id)?'matched':''} ${m.left===w.id?'picked':''}" data-vx-act="matchpick" data-side="en" data-id="${w.id}" ${m.matched.has(w.id)?'disabled':''}>${vxEsc(w.w)}</button>`).join('')}</div><div class="vx-matchcol"><h3>TIẾNG VIỆT · Chọn nghĩa</h3>${m.orderR.map(w=>`<button class="vx-match-item vi ${m.matched.has(w.id)?'matched':''} ${m.right===w.id?'picked':''}" data-vx-act="matchpick" data-side="vi" data-id="${w.id}" ${m.matched.has(w.id)?'disabled':''}>${vxEsc(w.vi)}</button>`).join('')}</div></div>
 <div id="vxMatchFeedback" class="vx-feedback" aria-live="polite">${done?'✓ Đã hoàn tất lượt này':''}</div>
 ${done?`<div class="vx-centered"><button class="vx-btn primary" data-vx-act="matchnext">${m.queue.length?'Ghép lượt tiếp theo →':'Xem kết quả 🎉'}</button></div>`:''}`);
}
function vxMatchPick(side,id){let m=VX.match;if(!m||m.locked||m.matched.has(id))return;if(side==='en'){m.left=id;let w=m.round.find(x=>x.id===id);if(w)vxSpeak(w.w)}else m.right=id;
 if(m.left!==null && m.right!==null){let left=m.left,right=m.right,good=left===right;m.locked=true;
 if(good){m.correct++;m.matched.add(left);vxClickTone('good');vxNotice('Ghép đúng!')}else{m.wrong++;vxClickTone('wrong');vxNotice('Sai, hãy thử ghép lại!')}
 vxRenderMatch();let fb=vx$('vxMatchFeedback');if(fb){fb.className='vx-feedback '+(good?'good':'bad');fb.textContent=good?'✓ Đã ghép đúng một cặp!':'✕ Hai thẻ chưa khớp, thử lại nhé.'}
 if(!good){document.querySelectorAll(`[data-vx-act="matchpick"][data-id="${left}"][data-side="en"], [data-vx-act="matchpick"][data-id="${right}"][data-side="vi"]`).forEach(b=>b.classList.add('bad'))}
 window.setTimeout(()=>{if(VX.mode!=='match'||VX.match!==m)return;m.left=null;m.right=null;m.locked=false;vxRenderMatch()},good?420:750);
 }else vxRenderMatch();
}
function vxMatchFinish(){let m=VX.match;vxStage(`<div class="vx-end"><h3>🎉 Hoàn thành game Ghép từ!</h3><div class="score">${m.correct} cặp</div><p>Đã ghép toàn bộ từ được chọn. Số lần ghép sai: ${m.wrong}.</p><button class="vx-btn primary" data-vx-act="matchrestart">Làm lại / Trộn thẻ</button></div>`)}
function vxRenderMode(reset=false){vxUpdateCounts();if(VX.mode==='learn')return vxRenderLearn();if(VX.mode==='flash'){if(reset||!VX.flash)return vxStartFlash();return vxRenderFlash()}if(VX.mode==='quiz'){if(reset||!VX.quiz)return vxStartQuiz();return vxRenderQuiz()}if(VX.mode==='fly'){if(reset||!VX.fly)return vxStartFly();return vxRenderFly()}if(VX.mode==='match'){if(reset||!VX.match)return vxStartMatch();return vxRenderMatch()}}
function vxSelectionChanged(){vxPersist();vxUpdateCounts();if(VX.mode==='learn')vxRenderLearn();}
function vxInit(){vxInitSelection();vx$('vxCategory').innerHTML='<option value="all">Tất cả 20 chủ đề (200 từ)</option>'+V_CATS.map((name,i)=>`<option value="${i+1}">${String(i+1).padStart(2,'0')} – ${vxEsc(name)}</option>`).join('');
 vx$('modeExam').onclick=()=>vxOpenBranch('exam');vx$('modeVocab').onclick=()=>vxOpenBranch('vocab');
 vx$('vxCategory').onchange=e=>{VX.cat=e.target.value;VX.page=0;vxAudioStop();vxRenderMode(true)};
 vx$('vxSearch').oninput=e=>{VX.search=e.target.value;VX.page=0;if(VX.mode==='learn')vxRenderLearn();vxUpdateCounts()};
 vx$('vxSelectedOnly').onchange=e=>{VX.onlySelected=e.target.checked;VX.page=0;if(VX.mode==='learn')vxRenderLearn();vxUpdateCounts()};
 vx$('vxHotOnly').onclick=e=>{VX.hotOnly=!VX.hotOnly;VX.page=0;e.currentTarget.classList.toggle('active',VX.hotOnly);e.currentTarget.setAttribute('aria-pressed',VX.hotOnly);vxRenderMode(true)};
 document.querySelectorAll('[data-vx-mode]').forEach(b=>b.onclick=()=>vxSetMode(b.dataset.vxMode));
 vx$('vxSelectVisible').onclick=()=>{vxVisible().forEach(w=>VX.selected.add(w.id));vxSelectionChanged()};
 vx$('vxSelectAll').onclick=()=>{VX.selected=new Set(VOCAB.map(w=>w.id));vxSelectionChanged()};
 vx$('vxClear').onclick=()=>{VX.selected.clear();vxSelectionChanged()};
 document.addEventListener('change',e=>{const input=e.target.closest('[data-vx-check]');if(!input)return;let id=+input.dataset.vxCheck;if(input.checked)VX.selected.add(id);else VX.selected.delete(id);vxClickTone();vxSelectionChanged()});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-vx-act]');if(!b||!vx$('vocabApp').contains(b))return;let act=b.dataset.vxAct,id=Number(b.dataset.id),w=VOCAB.find(x=>x.id===id);
 switch(act){case 'learn':vxSetMode('learn');break;case 'say':if(w)vxSpeak(w.w);break;case 'pageprev':VX.page=Math.max(0,VX.page-1);vxRenderLearn();break;case 'pagenext':VX.page++;vxRenderLearn();break;
 case 'flip':VX.flash.back=!VX.flash.back;vxRenderFlash(true);break;case 'flashprev':VX.flash.index=Math.max(0,VX.flash.index-1);VX.flash.back=false;vxRenderFlash(true);break;case 'flashnext':VX.flash.index=(VX.flash.index+1)%VX.flash.deck.length;VX.flash.back=false;vxRenderFlash(true);break;case 'flashrepeat':vxSpeak(VX.flash.deck[VX.flash.index].w);break;case 'flashshuffle':vxStartFlash();break;
 case 'quizsay':if(VX.quiz&&VX.quiz.index<VX.quiz.deck.length)vxSpeak(VX.quiz.deck[VX.quiz.index].w);break;case 'quizanswer':vxChooseAnswer(+b.dataset.choice);break;case 'quiznext':VX.quiz.index++;VX.quiz.locked=false;if(VX.quiz.index<VX.quiz.deck.length)vxQuizOptions();vxRenderQuiz(true);break;case 'quizrestart':vxStartQuiz();break;
 case 'flyrepeat':if(VX.fly?.target)vxSpeak(VX.fly.target.w,3);break;case 'flytap':vxFlyTap(id);break;case 'flynext':if(VX.fly.cursor<VX.fly.queue.length)vxNextFlyRound();else{VX.fly.finished=true;vxRenderFly()}break;case 'flyrestart':vxStartFly();break;
 case 'matchpick':vxMatchPick(b.dataset.side,id);break;case 'matchnext':if(VX.match.queue.length)vxNextMatchRound();else vxMatchFinish();break;case 'matchrestart':vxStartMatch();break;
 }
 });
 vxUpdateCounts();vxRenderLearn();
}
vxInit();
