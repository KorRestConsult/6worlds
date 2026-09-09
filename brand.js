// Public branding layer: KORREST AI is the master brand; "Департамент Сервиса" is the product name.
(function(){
  const FROM='Restaurant Academy';
  const TO='Департамент Сервиса';

  function setText(el,value){
    if(el && el.textContent!==value) el.textContent=value;
  }

  function replaceTextNode(node){
    if(node.nodeType===Node.TEXT_NODE&&node.nodeValue&&node.nodeValue.includes(FROM)){
      node.nodeValue=node.nodeValue.split(FROM).join(TO);
    }
  }

  function replaceAttrs(el){
    if(!(el instanceof Element))return;
    ['aria-label','title'].forEach(attr=>{
      const v=el.getAttribute(attr);
      if(v&&v.includes(FROM))el.setAttribute(attr,v.split(FROM).join(TO));
    });
  }

  function walk(root){
    if(!root)return;
    if(root.nodeType===Node.TEXT_NODE){replaceTextNode(root);return}
    if(root.nodeType===Node.ELEMENT_NODE)replaceAttrs(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;while((n=w.nextNode()))replaceTextNode(n);
    if(root.querySelectorAll)root.querySelectorAll('[aria-label],[title]').forEach(replaceAttrs);
  }

  function paintHeader(){
    if(document.title!=='KORREST AI — Департамент Сервиса')document.title='KORREST AI — Департамент Сервиса';
    const brand=document.querySelector('.brand');
    if(brand){
      setText(brand.querySelector('.logo'),'K');
      setText(brand.querySelector('b'),'KORREST AI');
      setText(brand.querySelector('small'),'ДЕПАРТАМЕНТ СЕРВИСА · DEMO');
    }
    const avatar=document.getElementById('topAvatar');
    if(avatar&&avatar.textContent.trim()==='RA')setText(avatar,'K');
  }

  function apply(){paintHeader();walk(document.body)}

  let scheduled=false;
  function scheduleApply(nodes){
    if(nodes)nodes.forEach(walk);
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;paintHeader()});
  }

  const mo=new MutationObserver(muts=>{
    const nodes=[];
    muts.forEach(m=>m.addedNodes.forEach(n=>nodes.push(n)));
    scheduleApply(nodes);
  });

  function start(){
    apply();
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  // Keep copied pilot text under the same public brand.
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      const raw=navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText=(text)=>raw(String(text).split(FROM).join(TO));
    }
  }catch(e){}
})();
