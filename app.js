(()=>{'use strict';
const $=id=>document.getElementById(id);
const cfg=window.GACEB_CONFIG||{};
let db=null,session=null,profile=null,resources=[],quizIndex=0,quizSelected=null,quizScore=0,quizChecked=false;
let calYear,calMonth,calendarEvents=[];

try{
  if(window.supabase&&cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('YOUR-PROJECT')&&!cfg.SUPABASE_ANON_KEY.includes('YOUR-SUPABASE'))
    db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
}catch(e){console.warn('Supabase setup needs checking',e)}

function toast(msg){const el=$('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),4000)}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function modal(html){if(!$('modal'))return;$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal')?.classList.add('hidden')}
function ugx(n){return 'Sh. '+Number(n).toLocaleString('en-UG')}

$('year')&&($('year').textContent=new Date().getFullYear());
$('mobileMenu')?.addEventListener('click',()=>$('nav')?.classList.toggle('open'));
$('modalClose')?.addEventListener('click',closeModal);
$('modal')?.addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

/* ===== Account button (avatar near ⋮) ===== */
function updateAccountBtn(){
  const btn=$('accountBtn');if(!btn)return;
  const name=profile?.full_name||session?.user?.email||'';
  const letter=(name.trim().charAt(0)||'👤').toUpperCase();
  if(profile?.avatar_url){
    btn.innerHTML=`<img src="${safe(profile.avatar_url)}" alt="Profile">`;
  }else{
    btn.innerHTML=`<span class="fallback">${session?safe(letter):'👤'}</span>`;
  }
}
$('accountBtn')?.addEventListener('click',()=>{
  if(session) location.href='dashboard.html';
  else authModal('login');
});

/* ===== Auth ===== */
function authModal(mode='login'){
  modal(`<h2>${mode==='signup'?'Create your student account':'Log in to GACEB Scholar'}</h2>
  <p class="muted">Teachers and students use the same account system.</p>
  <form id="authForm" class="form">
  ${mode==='signup'?`<label>Full name<input name="full_name" required maxlength="100"></label>
  <label>School<input name="school" maxlength="150"></label>
  <label>Study level<select name="level"><option>O-Level</option><option>A-Level</option><option>Teacher</option></select></label>
  <label>Referral code (optional)<input name="referral_code" value="${safe(new URLSearchParams(location.search).get('ref')||'')}"></label>`:''}
  <label>Email<input name="email" type="email" required></label>
  <label>Password<input name="password" type="password" required minlength="6"></label>
  <button class="btn primary">${mode==='signup'?'Create account':'Log in'}</button>
  <p id="authStatus" class="muted"></p></form>
  <button id="switchAuth" class="btn outline">${mode==='signup'?'I already have an account':'Create a new account'}</button>`);
  $('switchAuth').onclick=()=>authModal(mode==='signup'?'login':'signup');
  $('authForm').onsubmit=async e=>{
    e.preventDefault();const fd=new FormData(e.target),st=$('authStatus');
    if(!db){st.textContent='Database not connected yet. Complete Supabase setup first.';return}
    st.textContent='Please wait…';
    try{
      let result;
      if(mode==='signup') result=await db.auth.signUp({email:fd.get('email'),password:fd.get('password'),options:{data:{full_name:fd.get('full_name'),school:fd.get('school'),level:fd.get('level'),referral_code:fd.get('referral_code')}}});
      else result=await db.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});
      if(result.error) throw result.error;
      st.textContent=mode==='signup'?'Account created. Check your email if confirmation is enabled.':'You are logged in.';
      await refreshAuth();setTimeout(closeModal,900);
    }catch(err){st.textContent=err.message||'Authentication failed'}
  };
}
$('homeLogin')?.addEventListener('click',()=>authModal('login'));
$('homeSignup')?.addEventListener('click',()=>authModal('signup'));
$('dashboardLogin')?.addEventListener('click',()=>authModal('login'));
$('dashboardLogout')?.addEventListener('click',async()=>{if(db)await db.auth.signOut();session=null;profile=null;updateAccountBtn();renderDashboard();toast('Logged out')});

async function refreshAuth(){
  if(!db)return;
  try{
    const r=await db.auth.getSession();session=r.data.session;profile=null;
    if(session){
      const p=await db.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
      profile=p.data||null;
    }
  }catch(e){console.warn(e)}
  updateAccountBtn();
  if($('dashboardGreeting'))renderDashboard();
  if($('addNoticeBtn'))updateAdminNoticeBtns();
}

/* ===== Profile picture ===== */
async function uploadAvatar(file){
  if(!db||!session||!file)return;
  if(!file.type.startsWith('image/')){toast('Choose an image file');return}
  if(file.size>3*1024*1024){toast('Image must be under 3 MB');return}
  const path=`${session.user.id}/avatar-${Date.now()}.${file.name.split('.').pop()||'jpg'}`;
  toast('Uploading photo…');
  try{
    const up=await db.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type});
    if(up.error)throw up.error;
    const {data:pub}=db.storage.from('avatars').getPublicUrl(path);
    const url=pub?.publicUrl;
    const u=await db.from('profiles').update({avatar_url:url}).eq('id',session.user.id);
    if(u.error)throw u.error;
    if(profile)profile.avatar_url=url;
    updateAccountBtn();
    await renderDashboard();
    toast('Profile photo updated');
  }catch(err){toast(err.message||'Could not upload photo')}
}

