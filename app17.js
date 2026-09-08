// Native demo handoff: manager -> waiter with live task badges and guided continuation.
(function(){
  function pendingForEmployee(id){
    return (state.assignedTests||[]).filter(t=>t.employeeId===id&&t.status!=='done');
  }
  function pendingForRole(role){
    const ids=new Set((state.employees||[]).filter(e=>e.active!==false&&e.role===role).map(e=>e.id));
    return (state.assignedTests||[]).filter(t=>ids.has(t.employeeId)&&t.status!=='done');
  }
  function badge(n){return n?'<span class="role-task-badge">'+n+'</span>':''}

  window.quickSwitchToWaiter=function(){
    const tasks=pendingForRole('Официант');
    const target=tasks[0]?.employeeId||null;
    state.demoHandoff=target?{employeeId:target,stage:'select'}:null;
    state.role='Официант';
    state.auth=null;
    state.route='staff-select';
    save();render();
  };
  window.quickSwitchToManager=function(){
    const done=(state.assignedTests||[]).filter(t=>t.assignmentType==='attestation'&&t.status==='done').sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')))[0];
    state.demoHandoff=done?{employeeId:done.employeeId,stage:'manager-pin-return'}:null;
    state.role='Управляющий';
    state.auth=null;
    state.route='manager-pin';
    save();render();
  };

  function renderQuickRoleSwitch(){
    const box=document.querySelector('.top-actions');if(!box)return;
    box.querySelectorAll('.quick-role-switch').forEach(x=>x.remove());
    const roleBtn=document.getElementById('roleBtn');
    if(!roleBtn)return;

    if(state.auth==='manager'||(state.role==='Управляющий'&&['home','employee-detail'].includes(state.route))){
      const n=pendingForRole('Официант').length;
      const btn=document.createElement('button');
      btn.type='button';btn.className='rolebtn quick-role-switch quick-role-waiter'+(n?' has-tasks':'');
      btn.onclick=quickSwitchToWaiter;
      btn.innerHTML='<span>Официант</span>'+badge(n);
      roleBtn.insertAdjacentElement('afterend',btn);
    }else if(state.auth==='staff'||['staff-select','staff-pin'].includes(state.route)){
      const btn=document.createElement('button');
      btn.type='button';btn.className='rolebtn quick-role-switch quick-role-manager';
      btn.onclick=quickSwitchToManager;
      btn.innerHTML='<span>Управляющий</span>';
      roleBtn.insertAdjacentElement('afterend',btn);
    }
  }

  // Employee selection shows exactly who has work waiting.
  staffSelectPage=function(){
    const xs=activeEmployees().filter(e=>e.role===state.role);
    const total=xs.reduce((s,e)=>s+pendingForEmployee(e.id).length,0);
    return '<div class="head staff-select-head"><div><h2>'+esc(state.role)+'</h2><p>'+
      (total?('Новых заданий: '+total):'Выберите сотрудника')+
      '</p></div><button class="ghost" onclick="goRoles()">Назад</button></div>'+
      '<div class="team-grid">'+
      (xs.map(e=>{
        const n=pendingForEmployee(e.id).length;
        const isTarget=state.demoHandoff?.employeeId===e.id;
        return '<button class="card employee staff-select-card '+(n?'staff-with-task ':'')+(isTarget?'handoff-target':'')+'" onclick="selectStaff(\''+e.id+'\')">'+
          employeePhoto(e)+
          '<div><h3>'+esc(e.name)+'</h3><p>'+esc(e.role)+'</p>'+
          (n?'<div class="staff-task-line"><span class="role-task-badge">'+n+'</span><b>'+n+' '+(n===1?'новое задание':'новых задания')+'</b></div>':'')+
          '</div><div class="emp-score"><strong>'+((rating(e)||'—'))+(rating(e)?'%':'')+'</strong><span>рейтинг</span></div></button>';
      }).join('')||'<div class="empty">Нет сотрудников этой должности.</div>')+
      '</div>';
  };

  const baseToggleKnowledge=toggleKnowledge;
  toggleKnowledge=function(area,encodedBlock){
    baseToggleKnowledge(area,encodedBlock);
    if(state.expandedKnowledgeKey){
      setTimeout(()=>window.RAOnboarding?.startKey('employee-actions',true),180);
    }
  };

  const baseSelectStaff=selectStaff;
  selectStaff=function(id){
    if(state.demoHandoff?.employeeId===id)state.demoHandoff.stage='pin';
    baseSelectStaff(id);
  };

  const baseCheckPinBuffer=checkPinBuffer;
  checkPinBuffer=function(){
    const wasStaffHandoff=state.route==='staff-pin'&&state.demoHandoff?.employeeId===state.currentEmployee;
    const wasManagerReturn=state.route==='manager-pin'&&state.demoHandoff?.stage==='manager-pin-return';
    baseCheckPinBuffer();
    if(wasStaffHandoff&&state.auth==='staff'&&state.route==='home'){
      state.demoHandoff.stage='home';save();render();
    }else if(wasManagerReturn&&state.auth==='manager'&&state.route==='home'){
      state.demoHandoff.stage='manager-result';save();render();
    }
  };

  // Once the official task is opened, the handoff guidance has done its job.
  const baseOpenAssignedAttestation=window.openAssignedAttestation;
  window.openAssignedAttestation=function(id){
    state.demoHandoff=null;save();
    return baseOpenAssignedAttestation(id);
  };

  // After assigning an attestation, explicitly point the presenter to the waiter switch.
  const baseRunAttestation=runAttestationPlaceholder;
  runAttestationPlaceholder=function(employeeId,area,encodedBlock){
    const before=(state.assignedTests||[]).length;
    baseRunAttestation(employeeId,area,encodedBlock);
    const created=(state.assignedTests||[]).length>before;
    if(created){
      state.demoHandoff={employeeId,stage:'manager'};
      save();render();
      setTimeout(()=>window.RAOnboarding?.startKey('handoff-manager',true),320);
    }
  };

  // Training assignment gets the same native handoff.
  const baseSendTest=sendTest;
  sendTest=function(employeeId,area,encodedBlock){
    const before=(state.assignedTests||[]).length;
    baseSendTest(employeeId,area,encodedBlock);
    const created=(state.assignedTests||[]).length>before;
    if(created){
      state.demoHandoff={employeeId,stage:'manager'};
      save();render();
      setTimeout(()=>window.RAOnboarding?.startKey('handoff-manager',true),320);
    }
  };

  const baseRender=render;
  render=function(){baseRender();renderQuickRoleSwitch()};
  renderQuickRoleSwitch();
})();