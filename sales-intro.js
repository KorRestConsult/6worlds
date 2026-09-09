// Short sales presentation shown before the existing guided tour.
(function(){
  const ID='raProductIntro';
  let root=null;
  let step=0;
  let tourGuard=null;

  function suppressTour(){
    document.getElementById('raTour')?.classList.remove('show');
    document.documentElement.classList.remove('ra-tour-lock');
    document.body.classList.remove('ra-tour-lock');
    document.querySelectorAll('.ra-next-action').forEach(x=>x.classList.remove('ra-next-action'));
  }

  function ensure(){
    root=document.getElementById(ID);
    if(root)return root;
    root=document.createElement('div');
    root.id=ID;
    root.className='ra-product-intro';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','Презентация KORREST AI');
    document.body.appendChild(root);
    root.addEventListener('click',e=>{
      const next=e.target.closest('[data-intro-next]');
      const back=e.target.closest('[data-intro-back]');
      const start=e.target.closest('[data-intro-start]');
      if(next){step=Math.min(2,step+1);render()}
      if(back){step=Math.max(0,step-1);render()}
      if(start)beginDemo();
    });
    return root;
  }

  function dots(){return '<div class="ra-intro-dots">'+[0,1,2].map(i=>'<i class="'+(i===step?'on':'')+'"></i>').join('')+'</div>'}

  function slide0(){
    return `<div class="ra-intro-kicker">ГЛАВНАЯ ПРОБЛЕМА</div>
      <h1>Ресторан не должен узнавать уровень сотрудника от гостя.</h1>
      <p class="ra-intro-lead">Пока обучение живёт в чатах, файлах и памяти наставников, управляющий слышит одно: «вроде знает».</p>
      <div class="ra-intro-problems">
        <article><span>ЗНАНИЯ</span><b>Разбросаны</b><p>Меню и стандарты учат по-разному.</p></article>
        <article><span>ПРОВЕРКА</span><b>Вручную</b><p>На контроль постоянно уходит время.</p></article>
        <article><span>РЕЗУЛЬТАТ</span><b>Не виден</b><p>Слабое место обнаруживается слишком поздно.</p></article>
      </div>`;
  }

  function slide1(){
    return `<div class="ra-intro-kicker">ЧТО ДЕЛАЕТ KORREST AI</div>
      <h1>Превращает знания ресторана в систему, которой можно управлять.</h1>
      <div class="ra-intro-value">
        <article><span>01 · ВАШ КОНТЕНТ</span><b>Меню и стандарты</b><p>В систему попадают реальные знания конкретного ресторана.</p></article>
        <article><span>02 · ПУТЬ СОТРУДНИКА</span><b>Учёба → тест → аттестация</b><p>Не просто прочитал материал, а подтвердил уровень.</p></article>
        <article class="dark"><span>03 · ФАКТ ДЛЯ РУКОВОДИТЕЛЯ</span><b>Рейтинг и слабые блоки</b><p>Видно, кого и чему доучивать.</p></article>
      </div>
      <div class="ra-intro-note">Не разовый тренинг. Система остаётся в ресторане и продолжает работать после обучения.</div>`;
  }

  function slide2(){
    return `<div class="ra-intro-kicker">ХВАТИТ СЛАЙДОВ</div>
      <h1>Сейчас покажу один полный цикл вживую.</h1>
      <p class="ra-intro-lead">Управляющий назначит аттестацию. Сотрудник пройдёт её. Система вернёт результат руководителю.</p>
      <div class="ra-intro-demo">
        <div><b>01 · УПРАВЛЯЮЩИЙ</b><strong>Назначает</strong></div><i>→</i>
        <div><b>02 · СОТРУДНИК</b><strong>Получает и проходит</strong></div><i>→</i>
        <div><b>03 · СИСТЕМА</b><strong>Считает результат</strong></div><i>→</i>
        <div><b>04 · РУКОВОДИТЕЛЬ</b><strong>Видит факт</strong></div>
      </div>
      <div class="ra-intro-note">После тура сможете закрыть подсказки и спокойно потыкать систему сами.</div>`;
  }

  function render(){
    ensure();
    const slides=[slide0,slide1,slide2];
    root.innerHTML=`<div class="ra-intro-shell">
      <div class="ra-intro-top"><div class="ra-intro-brand"><span class="ra-intro-mark">K AI</span><div><b>KORREST AI</b><small>Департамент Сервиса · демонстрация</small></div></div><div class="ra-intro-counter">${step+1} / 3 · ~15 СЕК</div></div>
      <div class="ra-intro-body">${slides[step]()}</div>
      <div class="ra-intro-bottom">${dots()}<div class="ra-intro-actions"><button class="ghost" data-intro-back ${step===0?'disabled':''}>Назад</button>${step<2?'<button class="primary" data-intro-next>Далее</button>':'<button class="primary" data-intro-start>Показать вживую</button>'}</div></div>
    </div>`;
  }

  function show(){
    suppressTour();
    ensure();
    step=0;
    root.classList.add('show');
    document.documentElement.classList.add('ra-intro-lock');
    document.body.classList.add('ra-intro-lock');
    render();
    clearInterval(tourGuard);
    tourGuard=setInterval(()=>{
      if(root?.classList.contains('show'))suppressTour();
    },120);
  }

  function hide(){
    clearInterval(tourGuard);tourGuard=null;
    root?.classList.remove('show');
    document.documentElement.classList.remove('ra-intro-lock');
    document.body.classList.remove('ra-intro-lock');
  }

  function beginDemo(){
    hide();
    suppressTour();
    if(typeof window.restartAcademyTour==='function'){
      setTimeout(()=>window.restartAcademyTour(),120);
      return;
    }
    try{
      state.role='Управляющий';state.auth=null;state.route='roles';state.demoHandoff=null;save();render();
    }catch(e){}
  }

  window.RASalesIntro={show,hide};
  setTimeout(show,70);
})();
