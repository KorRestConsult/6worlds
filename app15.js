// Official attestation flow. Manager assigns -> employee completes -> rating updates in realtime.
(function(){
  state.activeAttestation=state.activeAttestation||null;

  function isAttestation(t){return t?.assignmentType==='attestation'}
  function pendingAttestationsFor(id){return (state.assignedTests||[]).filter(t=>t.employeeId===id&&isAttestation(t)&&t.status!=='done')}
  function sentAttestationExists(employeeId,area,block){return (state.assignedTests||[]).some(t=>t.employeeId===employeeId&&isAttestation(t)&&t.area===area&&t.block===block&&t.status!=='done')}

  runAttestationPlaceholder=function(employeeId,area,encodedBlock){
    const block=decodeURIComponent(encodedBlock),e=emp(employeeId);
    if(sentAttestationExists(employeeId,area,block)){showToast(`Аттестация уже назначена: ${e.name}`);return}
    const preview=buildDemoQuestions({area,block});
    if(!preview.length){showToast('Для этого блока пока нет вопросов аттестации');return}
    state.assignedTests.push({
      id:'att_'+Date.now(),employeeId,area,block,assignmentType:'attestation',
      status:'new',createdAt:today(),managerSeen:false
    });
    save();render();showToast(`Аттестация «${block}» назначена: ${e.name}`);
  };

  // Keep training and attestation status independent.
  sentTestExists=function(employeeId,area,block){
    return (state.assignedTests||[]).some(t=>t.employeeId===employeeId&&!isAttestation(t)&&t.area===area&&t.block===block&&t.status!=='done')
  };
  pendingTestsFor=function(id){return (state.assignedTests||[]).filter(t=>t.employeeId===id&&!isAttestation(t)&&t.status!=='done')};
  completedTestsFor=function(employeeId){return (state.assignedTests||[]).filter(t=>t.employeeId===employeeId&&!isAttestation(t)&&t.status==='done').sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')))};
  latestCompletedTest=function(employeeId,area,block){return completedTestsFor(employeeId).find(t=>(!area||t.area===area)&&(!block||t.block===block))||null};
  managerTrainingResults=function(e){const rows=completedTestsFor(e.id);if(!rows.length)return '<div class="empty">Тренировочных тестов пока нет.</div>';return `<div class="test-results-card">${rows.slice(0,8).map(t=>`<div class="test-result-row"><div><b>${esc(t.block)}</b><small>${t.area==='kitchen'?'Кухня':'Бар'} · ${esc(t.completedAt||'')} · тренировочный тест</small></div><div class="test-result-score">${t.correct}/${t.total}</div></div>`).join('')}</div>`};

  knowledgeRows=function(e,area){return blocksFor(area).map(b=>{
    const r=rating(e,area,b),n=atts(e,area,b).length,key=knowledgeKey(area,b),open=state.expandedKnowledgeKey===key,enc=encodeURIComponent(b),
      sent=sentTestExists(e.id,area,b),attSent=sentAttestationExists(e.id,area,b),lastTest=latestCompletedTest(e.id,area,b);
    let desc=n?`${n} аттестаци${n===1?'я':'и'}${r?' · текущий результат '+r+'%':''}`:'Аттестаций пока нет';
    if(lastTest)desc+=` · последний тест ${lastTest.correct}/${lastTest.total}`;
    return `<div class="knowledge-row-wrap ${open?'open':''}"><button class="knowledge-row" onclick="toggleKnowledge('${area}','${enc}')"><div><b>${esc(b)}</b><small>${esc(desc)}</small></div><strong>${r?r+'%':'—'}</strong><span class="knowledge-chevron">›</span></button><div class="knowledge-expand"><div class="knowledge-expand-inner"><div class="knowledge-actions"><button class="ghost ${sent?'sent':''}" onclick="sendTest('${e.id}','${area}','${enc}')">${sent?'Тест отправлен':'Отправить тест'}</button><button class="primary ${attSent?'sent':''}" onclick="runAttestationPlaceholder('${e.id}','${area}','${enc}')">${attSent?'Аттестация назначена':'Назначить аттестацию'}</button></div></div></div></div>`
  }).join('')};

  function attestationAssignmentsHTML(e){
    const rows=pendingAttestationsFor(e.id);if(!rows.length)return '';
    return `<section class="section section-lined attestation-inbox"><div class="section-title"><span>!</span><div><h2>Новая аттестация</h2><p>Официальная проверка от управляющего · результат войдёт в рейтинг</p></div></div><div class="assigned-tests">${rows.map(t=>`<div class="notification-card attestation-card"><div class="notification-badge">★</div><div><div class="meta"><span>${t.area==='kitchen'?'КУХНЯ':'БАР'}</span><span>·</span><span>АТТЕСТАЦИЯ</span></div><h3>${esc(t.block)}</h3><p>Официальный результат · влияет на рейтинг</p></div><button class="primary" onclick="openAssignedAttestation('${t.id}')">Начать аттестацию</button></div>`).join('')}</div></section>`
  }

  const trainingAssignmentsHTML=assignedTestsHTML;
  assignedTestsHTML=function(e){return attestationAssignmentsHTML(e)+trainingAssignmentsHTML(e)};

  window.openAssignedAttestation=function(id){
    const t=(state.assignedTests||[]).find(x=>x.id===id);if(!t||!isAttestation(t)||t.status==='done')return;
    const qs=buildDemoQuestions(t);
    if(!qs.length){showToast('Для этой аттестации нет вопросов');return}
    t.status='opened';
    state.activeAttestation={assignmentId:id,index:0,answers:[],questionSet:qs};
    state.route='assigned-attestation';save();render();window.scrollTo({top:0});
  };
  window.chooseAttestationAnswer=function(i){const a=state.activeAttestation;if(!a)return;a.answers[a.index]=i;save();render()};
  window.nextAttestationQuestion=function(){
    const a=state.activeAttestation;if(!a||a.answers[a.index]===undefined)return;
    if(a.index<a.questionSet.length-1){a.index++;save();render();window.scrollTo({top:0})}else finishAttestation();
  };
  function finishAttestation(){
    const a=state.activeAttestation,t=(state.assignedTests||[]).find(x=>x.id===a?.assignmentId);if(!a||!t)return;
    let correct=0;
    a.questionSet.forEach((q,i)=>{const ci=q.correctIndex??q.options.indexOf(q.correct);if(a.answers[i]===ci)correct++});
    const score=Math.round(correct/a.questionSet.length*100),e=emp(t.employeeId);
    const result={id:'att_result_'+Date.now(),area:t.area,block:t.block,score,date:today(),assignmentId:t.id,source:'assigned'};
    e.attestations=Array.isArray(e.attestations)?e.attestations:[];
    e.attestations.push(result);
    t.status='done';t.correct=correct;t.total=a.questionSet.length;t.score=score;t.completedAt=`${today()} ${testTime()}`;t.managerSeen=false;
    state.activeAttestation={...a,finished:true,score,correct,total:a.questionSet.length};
    state.route='assigned-attestation-result';save();render();
    showToast(`Аттестация завершена · новый рейтинг ${rating(e)}%`);
  }
  function attestationPage(){
    const a=state.activeAttestation,t=(state.assignedTests||[]).find(x=>x.id===a?.assignmentId);if(!a||!t)return staffHome();
    const q=a.questionSet[a.index],selected=a.answers[a.index];
    return `<section class="quiz-shell official-attestation"><div class="quiz-top"><div><div class="quiz-kicker">Официальная аттестация · ${t.area==='kitchen'?'Кухня':'Бар'}</div><h2>${esc(t.block)}</h2></div><div class="attestation-lock">Результат войдёт в рейтинг</div></div><div class="quiz-progress-label">Вопрос ${a.index+1} из ${a.questionSet.length}</div><div class="quiz-progress"><i style="width:${Math.round(a.index/a.questionSet.length*100)}%"></i></div><div class="quiz-card"><div class="quiz-kicker">Без подсказок до завершения</div><h1>${esc(q.text)}</h1><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option ${selected===i?'selected':''}" onclick="chooseAttestationAnswer(${i})"><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="quiz-next"><button class="primary" ${selected===undefined?'disabled':''} onclick="nextAttestationQuestion()">${a.index===a.questionSet.length-1?'Завершить аттестацию':'Дальше'}</button></div></div></section>`
  }
  function attestationResultPage(){
    const a=state.activeAttestation,t=(state.assignedTests||[]).find(x=>x.id===a?.assignmentId),e=t&&emp(t.employeeId);if(!a||!t||!e)return staffHome();
    const blockRating=rating(e,t.area,t.block),areaRating=rating(e,t.area),all=rating(e);
    return `<section class="quiz-shell"><div class="quiz-card quiz-result attestation-result"><div class="quiz-kicker">Аттестация завершена</div><div class="result-circle"><strong>${a.correct}/${a.total}</strong></div><h1>${esc(t.block)}</h1><p><b>${a.score}%</b> · официальный результат сохранён.</p><div class="rating-after"><div><span>Блок</span><strong>${blockRating}%</strong></div><div><span>${t.area==='kitchen'?'Кухня':'Бар'}</span><strong>${areaRating}%</strong></div><div><span>Общий рейтинг</span><strong>${all}%</strong></div></div><button class="primary" onclick="state.activeAttestation=null;state.route='home';save();render()">В кабинет</button></div></section>`
  }

  const staffBeforeAttestation=renderStaff;
  renderStaff=function(){
    if(state.route==='assigned-attestation')return attestationPage();
    if(state.route==='assigned-attestation-result')return attestationResultPage();
    return staffBeforeAttestation();
  };

  // Manager gets a distinct realtime result notification.
  const managerBeforeAttestation=managerHome;
  managerHome=function(){
    // Prevent older generic wrapper from showing the same attestation as a training result.
    const attDone=(state.assignedTests||[]).filter(t=>isAttestation(t)&&t.status==='done'&&!t.managerSeen)
      .sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
    if(!attDone.length)return managerBeforeAttestation();
    const t=attDone[0],e=emp(t.employeeId);
    const oldSeen=t.managerSeen;t.managerSeen=true;
    const base=managerBeforeAttestation();
    t.managerSeen=oldSeen;
    return `<section class="section"><div class="notification-card attestation-card"><div class="notification-badge">★</div><div><div class="meta"><span>АТТЕСТАЦИЯ ЗАВЕРШЕНА</span><span>·</span><span>${t.area==='kitchen'?'КУХНЯ':'БАР'}</span></div><h3>${esc(e?.name||'Сотрудник')} · ${esc(t.block)}</h3><p>${t.score}% · рейтинг уже пересчитан: ${rating(e)}%</p></div><button class="primary" onclick="openAttestationResultForManager('${t.id}')">Посмотреть</button></div></section>${base}`
  };
  window.openAttestationResultForManager=function(id){const t=state.assignedTests.find(x=>x.id===id);if(!t)return;t.managerSeen=true;save();openEmployeePage(t.employeeId)};

  render();
})();