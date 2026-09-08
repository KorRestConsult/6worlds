// Guided onboarding for the presentation build. First visit per screen + manual replay via ?.
(function(){
  const TOUR_VERSION='ra-tour-v3';
  const SEEN_KEY=TOUR_VERSION+':seen';
  const OPTOUT_KEY='ra-tour:optout';

  function seenMap(){try{return JSON.parse(localStorage.getItem(SEEN_KEY)||'{}')}catch(e){return {}}}
  function saveSeen(m){localStorage.setItem(SEEN_KEY,JSON.stringify(m))}
  function isOptedOut(){return localStorage.getItem(OPTOUT_KEY)==='1'}
  function setOptOut(v){if(v)localStorage.setItem(OPTOUT_KEY,'1');else localStorage.removeItem(OPTOUT_KEY)}
  function screenKey(){
    if(state.demoHandoff?.stage==='select'&&state.route==='staff-select')return 'handoff-staff-select';
    if(state.demoHandoff?.stage==='pin'&&state.route==='staff-pin')return 'handoff-staff-pin';
    if(state.demoHandoff?.stage==='home'&&state.auth==='staff'&&state.route==='home')return 'handoff-staff-home';
    if(state.demoHandoff?.stage==='manager-pin-return'&&state.route==='manager-pin')return 'handoff-manager-pin-return';
    if(state.demoHandoff?.stage==='manager-result'&&state.auth==='manager'&&state.route==='home')return 'handoff-manager-result';
    if(state.route==='roles')return 'roles';
    if(state.route==='manager-pin')return 'manager-pin';
    if(state.route==='staff-select')return 'staff-select:'+state.role;
    if(state.route==='staff-pin')return 'staff-pin';
    if(state.auth==='manager'&&state.route==='home')return 'manager-home';
    if(state.auth==='manager'&&state.route==='employee-detail')return 'employee-detail';
    if(state.auth==='staff'&&state.route==='home')return 'staff-home';
    if(state.auth==='staff'&&state.route==='learn')return 'learn:'+state.learnArea;
    if(state.route==='assigned-test')return 'assigned-test';
    if(state.route==='assigned-test-result')return 'assigned-test-result';
    if(state.route==='assigned-attestation')return 'assigned-attestation';
    if(state.route==='assigned-attestation-result')return 'assigned-attestation-result';
    if(state.route==='slow-self-quiz')return 'slow-self-quiz';
    return '';
  }

  const tours={
    'handoff-manager':[
      {sel:'.quick-role-waiter',title:'Вы всё ещё в кабинете управляющего',text:'Сейчас вы управляете системой от лица руководителя. Аттестация уже назначена. Чтобы увидеть вторую сторону процесса, нажмите «Официант» и продолжите демо глазами сотрудника.',action:true}
    ],
    'handoff-staff-select':[
      {sel:'.staff-select-head',title:'Задание уже ждёт сотрудника',text:'Система сама показывает, сколько новых заданий сейчас у официантов.'},
      {sel:'.handoff-target',title:'Выберите нужного официанта',text:'Красная метка указывает сотрудника, которому управляющий только что назначил задание. После подсказки нажмите его карточку.',action:true}
    ],
    'handoff-staff-pin':[
      {sel:'.pin-keypad',title:'Войдите как сотрудник',text:'Введите персональный PIN. Демо-код показан под клавиатурой. После четвёртой цифры откроется кабинет с новым заданием.',action:true}
    ],
    'handoff-staff-home':[
      {sel:'.attestation-inbox, .notification-card',title:'Вот назначенная аттестация',text:'Управляющий назначил официальную аттестацию. Её результат войдёт в рейтинг сотрудника.'},
      {sel:'.attestation-inbox .primary, .notification-card .primary',title:'Продолжите сценарий',text:'Сначала можно повторить материал, затем нажмите «Начать аттестацию». Это следующий шаг демонстрации.',action:true}
    ],
    'roles':[
      {sel:'.role-intro',title:'Restaurant Academy',text:'Это демонстрация глазами ресторана: сначала управляющий назначает аттестацию, затем официант получает её, проходит и рейтинг обновляется.'},
      {sel:'.role-card:nth-child(1)',title:'Начните с управляющего',text:'Чтобы увидеть главный бизнес-сценарий, после этой подсказки нажмите «Управляющий». Официанта и бармена мы покажем дальше по цепочке.',action:true}
    ],
    'manager-pin':[
      {sel:'.pin-keypad',title:'Вход управляющего · PIN 0000',text:'Нажмите 0 → 0 → 0 → 0. После четвёртой цифры кабинет откроется автоматически.',action:true}
    ],
    'staff-select:Официант':[
      {sel:'.head',title:'Выберите сотрудника',text:'В реальном заведении каждый сотрудник входит в свой кабинет под персональным PIN.'},
      {sel:'.team-grid .card, .team-grid .employee-compact',title:'Личный профиль',text:'Нажмите на нужного официанта. Рейтинг и история принадлежат конкретному сотруднику.'}
    ],
    'staff-select:Бармен':[
      {sel:'.head',title:'Выберите сотрудника',text:'У каждого бармена свой кабинет, задания, история тестов и рейтинг.'},
      {sel:'.team-grid .card, .team-grid .employee-compact',title:'Личный профиль',text:'Выберите бармена и войдите его персональным PIN.'}
    ],
    'staff-pin':[
      {sel:'.pin-keypad',title:'Вход сотрудника',text:'Демо-код крупно показан под клавиатурой. В рабочей версии у каждого сотрудника свой PIN.',action:true}
    ],
    'manager-home':[
      {sel:'.managerhero',title:'Команда под контролем',text:'Главный экран управляющего показывает состояние команды без лишней аналитики.'},
      {sel:'.team-score-card',title:'Рейтинг команды',text:'Он считается только по официальным аттестациям. Тренировочные тесты сюда не попадают.'},
      {sel:'.role-filters',title:'Быстрый фильтр',text:'Можно отдельно посмотреть официантов или барменов.'},
      {sel:'#nav',title:'Основные действия',text:'Внизу: команда, добавление сотрудника, архив и выход. Это ежедневная навигация управляющего.'},
      {sel:'.employee-compact',title:'Теперь откройте сотрудника',text:'После подсказки нажмите первую карточку сотрудника. Внутри увидите, из чего складывается рейтинг и сможете назначить аттестацию.',action:true}
    ],
    'employee-detail':[
      {sel:'.employee-detail-head',title:'Профиль сотрудника',text:'Сверху — общий рейтинг. Он автоматически пересчитывается после каждой новой аттестации.'},
      {sel:'.knowledge-card:first-child',title:'Знания по кухне',text:'Каждый блок имеет собственный рейтинг. Нажмите строку, чтобы открыть действия.'},
      {sel:'.test-results-card, .history-card',title:'История результатов',text:'Тренировочные тесты и официальные аттестации хранятся отдельно. Только аттестации влияют на рейтинг.'},
      {sel:'.knowledge-row-wrap',title:'Откройте блок знаний',text:'Нажмите первую строку блока. Она раскроется и покажет два действия: тренировочный тест и официальную аттестацию.',action:true}
    ],
    'employee-actions':[
      {sel:'.knowledge-row-wrap.open .knowledge-actions .ghost',title:'Тренировочный тест',text:'Его можно отправить сотруднику в любой момент. Он проверяет знания, но не меняет рейтинг.'},
      {sel:'.knowledge-row-wrap.open .knowledge-actions .primary',title:'Официальная аттестация',text:'Для основной демонстрации нажмите «Назначить аттестацию». После прохождения именно она изменит рейтинг сотрудника.',action:true}
    ],
    'staff-home':[
      {sel:'.hero',title:'Личный кабинет',text:'Сотрудник видит свой текущий рейтинг и понимает, что именно влияет на него.'},
      {sel:'.scorebox',title:'Мой рейтинг',text:'Эта цифра меняется только после официальной аттестации. Обычная тренировка её не портит.'},
      {sel:'.attestation-inbox, .notification-card',title:'Задания от управляющего',text:'Если управляющий отправил тест или назначил аттестацию, новое задание появляется здесь сразу сразу.'},
      {sel:'.area-card:first-child',title:'Изучение меню',text:'Откройте кухню или бар, чтобы учить реальные позиции Slow и запускать тренировочные тесты.'},
      {sel:'#nav',title:'Навигация',text:'Кабинет, кухня и бар всегда доступны одним нажатием.'}
    ],
    'learn:kitchen':[
      {sel:'.head',title:'Кухня Slow',text:'Здесь уже загружено реальное демонстрационное меню Slow с фотографиями, составами, ценами и описаниями.'},
      {sel:'.toolbar',title:'Разделы меню',text:'Переключайтесь между холодными и горячими закусками, салатами, супами, горячими блюдами и десертами.'},
      {sel:'.menu-grid .menu-card, #menuBlock .menu-card',title:'Карточка блюда',text:'Откройте блюдо: сотрудник увидит фото, состав, вкус и сервисную подсказку.'},
      {sel:'#menuBlock .ghost, .head .ghost',title:'Тест по блоку',text:'Можно проверить не одну позицию, а целый раздел меню. Вопросы берутся из банка Slow.'}
    ],
    'learn:bar':[
      {sel:'.head',title:'Бар Slow',text:'В баре собраны реальные позиции: коктейли, вино, крепкий алкоголь, пиво, чай и безалкогольные напитки.'},
      {sel:'.toolbar',title:'Разделы бара',text:'Выберите нужный блок и изучайте его отдельно.'},
      {sel:'.menu-grid .menu-card, #menuBlock .menu-card',title:'Карточка напитка',text:'Фото, описание, цена и ключевые вкусовые характеристики собраны в одной карточке.'},
      {sel:'#menuBlock .ghost, .head .ghost',title:'Проверить знания',text:'Тесты используют реальные сценарии продажи и сервиса, а не только зубрёжку цены.'}
    ],
    'assigned-test':[
      {sel:'.quiz-top',title:'Тренировочный тест',text:'Это тренировка: управляющий увидит результат, но рейтинг сотрудника не изменится.'},
      {sel:'.quiz-progress',title:'Прогресс',text:'Сотрудник всегда видит, сколько вопросов осталось.'},
      {sel:'.quiz-options',title:'Ответ и обучение',text:'После ответа Slow показывает верно или неверно и объясняет правильную логику.'}
    ],
    'slow-self-quiz':[
      {sel:'.quiz-top',title:'Самостоятельная тренировка',text:'Сотрудник может учиться сам, даже если управляющий ничего не назначал.'},
      {sel:'.quiz-options',title:'Практика по меню',text:'Вопросы построены на составе, вкусе, продаже, сервисе и реальных ситуациях с гостем.'}
    ],
    'assigned-test-result':[
      {sel:'.quiz-result',title:'Результат тренировки',text:'Результат сохранён и доступен управляющему. Главный рейтинг при этом остаётся прежним.'}
    ],
    'assigned-attestation':[
      {sel:'.quiz-top',title:'Официальная аттестация',text:'Эту аттестацию назначил управляющий. Результат после завершения войдёт в рейтинг сотрудника.'},
      {sel:'.attestation-lock, .quiz-kicker',title:'Без подсказок',text:'Во время аттестации правильные ответы не показываются — это уже контроль знаний, а не обучение.'},
      {sel:'.quiz-options',title:'Начните аттестацию',text:'Выберите вариант ответа. После каждого ответа нажимайте «Дальше». После последнего вопроса результат сохранится, а рейтинг сотрудника пересчитается автоматически.',action:true}
    ],
    'handoff-manager-pin-return':[
      {sel:'.pin-keypad',title:'Вернитесь управляющим',text:'Введите демо-PIN 0000. После входа покажем, что получил управляющий после аттестации.',action:true}
    ],
    'handoff-manager-result':[
      {sel:'.notification-card',title:'Результат уже у управляющего',text:'Аттестация завершена. Управляющий сразу видит официальный результат и новый рейтинг сотрудника.'},
      {sel:'.employee-compact',title:'Рейтинг обновлён',text:'Откройте сотрудника, чтобы увидеть новый результат в блоке знаний и в истории аттестаций.',action:true}
    ],
    'assigned-attestation-result':[
      {sel:'.attestation-result .result-circle',title:'Официальный результат',text:'Это результат конкретной аттестации, который сохраняется в историю сотрудника.'},
      {sel:'.rating-after',title:'Рейтинг пересчитан',text:'Сразу видно новый рейтинг блока, направления и общий рейтинг сотрудника.'},
      {sel:'.quick-role-manager',title:'Замкните цикл',text:'Теперь вернитесь в кабинет управляющего. Там появится результат и обновлённый рейтинг сотрудника.',action:true}
    ]
  };

  let active=null,index=0,resizeTimer=null;

  function availableSteps(key){
    return (tours[key]||[]).filter(s=>document.querySelector(s.sel));
  }
  function ensureUI(){
    if(document.getElementById('raTour'))return;
    const root=document.createElement('div');root.id='raTour';root.className='ra-tour';
    root.innerHTML='<div class="ra-tour-spot"></div><div class="ra-tour-card"><div class="ra-tour-top"><span class="ra-tour-count"></span><div class="ra-tour-top-actions"><button class="ra-tour-repeat" type="button">Повторить</button><button class="ra-tour-skip" type="button">Пропустить</button></div></div><h3></h3><p></p><div class="ra-tour-dots"></div><div class="ra-tour-actions"><button class="ra-tour-back" type="button">Назад</button><button class="ra-tour-next" type="button">Далее</button></div></div>';
    document.body.appendChild(root);
    root.querySelector('.ra-tour-skip').onclick=()=>finish('skip');
    root.querySelector('.ra-tour-repeat').onclick=()=>place();
    root.querySelector('.ra-tour-back').onclick=prev;
    root.querySelector('.ra-tour-next').onclick=next;
    const help=document.createElement('button');help.id='raTourHelp';help.className='ra-tour-help';help.type='button';help.textContent='?';help.setAttribute('aria-label','Показать подсказки');help.onclick=()=>start(screenKey(),true);document.body.appendChild(help);
  }
  let placing=false;
  function targetNeedsScroll(r){
    const safeTop=86,safeBottom=innerHeight-110;
    return r.top<safeTop||r.bottom>safeBottom||r.height>innerHeight*.72;
  }
  function scrollTargetIntoView(el,done){
    const r=el.getBoundingClientRect();
    if(!targetNeedsScroll(r)){done();return}
    placing=true;
    try{el.scrollIntoView({behavior:'auto',block:'center',inline:'nearest'})}catch(e){el.scrollIntoView({block:'center'})}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{placing=false;done()}));
  }
  function place(){
    if(!active)return;
    const steps=availableSteps(active),step=steps[index];if(!step){finish();return}
    const el=document.querySelector(step.sel);if(!el){next();return}
    scrollTargetIntoView(el,()=>placeVisible(el,step,steps));
  }
  function placeVisible(el,step,steps){
    if(!active||!document.body.contains(el))return;
    const r=el.getBoundingClientRect(),spot=document.querySelector('.ra-tour-spot'),card=document.querySelector('.ra-tour-card');
    const pad=8,left=Math.max(6,r.left-pad),top=Math.max(6,r.top-pad),width=Math.min(innerWidth-left-6,r.width+pad*2),height=Math.min(innerHeight-top-6,r.height+pad*2);
    Object.assign(spot.style,{left:left+'px',top:top+'px',width:Math.max(24,width)+'px',height:Math.max(24,height)+'px'});
    card.querySelector('h3').textContent=step.title;card.querySelector('p').textContent=step.text;
    card.querySelector('.ra-tour-count').textContent=(index+1)+' / '+steps.length;
    card.querySelector('.ra-tour-back').disabled=index===0;
    card.querySelector('.ra-tour-next').textContent=step.action?'Закрыть и выполнить':(index===steps.length-1?'Понятно':'Далее');
    card.querySelector('.ra-tour-dots').innerHTML=steps.map((_,i)=>'<i class="'+(i===index?'on':'')+'"></i>').join('');
    requestAnimationFrame(()=>{
      const ch=card.offsetHeight,cw=card.offsetWidth,gap=14;
      if(innerWidth<700){
        card.style.left='14px';card.style.right='14px';card.style.width='auto';
        const targetCenter=r.top+r.height/2;
        const topSpace=r.top-gap;
        const bottomSpace=innerHeight-r.bottom-gap;
        let ct;
        if(targetCenter>innerHeight/2&&topSpace>=ch+10) ct=Math.max(12,r.top-ch-gap);
        else if(bottomSpace>=ch+10) ct=Math.min(innerHeight-ch-12,r.bottom+gap);
        else ct=targetCenter>innerHeight/2?12:Math.max(12,innerHeight-ch-12);
        card.style.top=ct+'px';
      }else{
        card.style.right='auto';card.style.width='min(390px,calc(100vw - 32px))';
        const below=innerHeight-r.bottom-gap,above=r.top-gap;
        const roomRight=innerWidth-r.right-gap,roomLeft=r.left-gap;
        let cl,ct;
        if(roomRight>=cw+8){
          cl=r.right+gap;ct=Math.min(Math.max(14,r.top),innerHeight-ch-14);
        }else if(roomLeft>=cw+8){
          cl=Math.max(14,r.left-cw-gap);ct=Math.min(Math.max(14,r.top),innerHeight-ch-14);
        }else if(below>=ch+8){
          cl=Math.min(Math.max(16,r.left),innerWidth-cw-16);ct=r.bottom+gap;
        }else{
          cl=Math.min(Math.max(16,r.left),innerWidth-cw-16);ct=Math.max(14,r.top-ch-gap);
        }
        card.style.left=cl+'px';card.style.top=ct+'px';
      }
    });
  }
  function lockTourInteraction(){
    document.documentElement.classList.add('ra-tour-lock');
    document.body.classList.add('ra-tour-lock');
  }
  function unlockTourInteraction(){
    document.documentElement.classList.remove('ra-tour-lock');
    document.body.classList.remove('ra-tour-lock');
  }
  function blockTourGesture(e){
    if(!active)return;
    const card=e.target?.closest?.('.ra-tour-card');
    if(card)return;
    if(e.cancelable)e.preventDefault();
  }
  function blockTourWheel(e){
    if(!active)return;
    const card=e.target?.closest?.('.ra-tour-card');
    if(card)return;
    if(e.cancelable)e.preventDefault();
  }
  document.addEventListener('touchmove',blockTourGesture,{passive:false,capture:true});
  document.addEventListener('wheel',blockTourWheel,{passive:false,capture:true});
  document.addEventListener('gesturestart',blockTourGesture,{passive:false,capture:true});
  document.addEventListener('gesturechange',blockTourGesture,{passive:false,capture:true});
  document.addEventListener('gestureend',blockTourGesture,{passive:false,capture:true});

  function start(key,force=false){
    ensureUI();if(!key)return;
    const steps=availableSteps(key);if(!steps.length)return;
    const seen=seenMap();if(!force&&seen[key])return;
    active=key;index=0;lockTourInteraction();document.getElementById('raTour').classList.add('show');place();
  }
  function pulseNextAction(step){
    if(!step?.action)return;
    const el=document.querySelector(step.sel);if(!el)return;
    document.querySelectorAll('.ra-next-action').forEach(x=>x.classList.remove('ra-next-action'));
    el.classList.add('ra-next-action');
    try{el.scrollIntoView({behavior:'auto',block:'center',inline:'nearest'})}catch(e){}
    setTimeout(()=>el.classList.remove('ra-next-action'),6500);
  }
  function finish(reason='done'){
    const steps=active?availableSteps(active):[],step=steps[index];
    if(active){const m=seenMap();m[active]=true;saveSeen(m)}
    if(reason==='skip') setOptOut(true);
    active=null;unlockTourInteraction();document.getElementById('raTour')?.classList.remove('show');
    if(reason!=='skip') setTimeout(()=>pulseNextAction(step),80);
  }
  function next(){if(!active)return;const steps=availableSteps(active),step=steps[index];if(step?.action){finish();return}const n=steps.length;if(index>=n-1)finish();else{index++;place()}}
  function prev(){if(active&&index>0){index--;place()}}
  function maybe(){if(active||isOptedOut())return;const key=screenKey();if(!key)return;setTimeout(()=>start(key,false),260)}

  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(place,80)});
  window.addEventListener('scroll',()=>{if(active&&!placing){clearTimeout(resizeTimer);resizeTimer=setTimeout(place,90)}},{passive:true});

  const realRender=render;
  render=function(){realRender();ensureUI();maybe()};
  window.restartAcademyTour=async function(){
    finish();
    setOptOut(false);
    saveSeen({});
    state.demoRunId='run_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    state.demoIsolationVersion=typeof DEMO_ISOLATION_VERSION!=='undefined'?DEMO_ISOLATION_VERSION:'run-v1';
    state.demoHandoff=null;
    state.assignedTests=[];
    state.testResults=[];
    state.activeQuiz=null;
    state.activeAssignedTest=null;
    state.activeAttestation=null;
    state.expandedKnowledgeKey='';
    if(window.RA_DEMO_BASE_EMPLOYEES) state.employees=JSON.parse(JSON.stringify(window.RA_DEMO_BASE_EMPLOYEES));
    state.auth=null;
    state.role=null;
    state.currentEmployee='e1';
    state.route='roles';
    save();
    render();
    window.scrollTo({top:0,behavior:'auto'});
    try{
      if(window.RAResetDemoCloud) await window.RAResetDemoCloud();
    }catch(e){
      console.warn('[RA Demo reset]',e);
    }
    render();
    setTimeout(()=>start('roles',true),180);
  };
  window.RAOnboarding={
    startKey:(key,force=true)=>start(key,force),
    currentKey:screenKey,
    restart:window.restartAcademyTour
  };
  ensureUI();maybe();
})();