/* ===== Resources ===== */
async function loadResources(){
  const grid=$('resourceGrid');if(!grid)return;
  if(!db){grid.innerHTML='<div class="empty">The PDF library is ready, but the database is not connected.</div>';return}
  const {data,error}=await db.from('resources').select('id,title,description,subject,level,category,resource_type,file_path,status,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(100);
  if(error){grid.innerHTML='<div class="empty">Could not load resources.</div>';return}
  resources=data||[];renderResources();
}
function renderResources(){
  const grid=$('resourceGrid');if(!grid)return;
  const q=($('resourceSearch')?.value||'').toLowerCase(),level=$('resourceLevel')?.value||new URLSearchParams(location.search).get('level')||'',cat=$('resourceCategory')?.value||'',type=$('resourceType')?.value||'';
  if(level&&$('resourceLevel'))$('resourceLevel').value=level;
  const list=resources.filter(r=>(!q||[r.title,r.subject,r.description].some(x=>(x||'').toLowerCase().includes(q)))&&(!level||r.level===level)&&(!cat||r.category===cat)&&(!type||r.resource_type===type));
  grid.innerHTML=list.length?list.map(r=>`<article class="resource-card"><span class="pdf">PDF</span><h3>${safe(r.title)}</h3><p>${safe(r.description||'Study resource')}</p><div class="resource-meta"><span>${safe(r.level)}</span><span>${safe(r.category)}</span><span>${safe(r.subject)}</span><span>${safe(r.resource_type)}</span></div><button class="btn outline" data-download="${safe(r.id)}">Download PDF ↓</button></article>`).join(''):'<div class="empty">No matching approved PDFs yet.</div>';
  if($('resourceStatus'))$('resourceStatus').textContent=`${list.length} approved resource${list.length===1?'':'s'} shown.`;
  grid.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>downloadPdf(b.dataset.download));
}
async function downloadPdf(id){
  if(!session){authModal('login');toast('Log in to download resources.');return}
  const r=resources.find(x=>x.id===id);if(!r)return;
  const {data,error}=await db.storage.from('study-pdfs').createSignedUrl(r.file_path,120);
  if(error){toast('Download link failed: '+error.message);return}
  window.open(data.signedUrl,'_blank','noopener');
}
$('resourceSearch')?.addEventListener('input',renderResources);
['resourceLevel','resourceCategory','resourceType'].forEach(id=>$(id)?.addEventListener('change',renderResources));
$('uploadResource')?.addEventListener('click',()=>{
  if(!session){authModal('signup');toast('Create an account before uploading.');return}
  modal(`<h2>Contribute a PDF</h2><p class="muted">PDF only, max 15 MB. Reviewed before publication.</p>
  <form id="uploadForm" class="form">
  <label>Title<input name="title" required maxlength="120"></label>
  <label>Subject<input name="subject" required></label>
  <label>Level<select name="level"><option>O-Level</option><option>A-Level</option></select></label>
  <label>Category<select name="category"><option>Sciences</option><option>Humanities</option><option>Arts</option></select></label>
  <label>Type<select name="resource_type"><option>Notes</option><option>Past Paper</option><option>Revision Guide</option><option>Other</option></select></label>
  <label>Description<textarea name="description" rows="2" maxlength="500"></textarea></label>
  <label>PDF file<input name="file" type="file" accept="application/pdf,.pdf" required></label>
  <button class="btn primary">Submit for review</button><p id="uploadStatus" class="muted"></p></form>`);
  $('uploadForm').onsubmit=async e=>{
    e.preventDefault();const f=e.target,fd=new FormData(f),file=fd.get('file'),st=$('uploadStatus');
    if(!db||!session){st.textContent='Login required.';return}
    if(!file||(!file.type.includes('pdf')&&!file.name.toLowerCase().endsWith('.pdf'))){st.textContent='Choose a PDF.';return}
    if(file.size>15*1024*1024){st.textContent='Max 15 MB.';return}
    st.textContent='Uploading…';
    const path=`${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    try{
      let up=await db.storage.from('study-pdfs').upload(path,file,{contentType:'application/pdf'});
      if(up.error)throw up.error;
      let ins=await db.from('resources').insert({title:fd.get('title').trim(),subject:fd.get('subject').trim(),level:fd.get('level'),category:fd.get('category'),resource_type:fd.get('resource_type'),description:fd.get('description').trim(),file_path:path,uploaded_by:session.user.id,status:'pending'});
      if(ins.error){await db.storage.from('study-pdfs').remove([path]);throw ins.error}
      st.textContent='Submitted for review. You receive 5 coins after approval.';toast('PDF submitted');f.reset();
    }catch(err){st.textContent=err.message||'Upload failed'}
  };
});

/* ===== Quiz ===== */
const quiz=[{q:'Which organelle is primarily responsible for releasing energy during aerobic respiration?',o:['Ribosome','Mitochondrion','Nucleus','Vacuole'],a:1,e:'Mitochondria are the main site of aerobic respiration in eukaryotic cells.'},{q:'What is the chemical symbol for sodium?',o:['S','So','Na','N'],a:2,e:'Sodium uses the symbol Na, from the Latin name natrium.'},{q:'Which process changes water vapour into liquid water?',o:['Evaporation','Condensation','Sublimation','Melting'],a:1,e:'Condensation happens when water vapour cools and becomes liquid.'},{q:'What is the gradient of y = 3x + 2?',o:['2','3','5','x'],a:1,e:'In y = mx + c, the coefficient m is the gradient.'},{q:'Which instrument measures electric current?',o:['Voltmeter','Thermometer','Ammeter','Barometer'],a:2,e:'An ammeter is connected in series to measure current.'}];
function drawQuiz(){
  if(!$('quizQuestion'))return;const q=quiz[quizIndex];
  $('quizProgress').textContent=`Question ${quizIndex+1} of ${quiz.length}`;
  $('quizQuestion').textContent=q.q;
  $('quizOptions').innerHTML=q.o.map((x,i)=>`<button class="quiz-option" data-option="${i}">${String.fromCharCode(65+i)}. ${safe(x)}</button>`).join('');
  $('quizFeedback').textContent='';$('quizScore').textContent=`Score: ${quizScore}`;
  quizSelected=null;quizChecked=false;$('quizNext').textContent='Check answer';
  $('quizOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(quizChecked)return;quizSelected=Number(b.dataset.option);$('quizOptions').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b))});
}
$('quizNext')?.addEventListener('click',()=>{
  if(!quizChecked){
    if(quizSelected===null){$('quizFeedback').textContent='Choose an answer first.';return}
    quizChecked=true;const q=quiz[quizIndex],buttons=$('quizOptions').querySelectorAll('button');
    buttons[q.a].classList.add('correct');
    if(quizSelected===q.a){quizScore++;$('quizFeedback').textContent='Correct! '+q.e}
    else{$('quizFeedback').textContent='Not quite. '+q.e;buttons[quizSelected].classList.add('wrong')}
    $('quizScore').textContent=`Score: ${quizScore}`;
    $('quizNext').textContent=quizIndex===quiz.length-1?'See results':'Next question';
  }else if(quizIndex<quiz.length-1){quizIndex++;drawQuiz()}
  else{
    $('quizQuestion').textContent=`Quiz complete — you scored ${quizScore} out of ${quiz.length}.`;
    $('quizOptions').innerHTML='';
    $('quizFeedback').textContent=quizScore>=4?'Excellent work.':'Good effort. Review and try again.';
    $('quizNext').textContent='Restart quiz';quizIndex=0;quizChecked=true;
    $('quizNext').onclick=()=>{quizScore=0;quizIndex=0;quizChecked=false;$('quizNext').onclick=null;drawQuiz()};
  }
});
$('quizRestart')?.addEventListener('click',()=>{quizIndex=0;quizScore=0;quizChecked=false;drawQuiz()});
drawQuiz();

/* ===== Planner ===== */
const plannerKey='gaceb-study-planner-v1';
function getPlans(){try{return JSON.parse(localStorage.getItem(plannerKey)||'[]')}catch{return []}}
function savePlans(p){localStorage.setItem(plannerKey,JSON.stringify(p));drawPlans()}
function drawPlans(){
  if(!$('plannerList'))return;
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const p=getPlans().sort((a,b)=>days.indexOf(a.day)-days.indexOf(b.day)||a.time.localeCompare(b.time));
  $('plannerList').innerHTML=p.length?p.map((x,i)=>`<div class="planner-item"><div><b>${safe(x.day)} · ${safe(x.time)}</b><small>${safe(x.subject)} — ${safe(x.topic)} · ${safe(x.duration)}</small></div><button data-remove-plan="${i}" aria-label="Remove">×</button></div>`).join(''):'<p class="muted">No sessions yet.</p>';
  $('plannerList').querySelectorAll('[data-remove-plan]').forEach(b=>b.onclick=()=>{const arr=getPlans();arr.splice(Number(b.dataset.removePlan),1);savePlans(arr)});
}
$('plannerForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target);const p=getPlans();p.push(Object.fromEntries(fd.entries()));savePlans(p);e.target.reset();toast('Study session saved')});
$('clearPlanner')?.addEventListener('click',()=>{if(confirm('Clear all saved study sessions?'))savePlans([])});
drawPlans();

/* ===== Assistant ===== */
function assistantReply(t){
  const s=t.toLowerCase();
  if(/stress|anxious|nervous|tired|overwhelm/.test(s))return 'Pressure before exams is normal. Take short breaks, sleep well, and study in 25-minute blocks.';
  if(/essay|composition|writing/.test(s))return 'Plan first: 3–5 points, clear opening, one idea per paragraph, short conclusion. Leave time to check.';
  if(/physics|chemistry|biology|science/.test(s))return 'Learn key terms, draw diagrams, memorise formulas with units, and practise structured questions.';
  if(/timetable|revision plan|schedule/.test(s))return 'List subjects and exam dates. Use 25–45 min sessions, alternate hard subjects, include past-paper practice.';
  if(/remember|memor|forget|read/.test(s))return 'Use active recall: close the book and explain from memory. Review after 1 day, 3 days and a week.';
  if(/past paper|exam|answer/.test(s))return 'Read the command word, underline key terms, plan longer answers, watch the marks. Review mistakes.';
  if(/math|equation|calculate/.test(s))return 'Write given and required, choose the rule, show steps, include units, check if the answer is reasonable.';
  if(/coin|referral|premium|payment/.test(s))return '5 coins for approved PDF or verified referral. Premium UGX 10,000 weekly / 30,000 monthly. Mobile Money: 0783165723 or 0743766451.';
  return 'Break the topic into small ideas, summarise from memory, answer a few questions, then explain in your own words. Tell me your class, subject and topic.';
}
function addMessage(txt,cls){const d=document.createElement('div');d.className='message '+cls;d.textContent=txt;$('assistantMessages').appendChild(d);$('assistantMessages').scrollTop=$('assistantMessages').scrollHeight}
$('assistantForm')?.addEventListener('submit',e=>{
  e.preventDefault();const i=$('assistantInput'),t=i.value.trim();if(!t)return;
  addMessage(t,'user');i.value='';
  const ty=document.createElement('div');ty.className='message bot';ty.textContent='…';$('assistantMessages').appendChild(ty);
  setTimeout(()=>{ty.remove();addMessage(assistantReply(t),'bot')},600);
});
document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{if($('assistantInput')){$('assistantInput').value=b.dataset.prompt;$('assistantInput').focus()}});
$('clearChat')?.addEventListener('click',()=>{$('assistantMessages').innerHTML='';addMessage('Chat cleared. What would you like to study?','bot')});

/* ===== Dashboard ===== */
$('viewCoins')?.addEventListener('click',()=>{if(!session){authModal('login');return}location.href='dashboard.html'});
async function renderDashboard(){
  if(!$('dashboardContent'))return;
  const admin=$('adminPanel');
  $('dashboardLogin')?.classList.toggle('hidden',!!session);
  $('dashboardLogout')?.classList.toggle('hidden',!session);
  if(!session){
    $('dashboardGreeting').textContent='Welcome, learner';
    $('dashboardContent').innerHTML='<div class="card signin-prompt"><div class="icon">🎓</div><h3>Sign in to see your dashboard</h3><p class="muted">Track coins, uploads and progress. Teachers and students use the same dashboard.</p></div>';
    admin?.classList.add('hidden');return;
  }
  const name=profile?.full_name||session.user.email,coins=Number(profile?.coins||0);
  const tiers=[['New Scholar',0],['Bronze Scholar',20],['Silver Scholar',100],['Gold Scholar',500]];
  let ti=0;tiers.forEach((t,i)=>{if(coins>=t[1])ti=i});
  const nxt=tiers[ti+1],pct=nxt?Math.round((coins-tiers[ti][1])/(nxt[1]-tiers[ti][1])*100):100;
  $('dashboardGreeting').textContent='Welcome back, '+name.split(' ')[0];
  let ups=[],tx=[],buys=[];
  if(db){
    const [a,b,c]=await Promise.all([
      db.from('resources').select('title,subject,status,created_at').eq('uploaded_by',session.user.id).order('created_at',{ascending:false}).limit(20),
      db.from('coin_transactions').select('amount,reason,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(8),
      db.from('coin_purchases').select('coins,amount_ugx,status,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(5)
    ]);
    ups=a.data||[];tx=b.data||[];buys=c.data||[];
  }
  const cnt=s=>ups.filter(x=>x.status===s).length;
  const why={approved_upload:'PDF approved',verified_referral:'Referral verified',coin_purchase:'Coins purchased',admin_adjustment:'Adjustment',premium_reward:'Reward'};
  const av=profile?.avatar_url?`<img src="${safe(profile.avatar_url)}" alt="">`:`${safe(name.trim().charAt(0).toUpperCase()||'S')}`;
  $('dashboardContent').innerHTML=`
  <div class="dash-hero">
    <div class="who">
      <div class="profile-avatar" id="avatarClick" title="Change photo">${av}<span class="edit-hint">Change</span></div>
      <div>
        <h2>${safe(name)}</h2>
        <small>${safe(session.user.email)}</small>
        <small>${safe([profile?.level,profile?.school].filter(Boolean).join(' · '))}</small>
        <span class="badge-rank">🏅 ${tiers[ti][0]}</span>
      </div>
    </div>
    <div class="wallet"><small>GACEB COINS</small><div class="amt"><span>🪙 ${coins}</span></div>
    <small>${nxt?(nxt[1]-coins)+' coins to '+nxt[0]:'Top rank reached'}</small></div>
  </div>
  <input type="file" id="avatarFile" accept="image/*" class="hidden">
  <div class="card" style="margin-top:16px"><div class="section-head"><b>Scholar progress</b><small class="muted">${tiers[ti][0]}${nxt?' → '+nxt[0]:''}</small></div><div class="progress"><i style="width:${pct}%"></i></div></div>
  <div class="stats">
    <div class="stat"><b>${ups.length}</b><span>PDF uploads</span></div>
    <div class="stat"><b>${cnt('approved')}</b><span>Approved</span></div>
    <div class="stat"><b>${cnt('pending')}</b><span>Awaiting review</span></div>
    <div class="stat"><b style="font-size:17px">${safe(profile?.referral_code||'—')}</b><span>Your referral code</span></div>
  </div>
  <div class="quick">
    <a href="coins.html#buy">➕ Add coins</a>
    <a href="resources.html">📤 Upload PDF</a>
    <a href="notices.html">📢 Notice board</a>
    <a href="planner.html">📅 Study planner</a>
    <a href="quizzes.html">🧠 Take a quiz</a>
  </div>
  <div class="dash-grid">
    <div class="card"><h3>My uploads</h3>${ups.length?ups.slice(0,8).map(x=>`<div class="row-item"><div><b>${safe(x.title)}</b><small>${safe(x.subject)} · ${safe(String(x.created_at).slice(0,10))}</small></div><span class="tag ${safe(x.status)}">${safe(x.status)}</span></div>`).join(''):'<p class="muted">No uploads yet.</p>'}</div>
    <div class="card"><h3>Coin activity</h3>${tx.length?tx.map(x=>`<div class="row-item"><div><b>${safe(why[x.reason]||x.reason)}</b><small>${safe(String(x.created_at).slice(0,10))}</small></div><span class="pos">${x.amount>0?'+':''}${Number(x.amount)}</span></div>`).join(''):'<p class="muted">No activity yet.</p>'}${buys.length?'<h3 style="margin-top:16px">Coin purchases</h3>'+buys.map(x=>`<div class="row-item"><div><b>${Number(x.coins)} coins</b><small>${safe(ugx(x.amount_ugx))}</small></div><span class="tag ${safe(x.status)}">${safe(x.status)}</span></div>`).join(''):''}</div>
  </div>`;
  $('avatarClick')?.addEventListener('click',()=>$('avatarFile')?.click());
  $('avatarFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)uploadAvatar(f)});
  if(profile?.role==='admin'){admin?.classList.remove('hidden');loadAdmin();loadPurchases();loadSettings();loadDonations()}
  else admin?.classList.add('hidden');
}

async function loadAdmin(){
  if(!db||profile?.role!=='admin')return;
  const r=await db.from('resources').select('id,title,subject,level,uploaded_by,created_at').eq('status','pending').order('created_at');
  if($('adminResources'))$('adminResources').innerHTML=r.data?.length?r.data.map(x=>`<div class="planner-item"><div><b>${safe(x.title)}</b><small>${safe(x.subject)} · ${safe(x.level)}</small></div><button class="btn primary" data-approve="${x.id}">Approve (+5 coins)</button></div>`).join(''):'<p class="muted">No pending PDFs.</p>';
  $('adminResources')?.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{const res=await db.rpc('approve_resource',{resource_id:b.dataset.approve});if(res.error)toast(res.error.message);else{toast('PDF approved');await renderDashboard()}});
  const students=await db.from('profiles').select('full_name,email,level,coins,role,created_at').order('created_at',{ascending:false}).limit(100);
  if($('adminStudents'))$('adminStudents').innerHTML=students.data?.length?'<table><tr><th>Name</th><th>Email</th><th>Level</th><th>Coins</th><th>Role</th></tr>'+students.data.map(x=>`<tr><td>${safe(x.full_name)}</td><td>${safe(x.email)}</td><td>${safe(x.level)}</td><td>${x.coins}</td><td>${safe(x.role)}</td></tr>`).join('')+'</table>':'<p class="muted">No students.</p>';
  const refs=await db.from('referrals').select('id,inviter_id,invitee_id,referral_code,status,created_at').eq('status','pending').limit(100);
  if($('adminReferrals'))$('adminReferrals').innerHTML=refs.data?.length?refs.data.map(x=>`<div class="planner-item"><div><b>${safe(x.referral_code)}</b><small>Pending · ${safe(x.created_at?.slice(0,10))}</small></div><button class="btn primary" data-verify-ref="${x.id}">Verify (+5 coins)</button></div>`).join(''):'<p class="muted">No pending referrals.</p>';
  $('adminReferrals')?.querySelectorAll('[data-verify-ref]').forEach(b=>b.onclick=async()=>{const v=await db.rpc('verify_referral',{referral_id:b.dataset.verifyRef});if(v.error)toast(v.error.message);else{toast('Referral verified');await renderDashboard()}});
}

$('makeReferral')?.addEventListener('click',async()=>{
  if(!session){authModal('signup');return}
  if(!profile)await refreshAuth();
  const code=profile?.referral_code;
  if(!code){$('referralStatus').textContent='Referral code not ready yet.';return}
  const link=location.origin+location.pathname.replace(/[^/]*$/,'')+'index.html?ref='+encodeURIComponent(code);
  $('referralStatus').innerHTML=`Your link: <input id="referralLink" value="${safe(link)}" readonly style="width:100%;padding:9px;margin:8px 0"><button class="btn outline" id="copyReferral">Copy link</button>`;
  $('copyReferral').onclick=async()=>{try{await navigator.clipboard.writeText(link);toast('Copied')}catch{$('referralLink').select()}};
});

/* Premium requires login */
document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{
  if(!session){authModal('login');toast('Create an account or log in first to subscribe to Premium.');return}
  const plan=b.dataset.plan,url=plan==='weekly'?cfg.WEEKLY_PAYMENT_URL:cfg.MONTHLY_PAYMENT_URL;
  if(url)location.href=url;
  else modal(`<h2>Premium checkout</h2><p>Plan: ${plan==='weekly'?'UGX 10,000 weekly':'UGX 30,000 monthly'}.</p>
  <p>Pay via Mobile Money to <b>0783165723</b> or <b>0743766451</b>, then contact GACEB with your transaction ID.</p>
  <button class="btn primary" id="okPayment">Close</button>`);
  $('okPayment')?.addEventListener('click',closeModal);
});

const support=$('supportEmail');if(support&&cfg.SUPPORT_EMAIL)support.textContent='Support: '+cfg.SUPPORT_EMAIL;
$('contactForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const fd=new FormData(e.target),st=$('contactStatus');
  if(!db){st.textContent='Database not connected.';return}
  st.textContent='Sending…';
  const r=await db.from('contact_messages').insert({name:fd.get('name').trim(),email:fd.get('email').trim(),message:fd.get('message').trim()});
  if(r.error)st.textContent='Could not send: '+r.error.message;else{st.textContent='Thank you. Message sent.';e.target.reset()}
});

/* ===== Coins ===== */
const DEFAULT_PACKS=[{coins:150,amount_ugx:10000,label:'Starter'},{coins:500,amount_ugx:25000,label:'Popular'},{coins:1000,amount_ugx:40000,label:'Best value'}];
async function loadPacks(){
  const g=$('packGrid');if(!g)return;
  let packs=DEFAULT_PACKS;
  if(db){const r=await db.from('coin_packs').select('coins,amount_ugx,label').order('sort');if(r.data?.length)packs=r.data}
  g.innerHTML=packs.map((p,i)=>`<article class="card pack${i===packs.length-1?' best':''}">${p.label?`<span class="pill">${safe(p.label)}</span>`:''}<div class="coins" style="font-size:28px;font-weight:900">${Number(p.coins)} <small>coins</small></div><div class="ugx">${ugx(p.amount_ugx)}</div><p class="muted">Sh. ${Math.round(p.amount_ugx/p.coins)} per coin</p><button class="btn primary" data-pack="${Number(p.coins)}" data-price="${Number(p.amount_ugx)}">Buy ${Number(p.coins)} coins</button></article>`).join('');
  g.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>buyModal(Number(b.dataset.pack),Number(b.dataset.price)));
}
async function buyModal(coins,price){
  if(!db||!session){authModal('login');toast('Log in first to buy coins');return}
  const P=await getPay();
  const nums=[P.number,P.number2].filter(Boolean);
  modal(`<h2>Buy ${coins} coins</h2><p><b>${ugx(price)}</b> via ${safe(P.network||'Mobile Money')}</p>
  ${nums.length?`<ol class="steps" style="padding-left:18px">
  <li>Send <b>${ugx(price)}</b> to <b>${safe(nums.join(' or '))}</b>${P.name?' ('+safe(P.name)+')':''}.</li>
  <li>Enter the transaction ID below.</li>
  <li>GACEB confirms and adds your coins.</li></ol>
  <form id="buyForm" class="form"><label>Transaction ID<input name="ref" required minlength="6" maxlength="40"></label>
  <label>Phone you paid from<input name="phone" inputmode="tel" maxlength="20"></label>
  <button class="btn primary">Submit payment details</button><p id="buyStatus" class="muted"></p></form>`
  :`<p class="notice">Payment numbers: 0783165723 / 0743766451</p>`}
  <p class="muted">Never share your Mobile Money PIN.</p>`);
  $('buyForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const fd=new FormData(e.target),st=$('buyStatus');st.textContent='Sending…';
    const r=await db.rpc('request_coin_purchase',{p_coins:coins,p_ref:fd.get('ref'),p_phone:fd.get('phone')||''});
    if(r.error){st.textContent=/duplicate|unique/i.test(r.error.message)?'That transaction ID was already submitted.':r.error.message;return}
    st.textContent='Received. Coins added after GACEB confirms.';e.target.reset();
  });
}
async function loadPurchases(){
  const box=$('adminPurchases');if(!box||!db||profile?.role!=='admin')return;
  const r=await db.from('coin_purchases').select('id,coins,amount_ugx,provider_ref,payer_phone,created_at').eq('status','pending').order('created_at');
  box.innerHTML=r.data?.length?r.data.map(x=>`<div class="row-item"><div><b>${Number(x.coins)} coins · ${ugx(x.amount_ugx)}</b><small>Ref ${safe(x.provider_ref)} · ${safe(x.payer_phone||'—')}</small></div><div class="actions"><button class="btn primary" data-buy-ok="${x.id}">Confirm</button><button class="btn outline" data-buy-no="${x.id}">Reject</button></div></div>`).join(''):'<p class="muted">No purchases waiting.</p>';
  box.querySelectorAll('[data-buy-ok]').forEach(b=>b.onclick=async()=>{const v=await db.rpc('approve_coin_purchase',{p_id:b.dataset.buyOk});toast(v.error?v.error.message:'Confirmed');await renderDashboard()});
  box.querySelectorAll('[data-buy-no]').forEach(b=>b.onclick=async()=>{const v=await db.rpc('reject_coin_purchase',{p_id:b.dataset.buyNo});toast(v.error?v.error.message:'Rejected');await renderDashboard()});
}
loadPacks();

/* ===== Settings / payments ===== */
let settingsCache=null;
async function getPay(){
  if(settingsCache)return settingsCache;
  const o={network:cfg.PAYMENT_NETWORK||'',number:cfg.PAYMENT_NUMBER||'0783165723',number2:cfg.PAYMENT_NUMBER_2||'0743766451',name:cfg.PAYMENT_NAME||'GACEB Scholar',email:cfg.SUPPORT_EMAIL||''};
  const map={payment_network:'network',payment_number:'number',payment_number_2:'number2',payment_name:'name',support_email:'email'};
  if(db){const r=await db.from('site_settings').select('key,value');(r.data||[]).forEach(x=>{if(map[x.key]&&x.value)o[map[x.key]]=x.value})}
  return settingsCache=o;
}
async function loadSettings(){
  const f=$('settingsForm');if(!f||!db||profile?.role!=='admin')return;
  settingsCache=null;const P=await getPay();
  f.network.value=P.network;f.number.value=P.number;
  if(f.number2)f.number2.value=P.number2||'';
  f.pname.value=P.name;f.email.value=P.email;
  if(f.dataset.bound)return;f.dataset.bound=1;
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const rows=[['payment_network',f.network.value],['payment_number',f.number.value],['payment_number_2',f.number2?.value||''],['payment_name',f.pname.value],['support_email',f.email.value]].map(([key,value])=>({key,value:value.trim()}));
    const r=await db.from('site_settings').upsert(rows);settingsCache=null;toast(r.error?r.error.message:'Payment settings saved.');
  });
}
async function loadDonations(){
  const box=$('adminDonations');if(!box||!db||profile?.role!=='admin')return;
  const r=await db.from('donations').select('id,donor_name,amount_ugx,provider_ref,payer_phone,message,created_at').eq('status','pending').order('created_at');
  box.innerHTML=r.data?.length?r.data.map(x=>`<div class="row-item"><div><b>${ugx(x.amount_ugx)} · ${safe(x.donor_name)}</b><small>Ref ${safe(x.provider_ref)} · ${safe(x.payer_phone||'—')}</small></div><div class="actions"><button class="btn primary" data-don-ok="${x.id}">Confirm</button><button class="btn outline" data-don-no="${x.id}">Reject</button></div></div>`).join(''):'<p class="muted">No donations waiting.</p>';
  box.querySelectorAll('[data-don-ok]').forEach(b=>b.onclick=async()=>{const v=await db.rpc('confirm_donation',{p_id:b.dataset.donOk});toast(v.error?v.error.message:'Donation confirmed');loadDonations()});
  box.querySelectorAll('[data-don-no]').forEach(b=>b.onclick=async()=>{const v=await db.rpc('reject_donation',{p_id:b.dataset.donNo});toast(v.error?v.error.message:'Rejected');loadDonations()});
}

/* ===== Donate form ===== */
if($('donateForm')){
  const f=$('donateForm'),inp=$('donAmount'),err=$('donErr');
  document.querySelectorAll('#amountChips button').forEach(b=>b.onclick=()=>{inp.value=b.dataset.a;document.querySelectorAll('#amountChips button').forEach(x=>x.classList.toggle('on',x===b));err.textContent=''});
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const raw=inp.value.trim();
    if(!/^\d+$/.test(raw)){err.textContent='Enter a whole number in UGX.';return}
    const amt=Number(raw);
    if(amt<500){err.textContent='Minimum UGX 500.';return}
    if(amt>100000000){err.textContent='Contact GACEB for large gifts.';return}
    err.textContent='';
    const P=await getPay(),dn=(f.dname.value||'').trim()||'Anonymous',msg=(f.msg.value||'').trim(),box=$('donateStep2');
    f.classList.add('hidden');box.classList.remove('hidden');
    const nums=[P.number||'0783165723',P.number2||'0743766451'].filter(Boolean);
    box.innerHTML=`<h3>Your gift: ${ugx(amt)}</h3>
    <ol style="padding-left:18px">
      <li>Send <b>${ugx(amt)}</b> to <b>${safe(nums.join(' or '))}</b> via ${safe(P.network||'Mobile Money')}.</li>
      <li>Enter the transaction ID from your SMS below.</li>
      <li>GACEB confirms and records your donation.</li>
    </ol>
    <form id="donPay" class="form">
      <label>Transaction ID<input name="ref" required minlength="6" maxlength="40"></label>
      <label>Phone you paid from<input name="phone" inputmode="tel" maxlength="20"></label>
      <p class="err" id="donPayErr" style="color:#a33"></p>
      <button class="btn goldbtn">I have paid, submit</button>
    </form>
    <p class="muted">Never share your PIN.</p>
    <button class="btn outline" id="donBack" type="button">Change amount</button>`;
    $('donBack').onclick=()=>{box.classList.add('hidden');f.classList.remove('hidden')};
    $('donPay')?.addEventListener('submit',async ev=>{
      ev.preventDefault();const fd=new FormData(ev.target),pe=$('donPayErr');pe.textContent='Sending…';
      if(!db){pe.textContent='Database not connected.';return}
      const r=await db.rpc('submit_donation',{p_name:dn,p_amount:amt,p_ref:fd.get('ref'),p_phone:fd.get('phone')||'',p_message:msg});
      if(r.error){pe.textContent=/duplicate|unique/i.test(r.error.message)?'That transaction ID was already submitted.':r.error.message;return}
      box.classList.add('hidden');
      const done=$('donateDone');done.classList.remove('hidden');
      done.innerHTML=`<div class="thanks-done"><h3>Thank you, ${safe(dn==='Anonymous'?'dear friend':dn)}</h3>
      <p>Your gift of <b>${ugx(amt)}</b> means a great deal. We will confirm shortly.</p>
      <p><b>May God bless you.</b><br>Sr. Gauge and the GACEB family</p>
      <a class="btn primary" href="index.html">Back to home</a></div>`;
    });
  });
}

/* ===== Notice board + Calendar + UNEB countdown ===== */
const UNEB_DATE=new Date('2026-11-06T08:00:00+03:00');
function tickCountdown(){
  if(!$('cdDays'))return;
  const now=new Date(),diff=UNEB_DATE-now;
  if(diff<=0){$('cdDays').textContent='0';$('cdHours').textContent='0';$('cdMins').textContent='0';$('cdSecs').textContent='0';return}
  const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
  $('cdDays').textContent=d;$('cdHours').textContent=h;$('cdMins').textContent=m;$('cdSecs').textContent=s;
}
if($('countdownTimer')){tickCountdown();setInterval(tickCountdown,1000)}

function updateAdminNoticeBtns(){
  const isAdmin=profile?.role==='admin';
  $('addNoticeBtn')?.classList.toggle('hidden',!isAdmin);
  $('addEventBtn')?.classList.toggle('hidden',!isAdmin);
}

async function loadNotices(){
  const list=$('noticeList');if(!list)return;
  if(!db){list.innerHTML='<p class="muted">Connect Supabase to load notices. You can still use the calendar offline.</p>';return}
  const {data,error}=await db.from('notices').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(30);
  if(error){list.innerHTML=`<p class="muted">Could not load notices (${safe(error.message)}). Run the SQL for the notices table.</p>`;return}
  if(!data?.length){list.innerHTML='<p class="muted">No announcements yet. Admins can add notices here.</p>';return}
  list.innerHTML=data.map(n=>`<article class="notice-item${n.pinned?' pinned':''}">
    <div class="meta">${n.pinned?'📌 Pinned · ':''}${safe(String(n.created_at).slice(0,10))}${n.author_name?' · '+safe(n.author_name):''}</div>
    <h3>${safe(n.title)}</h3><p style="margin:0;color:var(--ink)">${safe(n.body)}</p>
    ${profile?.role==='admin'?`<button class="btn small outline" data-del-notice="${n.id}" style="margin-top:8px">Delete</button>`:''}
  </article>`).join('');
  list.querySelectorAll('[data-del-notice]').forEach(b=>b.onclick=async()=>{
    if(!confirm('Delete this notice?'))return;
    await db.from('notices').delete().eq('id',b.dataset.delNotice);loadNotices();
  });
}
$('addNoticeBtn')?.addEventListener('click',()=>{
  if(profile?.role!=='admin')return;
  modal(`<h2>New notice</h2><form id="noticeForm" class="form">
  <label>Title<input name="title" required maxlength="120"></label>
  <label>Message<textarea name="body" required rows="4" maxlength="2000"></textarea></label>
  <label><input type="checkbox" name="pinned"> Pin to top</label>
  <button class="btn primary">Publish</button></form>`);
  $('noticeForm').onsubmit=async e=>{
    e.preventDefault();const fd=new FormData(e.target);
    const r=await db.from('notices').insert({title:fd.get('title').trim(),body:fd.get('body').trim(),pinned:!!fd.get('pinned'),author_name:profile?.full_name||'Admin',created_by:session.user.id});
    if(r.error)toast(r.error.message);else{toast('Notice published');closeModal();loadNotices()}
  };
});

async function loadCalendarEvents(){
  if(!db){calendarEvents=[];drawCalendar();return}
  const {data}=await db.from('calendar_events').select('*').order('event_date');
  calendarEvents=data||[];
  drawCalendar();drawEventList();
}
function drawCalendar(){
  const grid=$('calGrid');if(!grid)return;
  if(calYear==null){const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth()}
  const label=$('calMonthLabel');
  if(label)label.textContent=new Date(calYear,calMonth,1).toLocaleString('en',{month:'long',year:'numeric'});
  const first=new Date(calYear,calMonth,1);
  const startDay=(first.getDay()+6)%7; // Mon=0
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const today=new Date();today.setHours(0,0,0,0);
  let html='<div class="dow">Mon</div><div class="dow">Tue</div><div class="dow">Wed</div><div class="dow">Thu</div><div class="dow">Fri</div><div class="dow">Sat</div><div class="dow">Sun</div>';
  for(let i=0;i<startDay;i++)html+='<div class="cal-day other"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dt=new Date(calYear,calMonth,d);dt.setHours(0,0,0,0);
    const iso=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const has=calendarEvents.some(e=>String(e.event_date).slice(0,10)===iso);
    const isToday=dt.getTime()===today.getTime();
    html+=`<div class="cal-day${isToday?' today':''}${has?' has-event':''}" title="${iso}">${d}${has?'<span class="dot"></span>':''}</div>`;
  }
  grid.innerHTML=html;
}
function drawEventList(){
  const box=$('eventList');if(!box)return;
  const upcoming=calendarEvents.filter(e=>new Date(e.event_date)>=new Date(new Date().toDateString())).slice(0,12);
  if(!upcoming.length){box.innerHTML='<p class="muted">No upcoming events. Admins can add exam dates and study milestones.</p>';return}
  box.innerHTML=upcoming.map(e=>{
    const d=new Date(e.event_date);
    return `<div class="event-item">
      <div class="date-badge"><b>${d.getDate()}</b>${d.toLocaleString('en',{month:'short'})}</div>
      <div><b>${safe(e.title)}</b><small style="display:block;color:var(--muted)">${safe(e.description||'')}</small>
      ${profile?.role==='admin'?`<button class="btn small outline" data-del-event="${e.id}" style="margin-top:6px">Delete</button>`:''}</div>
    </div>`;
  }).join('');
  box.querySelectorAll('[data-del-event]').forEach(b=>b.onclick=async()=>{
    if(!confirm('Delete this event?'))return;
    await db.from('calendar_events').delete().eq('id',b.dataset.delEvent);loadCalendarEvents();
  });
}
$('calPrev')?.addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--}drawCalendar()});
$('calNext')?.addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++}drawCalendar()});
$('addEventBtn')?.addEventListener('click',()=>{
  if(profile?.role!=='admin')return;
  modal(`<h2>Add calendar event</h2><form id="eventForm" class="form">
  <label>Title<input name="title" required maxlength="120"></label>
  <label>Date<input name="event_date" type="date" required></label>
  <label>Description<textarea name="description" rows="2" maxlength="400"></textarea></label>
  <button class="btn primary">Save event</button></form>`);
  $('eventForm').onsubmit=async e=>{
    e.preventDefault();const fd=new FormData(e.target);
    const r=await db.from('calendar_events').insert({title:fd.get('title').trim(),event_date:fd.get('event_date'),description:(fd.get('description')||'').trim(),created_by:session.user.id});
    if(r.error)toast(r.error.message);else{toast('Event added');closeModal();loadCalendarEvents()}
  };
});

/* About slideshow (if present) */
const ss=document.querySelector('.slideshow');
if(ss){
  const sl=[...ss.querySelectorAll('.slide')],dt=ss.querySelector('.dots');let i=0,t;
  if(dt){dt.innerHTML=sl.map((_,k)=>`<button type="button" aria-label="Slide ${k+1}"></button>`).join('');const ds=[...dt.children];
  const go=n=>{i=(n+sl.length)%sl.length;sl.forEach((x,k)=>x.classList.toggle('on',k===i));ds.forEach((x,k)=>x.classList.toggle('on',k===i))};
  const stop=()=>clearInterval(t),play=()=>{stop();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)t=setInterval(()=>go(i+1),4800)};
  ds.forEach((d,k)=>d.onclick=()=>{go(k);play()});
  ss.querySelector('.prev')?.addEventListener('click',()=>{go(i-1);play()});
  ss.querySelector('.next')?.addEventListener('click',()=>{go(i+1);play()});
  ss.onmouseenter=stop;ss.onmouseleave=play;go(0);play()}
}

/* PWA */
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn')?.classList.remove('hidden')});
$('installBtn')?.addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').classList.add('hidden')});

async function init(){
  if(db){await refreshAuth();db.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0))}
  else updateAccountBtn();
  await loadResources();
  if($('noticeList')){await loadNotices();await loadCalendarEvents();updateAdminNoticeBtns()}
}
init();
})();
