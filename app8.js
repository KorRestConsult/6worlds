// Large touch keypad for manager/staff PIN. No product logic changes.
let pinBuffer='';
const PIN_LETTERS={1:'',2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ',0:''};

function resetPinBuffer(){pinBuffer=''}
function pinDots(){return `<div class="pin-dots" id="pinDots">${[0,1,2,3].map(i=>`<span class="pin-dot ${i<pinBuffer.length?'on':''}"></span>`).join('')}</div>`}
function keypadHTML(){return `<div class="pin-keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" type="button" onclick="pinPress('${n}',this)"><strong>${n}</strong><small>${PIN_LETTERS[n]}</small></button>`).join('')}<button class="pin-key pin-empty" tabindex="-1"></button><button class="pin-key" type="button" onclick="pinPress('0',this)"><strong>0</strong><small>&nbsp;</small></button><button class="pin-key pin-delete" type="button" aria-label="Удалить цифру" onclick="pinDelete(this)">⌫</button></div>`}
function pinShell(kicker,title,sub,demo,backAction){resetPinBuffer();return `<section class="pin-screen"><div class="pin-panel" id="pinPanel"><div class="pin-kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p class="pin-sub">${esc(sub)}</p>${pinDots()}${keypadHTML()}<button class="pin-back" type="button" onclick="${backAction}">Назад</button>${demo?`<div class="pin-demo">Демо-код: ${esc(demo)}</div>`:''}</div></section>`}

function managerPinPage(){return pinShell('Управляющий','Введите PIN','Четырёхзначный код доступа в кабинет управляющего.',state.managerPin||'0000','goRoles()')}
function staffPinPage(){const e=current();return pinShell(e.role,e.name,'Введите персональный четырёхзначный PIN.',e.pin||'','state.route=\'staff-select\';save();render()')}

function updatePinDots(){const box=document.getElementById('pinDots');if(!box)return;box.querySelectorAll('.pin-dot').forEach((d,i)=>d.classList.toggle('on',i<pinBuffer.length))}
function pinPress(n,btn){if(pinBuffer.length>=4)return;pinBuffer+=String(n);if(btn){btn.classList.add('pressed');setTimeout(()=>btn.classList.remove('pressed'),90)}updatePinDots();if(pinBuffer.length===4)setTimeout(checkPinBuffer,120)}
function pinDelete(btn){if(btn){btn.classList.add('pressed');setTimeout(()=>btn.classList.remove('pressed'),90)}pinBuffer=pinBuffer.slice(0,-1);updatePinDots()}
function checkPinBuffer(){const expected=state.route==='manager-pin'?(state.managerPin||'0000'):(current()?.pin||'');if(pinBuffer===expected){if(state.route==='manager-pin')state.auth='manager';else state.auth='staff';state.route='home';save();resetPinBuffer();render();return}const panel=document.getElementById('pinPanel');if(panel){panel.classList.remove('pin-error');void panel.offsetWidth;panel.classList.add('pin-error')}setTimeout(()=>{resetPinBuffer();updatePinDots();panel?.classList.remove('pin-error')},360)}

document.addEventListener('keydown',e=>{if(!['manager-pin','staff-pin'].includes(state.route))return;if(/^\d$/.test(e.key)){e.preventDefault();pinPress(e.key)}else if(e.key==='Backspace'){e.preventDefault();pinDelete()}else if(e.key==='Escape'){e.preventDefault();if(state.route==='manager-pin')goRoles();else{state.route='staff-select';save();render()}}});

render();