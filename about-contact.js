// Public author/contact layer for the KORREST AI demo.
(function(){
  const SITE='https://korrestconsult.github.io/RestConsult/';
  const PHONE_DISPLAY='+7 906 543-13-48';
  const PHONE='tel:+79065431348';
  const TELEGRAM='https://t.me/KorRestConsalt';
  const TG_HANDLE='@KorRestConsalt';
  let modal=null;

  function ensureModal(){
    modal=document.getElementById('korrestAbout');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='korrestAbout';
    modal.className='korrest-about';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label','Об авторе KORREST AI');
    modal.innerHTML=`<div class="korrest-about-card">
      <div class="korrest-about-head">
        <div class="korrest-about-brand"><span class="korrest-about-mark">K AI</span><div><b>KORREST AI</b><small>Департамент Сервиса</small></div></div>
        <button class="korrest-about-x" type="button" data-about-close aria-label="Закрыть">×</button>
      </div>
      <div class="korrest-about-body">
        <div class="korrest-about-kicker">Автор продукта</div>
        <h2>Илья Коробицин</h2>
        <div class="korrest-about-role">HoReCa-консультант · сервис · продажи · обучение команды</div>
        <p>Работаю с ресторанами, кафе и барами: сервис, знание меню, обучение персонала, продажи и операционный порядок. «Департамент Сервиса» — мой цифровой продукт для системного обучения, аттестации и контроля знаний команды.</p>
        <div class="korrest-about-product"><span>KORREST AI · ДЕПАРТАМЕНТ СЕРВИСА</span><b>Не разовый тренинг, а система, которая остаётся в заведении.</b><p>Внедрение строится вокруг реального меню, стандартов и команды конкретного ресторана.</p></div>
        <div class="korrest-about-actions">
          <a href="${TELEGRAM}" target="_blank" rel="noopener" class="primary">Написать в Telegram</a>
          <a href="${PHONE}">Позвонить</a>
          <a href="${SITE}" target="_blank" rel="noopener">Сайт-визитка</a>
        </div>
        <div class="korrest-contact-strip"><span><b>Телефон:</b> ${PHONE_DISPLAY}</span><span><b>Telegram:</b> ${TG_HANDLE}</span></div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target===modal||e.target.closest('[data-about-close]'))hide();
    });
    return modal;
  }

  function show(){ensureModal();modal.classList.add('show');document.documentElement.style.overflow='hidden';}
  function hide(){modal?.classList.remove('show');document.documentElement.style.overflow='';}

  function installTrigger(){
    const actions=document.querySelector('.top-actions');
    if(!actions||actions.querySelector('.korrest-about-trigger'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='korrest-about-trigger';btn.textContent='Об авторе';btn.addEventListener('click',show);
    const avatar=actions.querySelector('#topAvatar,.avatar');
    actions.insertBefore(btn,avatar||null);
  }

  function finalContactHtml(){
    return `<div class="korrest-final-contact" data-korrest-final-contact>
      <span>СВЯЗАТЬСЯ СО МНОЙ</span>
      <h2>Илья Коробицин · KORREST AI</h2>
      <p>Покажу, как перенести в систему ваше меню, стандарты и команду.</p>
      <div class="korrest-final-actions">
        <a class="primary" href="${TELEGRAM}" target="_blank" rel="noopener">Telegram · ${TG_HANDLE}</a>
        <a href="${PHONE}">${PHONE_DISPLAY}</a>
        <a href="${SITE}" target="_blank" rel="noopener">Сайт-визитка</a>
      </div>
    </div>`;
  }

  function enhanceFinale(){
    const body=document.querySelector('#raSalesFinale.show .ra-finale-body');
    if(!body)return;
    const explore=body.querySelector('.ra-finale-explore');
    if(!explore||body.querySelector('[data-korrest-final-contact]'))return;
    explore.insertAdjacentHTML('beforebegin',finalContactHtml());
  }

  function install(){
    installTrigger();
    ensureModal();
    enhanceFinale();
    const obs=new MutationObserver(()=>{installTrigger();enhanceFinale()});
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  window.KorrestAbout={show,hide};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
