// iPad/tablet stability fix for the guided onboarding overlay.
(function(){
  const TABLET_MIN=701;
  const TABLET_MAX=1180;
  let raf=0;
  let root=null,spot=null,card=null;

  function isTablet(){return innerWidth>=TABLET_MIN&&innerWidth<=TABLET_MAX}

  function placeTabletCard(){
    raf=0;
    if(!isTablet()||!root?.classList.contains('show')||!spot||!card)return;

    const edge=16,gap=16;
    const target=spot.getBoundingClientRect();
    const width=Math.min(430,innerWidth-edge*2);

    card.style.setProperty('width',width+'px','important');
    card.style.setProperty('left','50%','important');
    card.style.setProperty('right','auto','important');
    card.style.setProperty('transform','translateX(-50%)','important');
    card.style.setProperty('max-height','48vh','important');
    card.style.setProperty('overflow','auto','important');
    card.style.setProperty('-webkit-overflow-scrolling','touch','important');

    requestAnimationFrame(()=>{
      if(!root?.classList.contains('show'))return;
      const h=card.offsetHeight;
      const below=innerHeight-target.bottom-gap;
      const above=target.top-gap;
      let top;

      if(below>=h+edge) top=target.bottom+gap;
      else if(above>=h+edge) top=target.top-h-gap;
      else top=(target.top+target.height/2)>innerHeight/2?edge:innerHeight-h-edge;

      top=Math.max(edge,Math.min(top,innerHeight-h-edge));
      card.style.setProperty('top',top+'px','important');
    });
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(placeTabletCard);
  }

  function bind(){
    root=document.getElementById('raTour');
    if(!root){setTimeout(bind,60);return}
    spot=root.querySelector('.ra-tour-spot');
    card=root.querySelector('.ra-tour-card');
    if(!spot||!card){setTimeout(bind,60);return}

    // iPad Safari can occasionally swallow the synthesized click while the page is touch-locked.
    // Trigger the existing tour buttons directly on touchend and suppress the duplicate click.
    root.addEventListener('touchend',e=>{
      const btn=e.target?.closest?.('.ra-tour-next,.ra-tour-back,.ra-tour-skip');
      if(!btn)return;
      e.preventDefault();
      btn.click();
    },{passive:false});

    const observer=new MutationObserver(records=>{
      if(records.some(r=>r.target===root||r.target===spot||r.type==='childList'))schedule();
    });
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','style'],childList:true,characterData:true});

    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(schedule,120),{passive:true});
    schedule();
  }

  bind();
})();
