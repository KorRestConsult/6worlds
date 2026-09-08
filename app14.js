// Firestore realtime layer for Restaurant Academy.
// Cloud is the source of truth for employees, assignments and training results.
(function initRestaurantAcademyCloud(){
  const cfg=window.RA_FIREBASE_CONFIG;
  const venueId=window.RA_VENUE_ID||'restaurant-academy-demo';
  if(!cfg||!window.firebase){return;}

  const clientKey='restaurant_academy_client_id';
  let clientId=localStorage.getItem(clientKey);
  if(!clientId){clientId='c_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);localStorage.setItem(clientKey,clientId)}

  let cloudReady=false;
  let applyingRemote=false;
  let writeTimer=null;
  let docRef=null;
  let lastLocalSig='';
  const localSave=save;

  function academyData(){
    return {
      schemaVersion:1,
      venueId,
      employees:Array.isArray(state.employees)?state.employees:[],
      assignments:Array.isArray(state.assignedTests)?state.assignedTests:[],
      testResults:Array.isArray(state.testResults)?state.testResults:[]
    };
  }
  function signature(data=academyData()){
    try{return JSON.stringify([data.employees||[],data.assignments||[],data.testResults||[]])}catch(e){return String(Date.now())}
  }
  function ensureCloudPill(){
    let el=document.getElementById('raCloudStatus');
    if(el)return el;
    const wrap=document.querySelector('.top-actions');
    if(!wrap)return null;
    el=document.createElement('div');
    el.id='raCloudStatus';
    el.style.cssText='font-size:8px;font-weight:900;padding:6px 8px;border:1px solid #dedbd3;border-radius:999px;background:#fff;color:#77736a;white-space:nowrap';
    wrap.insertBefore(el,wrap.firstChild);
    return el;
  }
  function cloudStatus(text,kind='idle'){
    const el=ensureCloudPill();if(!el)return;
    el.textContent=text;
    el.style.background=kind==='ok'?'#e4f2e7':kind==='bad'?'#f6dfdc':'#fff';
    el.style.color=kind==='ok'?'#35613e':kind==='bad'?'#8a3f39':'#77736a';
  }
  function cloudPayload(){
    const data=academyData();
    return {
      restaurantAcademy:{
        ...data,
        updatedBy:clientId,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      }
    };
  }
  function scheduleCloudWrite(){
    if(!cloudReady||!docRef)return;
    clearTimeout(writeTimer);
    writeTimer=setTimeout(writeCloudNow,180);
  }
  async function writeCloudNow(){
    if(!cloudReady||!docRef)return;
    try{
      cloudStatus('Cloud · sync');
      await docRef.set(cloudPayload(),{merge:true});
      cloudStatus('Cloud · live','ok');
    }catch(e){
      console.error('Restaurant Academy Firestore write failed',e);
      cloudStatus('Cloud · error','bad');
    }
  }
  function applyRemote(remote){
    if(!remote)return;
    const next={
      employees:Array.isArray(remote.employees)?remote.employees:state.employees,
      assignments:Array.isArray(remote.assignments)?remote.assignments:state.assignedTests,
      testResults:Array.isArray(remote.testResults)?remote.testResults:state.testResults
    };
    const nextSig=signature(next);
    if(nextSig===signature())return;
    applyingRemote=true;
    state.employees=next.employees||[];
    state.assignedTests=next.assignments||[];
    state.testResults=next.testResults||[];
    lastLocalSig=signature();
    localSave();
    applyingRemote=false;
    render();
    cloudStatus('Cloud · live','ok');
  }

  // Keep every existing save() call intact, but send only shared Academy data to Firestore.
  save=function(){
    localSave();
    const sig=signature();
    if(!applyingRemote&&sig!==lastLocalSig){lastLocalSig=sig;scheduleCloudWrite()}
  };

  async function start(){
    cloudStatus('Cloud · connect');
    try{
      const app=firebase.apps&&firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
      try{await firebase.auth().signInAnonymously()}catch(authError){console.warn('Anonymous auth unavailable, trying Firestore rules directly',authError)}
      const db=firebase.firestore(app);
      docRef=db.doc(`venues/${venueId}`);
      const snap=await docRef.get();
      const existing=snap.exists&&snap.data()?snap.data().restaurantAcademy:null;
      if(existing&&Array.isArray(existing.employees)){
        applyRemote(existing);
      }else{
        await docRef.set(cloudPayload(),{merge:true});
      }
      lastLocalSig=signature();
      cloudReady=true;
      cloudStatus('Cloud · live','ok');
      docRef.onSnapshot(next=>{
        if(!next.exists)return;
        const data=next.data()&&next.data().restaurantAcademy;
        if(data)applyRemote(data);
      },err=>{
        console.error('Restaurant Academy Firestore listener failed',err);
        cloudStatus('Cloud · error','bad');
      });
    }catch(e){
      console.error('Restaurant Academy Firebase init failed',e);
      cloudStatus('Cloud · offline','bad');
    }
  }

  lastLocalSig=signature();
  start();
})();
