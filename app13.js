// Presentation loop: manager sends a training test -> employee completes it -> manager sees the result.
state.testResults=Array.isArray(state.testResults)?state.testResults:[];
state.activeQuiz=state.activeQuiz||null;

function showToast(message){
  let el=document.getElementById('appToast');
  if(!el){el=document.createElement('div');el.id='appToast';el.className='toast';document.body.appendChild(el)}
  el.innerHTML=`<span class="toast-dot"></span><span>${esc(message)}</span>`;
  requestAnimationFrame(()=>el.classList.add('show'));
  clearTimeout(showToast._t);showToast._t=setTimeout(()=>el.classList.remove('show'),2300);
}
function testTime(){try{return new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function completedTestsFor(employeeId){return state.assignedTests.filter(t=>t.employeeId===employeeId&&t.status==='done').sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')))}
function latestCompletedTest(employeeId,area,block){return completedTestsFor(employeeId).find(t=>(!area||t.area===area)&&(!block||t.block===block))||null}

function sendTest(employeeId,area,encodedBlock){
  const block=decodeURIComponent(encodedBlock),e=emp(employeeId);
  if(sentTestExists(employeeId,area,block)){showToast(`Тест уже отправлен: ${e.name}`);return}
  state.assignedTests.push({id:'t'+Date.now(),employeeId,area,block,status:'new',createdAt:today(),managerSeen:false});
  save();render();showToast(`Тест «${block}» отправлен: ${e.name}`);
}

function cleanValue(v,fallback='—'){return String(v||fallback).trim()}
function numberFromText(v){const m=String(v||'').replace(',','.').match(/\d+(?:\.\d+)?/);return m?Number(m[0]):null}
function numericAlternatives(value,suffix){const n=numberFromText(value);if(n===null)return ['490 '+suffix,'690 '+suffix,'790 '+suffix];const step=n>=500?100:n>=100?25:n>=50?10:5;return [Math.max(1,n-step),n+step,n+step*2].map(x=>`${Number.isInteger(x)?x:x.toFixed(1)} ${suffix}`.trim())}
function uniqueQuizOptions(correct,candidates){const all=[correct,...candidates].map(x=>cleanValue(x)).filter((x,i,a)=>a.indexOf(x)===i);while(all.length<4)all.push('Другой вариант '+all.length);return all.slice(0,4)}
function quizQuestion(id,text,correct,candidates){const options=uniqueQuizOptions(correct,candidates);return {id,text,correct,options}}
function buildDemoQuestions(t){
  const items=STOCK[t.area].filter(x=>x.block===t.block),item=items[0]||STOCK[t.area][0]||{};
  const otherItems=STOCK[t.area].filter(x=>x.id!==item.id).map(x=>x.name);
  const otherBlocks=blocksFor(t.area).filter(x=>x!==t.block);
  const unit=t.area==='bar'?'мл':'г';
  const measure=cleanValue(t.area==='bar'?(item.volume||'125 мл'):(item.weight||'220 г'));
  const areaLabel=t.area==='kitchen'?'Кухня':'Бар';
  const otherArea=t.area==='kitchen'?'Бар':'Кухня';
  return [
    quizQuestion('q1',`Какая позиция относится к блоку «${t.block}»?`,cleanValue(item.name,'Позиция меню'),otherItems),
    quizQuestion('q2',`Какая цена указана у позиции «${cleanValue(item.name,'Позиция меню')}»?`,cleanValue(item.price,'590 ₽'),numericAlternatives(item.price,'₽')),
    quizQuestion('q3',`${t.area==='bar'?'Какой объём':'Какой вес'} указан у позиции «${cleanValue(item.name,'Позиция меню')}»?`,measure,numericAlternatives(measure,unit)),
    quizQuestion('q4',`К какому блоку относится позиция «${cleanValue(item.name,'Позиция меню')}»?`,t.block,otherBlocks),
    quizQuestion('q5',`В каком разделе находится блок «${t.block}»?`,areaLabel,[otherArea,'Оба раздела','Профиль сотрудника'])
  ];
}

function openAssignedTest(id){
  const t=state.assignedTests.find(x=>x.id===id);if(!t||t.status==='done')return;
  t.status='opened';
  state.activeQuiz={testId:id,index:0,answers:[]};
  state.route='assigned-test';save();render();window.scrollTo({top:0,behavior:'auto'});
}
function selectedQuizAnswer(){const q=state.activeQuiz;return q?.answers?.[q.index]??null}
function chooseQuizAnswer(index){const q=state.activeQuiz;if(!q)return;q.answers[q.index]=index;save();render()}
function nextQuizQuestion(){
  const q=state.activeQuiz;if(!q||q.answers[q.index]===undefined)return;
  const t=state.assignedTests.find(x=>x.id===q.testId);if(!t)return;
  const questions=buildDemoQuestions(t);
  if(q.index<questions.length-1){q.index++;save();render();window.scrollTo({top:0,behavior:'auto'})}else finishTrainingTest();
}
function finishTrainingTest(){
  const q=state.activeQuiz;if(!q)return;const t=state.assignedTests.find(x=>x.id===q.testId);if(!t)return;
  const questions=buildDemoQuestions(t);let correct=0;
  questions.forEach((question,i)=>{const chosen=q.answers[i];if(chosen!==undefined&&question.options[chosen]===question.correct)correct++});
  t.status='done';t.correct=correct;t.total=questions.length;t.score=Math.round(correct/questions.length*100);t.completedAt=`${today()} ${testTime()}`;t.managerSeen=false;
  state.testResults.push({testId:t.id,employeeId:t.employeeId,area:t.area,block:t.block,correct,total:t.total,score:t.score,completedAt:t.completedAt});
  state.route='assigned-test-result';save();render();showToast('Тест завершён. Рейтинг не изменился.');
}
function trainingTestPage(){
  const q=state.activeQuiz,t=q&&state.assignedTests.find(x=>x.id===q.testId);if(!q||!t){state.route='home';save();return staffHome()}
  const questions=buildDemoQuestions(t),question=questions[q.index],selected=selectedQuizAnswer(),pct=Math.round((q.index/questions.length)*100);
  return `<section class="quiz-shell"><div class="quiz-top"><div><div class="quiz-kicker">Тренировочный тест · ${t.area==='kitchen'?'Кухня':'Бар'}</div><h2>${esc(t.block)}</h2></div><button class="ghost" onclick="state.route='home';save();render()">Закрыть</button></div><div class="quiz-progress-label">Вопрос ${q.index+1} из ${questions.length}</div><div class="quiz-progress"><i style="width:${pct}%"></i></div><div class="quiz-card"><div class="quiz-kicker">Вопрос ${q.index+1}</div><h1>${esc(question.text)}</h1><div class="quiz-sub">Выбери один вариант. Результат тренировочного теста не влияет на рейтинг.</div><div class="quiz-options">${question.options.map((o,i)=>`<button class="quiz-option ${selected===i?'selected':''}" onclick="chooseQuizAnswer(${i})"><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="quiz-next"><button class="primary" ${selected===null?'disabled':''} onclick="nextQuizQuestion()">${q.index===questions.length-1?'Завершить тест':'Дальше'}</button></div></div></section>`
}
function trainingTestResultPage(){
  const q=state.activeQuiz,t=q&&state.assignedTests.find(x=>x.id===q.testId);if(!t){state.route='home';save();return staffHome()}
  return `<section class="quiz-shell"><div class="quiz-card quiz-result"><div class="quiz-kicker">Тест завершён · ${t.area==='kitchen'?'Кухня':'Бар'}</div><div class="result-circle"><strong>${t.correct}/${t.total}</strong></div><h1>${esc(t.block)}</h1><p>${t.score}% правильных ответов. Это тренировочный тест — общий рейтинг сотрудника не изменился.</p><div class="split-actions" style="justify-content:center"><button class="primary" onclick="state.activeQuiz=null;state.route='home';save();render()">Вернуться в кабинет</button></div></div></section>`
}

function assignedTestsHTML(e){
  const rows=pendingTestsFor(e.id);if(!rows.length)return '';
  return `<section class="section section-lined"><div class="section-title"><span>!</span><div><h2>Новые задания</h2><p>Управляющий отправил тренировочный тест</p></div></div><div class="assigned-tests">${rows.map(t=>`<div class="notification-card"><div class="notification-badge">✓</div><div><div class="meta"><span>${t.area==='kitchen'?'КУХНЯ':'БАР'}</span><span>·</span><span>ОТ УПРАВЛЯЮЩЕГО</span></div><h3>${esc(t.block)}</h3><p>Новый тренировочный тест · рейтинг не меняет</p></div><button class="primary" onclick="openAssignedTest('${t.id}')">Начать</button></div>`).join('')}</div></section>`
}
function renderStaff(){if(state.route==='assigned-test')return trainingTestPage();if(state.route==='assigned-test-result')return trainingTestResultPage();if(state.route==='learn')return learnPage();return staffHome()}

function managerTrainingResults(e){
  const rows=completedTestsFor(e.id);if(!rows.length)return '<div class="empty">Тренировочных тестов пока нет.</div>';
  return `<div class="test-results-card">${rows.slice(0,8).map(t=>`<div class="test-result-row"><div><b>${esc(t.block)}</b><small>${t.area==='kitchen'?'Кухня':'Бар'} · ${esc(t.completedAt||'')} · тренировочный тест</small></div><div class="test-result-score">${t.correct}/${t.total}</div></div>`).join('')}</div>`
}
function knowledgeRows(e,area){return blocksFor(area).map(b=>{
  const r=rating(e,area,b),n=atts(e,area,b).length,key=knowledgeKey(area,b),open=state.expandedKnowledgeKey===key,enc=encodeURIComponent(b),sent=sentTestExists(e.id,area,b),lastTest=latestCompletedTest(e.id,area,b);
  let desc=n?`${n} аттестаци${n===1?'я':'и'}${r?' · текущий результат '+r+'%':''}`:'Аттестаций пока нет';
  if(lastTest)desc+=` · последний тест ${lastTest.correct}/${lastTest.total}`;
  return `<div class="knowledge-row-wrap ${open?'open':''}"><button class="knowledge-row" onclick="toggleKnowledge('${area}','${enc}')"><div><b>${esc(b)}</b><small>${esc(desc)}</small></div><strong>${r?r+'%':'—'}</strong><span class="knowledge-chevron">›</span></button><div class="knowledge-expand"><div class="knowledge-expand-inner"><div class="knowledge-actions"><button class="ghost ${sent?'sent':''}" onclick="sendTest('${e.id}','${area}','${enc}')">${sent?'Тест отправлен':'Отправить тест'}</button><button class="primary" onclick="runAttestationPlaceholder('${e.id}','${area}','${enc}')">Провести аттестацию</button></div></div></div></div>`
}).join('')}

function employeeDetailPage(){const e=current(),all=rating(e),kr=rating(e,'kitchen'),br=rating(e,'bar');return `<div class="backline"><button class="ghost" onclick="state.route='home';save();render()">← Команда</button></div><section class="employee-detail-head">${employeePhoto(e)}<div><div class="kicker">${esc(e.role)} · сотрудник</div><h1>${esc(e.name)}</h1><p>${e.phone?esc(e.phone):''}${e.tg?`${e.phone?' · ':''}${esc(e.tg)}`:''}${e.start?`${e.phone||e.tg?' · ':''}с ${esc(e.start)}`:''}</p></div><div class="detail-total"><span>Общий рейтинг</span><strong>${all||'—'}${all?'%':''}</strong></div></section><section class="section section-lined"><div class="section-title"><span>01</span><div><h2>Знания</h2><p>Рейтинг формируется только аттестациями; тесты показаны отдельно</p></div></div><div class="knowledge-grid"><div class="knowledge-card"><div class="knowledge-head"><h3>Кухня</h3><strong>${kr?kr+'%':'—'}</strong></div><div class="knowledge-list">${knowledgeRows(e,'kitchen')}</div></div><div class="knowledge-card"><div class="knowledge-head"><h3>Бар</h3><strong>${br?br+'%':'—'}</strong></div><div class="knowledge-list">${knowledgeRows(e,'bar')}</div></div></div></section><section class="section section-lined"><div class="section-title"><span>02</span><div><h2>Тренировочные тесты</h2><p>Последние проверки от управляющего — на рейтинг не влияют</p></div></div>${managerTrainingResults(e)}</section><section class="section section-lined"><div class="section-title"><span>03</span><div><h2>История аттестаций</h2><p>Только эти результаты участвуют в рейтинге</p></div></div>${employeeHistory(e)}</section><section class="section section-lined"><div class="settings-strip"><div><b>Настройки сотрудника</b><small>Редко используемые действия</small></div><div class="settings-actions"><button class="ghost" onclick="openEmployeeForm('${e.id}')">Редактировать</button><button class="ghost" onclick="openPinReset('${e.id}')">Сменить PIN</button><button class="danger" onclick="archiveEmployee('${e.id}')">Архивировать</button></div></div></section>`}

const managerHomeBeforePresentation=managerHome;
managerHome=function(){
  const unseen=state.assignedTests.filter(t=>t.status==='done'&&!t.managerSeen).sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
  const base=managerHomeBeforePresentation();if(!unseen.length)return base;const t=unseen[0],e=emp(t.employeeId);
  return `<section class="section"><div class="notification-card"><div class="notification-badge">✓</div><div><div class="meta"><span>НОВЫЙ РЕЗУЛЬТАТ</span><span>·</span><span>${t.area==='kitchen'?'КУХНЯ':'БАР'}</span></div><h3>${esc(e?.name||'Сотрудник')} · ${esc(t.block)}</h3><p>Тест завершён: ${t.correct}/${t.total} · рейтинг не изменён</p></div><button class="primary" onclick="openCompletedTestResult('${t.id}')">Посмотреть</button></div></section>${base}`
}
function openCompletedTestResult(id){const t=state.assignedTests.find(x=>x.id===id);if(!t)return;t.managerSeen=true;save();openEmployeePage(t.employeeId)}

render();
