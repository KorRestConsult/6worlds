// Public branding layer: KORREST AI is the master brand; "Департамент Сервиса" is the product name.
(function(){
  const FROM='Restaurant Academy';
  const TO='Департамент Сервиса';

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
    document.title='KORREST AI — Департамент Сервиса';
    const brand=document.querySelector('.brand');
    if(brand){
      const logo=brand.querySelector('.logo');
      const name=brand.querySelector('b');
      const sub=brand.querySelector('small');
      if(logo)logo.textContent='K';
      if(name)name.textContent='KORREST AI';
      if(sub)sub.textContent='ДЕПАРТАМЕНТ СЕРВИСА · DEMO';
    }
    const avatar=document.getElementById('topAvatar');
    if(avatar&&avatar.textContent.trim()==='RA')avatar.textContent='K';
  }

  function apply(){paintHeader();walk(document.body)}

  const mo=new MutationObserver(muts=>{
    paintHeader();
    muts.forEach(m=>m.addedNodes.forEach(walk));
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();mo.observe(document.body,{childList:true,subtree:true})});
  else {apply();mo.observe(document.body,{childList:true,subtree:true})}

  // Keep copied pilot text under the same public brand.
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      const raw=navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText=(text)=>raw(String(text).split(FROM).join(TO));
    }
  }catch(e){}
})();
