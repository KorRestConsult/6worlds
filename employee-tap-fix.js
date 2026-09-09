// Robust employee-card navigation for manager demo states on touch and desktop.
(function(){
  let lastTouchAt=0;
  let lastTouchId='';

  function managerViewIsActive(){
    return state && (state.auth==='manager' || state.role==='Управляющий' || (typeof roleIsManager==='function' && roleIsManager()));
  }

  function openEmployeeCard(card){
    if(!card || !managerViewIsActive()) return false;
    const id=card.dataset.employeeId;
    if(!id || !(state.employees||[]).some(e=>e.id===id)) return false;
    state.currentEmployee=id;
    state.route='employee-detail';
    save();
    try{closeModal()}catch(e){}
    render();
    window.scrollTo({top:0,behavior:'auto'});
    return true;
  }

  // app18 has an older capture fallback that can consume the normal inline onclick.
  // A listener on the same capture target still runs, so we finish navigation here.
  document.addEventListener('touchend',function(e){
    const card=e.target?.closest?.('.employee-compact[data-employee-id]');
    if(!card) return;
    if(document.getElementById('raTour')?.classList.contains('show')) return;
    if(openEmployeeCard(card)){
      lastTouchAt=Date.now();
      lastTouchId=card.dataset.employeeId||'';
      if(e.cancelable)e.preventDefault();
      e.stopPropagation();
    }
  },{passive:false,capture:true});

  document.addEventListener('click',function(e){
    const card=e.target?.closest?.('.employee-compact[data-employee-id]');
    if(!card) return;
    if(Date.now()-lastTouchAt<900 && card.dataset.employeeId===lastTouchId) return;
    if(openEmployeeCard(card)){
      if(e.cancelable)e.preventDefault();
      e.stopPropagation();
    }
  },true);
})();
