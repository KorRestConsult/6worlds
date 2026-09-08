// Restaurant Academy cloud sync.
// Product logic and UI stay unchanged. Firestore only replaces shared persistence for:
// employees, assignedTests, testResults.
(function initRestaurantAcademyFirebase(){
  const EXPECTED_PROJECT_ID='restaurant-academy-demo';
  const cfg=window.RA_FIREBASE_CONFIG;
  if(!cfg){console.info('[RA Firebase] config not set; localStorage mode remains active');return}
  if(cfg.projectId!==EXPECTED_PROJECT_ID){
    console.error('[RA Firebase] blocked: unexpected projectId',cfg.projectId);
    return;
  }
  if(!window.firebase){console.error('[RA Firebase] SDK is not loaded');return}

  const app=window.firebase.apps.length?window.firebase.app():window.firebase.initializeApp(cfg);
  const db=app.firestore();
  const docRef=db.collection('restaurantAcademy').doc('state');
  const originalSave=save;
  let applyingRemote=false;
  let cloudReady=false;
  let lastSharedSignature='';
  let writeTimer=null;

  function sharedState(){
    return {
      schemaVersion:1,
      employees:Array.isArray(state.employees)?state.employees:[],
      assignedTests:Array.isArray(state.assignedTests)?state.assignedTests:[],
      testResults:Array.isArray(state.testResults)?state.testResults:[]
    };
  }
  function signature(data){
    try{return JSON.stringify(data)}catch(e){return ''}
  }
  function applyRemote(data){
    if(!data)return;
    applyingRemote=true;
    if(Array.isArray(data.employees))state.employees=data.employees;
    if(Array.isArray(data.assignedTests))state.assignedTests=data.assignedTests;
    if(Array.isArray(data.testResults))state.testResults=data.testResults;
    lastSharedSignature=signature(sharedState());
    originalSave();
    applyingRemote=false;
    if(typeof render==='function')render();
  }
  async function pushShared(){
    if(!cloudReady||applyingRemote)return;
    const payload=sharedState();
    const sig=signature(payload);
    if(sig===lastSharedSignature)return;
    lastSharedSignature=sig;
    try{
      await docRef.set({...payload,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }catch(err){
      console.error('[RA Firebase] write failed',err);
      lastSharedSignature='';
    }
  }
  function schedulePush(){
    clearTimeout(writeTimer);
    writeTimer=setTimeout(pushShared,120);
  }

  save=function(){
    originalSave();
    if(!applyingRemote&&cloudReady)schedulePush();
  };

  (async()=>{
    try{
      const snap=await docRef.get();
      if(snap.exists){
        applyRemote(snap.data());
      }else{
        const payload=sharedState();
        await docRef.set({...payload,createdAt:window.firebase.firestore.FieldValue.serverTimestamp(),updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()},{merge:false});
        lastSharedSignature=signature(payload);
      }
      cloudReady=true;
      docRef.onSnapshot(next=>{
        if(!next.exists)return;
        const remote=next.data();
        const remoteSig=signature({
          schemaVersion:remote.schemaVersion||1,
          employees:Array.isArray(remote.employees)?remote.employees:[],
          assignedTests:Array.isArray(remote.assignedTests)?remote.assignedTests:[],
          testResults:Array.isArray(remote.testResults)?remote.testResults:[]
        });
        if(remoteSig===lastSharedSignature)return;
        applyRemote(remote);
      },err=>console.error('[RA Firebase] realtime failed',err));
      console.info('[RA Firebase] live:',EXPECTED_PROJECT_ID);
    }catch(err){
      console.error('[RA Firebase] init failed',err);
    }
  })();
})();
