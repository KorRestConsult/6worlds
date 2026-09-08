// Manager sends training tests to a concrete employee. Training assignments never affect rating.
state.assignedTests=Array.isArray(state.assignedTests)?state.assignedTests:[];
function pendingTestsFor(id){return state.assignedTests.filter(t=>t.employeeId===id&&t.status!=='done')}
function sentTestExists(employeeId,area,block){return state.assignedTests.some(t=>t.employeeId===employeeId&&t.area===area&&t.block===block&&t.status!=='done')}
function sendTest(employeeId,area,encodedBlock){
  const block=decodeURIComponent(encodedBlock);
  if(!sentTestExists(employeeId,area,block)){
    state.assignedTests.push({id:'t'+Date.now(),employeeId,area,block,status:'new',createdAt:today()});
    save();
  }
  const e=emp(employeeId);
  openModal(`<div class="modal-head"><div><div class="kicker">Тест отправлен</div><h2>${esc(block)}</h2><p>${esc(e.name)} · ${area==='kitchen'?'Кухня':'Бар'}</p></div><button class="closebtn" onclick="closeModal()">×</button></div><div class="notice">Тест появился в кабинете сотрудника. Он учебный и рейтинг не меняет.</div><div class="modal-actions"><button class="primary" onclick="closeModal()">Готово</button></div>`);
  render();
}
function runAttestationPlaceholder(id,area,encodedBlock){
  const block=decodeURIComponent(encodedBlock),e=emp(id);
  openModal(`<div class="modal-head"><div><div class="kicker">Провести аттестацию</div><h2>${esc(block)}</h2><p>${esc(e.name)} · ${area==='kitchen'?'Кухня':'Бар'}</p></div><button class="closebtn" onclick="closeModal()">×</button></div><div class="notice">Механику аттестации проектируем отдельно. Зафиксировано: результат аттестации участвует в рейтинге сотрудника.</div>`)
}
function knowledgeRows(e,area){return blocksFor(area).map(b=>{
  const r=rating(e,area,b),n=atts(e,area,b).length,key=knowledgeKey(area,b),open=state.expandedKnowledgeKey===key,enc=encodeURIComponent(b),sent=sentTestExists(e.id,area,b);
  const desc=n?`${n} аттестаци${n===1?'я':'и'}${r?' · текущий результат '+r+'%':''}`:'Аттестаций пока нет';
  return `<div class="knowledge-row-wrap ${open?'open':''}"><button class="knowledge-row" onclick="toggleKnowledge('${area}','${enc}')"><div><b>${esc(b)}</b><small>${esc(desc)}</small></div><strong>${r?r+'%':'—'}</strong><span class="knowledge-chevron">›</span></button><div class="knowledge-expand"><div class="knowledge-expand-inner"><div class="knowledge-actions"><button class="ghost ${sent?'sent':''}" onclick="sendTest('${e.id}','${area}','${enc}')">${sent?'Тест отправлен':'Отправить тест'}</button><button class="primary" onclick="runAttestationPlaceholder('${e.id}','${area}','${enc}')">Провести аттестацию</button></div></div></div></div>`
}).join('')}
function assignedTestsHTML(e){const rows=pendingTestsFor(e.id);if(!rows.length)return '';return `<section class="section section-lined"><div class="section-title"><span>01</span><div><h2>Новые тесты</h2><p>Задания от управляющего</p></div></div><div class="assigned-tests">${rows.map(t=>`<div class="assigned-test"><div><div class="meta"><span>${t.area==='kitchen'?'КУХНЯ':'БАР'}</span><span>·</span><span>ОТ УПРАВЛЯЮЩЕГО</span></div><h3>${esc(t.block)}</h3><p>Учебный тест · рейтинг не меняет</p></div><button class="primary" onclick="openAssignedTest('${t.id}')">Начать</button></div>`).join('')}</div></section>`}
function openAssignedTest(id){const t=state.assignedTests.find(x=>x.id===id);if(!t)return;t.status='opened';save();openModal(`<div class="modal-head"><div><div class="kicker">Тренировочный тест</div><h2>${esc(t.block)}</h2><p>${t.area==='kitchen'?'Кухня':'Бар'} · от управляющего</p></div><button class="closebtn" onclick="closeModal()">×</button></div><div class="notice">Саму механику теста проектируем отдельно. Этот тест учебный и рейтинг не меняет.</div>`)}
function staffHome(){const e=current(),all=rating(e),kr=rating(e,'kitchen'),br=rating(e,'bar');return `<section class="hero"><div><div class="kicker">${esc(e.role)} · кабинет</div><h1>${esc(e.name)}</h1><p>Рейтинг формируется только из нескольких аттестаций. Тренировочные тесты его не меняют.</p><div class="split-actions"><button class="secondary ghost" onclick="openSelfPhoto()">Изменить фото</button></div></div><div class="scorebox"><span>Мой рейтинг</span><strong>${all||'—'}${all?'%':''}</strong><div class="track"><i style="width:${all}%"></i></div><small>${atts(e).length} аттестаций</small></div></section>${assignedTestsHTML(e)}<section class="section section-lined"><div class="section-title"><span>${pendingTestsFor(e.id).length?'02':'01'}</span><div><h2>Кухня и бар</h2><p>Открывай направление и проваливайся в блоки меню</p></div></div><div class="grid g2">${staffAreaCard(e,'kitchen','Кухня',kr)}${staffAreaCard(e,'bar','Бар',br)}</div></section>`}
render();
