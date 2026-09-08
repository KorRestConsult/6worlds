// Final UX audit fixes from the 13-page buyer review.
(function(){
  function pct(v){const n=Number(v)||0;return Math.max(0,Math.min(100,n))}
  function scaleHTML(v,label){
    const n=pct(v);
    return '<div class="ra-rating-scale" aria-label="'+esc(label||'Рейтинг')+' '+n+'%"><div class="ra-rating-scale-top"><span>'+esc(label||'Рейтинг')+'</span><b>'+(n?n+'%':'—')+'</b></div><div class="ra-rating-track"><i style="width:'+n+'%"></i></div></div>';
  }
  window.raScaleHTML=scaleHTML;

  // 1) Make every employee knowledge score visual, not a lonely percentage.
  knowledgeRows=function(e,area){return blocksFor(area).map(b=>{
    const r=rating(e,area,b),n=atts(e,area,b).length,key=knowledgeKey(area,b),open=state.expandedKnowledgeKey===key,enc=encodeURIComponent(b),
      sent=sentTestExists(e.id,area,b),attSent=sentAttestationExists(e.id,area,b),lastTest=latestCompletedTest(e.id,area,b);
    let desc=n?(n+' '+(n===1?'аттестация':'аттестации')+(r?' · официальный результат '+r+'%':'')):'Аттестаций пока нет';
    if(lastTest)desc+=' · тренировка '+lastTest.correct+' из '+lastTest.total;
    return '<div class="knowledge-row-wrap '+(open?'open':'')+'"><button class="knowledge-row" onclick="toggleKnowledge(\''+area+'\',\''+enc+'\')"><div class="knowledge-row-main"><b>'+esc(b)+'</b><small>'+esc(desc)+'</small>'+scaleHTML(r,'Уровень блока')+'</div><span class="knowledge-chevron">›</span></button><div class="knowledge-expand"><div class="knowledge-expand-inner"><div class="knowledge-actions"><button class="ghost '+(sent?'sent':'')+'" onclick="sendTest(\''+e.id+'\',\''+area+'\',\''+enc+'\')">'+(sent?'Тест отправлен':'Отправить тест')+'</button><button class="primary '+(attSent?'sent':'')+'" onclick="runAttestationPlaceholder(\''+e.id+'\',\''+area+'\',\''+enc+'\')">'+(attSent?'Аттестация назначена':'Назначить аттестацию')+'</button></div></div></div></div>';
  }).join('')};

  employeeDetailPage=function(){
    const e=current(),all=rating(e),kr=rating(e,'kitchen'),br=rating(e,'bar');
    return '<div class="backline"><button class="ghost" onclick="state.route=\'home\';save();render()">← Команда</button></div>'+
      '<section class="employee-detail-head ra-detail-head">'+employeePhoto(e)+'<div><div class="kicker">'+esc(e.role)+' · сотрудник</div><h1>'+esc(e.name)+'</h1><p>'+(e.tg?esc(e.tg):'')+(e.start?' · с '+esc(e.start):'')+'</p></div><div class="detail-total"><span>Общий рейтинг</span><strong>'+(all||'—')+(all?'%':'')+'</strong>'+scaleHTML(all,'Общий уровень')+'</div></section>'+
      '<section class="section section-lined"><div class="section-title"><span>01</span><div><h2>Шкала знаний</h2><p>Вся система строится от общего рейтинга к конкретному слабому блоку</p></div></div>'+
      '<div class="ra-area-scales"><div class="card">'+scaleHTML(kr,'Кухня')+'</div><div class="card">'+scaleHTML(br,'Бар')+'</div></div>'+
      '<div class="knowledge-grid"><div class="knowledge-card"><div class="knowledge-head"><h3>Кухня</h3><strong>'+ (kr?kr+'%':'—') +'</strong></div><div class="knowledge-list">'+knowledgeRows(e,'kitchen')+'</div></div><div class="knowledge-card"><div class="knowledge-head"><h3>Бар</h3><strong>'+ (br?br+'%':'—') +'</strong></div><div class="knowledge-list">'+knowledgeRows(e,'bar')+'</div></div></div></section>'+
      '<section class="section section-lined"><div class="section-title"><span>02</span><div><h2>Тренировочные тесты</h2><p>Тренировка показывает знания, но не меняет рейтинг</p></div></div>'+managerTrainingResults(e)+'</section>'+
      '<section class="section section-lined"><div class="section-title"><span>03</span><div><h2>История аттестаций</h2><p>Только официальные аттестации формируют шкалы выше</p></div></div>'+employeeHistory(e)+'</section>'+
      '<section class="section section-lined"><div class="settings-strip"><div><b>Настройки сотрудника</b><small>Редко используемые действия</small></div><div class="settings-actions"><button class="ghost" onclick="openEmployeeForm(\''+e.id+'\')">Редактировать</button><button class="ghost" onclick="openPinReset(\''+e.id+'\')">Сменить PIN</button><button class="danger" onclick="archiveEmployee(\''+e.id+'\')">Архивировать</button></div></div></section>';
  };

  managerTrainingResults=function(e){
    const rows=completedTestsFor(e.id);
    if(!rows.length)return '<div class="empty">Тренировочных тестов пока нет.</div>';
    return '<div class="test-results-card">'+rows.slice(0,8).map(t=>'<div class="test-result-row"><div><b>'+esc(t.block)+'</b><small>'+(t.area==='kitchen'?'Кухня':'Бар')+' · '+esc(t.completedAt||'')+' · тренировка</small></div><div class="test-result-score"><b>'+t.correct+' из '+t.total+'</b><small>'+t.score+'%</small></div></div>').join('')+'</div>';
  };

  // 2) Learning always comes before a test/attestation in the demo.
  function pendingAssignment(id){return (state.assignedTests||[]).find(t=>t.id===id)}
  window.studyAssignmentMaterial=function(id){
    const t=pendingAssignment(id);if(!t)return;
    state.studyAssignmentId=id;
    state.learnArea=t.area;
    state.route='learn';
    save();render();
    setTimeout(()=>{
      try{showBlock(t.area,t.block)}catch(e){}
      const item=(STOCK[t.area]||[]).find(x=>x.block===t.block);
      if(item) setTimeout(()=>openMenu(item.id),100);
    },80);
  };
  window.finishStudyMaterial=function(){
    const t=pendingAssignment(state.studyAssignmentId);
    if(t)t.materialReviewed=true;
    state.studyAssignmentId=null;
    closeModal();
    state.route='home';
    save();render();
    setTimeout(()=>{
      const btn=document.querySelector('.attestation-card .primary,.assigned-test .primary');
      if(btn){btn.classList.add('ra-next-action');btn.scrollIntoView({behavior:'auto',block:'center'});setTimeout(()=>btn.classList.remove('ra-next-action'),5000)}
    },120);
  };

  const originalOpenMenu=openMenu;
  openMenu=function(id){
    const x=findMenu(id);if(!x)return;
    const bar=x.area==='bar';
    const study=state.studyAssignmentId&&pendingAssignment(state.studyAssignmentId);
    const facts=[
      ['Цена',x.price||'—'],
      [bar?'Объём':'Вес',x.volume||x.weight||'—'],
      ['Состав',x.ingredients||'—'],
      ['Вкус и ощущения',x.taste||x.meta||'—'],
      ['Как продавать',x.salesScript||x.desc||'—'],
      ['Скрипт / сервис',x.salesTechnique||'—']
    ];
    openModal('<div class="modal-head"><div><div class="kicker">'+(bar?'Бар':'Кухня')+' · '+esc(x.block)+'</div><h2>'+esc(x.name)+'</h2><p>Сначала изучите позицию. Затем проверьте себя тестом или переходите к назначенной аттестации.</p></div><button class="closebtn" onclick="closeModal()">×</button></div>'+
      (x.photo?'<div class="detail-photo ra-study-photo"><img src="'+esc(x.photo)+'" alt="'+esc(x.name)+'"></div>':'')+
      '<div class="ra-study-label">МАТЕРИАЛ ДЛЯ ИЗУЧЕНИЯ</div><div class="facts ra-study-facts">'+facts.map(([k,v])=>'<div class="fact '+(['Состав','Вкус и ощущения','Как продавать','Скрипт / сервис'].includes(k)?'wide':'')+'"><span>'+esc(k)+'</span><b>'+esc(v)+'</b></div>').join('')+'</div>'+
      '<div class="modal-actions ra-study-actions">'+(study?'<button class="primary" onclick="finishStudyMaterial()">Материал изучен → к аттестации</button>':'<button class="primary" onclick="closeModal();startSelfSlowQuiz(\''+x.area+'\',\''+encodeURIComponent(x.block)+'\',\''+x.id+'\',\''+encodeURIComponent(x.name)+'\')">Пройти тренировочный тест</button>')+'</div>');
  };

  // 3) Clear employee inbox wording: study -> attestation.
  assignedTestsHTML=function(e){
    const all=(state.assignedTests||[]).filter(t=>t.employeeId===e.id&&t.status!=='done');
    const attrs=all.filter(t=>t.assignmentType==='attestation');
    const tests=all.filter(t=>t.assignmentType!=='attestation');
    let html='';
    if(attrs.length){
      html+='<section class="section section-lined attestation-inbox"><div class="section-title"><span>!</span><div><h2>Новая аттестация</h2><p>Сначала повторите материал, затем пройдите официальную аттестацию</p></div></div><div class="assigned-tests">'+attrs.map(t=>'<div class="notification-card attestation-card"><div class="notification-badge">★</div><div><div class="meta"><span>'+(t.area==='kitchen'?'КУХНЯ':'БАР')+'</span><span>·</span><span>АТТЕСТАЦИЯ</span></div><h3>'+esc(t.block)+'</h3><p>'+(t.materialReviewed?'Материал просмотрен · можно начинать':'Шаг 1 — изучить материал · Шаг 2 — пройти аттестацию')+'</p></div><div class="ra-assignment-actions"><button class="ghost" onclick="studyAssignmentMaterial(\''+t.id+'\')">'+(t.materialReviewed?'Повторить материал':'Изучить материал')+'</button><button class="primary" onclick="openAssignedAttestation(\''+t.id+'\')">Начать аттестацию</button></div></div>').join('')+'</div></section>';
    }
    if(tests.length){
      html+='<section class="section section-lined"><div class="section-title"><span>Т</span><div><h2>Тренировочные тесты</h2><p>Результат увидит управляющий, рейтинг не изменится</p></div></div><div class="assigned-tests">'+tests.map(t=>'<div class="assigned-test"><div><div class="meta"><span>'+(t.area==='kitchen'?'КУХНЯ':'БАР')+'</span><span>·</span><span>ТРЕНИРОВКА</span></div><h3>'+esc(t.block)+'</h3><p>'+(t.materialReviewed?'Материал просмотрен':'Перед тестом повторите материал')+'</p></div><div class="ra-assignment-actions"><button class="ghost" onclick="studyAssignmentMaterial(\''+t.id+'\')">Изучить материал</button><button class="primary" onclick="openAssignedTest(\''+t.id+'\')">Начать тест</button></div></div>').join('')+'</div></section>';
    }
    return html;
  };

  // Guard official assessment: in the sales demo the buyer must see learning before control.
  const rawOpenAttestation=window.openAssignedAttestation;
  window.openAssignedAttestation=function(id){
    const t=pendingAssignment(id);if(!t)return;
    if(!t.materialReviewed){
      showToast('Сначала изучите материал — затем начнётся аттестация');
      studyAssignmentMaterial(id);return;
    }
    return rawOpenAttestation(id);
  };
  const rawOpenTest=window.openAssignedTest;
  if(typeof rawOpenTest==='function'){
    window.openAssignedTest=function(id){
      const t=pendingAssignment(id);if(!t)return;
      if(!t.materialReviewed){showToast('Сначала изучите материал');studyAssignmentMaterial(id);return}
      return rawOpenTest(id);
    };
  }

  // 4) Make result numbers self-explanatory.
  const baseManagerHome=managerHome;
  managerHome=function(){
    let html=baseManagerHome();
    html=html.replace(/<p>(\d+)% · рейтинг уже пересчитан: (\d+)%<\/p>/g,'<p>Результат аттестации: <b>$1%</b> · новый общий рейтинг сотрудника: <b>$2%</b></p>');
    html=html.replace(/Тест завершён: (\d+)\/(\d+) · рейтинг не изменён/g,'Тренировочный тест: $1 из $2 правильных · рейтинг не изменился');
    return html;
  };

  // 5) When a rating appears, always give it a visible scale.
  const baseEmployeeCard=employeeCard;
  employeeCard=function(e){
    const html=baseEmployeeCard(e),r=rating(e);
    return html.replace('</div><span class="employee-compact-arrow">',''+scaleHTML(r,'Общий уровень')+'</div><span class="employee-compact-arrow">');
  };

  render();
})();