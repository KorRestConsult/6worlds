// Product presentation shown on every fresh page load. Separate from the guided tour.
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
    root.setAttribute('aria-label','Презентация Restaurant Academy');
    document.body.appendChild(root);
    root.addEventListener('click',e=>{
      const next=e.target.closest('[data-intro-next]');
      const back=e.target.closest('[data-intro-back]');
      const start=e.target.closest('[data-intro-start]');
      if(next){step=Math.min(3,step+1);render()}
      if(back){step=Math.max(0,step-1);render()}
      if(start)beginDemo();
    });
    return root;
  }

  function dots(){return '<div class="ra-intro-dots">'+[0,1,2,3].map(i=>'<i class="'+(i===step?'on':'')+'"></i>').join('')+'</div>'}

  function slide0(){
    return `<div class="ra-intro-kicker">ПРОБЛЕМА, КОТОРУЮ РЕСТОРАН ОБЫЧНО НЕ ВИДИТ</div>
      <h1>Сотрудник вышел к гостю. Вы уверены, что он знает, что продаёт?</h1>
      <p class="ra-intro-lead">Меню меняется. Люди приходят и уходят. Один наставник объясняет так, другой — иначе. А реальный уровень знаний обычно становится заметен уже после ошибки, жалобы или упущенной продажи.</p>
      <div class="ra-intro-problems">
        <article><span>01 · обучение</span><b>Знания живут в людях.</b><p>Файлы, чаты и устные объяснения не гарантируют, что вся команда учится по одному стандарту.</p></article>
        <article><span>02 · контроль</span><b>Проверки эпизодические.</b><p>Управляющий тратит время на ручные опросы и всё равно не видит картину по всей команде.</p></article>
        <article><span>03 · результат</span><b>«Вроде знает» — не показатель.</b><p>Без истории и измерения трудно понять, кого допускать, кого доучивать и где именно слабое место.</p></article>
      </div>`;
  }

  function slide1(){
    return `<div class="ra-intro-kicker">ЧТО МЕНЯЕТ СИСТЕМА</div>
      <h1>Все знания ресторана — в одном управляемом контуре.</h1>
      <p class="ra-intro-lead">Система не заменяет руководителя. Она убирает ручную рутину и превращает обучение в последовательный процесс, который можно увидеть и проверить.</p>
      <div class="ra-intro-chain">
        <div><b>01</b><strong>Ваше меню и стандарты</strong></div>
        <div><b>02</b><strong>Обучение сотрудника</strong></div>
        <div><b>03</b><strong>Тренировочные тесты</strong></div>
        <div><b>04</b><strong>Официальная аттестация</strong></div>
        <div><b>05</b><strong>Рейтинг и слабые блоки</strong></div>
        <div><b>06</b><strong>Контроль управляющего</strong></div>
      </div>
      <div class="ra-intro-note">Не просто «обучили». Видно, что сотрудник изучил, как прошёл проверку, где ошибается и как меняется его подтверждённый уровень знаний.</div>`;
  }

  function slide2(){
    return `<div class="ra-intro-kicker">ЦЕННОСТЬ ДЛЯ РЕСТОРАНА</div>
      <h1>Каждый получает ровно то, что ему нужно.</h1>
      <div class="ra-intro-value">
        <article class="dark"><span>Собственник</span><b>Не верит на слово — видит систему.</b><p>Единый стандарт обучения и понятный факт: кто знает продукт, кто проседает и где требуется внимание.</p></article>
        <article><span>Управляющий</span><b>Управляет по слабым местам.</b><p>Назначает обучение и аттестации конкретному сотруднику, а не проверяет всех вручную одинаково.</p></article>
        <article><span>Сотрудник</span><b>Понимает, что учить и зачем.</b><p>Меню, материалы, задания, личный рейтинг и понятная история результатов находятся в одном кабинете.</p></article>
      </div>`;
  }

  function slide3(){
    return `<div class="ra-intro-kicker">ТЕПЕРЬ — НЕ СЛАЙДЫ, А РАБОЧИЙ СЦЕНАРИЙ</div>
      <h1>За несколько минут вы увидите полный цикл глазами ресторана.</h1>
      <p class="ra-intro-lead">Сначала вы войдёте как управляющий и назначите аттестацию. Затем переключитесь на официанта, повторите материал и пройдёте проверку. В финале вернётесь к управляющему и увидите, как система превратила действие сотрудника в управленческий факт.</p>
      <div class="ra-intro-demo">
        <div><b>01 · управляющий</b><strong>Назначает аттестацию</strong></div><i>→</i>
        <div><b>02 · сотрудник</b><strong>Получает и проходит</strong></div><i>→</i>
        <div><b>03 · система</b><strong>Пересчитывает результат</strong></div><i>→</i>
        <div><b>04 · ресторан</b><strong>Видит факт и слабое место</strong></div>
      </div>
      <div class="ra-intro-note">После тура система останется открыта: сможете самостоятельно зайти в кабинеты, сотрудников, меню и тесты — уже без подсказок.</div>`;
  }

  function render(){
    ensure();
    const slides=[slide0,slide1,slide2,slide3];
    root.innerHTML=`<div class="ra-intro-shell">
      <div class="ra-intro-top"><div class="ra-intro-brand"><span class="ra-intro-mark">K AI</span><div><b>KORREST AI</b><small>Restaurant Academy · демонстрация продукта</small></div></div><div class="ra-intro-counter">${step+1} / 4 · ~30 СЕК</div></div>
      <div class="ra-intro-body">${slides[step]()}</div>
      <div class="ra-intro-bottom">${dots()}<div class="ra-intro-actions"><button class="ghost" data-intro-back ${step===0?'disabled':''}>Назад</button>${step<3?'<button class="primary" data-intro-next>Далее</button>':'<button class="primary" data-intro-start>Начать демонстрацию</button>'}</div></div>
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