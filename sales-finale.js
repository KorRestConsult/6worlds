// Short sales finale shown after the existing guided tour.
(function(){
  const FINALE_ID='raSalesFinale';
  let step=0;
  let root=null;

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
      const exploreBtn=e.target.closest('[data-finale-explore]');
      if(next){step=Math.min(1,step+1);render()}
      if(back){step=Math.max(0,step-1);render()}
      if(close)hide();
      if(restart){hide();localStorage.removeItem('ra-tour:optout');setTimeout(()=>window.restartAcademyTour?.(),120)}
      if(exploreBtn)explore();
    });
    return root;
  }

  function dots(){return '<div class="ra-finale-dots">'+[0,1].map(i=>'<i class="'+(i===step?'on':'')+'"></i>').join('')+'</div>'}

  function slide0(){
    return `<div class="ra-finale-kicker">ВОТ ЧТО ПРОИЗОШЛО</div>
      <h1>Действие сотрудника превратилось в управленческий факт.</h1>
      <p class="ra-finale-lead">Управляющий назначил. Сотрудник прошёл. Система сохранила результат и показала, где слабое место.</p>
      <div class="ra-cycle">
        <div><b>01</b><span>Назначить</span></div><i>→</i><div><b>02</b><span>Пройти</span></div><i>→</i><div><b>03</b><span>Проверить</span></div><i>→</i><div><b>04</b><span>Увидеть результат</span></div>
      </div>
      <div class="ra-finale-quote">Не «вроде знает». Видно, кого допускать, кого доучивать и что именно проседает.</div>`;
  }

  function slide1(){
    return `<div class="ra-finale-kicker">ДАЛЬШЕ — ВЫ РЕШАЕТЕ</div>
      <h1>Хотите проверить это на своём ресторане — свяжитесь со мной.</h1>
      <p class="ra-finale-lead">Перенесём ваше меню и стандарты, дадим системе реальную команду и посмотрим результат на фактах.</p>
      <div class="ra-finale-explore"><span>ИЛИ СНАЧАЛА ПОТЫКАЙТЕ САМИ</span><h2>Тур закончился. Демонстрация остаётся открытой.</h2><p>Откройте сотрудников, меню, рейтинги, тесты и аттестации без подсказок.</p><div class="ra-pilot-actions"><button class="primary" data-finale-explore>Открыть систему самому</button><button class="ghost" data-finale-restart>Повторить тур</button></div></div>`;
  }

  function render(){
    ensure();
    const slides=[slide0,slide1];
    root.innerHTML=`<div class="ra-finale-shell">
      <div class="ra-finale-top"><div class="ra-finale-brand"><span>K AI</span><div><b>KORREST AI</b><small>Департамент Сервиса</small></div></div><button class="ra-finale-x" data-finale-close aria-label="Закрыть">×</button></div>
      <div class="ra-finale-body">${slides[step]()}</div>
      <div class="ra-finale-bottom">${dots()}<div class="ra-finale-nav"><button class="ghost" data-finale-back ${step===0?'disabled':''}>Назад</button>${step===0?'<button class="primary" data-finale-next>Итог и контакты</button>':'<button class="primary" data-finale-explore>Потыкать самому</button>'}</div></div>
    </div>`;
  }

  function show(){
    stopTour();
    ensure();
    step=0;
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

  function explore(){
    stopTour();
    hide();
    try{localStorage.setItem('ra-tour:optout','1')}catch(e){}
    try{
      state.demoHandoff=null;
      state.role='Управляющий';
      state.auth='manager';
      state.route='home';
      save();render();
      window.scrollTo({top:0,behavior:'auto'});
      setTimeout(()=>{try{showToast('Свободный режим: исследуйте систему без подсказок')}catch(e){}},100);
    }catch(e){}
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

  window.RASalesFinale={show,hide,explore};
  installHook();
})();
