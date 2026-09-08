// Touch / viewport behaviour only. No new product mechanics.
(function(){
  const stopGesture=e=>e.preventDefault();
  document.addEventListener('gesturestart',stopGesture,{passive:false});
  document.addEventListener('gesturechange',stopGesture,{passive:false});
  document.addEventListener('gestureend',stopGesture,{passive:false});
  document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
})();

// Keep the current page stable when switching menu blocks.
function showBlock(area,block){
  const box=document.getElementById('menuBlock');
  if(!box)return;
  box.innerHTML=blockHTML(area,block);
  document.querySelectorAll('.toolbar .chip').forEach(x=>x.classList.toggle('on',x.textContent.trim()===block));
}

render();