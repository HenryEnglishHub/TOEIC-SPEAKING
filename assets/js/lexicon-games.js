(function(){
'use strict';
const db=window.HENRY_LEX_DB;
const words=db.words.map((w,i)=>({...w,id:i}));
const categories=db.categories;
const catCodes=db.codes;
const catBanks=db.banks;
const byId=new Map(words.map(w=>[w.id,w]));
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const meaning=w=>String(w.v||'').split(/\s+[|/]\s+/)[0];
const oneMeaning=w=>w.v||'Không có nghĩa';
let bank='topic',topic=0,search='',selectedOnly=false,selected=new Set(words.filter(x=>x.cat===0).slice(0,20).map(x=>x.id));
const bankLabel={topic:'30 chủ đề',adjective:'Tính từ',adverb:'Trạng từ'};
const catsForBank=()=>categories.map((_,i)=>i).filter(i=>catBanks[i]===bank);
const isInBank=w=>catBanks[w.cat]===bank;
let currentResults=[],loadedLimit=0;
function wordCard(w){return `<article class="lexWord"><div class="lexWordTop"><input type="checkbox" data-lx-check="${w.id}" id="lex-check-${w.id}" ${selected.has(w.id)?'checked':''} aria-label="Chọn ${esc(w.w)}"><label for="lex-check-${w.id}"><b>${esc(w.w)}</b><div class="lexIPA">${esc(w.ipa)}</div><div class="lexMeta">${esc(w.pos||'—')} ${w.level?' · '+esc(w.level):''}</div></label><button type="button" class="lexSpeak" data-lx="hear" data-id="${w.id}" title="Nghe phát âm">🔊</button></div><div class="lexMeaning">${esc(oneMeaning(w))}</div>${w.ex?`<div class="lexEx">${esc(w.ex)}</div>`:''}</article>`}
function appendMore(){if(loadedLimit>=currentResults.length)return;let next=Math.min(loadedLimit+72,currentResults.length);$('lexWordList').insertAdjacentHTML('beforeend',currentResults.slice(loadedLimit,next).map(wordCard).join(''));loadedLimit=next;}
function chooseBank(nextBank){if(!['topic','adjective','adverb'].includes(nextBank))return;bank=nextBank;topic=catsForBank()[0];search='';selectedOnly=false;$('lexSearch').value='';selected=new Set(words.filter(x=>x.cat===topic).slice(0,20).map(x=>x.id));renderCats();renderList()}

let mode='',pool=[],idx=0,score=0,locked=false,flipped=false,roundMatched=new Set(),matchLeft=null,matchRight=null,roundItems=[],timer=null,speechNonce=0;
function cancel(){speechNonce++;try{window.speechSynthesis?.cancel()}catch(e){};if(timer){clearTimeout(timer);timer=null}}
function voice(){if(!('speechSynthesis' in window))return null;let v=window.speechSynthesis.getVoices()||[];return v.find(x=>/^en-GB$/i.test(x.lang)&&/Daniel|Sonia|Serena|Oliver|Kate|British/i.test(x.name))||v.find(x=>/^en-GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null}
function speak(text,times=1){cancel();if(!('speechSynthesis' in window))return;const nonce=speechNonce,synth=window.speechSynthesis;let repeat=0;function next(){if(nonce!==speechNonce||repeat>=times)return;repeat++;let u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.84;u.pitch=1;let v=voice();if(v)u.voice=v;let done=false;const complete=()=>{if(done)return;done=true;if(nonce===speechNonce&&repeat<times)timer=setTimeout(next,200)};u.onend=complete;u.onerror=complete;try{synth.speak(u)}catch(e){complete()}}next()}
function visible(){let q=search.trim().toLocaleLowerCase();return words.filter(w=>isInBank(w)&&(topic===-1||w.cat===topic)&&(!selectedOnly||selected.has(w.id))&&(!q||(`${w.w} ${w.ipa} ${w.v} ${w.pos} ${w.ex}`.toLocaleLowerCase().includes(q))))}
function renderCats(){const cats=catsForBank();const count=cats.reduce((n,i)=>n+words.filter(w=>w.cat===i).length,0);
$('lexCats').innerHTML=`<button class="lexCatBtn ${topic===-1?'active':''}" data-lx="cat" data-topic="-1">Tất cả ${bankLabel[bank]} <b>${count}</b></button>`+cats.map(i=>`<button class="lexCatBtn ${topic===i?'active':''}" data-lx="cat" data-topic="${i}">${esc(catCodes[i])}. ${esc(categories[i])} <b>${words.filter(w=>w.cat===i).length}</b></button>`).join('');
$('lexMobileCat').innerHTML=`<option value="-1">Tất cả ${bankLabel[bank]} (${count})</option>`+cats.map(i=>`<option value="${i}">${esc(catCodes[i])}. ${esc(categories[i])} (${words.filter(w=>w.cat===i).length})</option>`).join('');$('lexMobileCat').value=topic;
document.querySelectorAll('#lexBankTabs [data-lx="bank"]').forEach(b=>{const on=b.dataset.bank===bank;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
}
function renderList(){currentResults=visible();const arr=currentResults;
$('lexCurrentTopic').textContent=topic===-1?'Tất cả '+bankLabel[bank]:categories[topic];$('lexTotalStat').textContent=`${arr.length} mục đang xem • 1.686 mục toàn bộ`;$('lexSelectedStat').textContent=`${selected.size} từ đã chọn`;
const toggle=document.querySelector('#lex551Screen [data-lx="selectedOnly"]');if(toggle){toggle.textContent=selectedOnly?'◉ Đang xem từ đã chọn':'◯ Xem từ đã chọn';toggle.classList.toggle('navy',selectedOnly)}
const list=$('lexWordList');loadedLimit=0;list.innerHTML='';list.scrollTop=0;
if(!arr.length){list.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#64708a">Không tìm thấy từ. Hãy đổi chủ đề hoặc từ khóa tìm kiếm.</p>'}else appendMore();}
function chooseTopic(n){if(n!==-1&&!catsForBank().includes(n))return;topic=n;search='';selectedOnly=false;selected=new Set(words.filter(w=>isInBank(w)&&(n===-1||w.cat===n)).map(w=>w.id));$('lexSearch').value='';renderCats();renderList()}
function pickWrong(w,n,kind){const poolCandidates=shuffle(words.filter(x=>x.id!==w.id && (kind==='word'?x.w.toLowerCase()!==w.w.toLowerCase():meaning(x)!==meaning(w))));let found=new Set(),ret=[];for(const item of poolCandidates){const value=kind==='word'?item.w:meaning(item);if(found.has(value))continue;found.add(value);ret.push({id:item.id,text:value});if(ret.length>=n)break}return ret}
function current(){return pool[idx]}
function scorebar(){return `<span class="lexGamePrompt">Câu ${Math.min(idx+1,pool.length)} / ${pool.length}</span>`}
function finish(){cancel();$('lexGameStage').innerHTML=`<div class="lexGameCard lexDone"><b>🎉 Hoàn thành!</b><div class="lexGameMeaning">${score} điểm · ${pool.length} mục luyện tập</div><div class="lexGamePrompt">Bạn có thể chơi lại với cùng nhóm từ hoặc thay đổi lựa chọn.</div><div class="lexGameActions"><button class="lexBtn navy" data-lx="again">↻ Chơi lại</button><button class="lexBtn primary" data-lx="exit">← Chọn từ mới</button></div></div>`;$('lexGameScore').textContent=score+' điểm'}
function renderGame(){cancel();$('lexGameScore').textContent=score+' điểm';if(idx>=pool.length)return finish();locked=false;flipped=false;const w=current();const stage=$('lexGameStage');
if(mode==='flash'){
 stage.innerHTML=`<div class="lexGameCard">${scorebar()}<button type="button" class="lexFlip" data-lx="flip" aria-label="Lật thẻ"><div class="lexGameWord">${esc(w.w)}</div><div class="lexGameIpa">${esc(w.ipa)}</div><p class="lexHint">Chạm để xem nghĩa</p></button><div class="lexGameActions"><button class="lexBtn" data-lx="prev" ${idx===0?'disabled':''}>← Trước</button><button class="lexBtn" data-lx="play">🔊 Phát âm</button><button class="lexBtn primary" data-lx="next">Tiếp →</button></div></div>`;speak(w.w);
}else if(mode==='quiz'){
 const opts=shuffle([{id:w.id,text:meaning(w)},...pickWrong(w,3,'meaning')]);stage.innerHTML=`<div class="lexGameCard">${scorebar()}<div class="lexGameWord">${esc(w.w)}</div><div class="lexGameIpa">${esc(w.ipa)}</div><div class="lexGameActions"><button class="lexBtn" data-lx="play">🔊 Nghe từ</button></div><p class="lexGamePrompt">Chọn nghĩa tiếng Việt đúng.</p><div class="lexChoices">${opts.map(o=>`<button class="lexChoice" data-lx="quizAnswer" data-id="${o.id}">${esc(o.text)}</button>`).join('')}</div><div class="lexFeedback" id="lexFeedback"></div><div class="lexGameActions"><button class="lexBtn primary" data-lx="next" id="lexNextBtn" disabled>Câu tiếp →</button></div></div>`;
}else if(mode==='fly'){
 const opts=shuffle([{id:w.id,text:w.w},...pickWrong(w,3,'word')]);stage.innerHTML=`<div class="lexGameCard">${scorebar()}<div class="lexEyebrow">LISTEN & CHOOSE</div><div class="lexGamePrompt">Hệ thống đọc 3 lần. Chạm vào từ tiếng Anh đang bay phù hợp với nghĩa:</div><div class="lexGameMeaning">${esc(meaning(w))}</div><div class="lexGameActions"><button class="lexBtn navy" data-lx="repeatThree">🔊 Nghe lại 3 lần</button></div><div class="lexFlyBox">${opts.map(o=>`<button class="lexFlying" data-lx="flyAnswer" data-id="${o.id}">${esc(o.text)}</button>`).join('')}</div><div class="lexFeedback" id="lexFeedback"></div></div>`;speak(w.w,3);
}else if(mode==='match')renderMatch();
}
function renderMatch(){cancel();roundItems=pool.slice(idx,Math.min(idx+10,pool.length));roundMatched.clear();matchLeft=null;matchRight=null;locked=false;const used=new Set();let unique=[];
for(const w of roundItems){let m=meaning(w);if(!used.has(m)){used.add(m);unique.push(w)}}
// If some meanings are identical, keep the extra words for subsequent rounds rather than showing ambiguous pairs.
const leftovers=roundItems.filter(w=>!unique.includes(w));if(leftovers.length){pool.splice(idx,roundItems.length,...unique,...leftovers);roundItems=unique}
const left=shuffle(roundItems),right=shuffle(roundItems);
$('lexGameStage').innerHTML=`<div class="lexGameCard">${scorebar()}<div class="lexGamePrompt">Chọn một từ tiếng Anh ở cột trái rồi chọn nghĩa phù hợp ở cột phải. Tối đa 10 cặp mỗi lượt.</div><div class="lexMatchGrid"><div class="lexMatchColumn">${left.map(w=>`<button class="lexMatchOption" data-lx="match" data-side="left" data-id="${w.id}">${esc(w.w)}</button>`).join('')}</div><div class="lexMatchColumn">${right.map(w=>`<button class="lexMatchOption" data-lx="match" data-side="right" data-id="${w.id}">${esc(meaning(w))}</button>`).join('')}</div></div><div class="lexFeedback" id="lexFeedback">Ghép đúng: 0/${roundItems.length}</div><div class="lexGameActions"><button class="lexBtn" data-lx="playMatch">🔊 Nghe từ đã chọn</button></div></div>`}
function next(){if(idx>=pool.length-1)idx=pool.length;else idx++;renderGame()}
function answer(kind,id,button){if(locked)return;locked=true;cancel();const w=current(),good=id===w.id;let correct=document.querySelector(`#lexGameStage [data-lx="${kind}"][data-id="${w.id}"]`);button?.classList.add(good?'good':'bad');if(!good&&correct)correct.classList.add('good');score+=good?10:0;$('lexGameScore').textContent=score+' điểm';$('lexFeedback').textContent=(good?'✓ Chính xác! ':'✕ Chưa đúng. ')+`${w.w} ${w.ipa} — ${oneMeaning(w)}`;speak(w.w);if(kind==='quizAnswer')$('lexNextBtn').disabled=false;else{timer=setTimeout(()=>{idx++;renderGame()},1600)}}
function handleMatch(side,id,el){if(locked||roundMatched.has(id))return;el.classList.add('on');if(side==='left'){if(matchLeft!==null){document.querySelectorAll('#lexGameStage [data-side="left"]').forEach(e=>e.classList.remove('on'))}matchLeft=id;el.classList.add('on');speak(byId.get(id).w)}else{if(matchRight!==null){document.querySelectorAll('#lexGameStage [data-side="right"]').forEach(e=>e.classList.remove('on'))}matchRight=id;el.classList.add('on')}
if(matchLeft===null||matchRight===null)return;
const leftId=matchLeft,rightId=matchRight;
if(leftId===rightId){roundMatched.add(leftId);score+=10;$('lexGameScore').textContent=score+' điểm';document.querySelectorAll(`#lexGameStage [data-lx="match"][data-id="${leftId}"]`).forEach(e=>{e.classList.add('done');e.classList.remove('on')});$('lexFeedback').textContent=`✓ Đúng! ${roundMatched.size}/${roundItems.length} cặp.`;matchLeft=null;matchRight=null;if(roundMatched.size===roundItems.length){locked=true;timer=setTimeout(()=>{idx+=roundItems.length;renderGame()},950)}}
else{locked=true;document.querySelectorAll(`#lexGameStage [data-lx="match"][data-id="${leftId}"],#lexGameStage [data-lx="match"][data-id="${rightId}"]`).forEach(e=>e.classList.add('bad'));$('lexFeedback').textContent='Chưa đúng, hãy thử lại.';timer=setTimeout(()=>{document.querySelectorAll('#lexGameStage .lexMatchOption').forEach(e=>e.classList.remove('bad','on'));matchLeft=null;matchRight=null;locked=false},650)}
}
function start(modeName){if(!selected.size){alert('Hãy chọn ít nhất một từ trước khi bắt đầu.');return}cancel();mode=modeName;let size=$('lexRoundSize').value;let all=shuffle([...selected].map(id=>byId.get(id)).filter(Boolean));pool=size==='all'?all:all.slice(0,Number(size));idx=0;score=0;$('lexListMode').hidden=true;$('lexGameMode').hidden=false;$('lexGameName').textContent=({flash:'🃏 Flashcard',quiz:'✅ Trắc nghiệm',fly:'🚀 Chữ bay',match:'🧩 Ghép từ – nghĩa'})[mode];$('lexReturn').hidden=false;renderGame();$('lex551Screen').querySelector('.lexContent').scrollTo(0,0)}
function exitGame(){cancel();mode='';$('lexGameMode').hidden=true;$('lexListMode').hidden=false;$('lexReturn').hidden=true;renderList()}
function onAction(e){const btn=e.target.closest('[data-lx]');if(!btn||!$('lex551Screen').contains(btn))return;const act=btn.dataset.lx;
if(act==='bank'){chooseBank(btn.dataset.bank);return}
if(act==='cat'){chooseTopic(Number(btn.dataset.topic));return}
if(act==='hear'){const w=byId.get(Number(btn.dataset.id));if(w)speak(w.w);return}
if(act==='selectedOnly'){selectedOnly=!selectedOnly;renderList();return}
if(act==='allVisible'||act==='noneVisible'){visible().forEach(w=>act==='allVisible'?selected.add(w.id):selected.delete(w.id));renderList();return}
if(act==='clearAll'){selected.clear();selectedOnly=false;renderList();return}
if(act==='random20'){let arr=shuffle(words.filter(w=>isInBank(w)&&(topic===-1||w.cat===topic)));selected=new Set(arr.slice(0,Math.min(20,arr.length)).map(w=>w.id));selectedOnly=false;renderList();return}
if(act==='start'){start(btn.dataset.mode);return}
if(act==='exit'){exitGame();return}
if(act==='again'){start(mode);return}
if(act==='play'||act==='repeatThree'){if(current())speak(current().w,act==='repeatThree'?3:1);return}
if(act==='prev'){if(idx>0){idx--;renderGame()}return}
if(act==='next'){if(mode==='quiz'&&!locked)return;next();return}
if(act==='flip'){flipped=!flipped;const w=current();btn.innerHTML=flipped?`<div class="lexGameMeaning">${esc(oneMeaning(w))}</div><div class="lexGameWord" style="font-size:24px;margin-top:15px">${esc(w.w)}</div><div class="lexGameIpa" style="font-size:16px">${esc(w.ipa)}</div><p class="lexHint">Chạm để xem lại mặt tiếng Anh</p>`:`<div class="lexGameWord">${esc(w.w)}</div><div class="lexGameIpa">${esc(w.ipa)}</div><p class="lexHint">Chạm để xem nghĩa</p>`;speak(w.w);return}
if(act==='quizAnswer'||act==='flyAnswer'){answer(act,Number(btn.dataset.id),btn);return}
if(act==='match'){handleMatch(btn.dataset.side,Number(btn.dataset.id),btn);return}
if(act==='playMatch'){if(matchLeft!==null)speak(byId.get(matchLeft).w);return}
}
function init(){const sc=$('lex551Screen');if(!sc)return;sc.addEventListener('click',onAction);sc.addEventListener('change',e=>{if(e.target.matches('[data-lx-check]')){let id=Number(e.target.dataset.lxCheck);e.target.checked?selected.add(id):selected.delete(id);$('lexSelectedStat').textContent=`${selected.size} từ đã chọn`}});$('lexSearch').addEventListener('input',e=>{search=e.target.value;renderList()});$('lexMobileCat').addEventListener('change',e=>chooseTopic(Number(e.target.value)));$('lexWordList').addEventListener('scroll',e=>{const el=e.currentTarget;if(el.scrollHeight-el.scrollTop-el.clientHeight<400)appendMore()},{passive:true});$('lexReturn').onclick=exitGame;$('lexReturn').hidden=true;renderCats();renderList();}
function openFromCoach(){cancel();if(typeof window.show==='function')window.show('lex551Screen');else{document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$('lex551Screen').hidden=false;$('lex551Screen').classList.add('active')} $('lex551Screen').hidden=false;}
function backToCoach(){cancel();exitGame();$('lex551Screen').hidden=true;typeof window.show==='function'?window.show('welcome'):null}
function openFromFull(){cancel();if(typeof window.resetTimer==='function')window.resetTimer();$('examApp').hidden=true;$('vocabApp').hidden=true;$('lex551Screen').hidden=false;$('modeLex').classList.add('active');$('modeLex').setAttribute('aria-pressed','true');['modeExam','modeVocab'].forEach(x=>{let e=$(x);e.classList.remove('active');e.setAttribute('aria-pressed','false')});window.scrollTo(0,0)}
function attachFull(){const nav=$('modeLex');if(!nav)return;nav.onclick=openFromFull;['modeExam','modeVocab'].forEach(id=>$(id).addEventListener('click',()=>{cancel();exitGame();$('lex551Screen').hidden=true;nav.classList.remove('active');nav.setAttribute('aria-pressed','false')}));$('lexBack').onclick=()=>{exitGame();$('lex551Screen').hidden=true;$('modeExam').click()};}
function attachCoach(){$('lexBack').onclick=backToCoach;}
window.HenryLex551={openFromCoach,openFromFull,exitGame,getTotal:()=>words.length,getSelected:()=>selected.size};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();if($('modeLex'))attachFull();else attachCoach()});else{init();if($('modeLex'))attachFull();else attachCoach()}
})();
