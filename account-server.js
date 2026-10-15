(function(){
const C=window.GACEB_CONFIG;if(!C||!C.url||!C.anonKey||!window.supabase)return;
const sb=supabase.createClient(C.url,C.anonKey),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>t.classList.remove('show'),3600)};
async function sha(buf){try{return [...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return null}}
const MSG={NOT_ENOUGH_COINS:'You do not have enough coins yet. Upload a document to earn more.',ALREADY_UNLOCKED:'You already unlocked this.',NOT_AVAILABLE:'This service is not available yet.',NOT_ALLOWED:'Only GACEB admins can do that.',NOT_PENDING:'That upload was already reviewed.'};
const why=e=>{const m=(e&&e.message)||'';for(const k in MSG)if(m.includes(k))return MSG[k];return 'Something went wrong. Please try again.'};
let P=null,SV=[],UN=[];
document.querySelector('.demo-note').hidden=true;
$$('#authTabs button').forEach(b=>b.addEventListener('click',()=>{$$('#authTabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#signupForm').hidden=b.dataset.t!=='signup';$('#signinForm').hidden=b.dataset.t!=='signin'}));
$('#dashTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#dashTabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.panel').forEach(p=>p.hidden=p.id!==b.dataset.p)});
$('#signupForm').addEventListener('submit',async e=>{e.preventDefault();const el=e.target.elements,err=$('#signupErr'),v=n=>el[n].value.trim(),email=v('email').toLowerCase(),pw=el.pw.value;let m='';
if(v('name').length<2)m='Please enter your full name.';else if(!/^\S+@\S+\.\S+$/.test(email))m='Please enter a valid email address.';else if(pw.length<8)m='Password must be at least 8 characters.';else if(pw!==el.pw2.value)m='Passwords do not match.';else if(el.minor.checked&&!el.guardian.checked)m='If you are under 18, a parent, guardian or school must agree before you join.';else if(!el.terms.checked)m='Please accept the privacy notice.';
if(m){err.textContent=m;return}
const {data,error}=await sb.auth.signUp({email,password:pw,options:{emailRedirectTo:location.href.split('#')[0],data:{full_name:v('name'),role:el.role.value,school:v('school'),level:el.level.value,is_minor:el.minor.checked,guardian_consent:el.guardian.checked}}});
if(error){err.textContent=error.message;return}
err.textContent='';e.target.reset();if(!data.session)say('Almost done. Check your email to confirm, then sign in.');else say('Welcome to GACEB Scholar!')});
$('#signinForm').addEventListener('submit',async e=>{e.preventDefault();const el=e.target.elements,{error}=await sb.auth.signInWithPassword({email:el.email.value.trim().toLowerCase(),password:el.pw.value});
$('#signinErr').textContent=error?'Email or password is not correct.':'';if(!error)e.target.reset()});
$('#signOut').addEventListener('click',async()=>{await sb.auth.signOut();say('You have signed out.')});
$('#delAcc').addEventListener('click',async()=>{if(!confirm('Delete your account, your uploads and your coins? This cannot be undone.'))return;
const {data}=await sb.from('uploads').select('file_path');if(data&&data.length)await sb.storage.from('documents').remove(data.map(x=>x.file_path));
const {error}=await sb.rpc('delete_my_account');if(error){say(why(error));return}await sb.auth.signOut();say('Your account was deleted.')});
$('#uploadForm').addEventListener('submit',async e=>{e.preventDefault();const el=e.target.elements,file=el.file.files[0],err=$('#upErr');let m='';
if(!file)m='Choose a file to upload.';else if(file.size>5242880)m='That file is too large. The limit is 5 MB.';else if(!/\.(pdf|docx?|txt|png|jpe?g)$/i.test(file.name))m='Allowed files: PDF, Word, text, PNG or JPG.';else if(el.title.value.trim().length<3)m='Please give your document a title.';else if(!el.own.checked)m='Please confirm this is your own work or you have permission to share it.';
if(m){err.textContent=m;return}
const hash=await sha(await file.arrayBuffer());if(!hash){err.textContent='This browser cannot check files securely. Open the site over https.';return}
const path=P.id+'/'+crypto.randomUUID()+'-'+file.name.replace(/[^\w.\-]/g,'_');
const up=await sb.storage.from('documents').upload(path,file,{contentType:file.type||undefined});if(up.error){err.textContent='Upload failed. Please try again.';return}
const ins=await sb.from('uploads').insert({title:el.title.value.trim(),subject:el.subject.value,doc_type:el.type.value,file_path:path,file_name:file.name,file_size:file.size,file_hash:hash});
if(ins.error){await sb.storage.from('documents').remove([path]);err.textContent=ins.error.code==='23505'?'This file has already been uploaded.':/DAILY_LIMIT/.test(ins.error.message)?'Daily limit reached (3 uploads). Come back tomorrow.':'Upload failed. Please try again.';return}
err.textContent='';e.target.reset();say('Submitted. Coins are added once GACEB approves it.');refresh()});
$('#svcList').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.buy){const {error}=await sb.rpc('unlock_service',{p_service:b.dataset.buy});if(error){say(why(error));return}say('Unlocked.');await refresh()}
if(b.dataset.open)openBonus()});
async function openBonus(){const {data,error}=await sb.from('bonus_questions').select('*').order('id');if(error||!data)return say(why(error));const box=$('#bonusBox');box.hidden=false;
box.innerHTML='<h3>Bonus practice set</h3>'+data.map((q,i)=>`<fieldset class="q"><legend>${i+1}. ${esc(q.question)}</legend>${q.options.map((o,j)=>`<label><input type="radio" name="b${i}" value="${j}"> ${esc(o)}</label>`).join('')}<p class="exp" hidden></p></fieldset>`).join('')+'<button class="button button-gold" id="bMark" type="button">Mark my answers</button><p id="bScore" style="font-weight:700"></p>';
$('#bMark').addEventListener('click',()=>{let r=0;$$('#bonusBox .q').forEach((f,i)=>{const c=f.querySelector('input:checked'),ok=c&&+c.value===data[i].answer_index;if(ok)r++;f.classList.toggle('ok',!!ok);f.classList.toggle('bad',!ok);const p=f.querySelector('.exp');p.hidden=false;p.textContent='Answer: '+data[i].options[data[i].answer_index]+'. '+data[i].explanation});$('#bScore').textContent='You scored '+r+' out of '+data.length+'.'})}
function setCoins(n){const el=$('#coins'),from=+el.textContent||0;if(from===n||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=n;return}const t0=performance.now();(function f(t){const p=Math.min((t-t0)/700,1);el.textContent=Math.round(from+(n-from)*p);if(p<1)requestAnimationFrame(f)})(t0)}
const badge=x=>x.status==='pending'?'Pending review':x.status==='approved'?'+'+x.coins_awarded+' coins':'Rejected'+(x.reject_reason?': '+esc(x.reject_reason):'');
async function refresh(){const {data:{session}}=await sb.auth.getSession(),cta=$('.nav-cta');$('#authBox').hidden=!!session;$('#dash').hidden=!session;
if(!session){P=null;cta.textContent='Join free ↗';return}
const uid=session.user.id,[p,u,l,s,us]=await Promise.all([sb.from('profiles').select('*').eq('id',uid).single(),sb.from('uploads').select('*').eq('user_id',uid).order('created_at',{ascending:false}),sb.from('coin_ledger').select('*').order('created_at',{ascending:false}).limit(20),sb.from('services').select('*').order('cost'),sb.from('user_services').select('service_id')]);
if(!p.data){say('Could not load your account.');return}P=p.data;SV=s.data||[];UN=(us.data||[]).map(x=>x.service_id);
$('#hello').textContent='Welcome, '+P.full_name.split(' ')[0];$('#roleLine').textContent=[P.role==='teacher'?'Teacher':'Student',P.level,P.school].filter(Boolean).join(' · ');setCoins(P.coins);cta.textContent=P.coins+' coins ↗';$('#bonusBox').hidden=true;
$('#upList').innerHTML=(u.data||[]).length?u.data.map(x=>`<div class="item"><div><b>${esc(x.title)}</b><small>${esc(x.subject)} · ${esc(x.doc_type)} · ${(x.file_size/1048576).toFixed(2)} MB</small></div><span class="badge ${x.status}">${badge(x)}</span></div>`).join(''):'<p class="muted">No uploads yet. Share your first document in the Upload tab.</p>';
$('#svcList').innerHTML=SV.map(x=>`<div class="svc"><h4>${esc(x.name)}</h4><p>${esc(x.description)}</p><span class="cost">${x.cost} coins</span>`+(UN.includes(x.id)?`<button class="ghost-btn" data-open="${x.id}" type="button">Open</button>`:x.is_live?`<button class="button button-gold" data-buy="${x.id}" type="button">Unlock</button>`:'<span class="muted">Coming soon</span>')+'</div>').join('');
$('#ledger').innerHTML=(l.data||[]).length?l.data.map(x=>`<div class="item"><div><b>${esc(x.reason)}</b><small>${new Date(x.created_at).toLocaleDateString()}</small></div><b class="${x.amount<0?'neg':'pos'}">${x.amount>0?'+':''}${x.amount} coins</b></div>`).join(''):'<p class="muted">Your coin activity will appear here.</p>';
if(P.is_admin)adminPanel()}
async function adminPanel(){if(!$('#p-admin')){const b=document.createElement('button');b.type='button';b.dataset.p='p-admin';b.setAttribute('aria-pressed','false');b.textContent='Review queue';$('#dashTabs').appendChild(b);const d=document.createElement('div');d.className='panel';d.id='p-admin';d.hidden=true;d.addEventListener('click',review);$('#dash').appendChild(d)}
const {data}=await sb.from('uploads').select('*, profiles(full_name,school)').eq('status','pending').order('created_at');
$('#p-admin').innerHTML=(data||[]).length?data.map(x=>`<div class="item"><div><b>${esc(x.title)}</b><small>${esc(x.profiles?x.profiles.full_name:'')} · ${esc(x.subject)} · ${esc(x.doc_type)}</small></div><div class="row" style="margin:0"><button class="ghost-btn" data-v="${esc(x.file_path)}" type="button">View file</button><button class="button button-gold" data-ok="${x.id}" type="button">Approve</button><button class="ghost-btn" data-no="${x.id}" type="button">Reject</button></div></div>`).join(''):'<p class="muted">No uploads waiting for review.</p>'}
async function review(e){const b=e.target.closest('button');if(!b)return;
if(b.dataset.v){const {data}=await sb.storage.from('documents').createSignedUrl(b.dataset.v,300);if(data)window.open(data.signedUrl,'_blank','noopener')}
if(b.dataset.ok){const {error}=await sb.rpc('approve_upload',{p_id:b.dataset.ok});say(error?why(error):'Approved. Coins awarded.');adminPanel()}
if(b.dataset.no){const r=prompt('Reason for rejecting (shown to the student):','Not original work');if(r===null)return;const {error}=await sb.rpc('reject_upload',{p_id:b.dataset.no,p_reason:r});say(error?why(error):'Rejected.');adminPanel()}}
sb.auth.onAuthStateChange(()=>setTimeout(refresh,0));refresh();
})();
