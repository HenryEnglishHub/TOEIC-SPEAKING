(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const branches=['exam','pron','lex'];
  function openBranch(which){
    if(!branches.includes(which))return;
    $('henryHub').hidden=true;
    document.body.dataset.henryPage=which;
    if(which==='exam')$('modeExam').click();
    else if(which==='pron')$('modeVocab').click();
    else $('modeLex').click();
    window.scrollTo(0,0);
  }
  function showHub(){
    try{speechSynthesis.cancel()}catch(e){}
    try{if(typeof resetTimer==='function')resetTimer()}catch(e){}
    try{window.HenryLex551?.exitGame()}catch(e){}
    $('examApp').hidden=true;
    $('vocabApp').hidden=true;
    $('lex551Screen').hidden=true;
    $('henryHub').hidden=false;
    document.body.dataset.henryPage='hub';
    document.querySelectorAll('.modebtn').forEach(btn=>{btn.classList.remove('active');btn.setAttribute('aria-pressed','false')});
    window.scrollTo(0,0);
  }
  function init(){
    document.querySelectorAll('[data-hub]').forEach(card=>card.addEventListener('click',()=>openBranch(card.dataset.hub)));
    $('returnHub').addEventListener('click',showHub);
    $('lexBack').onclick=showHub;
    const density=$('lexDensityBtn');
    density?.addEventListener('click',()=>{
      const screen=$('lex551Screen');
      const full=screen.dataset.lexView!=='full';
      screen.dataset.lexView=full?'full':'compact';
      density.setAttribute('aria-pressed',String(full));
      density.textContent=full?'▦ Xem gọn':'▦ Xem đầy đủ';
    });
    showHub();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
  window.HenryThreeRoutes={openBranch,showHub};
})();
