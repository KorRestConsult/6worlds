// UX / consistency pass: map alignment and interaction fixes.
(function(){
  const blockMap={
    'Закуски':'Холодные закуски',
    'Паста':'Горячие блюда',
    'Классика':'Коктейли',
    'Авторские':'Коктейли'
  };
  state.employees.forEach(e=>{
    (e.attestations||[]).forEach(a=>{if(blockMap[a.block])a.block=blockMap[a.block]});
  });
  save();
})();

function topIdentity(){
  if(state.route==='roles') return 'RA';
  if(state.auth==='manager') return 'У';
  const e=current();
  return e?.photo?`<img src="${esc(e.photo)}" alt="">`:e?initials(e.name):'RA';
}

function render(){
  const roleBtn=document.getElementById('roleBtn');
  roleBtn.textContent=state.route==='roles'?'Главное меню':state.role;
  roleBtn.onclick=goRoles;
  document.getElementById('topAvatar').innerHTML=topIdentity();
  document.getElementById('nav').innerHTML=nav();
  let html='';
  if(state.route==='roles') html=roleCards();
  else if(state.route==='manager-pin') html=managerPinPage();
  else if(state.route==='staff-select') html=staffSelectPage();
  else if(state.route==='staff-pin') html=staffPinPage();
  else html=state.auth==='manager'?renderManager():renderStaff();
  document.getElementById('root').innerHTML=html;
}

function roleCards(){
  return `<section class="managerhero role-intro"><div class="kicker">Главное меню</div><h1>Выберите кабинет</h1><p>Три понятных входа в систему. Никаких лишних разделов на старте.</p></section><section class="section role-section"><div class="role-grid"><button class="role-card" onclick="openRole('Управляющий')"><span class="role-no">01</span><div><h3>Управляющий</h3><p>Команда · сотрудники · рейтинг · аттестации</p></div><span class="role-arrow">→</span></button><button class="role-card" onclick="openRole('Официант')"><span class="role-no">02</span><div><h3>Официант</h3><p>Кухня · бар · обучение · личный рейтинг</p></div><span class="role-arrow">→</span></button><button class="role-card" onclick="openRole('Бармен')"><span class="role-no">03</span><div><h3>Бармен</h3><p>Бар · кухня · обучение · личный рейтинг</p></div><span class="role-arrow">→</span></button></div></section>`;
}

function staffHome(){
  const e=current(),all=rating(e),kr=rating(e,'kitchen'),br=rating(e,'bar');
  return `<section class="hero"><div><div class="kicker">${esc(e.role)} · кабинет</div><h1>${esc(e.name)}</h1><p>Рейтинг формируется только из нескольких аттестаций. Тренировочные тесты его не меняют.</p><div class="split-actions"><button class="secondary ghost" onclick="openSelfPhoto()">Изменить фото</button></div></div><div class="scorebox"><span>Мой рейтинг</span><strong>${all||'—'}${all?'%':''}</strong><div class="track"><i style="width:${all}%"></i></div><small>${atts(e).length} аттестаций</small></div></section><section class="section section-lined"><div class="section-title"><span>01</span><div><h2>Кухня и бар</h2><p>Открывай направление и проваливайся в блоки меню</p></div></div><div class="grid g2">${staffAreaCard(e,'kitchen','Кухня',kr)}${staffAreaCard(e,'bar','Бар',br)}</div></section>`;
}

function managerHome(){
  const xs=activeEmployees().filter(e=>state.filter==='Все'||e.role===state.filter);
  const archived=state.employees.filter(e=>e.active===false);
  const archiveHtml=archived.length
    ? `<div class="archive-list">${archived.map(e=>`<div class="archive-row"><div><b>${esc(e.name)}</b><small>${esc(e.role)} · рейтинг ${rating(e)||'—'}${rating(e)?'%':''}</small></div><button class="ghost" onclick="eRestore('${e.id}')">Вернуть</button></div>`).join('')}</div>`
    : '<div class="empty">Архив пуст</div>';
  return `<section class="managerhero"><div class="kicker">Кабинет управляющего</div><h1>Команда</h1><p>Общий рейтинг команды формируется только из результатов аттестаций сотрудников.</p></section><section class="section section-lined"><div class="section-title"><span>01</span><div><h2>Общий результат</h2><p>Среднее значение активной команды</p></div></div><div class="card metric team-score-card"><span>Общий рейтинг всей команды</span><strong>${teamRating()||'—'}${teamRating()?'%':''}</strong><div class="track"><i style="width:${teamRating()}%"></i></div><small>${activeEmployees().length} активных сотрудников · ${activeEmployees().reduce((s,e)=>s+atts(e).length,0)} аттестаций</small></div></section><section class="section section-lined"><div class="section-title with-action"><span>02</span><div><h2>Сотрудники</h2><p>Все зарегистрированные участники программы</p></div><button class="primary" onclick="openEmployeeForm()">+ Добавить</button></div><div class="toolbar role-filters">${['Все','Официант','Бармен'].map(f=>`<button class="chip ${state.filter===f?'on':''}" onclick="state.filter='${f}';save();render()">${f==='Официант'?'Официанты':f==='Бармен'?'Бармены':'Все'}</button>`).join('')}</div><div class="team-grid">${xs.map(employeeCard).join('')||'<div class="empty">В этом разделе пока нет сотрудников.</div>'}</div></section><section class="section section-lined" id="archiveBox"><div class="section-title"><span>03</span><div><h2>Архив</h2><p>История и аттестации сохраняются</p></div></div>${archiveHtml}</section>`;
}

function showBlock(area,block){
  const box=document.getElementById('menuBlock');
  if(!box)return;
  box.innerHTML=blockHTML(area,block);
  document.querySelectorAll('.toolbar .chip').forEach(x=>x.classList.toggle('on',x.textContent.trim()===block));
  box.scrollIntoView({behavior:'smooth',block:'start'});
}

function openEmployeeManager(id){
  state.currentEmployee=id;save();
  const e=emp(id);
  openModal(`<div class="modal-head"><div><div class="kicker">Управление сотрудником</div><h2>${esc(e.name)}</h2><p>${esc(e.role)} · общий рейтинг ${rating(e)||'—'}${rating(e)?'%':''}</p></div><button class="closebtn" onclick="closeModal()">×</button></div><div class="modal-divider"><span>Рейтинг по направлениям</span></div><div class="grid g2">${manageArea(e,'kitchen','Кухня',rating(e,'kitchen'))}${manageArea(e,'bar','Бар',rating(e,'bar'))}</div><div class="modal-divider"><span>История аттестаций</span></div>${attList(e,50)}<div class="modal-divider"><span>Управление</span></div><div class="split-actions"><button class="ghost" onclick="openPinReset('${e.id}')">Сменить / сбросить PIN</button><button class="ghost" onclick="openEmployeeForm('${e.id}')">Редактировать сотрудника</button><button class="danger" onclick="archiveEmployee('${e.id}')">Архивировать</button></div>`);
}

render();