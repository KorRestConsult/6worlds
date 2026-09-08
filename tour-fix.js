// Stable guided-onboarding placement for iPad / touch tablets.
(function(){
  let raf=0,root=null,spot=null,card=null,bound=false;

  function isTouchTablet(){
    const touch=(navigator.maxTouchPoints||0)>0||matchMedia('(pointer: coarse)').matches;
    const minSide=Math.min(window.innerWidth||0,window.innerHeight||0);
    return touch&&minSide>=600;
  }

  function vv(){
    const v=window.visualViewport;
    return {
      left:v?Math.max(0,v.offsetLeft):0,
      top:v?Math.max(0,v.offsetTop):0,
      width:v?Math.min(innerWidth,v.width):innerWidth,
      height:v?Math.min(innerHeight,v.height):innerHeight
    };
  }

  function px(el,prop,value){
    const next=Math.round(value)+'px';
    if(el.style.getPropertyValue(prop)!==next||el.style.getPropertyPriority(prop)!=='important'){
      el.style.setProperty(prop,next,'important');
    }
  }

  function placeTabletCard(){
    raf=0;
    if(!root?.classList.contains('show')||!spot||!card)return;
    if(!isTouchTablet()){
      card.style.removeProperty('transform');
      card.style.removeProperty('max-height');
      card.style.removeProperty('overflow');
      return;
    }

    const view=vv();
    const edge=16,gap=18;
    const target=spot.getBoundingClientRect();
    const width=Math.min(470,Math.max(300,view.width-edge*2));
    const centerX=view.left+view.width/2;

    card.style.setProperty('box-sizing','border-box','important');
    px(card,'width',width);
    px(card,'left',centerX);
    card.style.setProperty('right','auto','important');
    card.style.setProperty('transform','translateX(-50%)','important');
    card.style.setProperty('max-height',Math.max(240,Math.min(430,view.height*.48))+'px','important');
    card.style.setProperty('overflow-y','auto','important');
    card.style.setProperty('overflow-x','hidden','important');
    card.style.setProperty('-webkit-overflow-scrolling','touch','important');

    requestAnimationFrame(()=>{
      if(!root?.classList.contains('show'))return;
      const view2=vv();
      const h=Math.min(card.offsetHeight,view2.height-edge*2);
      const visibleTop=view2.top+edge;
      const visibleBottom=view2.top+view2.height-edge;
      const below=visibleBottom-target.bottom-gap;
      const above=target.top-gap-visibleTop;
      let top;

      if(below>=h) top=target.bottom+gap;
      else if(above>=h) top=target.top-h-gap;
      else {
        const targetCenter=target.top+target.height/2;
        top=targetCenter>(view2.top+view2.height/2)?visibleTop:visibleBottom-h;
      }

      top=Math.max(visibleTop,Math.min(top,visibleBottom-h));
      px(card,'top',top);
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
    if(bound)return;
    bound=true;

    // Safari on iPad may swallow the synthetic click while the page is touch-locked.
    root.addEventListener('touchend',e=>{
      const btn=e.target?.closest?.('.ra-tour-next,.ra-tour-back,.ra-tour-skip');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      btn.click();
    },{passive:false,capture:true});

    const observer=new MutationObserver(records=>{
      if(records.some(r=>r.target===root||r.target===spot||r.type==='childList'||r.type==='characterData'))schedule();
    });
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','style'],childList:true,characterData:true});

    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(schedule,180),{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(schedule,80)});
    schedule();
  }

  bind();
})();
