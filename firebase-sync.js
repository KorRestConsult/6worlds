// Realtime Firestore bridge for Restaurant Academy presentation demo.
// It is inert until firebase-config.js contains the real Web App config for restaurant-academy-demo.
(function(){
  const cfg=window.RA_FIREBASE_CONFIG||{};
  const EXPECTED_PROJECT='restaurant-academy-demo';
  const VENUE_ID='demo';
  window.RACloud={status:'local',projectId:cfg.projectId||'',venueId:VENUE_ID};

  if(cfg.projectId!==EXPECTED_PROJECT){
    console.warn('[RA Firebase] Refusing to connect to unexpected project:',cfg.projectId);
    window.RACloud.status='wrong-project';
    return;
  }
  if(!cfg.apiKey||!cfg.appId||!window.firebase){
    console.info('[RA Firebase] Waiting for real Web App config. Local mode stays active.');
    window.RACloud.status='waiting-config';
    return;
  }

  try{
    if(!firebase.apps.length) firebase.initializeApp(cfg);
  }catch(err){
    console.error('[RA Firebase] init failed',err);
    window.RACloud.status='error';
    window.RACloud.error=String(err?.message||err);
    return;
  }

  const db=firebase.firestore();
  const root=db.collection('restaurants').doc(VENUE_ID);
  const serverTimestamp=()=>firebase.firestore.FieldValue.serverTimestamp();
  const rawSave=save;
  let applyingRemote=false;
  let cloudReady=false;
  let pushTimer=null;
  let lastEmployees='';
  let lastAssignments='';
  let lastResults='';

  const clone=v=>JSON.parse(JSON.stringify(v??null));
  const cleanDoc=data=>{
    const x={...data};delete x._updatedAt;delete x._device;return x;
  };
  const signature=v=>JSON.stringify(v||[]);

  async function replaceCollection(name,items){
    const ref=root.collection(name);
    const snap=await ref.get();
    const existing=new Set(snap.docs.map(d=>d.id));
    const batch=db.batch();
    (items||[]).forEach(item=>{
      const docId=item?.id||item?.testId;
      if(!docId)return;
      batch.set(ref.doc(String(docId)),{...clone(item),_updatedAt:serverTimestamp()},{merge:false});
      existing.delete(String(docId));
    });
    existing.forEach(id=>batch.delete(ref.doc(id)));
    await batch.commit();
  }

  async function pushChanged(){
    if(!cloudReady||applyingRemote)return;
    const employees=state.employees||[];
    const assignments=state.assignedTests||[];
    const results=state.testResults||[];
    const es=signature(employees),as=signature(assignments),rs=signature(results);
    try{
      const jobs=[];
      if(es!==lastEmployees){lastEmployees=es;jobs.push(replaceCollection('employees',employees));}
      if(as!==lastAssignments){lastAssignments=as;jobs.push(replaceCollection('assignments',assignments));}
      if(rs!==lastResults){lastResults=rs;jobs.push(replaceCollection('testResults',results));}
      if(jobs.length){
        jobs.push(root.set({name:'Restaurant Academy Demo',projectId:EXPECTED_PROJECT,updatedAt:serverTimestamp()},{merge:true}));
        await Promise.all(jobs);
        window.RACloud.status='online';
      }
    }catch(err){
      console.error('[RA Firebase] push failed',err);
      window.RACloud.status='error';
      window.RACloud.error=String(err?.message||err);
    }
  }

  function schedulePush(){
    clearTimeout(pushTimer);
    pushTimer=setTimeout(pushChanged,220);
  }

  save=function(){
    rawSave();
    if(!applyingRemote)schedulePush();
  };

  function applyRemote(kind,items){
    applyingRemote=true;
    try{
      if(kind==='employees') state.employees=items;
      if(kind==='assignments') state.assignedTests=items;
      if(kind==='testResults') state.testResults=items;
      rawSave();
    }finally{
      applyingRemote=false;
    }
  }

  function docsToItems(snap){return snap.docs.map(d=>cleanDoc({id:d.id,...d.data()}));}

  async function initialLoad(){
    window.RACloud.status='connecting';
    try{
      const [employeesSnap,assignmentsSnap,resultsSnap]=await Promise.all([
        root.collection('employees').get(),
        root.collection('assignments').get(),
        root.collection('testResults').get()
      ]);

      if(employeesSnap.empty){
        // First clean connection: seed Firestore from the presentation demo already approved locally.
        await replaceCollection('employees',state.employees||[]);
        await replaceCollection('assignments',state.assignedTests||[]);
        await replaceCollection('testResults',state.testResults||[]);
        await root.set({name:'Restaurant Academy Demo',projectId:EXPECTED_PROJECT,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
      }else{
        applyRemote('employees',docsToItems(employeesSnap));
        applyRemote('assignments',docsToItems(assignmentsSnap));
        applyRemote('testResults',docsToItems(resultsSnap));
      }

      lastEmployees=signature(state.employees||[]);
      lastAssignments=signature(state.assignedTests||[]);
      lastResults=signature(state.testResults||[]);
      cloudReady=true;
      window.RACloud.status='online';
      rawSave();
      render();
      attachListeners();
      if(typeof showToast==='function')showToast('Синхронизация включена');
    }catch(err){
      console.error('[RA Firebase] initial load failed',err);
      window.RACloud.status='error';
      window.RACloud.error=String(err?.message||err);
    }
  }

  function attachListeners(){
    root.collection('employees').onSnapshot(snap=>{
      const items=docsToItems(snap),sig=signature(items);
      if(sig===lastEmployees)return;
      lastEmployees=sig;applyRemote('employees',items);render();
    },err=>console.error('[RA Firebase employees]',err));

    root.collection('assignments').onSnapshot(snap=>{
      const before=state.assignedTests||[];
      const items=docsToItems(snap),sig=signature(items);
      if(sig===lastAssignments)return;
      const beforeMap=new Map(before.map(x=>[x.id,x]));
      lastAssignments=sig;applyRemote('assignments',items);

      if(state.auth==='staff'){
        const fresh=items.find(x=>x.employeeId===state.currentEmployee&&!beforeMap.has(x.id)&&x.status!=='done');
        if(fresh&&typeof showToast==='function')showToast(`Новый тест от управляющего: ${fresh.block}`);
      }
      if(state.auth==='manager'){
        const done=items.find(x=>x.status==='done'&&beforeMap.get(x.id)?.status!=='done');
        if(done&&typeof showToast==='function'){
          const e=state.employees.find(x=>x.id===done.employeeId);
          showToast(`${e?.name||'Сотрудник'} завершил тест: ${done.correct}/${done.total}`);
        }
      }
      render();
    },err=>console.error('[RA Firebase assignments]',err));

    root.collection('testResults').onSnapshot(snap=>{
      const items=docsToItems(snap),sig=signature(items);
      if(sig===lastResults)return;
      lastResults=sig;applyRemote('testResults',items);render();
    },err=>console.error('[RA Firebase results]',err));
  }

  initialLoad();
})();
