// Optional shortcut from the sales presentation straight into the existing guided tour.
(function(){
  const INTRO_ID='raProductIntro';

  function startTour(){
    try{window.RASalesIntro?.hide()}catch(e){}
    document.getElementById('raTour')?.classList.remove('show');
    document.documentElement.classList.remove('ra-tour-lock');
    document.body.classList.remove('ra-tour-lock');
    if(typeof window.restartAcademyTour==='function'){
      setTimeout(()=>window.restartAcademyTour(),90);
      return;
    }
    try{
      state.role='Управляющий';
      state.auth=null;
      state.route='roles';
      state.demoHandoff=null;
      save();render();
    }catch(e){}
  }

  function inject(){
    const intro=document.getElementById(INTRO_ID);
    const top=intro?.querySelector('.ra-intro-top');
    if(!top||top.querySelector('[data-intro-skip]'))return;

    let controls=top.querySelector('.ra-intro-top-actions');
    if(!controls){
      controls=document.createElement('div');
      controls.className='ra-intro-top-actions';
      const counter=top.querySelector('.ra-intro-counter');
      if(counter)controls.appendChild(counter);
      top.appendChild(controls);
    }

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='ra-intro-skip';
    btn.dataset.introSkip='1';
    btn.textContent='Пропустить презентацию';
    btn.setAttribute('aria-label','Пропустить презентацию и перейти к демонстрации');
    btn.addEventListener('click',startTour);
    controls.appendChild(btn);
  }

  const style=document.createElement('style');
  style.textContent=`
    .ra-intro-top-actions{display:flex;align-items:center;gap:10px;flex:none}
    .ra-intro-skip{min-height:36px!important;padding:8px 12px!important;border-radius:12px!important;border:1px solid #d8cfc1!important;background:#fff!important;color:#4f4942!important;font-size:10px!important;font-weight:850!important;white-space:nowrap;cursor:pointer}
    .ra-intro-skip:active{transform:translateY(1px)}
    @media(max-width:620px){
      .ra-intro-top{gap:8px!important}
      .ra-intro-top-actions{gap:6px}
      .ra-intro-counter{display:none}
      .ra-intro-skip{min-height:34px!important;padding:7px 9px!important;font-size:9px!important}
    }
    @media(max-width:390px){.ra-intro-skip{max-width:122px;white-space:normal;line-height:1.1}}
  `;
  document.head.appendChild(style);

  const observer=new MutationObserver(inject);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(inject,120);
})();