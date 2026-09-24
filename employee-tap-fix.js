// Robust employee-card navigation for manager demo states on touch and desktop.
(function(){
  let lastOpenAt=0;
  let lastOpenId='';

  function managerViewIsActive(){
    return !!state && (
      state.auth==='manager' ||
      state.role==='Управляющий' ||
      state.route==='home' && document.querySelector('.managerhero') ||
      (typeof roleIsManager==='function' && roleIsManager())
    );
  }

  function employeeIdFromCard(card){
    if(!card)return '';
    if(card.dataset?.employeeId)return card.dataset.employeeId;

    // Older cached markup has no data-employee-id, but it still carries
    // onclick="openEmployeePage('e1')". Recover the id from that.
    const inline=card.getAttribute?.('onclick')||'';
    const m=inline.match(/openEmployeePage\(['"]([^'"]+)['"]\)/);
    if(m)return m[1];

    // Last-resort mapping by visible card order on the manager home screen.
    const cards=[...document.querySelectorAll('.team-grid .employee-compact')];
    const idx=cards.indexOf(card);
    const visible=(state.employees||[]).filter(e=>e.active!==false && (state.filter==='Все'||!state.filter||e.role===state.filter));
    return idx>=0 ? (visible[idx]?.id||'') : '';
  }

  function openEmployeeCard(card){
    if(!card || !managerViewIsActive()) return false;
    const id=employeeIdFromCard(card);
    if(!id || !(state.employees||[]).some(e=>e.id===id)) return false;

    const now=Date.now();
    if(now-lastOpenAt<500 && id===lastOpenId)return true;
    lastOpenAt=now;
    lastOpenId=id;

    // Clear any presentation locks before navigation. Safari/iPad can keep
    // touch-action from the previous tour frame for one event cycle.
    document.documentElement.classList.remove('ra-tour-lock');
    document.body.classList.remove('ra-tour-lock');
    document.getElementById('raTour')?.classList.remove('show');

    state.currentEmployee=id;
    state.route='employee-detail';
    state.expandedKnowledgeKey='';
    try{save()}catch(e){}
    try{closeModal()}catch(e){}
    render();
    window.scrollTo({top:0,behavior:'auto'});
    return true;
  }

  function cardFromEvent(e){
    return e.target?.closest?.('.employee-compact')||null;
  }

  function tourIsOpen(){
    return document.getElementById('raTour')?.classList.contains('show');
  }

  // Critical iPad/Safari path: navigate on touchstart/pointerdown, before
  // Safari can swallow the synthesized click or another legacy touchend handler.
  document.addEventListener('touchstart',function(e){
    const card=cardFromEvent(e);
    if(!card || tourIsOpen())return;
    openEmployeeCard(card);
  },{passive:true,capture:true});

  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='touch')return; // touchstart already handled it
    const card=cardFromEvent(e);
    if(!card || tourIsOpen())return;
    openEmployeeCard(card);
  },true);

  // Keyboard/desktop fallback.
  document.addEventListener('click',function(e){
    const card=cardFromEvent(e);
    if(!card || tourIsOpen())return;
    if(openEmployeeCard(card)){
      if(e.cancelable)e.preventDefault();
      e.stopPropagation();
    }
  },true);
})();
