// Sales finale for the completed Restaurant Academy demo.
(function(){
  const FINALE_ID='raSalesFinale';
  let step=0;
  let choice='';
  let root=null;

  const painMap={
    menu:{label:'Знание меню',text:'Начинаем с меню: загружаем реальные позиции, сервисные уточнения и проверяем одну смену официальной аттестацией.'},
    sales:{label:'Продажи в зале',text:'Встраиваем в обучение рекомендации, допродажу и сервисные формулировки — и проверяем не зубрёжку, а применение.'},
    onboarding:{label:'Адаптация новичков',text:'Собираем единый маршрут новичка: что учить, в какой последовательности и когда он действительно готов выходить в зал.'},
    control:{label:'Контроль управляющего',text:'Даём управляющему факты по каждому сотруднику: задания, результаты, слабые блоки и динамику рейтинга.'}
  };

  function stopTour(){
    document.getElementById('raTour')?.classList.remove('show');
    document.documentElement.classList.remove('ra-tour-lock');
    document.body.classList.remove('ra-tour-lock');
    document.querySelectorAll('.ra-next-action').forEach(x=>x.classList.remove('ra-next-action'));
  }

  function ensure(){
    root=document.getElementById(FINALE_ID);
    if(root)return root;
    root=document.createElement('div');
    root.id=FINALE_ID;
    root.className='ra-sales-finale';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    document.body.appendChild(root);
    root.addEventListener('click',e=>{
      const next=e.target.closest('[data-finale-next]');
      const back=e.target.closest('[data-finale-back]');
      const close=e.target.closest('[data-finale-close]');
      const restart=e.target.closest('[data-finale-restart]');
      const pick=e.target.closest('[data-finale-pain]');
      const copy=e.target.closest('[data-finale-copy]');
      if(next){step=Math.min(3,step+1);render()}
      if(back){step=Math.max(0,step-1);render()}
      if(close)hide();
      if(restart){hide();setTimeout(()=>window.restartAcademyTour?.(),120)}
      if(pick){choice=pick.dataset.finalePain;render()}
      if(copy)copyPilot();
    });
    return root;
  }

  function dots(){return '<div class="ra-finale-dots">'+[0,1,2,3].map(i=>'<i class="'+(i===step?'on':'')+'"></i>').join('')+'</div>'}

  function slide0(){
    return `<div class="ra-finale-kicker">ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА</div>
      <h1>Цикл замкнулся.</h1>
      <p class="ra-finale-lead">Управляющий назначил аттестацию. Сотрудник увидел её в своём кабинете, повторил материал, прошёл аттестацию, рейтинг пересчитался, а результат вернулся управляющему.</p>
      <div class="ra-cycle">
        <div><b>01</b><span>Назначить</span></div><i>→</i><div><b>02</b><span>Получить</span></div><i>→</i><div><b>03</b><span>Аттестовать</span></div><i>→</i><div><b>04</b><span>Пересчитать</span></div><i>→</i><div><b>05</b><span>Увидеть факт</span></div>
      </div>
      <div class="ra-finale-quote">До этой минуты вы просто надеялись, что сотрудник знает меню. Теперь это число, история и конкретный слабый блок. Этим уже можно управлять.</div>`;
  }

  function slide1(){
    return `<div class="ra-finale-kicker">ПРОБЛЕМА → ПРИЧИНА → РЕШЕНИЕ → РЕЗУЛЬТАТ</div>
      <h1>Не приложение. Управленческий контур.</h1>
      <div class="ra-ppr-grid">
        <article><span>Проблема</span><b>Команда «вроде знает» меню и стандарты.</b><p>Пока не случается ошибка перед гостем или просадка продаж.</p></article>
        <article><span>Причина</span><b>Обучение и контроль живут отдельно.</b><p>Чаты, файлы, устные проверки и память управляющего не дают единой картины.</p></article>
        <article><span>Решение</span><b>Один маршрут знаний.</b><p>Ваше меню, ваши стандарты, обучение, тесты, официальная аттестация и кабинет управляющего.</p></article>
        <article class="result"><span>Результат</span><b>Видно, кого и чему учить.</b><p>Новичок понимает путь, сотрудник — свой уровень, управляющий — слабые места команды.</p></article>
      </div>`;
  }

  function slide2(){
    return `<div class="ra-finale-kicker">ТРИ ВОПРОСА СОБСТВЕННИКУ</div>
      <h1>Ответьте себе без презентации.</h1>
      <div class="ra-yes-list">
        <div><b>01</b><p>Хотите видеть, кто <strong>реально знает</strong> меню, а не кто увереннее отвечает управляющему?</p></div>
        <div><b>02</b><p>Хотите, чтобы новый сотрудник учился <strong>по одному стандарту</strong>, а не по версии того, кто сегодня старший?</p></div>
        <div><b>03</b><p>Хотите получать результат аттестации <strong>без ручного сбора</strong> таблиц, чатов и бумажек?</p></div>
      </div>
      <div class="ra-finale-quote">Если хотя бы на два вопроса ответ «да», вам нужен не ещё один разовый тренинг. Вам нужна система, которая продолжает работать после тренинга.</div>`;
  }

  function slide3(){
    const selected=choice&&painMap[choice];
    return `<div class="ra-finale-kicker">СЛЕДУЮЩИЙ ШАГ</div>
      <h1>Не покупайте презентацию. Проверьте систему на своём ресторане.</h1>
      <p class="ra-finale-lead">Берём ваше настоящее меню, одну смену и одну реальную управленческую боль. Запускаем пилот. Через короткий цикл у вас будет не обещание, а цифры: кто учится, кто знает, где просадка и что изменилось. После этого вы сами решаете, стоит ли масштабировать.</p>
      <div class="ra-pain-title">С чего у вас логичнее начать?</div>
      <div class="ra-pain-grid">
        ${Object.entries(painMap).map(([k,v])=>`<button data-finale-pain="${k}" class="${choice===k?'on':''}"><span>${v.label}</span><i>${choice===k?'✓':'→'}</i></button>`).join('')}
      </div>
      ${selected?`<div class="ra-pilot"><span>ПИЛОТ · ${selected.label.toUpperCase()}</span><h2>${selected.text}</h2><p>Фиксируем задачу, команду и критерий результата. После пилота — конкретный разговор о масштабе внедрения.</p><div class="ra-pilot-actions"><button class="primary" data-finale-copy>Зафиксировать план пилота</button><button class="ghost" data-finale-restart>Пройти демо ещё раз</button></div></div>`:'<div class="ra-pilot muted"><p>Выберите главную боль — финал сразу соберёт под неё первый шаг.</p></div>'}`;
  }

  function render(){
    ensure();
    const slides=[slide0,slide1,slide2,slide3];
    root.innerHTML=`<div class="ra-finale-shell">
      <div class="ra-finale-top"><div class="ra-finale-brand"><span>RA</span><div><b>Restaurant Academy</b><small>система обучения и контроля команды</small></div></div><button class="ra-finale-x" data-finale-close aria-label="Закрыть">×</button></div>
      <div class="ra-finale-body">${slides[step]()}</div>
      <div class="ra-finale-bottom">${dots()}<div class="ra-finale-nav"><button class="ghost" data-finale-back ${step===0?'disabled':''}>Назад</button>${step<3?'<button class="primary" data-finale-next>'+(step===2?'К предложению':'Далее')+'</button>':'<button class="ghost" data-finale-close>Вернуться в кабинет</button>'}</div></div>
    </div>`;
  }

  function show(){
    stopTour();
    ensure();
    step=0;choice='';
    root.classList.add('show');
    document.documentElement.classList.add('ra-finale-lock');
    document.body.classList.add('ra-finale-lock');
    render();
  }

  function hide(){
    root?.classList.remove('show');
    document.documentElement.classList.remove('ra-finale-lock');
    document.body.classList.remove('ra-finale-lock');
    if(state?.demoHandoff?.stage==='finale'){
      state.demoHandoff=null;
      try{save()}catch(e){}
    }
  }

  async function copyPilot(){
    const selected=choice&&painMap[choice];if(!selected)return;
    const text=`Restaurant Academy — пилот\nЗадача: ${selected.label}\nПервый шаг: ${selected.text}\nДальше: фиксируем состав команды, объём контента и критерий результата; после пилота решаем масштаб внедрения.`;
    try{
      await navigator.clipboard.writeText(text);
      const btn=root.querySelector('[data-finale-copy]');
      if(btn){const old=btn.textContent;btn.textContent='План скопирован';setTimeout(()=>{if(btn.isConnected)btn.textContent=old},1800)}
    }catch(e){
      window.prompt('Скопируйте план пилота:',text);
    }
  }

  function installHook(){
    const base=window.openEmployeePage;
    if(typeof base!=='function'){setTimeout(installHook,80);return}
    if(base.__raSalesFinaleWrapped)return;
    const wrapped=function(id){
      const shouldFinish=state?.demoHandoff?.stage==='manager-result';
      const out=base.apply(this,arguments);
      if(shouldFinish){
        state.demoHandoff={employeeId:id,stage:'finale'};
        try{save()}catch(e){}
        setTimeout(show,260);
      }
      return out;
    };
    wrapped.__raSalesFinaleWrapped=true;
    window.openEmployeePage=wrapped;

    if(state?.demoHandoff?.stage==='manager-result'&&state?.auth==='manager'&&state?.route==='employee-detail'){
      state.demoHandoff.stage='finale';
      try{save()}catch(e){}
      setTimeout(show,260);
    }
  }

  window.RASalesFinale={show,hide};
  installHook();
})();
