(function(){
if(window.GACEB_CONFIG&&window.GACEB_CONFIG.url&&window.supabase)return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const REWARD={'Study notes':10,'Practice questions with answers':15,'Revision summary':8},MAXMB=5,DAILY=3;
const SERVICES=[{id:'bonus',name:'Bonus practice set',desc:'Five extra questions with explanations.',cost:20,live:1},{id:'feedback',name:'Teacher feedback',desc:'A teacher reviews one of your documents.',cost:50},{id:'challenge',name:'Challenge entry',desc:'Enter an academic challenge.',cost:30},{id:'session',name:'Live revision session',desc:'Join a small online revision class.',cost:80}];
const BONUS=[{q:'Expand (x + 2)(x + 3).',o:['x² + 6','x² + 5x + 6','x² + 5x + 5','2x + 5'],a:1,e:'Multiply each pair: x² + 3x + 2x + 6.'},{q:'Which of these is a vector quantity?',o:['Mass','Speed','Velocity','Time'],a:2,e:'Velocity has both size and direction.'},{q:'Zinc reacts with dilute hydrochloric acid. Which gas is released?',o:['Oxygen','Hydrogen','Carbon dioxide','Chlorine'],a:1,e:'Metal + acid gives a salt and hydrogen gas.'},{q:'Which blood cells mainly fight infection?',o:['Red blood cells','Platelets','White blood cells','Plasma'],a:2,e:'White blood cells defend the body against pathogens.'},{q:'What is the gradient of the line y = 4x − 7?',o:['−7','4','7','−4'],a:1,e:'In y = mx + c, the gradient is m = 4.'}];
let users=get('gaceb_users',{}),me=get('gaceb_session',null);
const save=()=>set('gaceb_users',users);
const say=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>t.classList.remove('show'),3400)};
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function sha(buf){try{return hex(await crypto.subtle.digest('SHA-256',buf))}catch(e){return null}}
async function hashPw(pw,salt){return sha(new TextEncoder().encode(salt+pw))}
const newSalt=()=>{try{return hex(crypto.getRandomValues(new Uint8Array(8)))}catch(e){return null}};
const add=(u,note,amt)=>{u.coins+=amt;u.ledger.unshift({d:new Date().toISOString(),n:note,a:amt});u.ledger=u.ledger.slice(0,20)};
/* Auth tabs */
$$('#authTabs button').forEach(b=>b.addEventListener('click',()=>{$$('#authTabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#signupForm').hidden=b.dataset.t!=='signup';$('#signinForm').hidden=b.dataset.t!=='signin'}));
$('#signupForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,el=f.elements,v=n=>el[n].value.trim(),err=$('#signupErr'),email=v('email').toLowerCase(),pw=el.pw.value;let m='';
if(v('name').length<2)m='Please enter your full name.';else if(!/^\S+@\S+\.\S+$/.test(email))m='Please enter a valid email address.';else if(pw.length<8)m='Password must be at least 8 characters.';else if(pw!==el.pw2.value)m='Passwords do not match.';else if(el.minor.checked&&!el.guardian.checked)m='If you are under 18, a parent, guardian or school must agree before you join.';else if(!el.terms.checked)m='Please accept the privacy notice.';else if(users[email])m='An account with this email already exists. Try signing in.';
if(m){err.textContent=m;return}
const salt=newSalt(),hash=salt&&await hashPw(pw,salt);
if(!hash){err.textContent='This browser cannot create secure demo accounts here. Open the site over https and try again.';return}
users[email]={name:v('name'),school:v('school'),level:el.level.value,role:el.role.value,minor:el.minor.checked,salt,hash,coins:0,ups:[],ledger:[],unlocked:[]};
me=email;set('gaceb_session',me);save();f.reset();err.textContent='';say('Account created. Welcome to GACEB Scholar!');render()});
$('#signinForm').addEventListener('submit',async e=>{e.preventDefault();const el=e.target.elements,email=el.email.value.trim().toLowerCase(),u=users[email],err=$('#signinErr');
const ok=u&&(await hashPw(el.pw.value,u.salt))===u.hash;
if(!ok){err.textContent='Email or password is not correct.';return}
me=email;set('gaceb_session',me);e.target.reset();err.textContent='';render()});
$('#signOut').addEventListener('click',()=>{me=null;set('gaceb_session',null);render();say('You have signed out.')});
$('#delAcc').addEventListener('click',()=>{if(confirm('Delete your account and everything saved with it on this device? This cannot be undone.')){delete users[me];me=null;set('gaceb_session',null);save();render();say('Your account was deleted.')}});
/* Dashboard tabs */
$$('#dashTabs button').forEach(b=>b.addEventListener('click',()=>{$$('#dashTabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.panel').forEach(p=>p.hidden=p.id!==b.dataset.p)}));
/* Upload */
$('#uploadForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,el=f.elements,u=users[me],file=el.file.files[0],err=$('#upErr'),today=new Date().toDateString();let m='';
if(!file)m='Choose a file to upload.';else if(file.size>MAXMB*1048576)m='That file is too large. The limit is '+MAXMB+' MB.';else if(!/\.(pdf|docx?|txt|png|jpe?g)$/i.test(file.name))m='Allowed files: PDF, Word, text, PNG or JPG.';else if(el.title.value.trim().length<3)m='Please give your document a title.';else if(!el.own.checked)m='Please confirm this is your own work or you have permission to share it.';else if(u.ups.filter(x=>new Date(x.at).toDateString()===today).length>=DAILY)m='Daily limit reached ('+DAILY+' uploads). Come back tomorrow.';
if(m){err.textContent=m;return}
const h=await sha(await file.arrayBuffer());
if(h&&Object.values(users).some(x=>x.ups.some(y=>y.h===h))){err.textContent='This file has already been uploaded.';return}
u.ups.unshift({id:String(Date.now()),title:el.title.value.trim(),subject:el.subject.value,type:el.type.value,name:file.name,size:file.size,h,at:new Date().toISOString(),status:'pending',coins:REWARD[el.type.value]});
save();f.reset();err.textContent='';say('Submitted. Coins are added once GACEB approves it.');renderUps()});
$('#upList').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const u=users[me],x=u.ups.find(y=>y.id===b.dataset.id);if(!x||x.status!=='pending')return;
if(b.dataset.a==='ok'){x.status='approved';add(u,'Approved: '+x.title,x.coins);say('+'+x.coins+' coins added.')}else{x.status='rejected';say('Marked as rejected.')}save();render()});
/* Services */
function renderServices(){const u=users[me];$('#svcList').innerHTML=SERVICES.map(s=>{const own=u.unlocked.includes(s.id);return `<div class="svc"><h4>${s.name}</h4><p>${s.desc}</p><span class="cost">${s.cost} coins</span>`+(own?`<button class="ghost-btn" data-open="${s.id}" type="button">Open</button>`:s.live?`<button class="button button-gold" data-buy="${s.id}" type="button">Unlock</button>`:'<span class="muted">Coming soon</span>')+'</div>'}).join('')}
$('#svcList').addEventListener('click',e=>{const u=users[me],b=e.target.closest('button');if(!b)return;
if(b.dataset.buy){const s=SERVICES.find(x=>x.id===b.dataset.buy);if(u.coins<s.cost){say('You need '+(s.cost-u.coins)+' more coins. Upload a document to earn them.');return}add(u,'Unlocked: '+s.name,-s.cost);u.unlocked.push(s.id);save();render();say(s.name+' unlocked.')}
if(b.dataset.open)openBonus()});
function openBonus(){const box=$('#bonusBox');box.hidden=false;box.innerHTML='<h3>Bonus practice set</h3>'+BONUS.map((q,i)=>`<fieldset class="q"><legend>${i+1}. ${q.q}</legend>${q.o.map((o,j)=>`<label><input type="radio" name="b${i}" value="${j}"> ${o}</label>`).join('')}<p class="exp" hidden></p></fieldset>`).join('')+'<button class="button button-gold" id="bMark" type="button">Mark my answers</button><p id="bScore" style="font-weight:700"></p>';
$('#bMark').addEventListener('click',()=>{let r=0;$$('#bonusBox .q').forEach((f,i)=>{const c=f.querySelector('input:checked'),ok=c&&+c.value===BONUS[i].a;if(ok)r++;f.classList.toggle('ok',!!ok);f.classList.toggle('bad',!ok);const p=f.querySelector('.exp');p.hidden=false;p.textContent='Answer: '+BONUS[i].o[BONUS[i].a]+'. '+BONUS[i].e});$('#bScore').textContent='You scored '+r+' out of '+BONUS.length+'.'});box.scrollIntoView({behavior:'smooth',block:'nearest'})}
function renderUps(){const u=users[me];$('#upList').innerHTML=u.ups.length?u.ups.map(x=>`<div class="item"><div><b>${esc(x.title)}</b><small>${esc(x.subject)} · ${esc(x.type)} · ${(x.size/1048576).toFixed(2)} MB</small></div><span class="badge ${x.status}">${x.status==='pending'?'Pending review':x.status==='approved'?'+'+x.coins+' coins':'Rejected'}</span>`+(x.status==='pending'?`<div class="row" style="margin:0"><button class="ghost-btn" data-a="ok" data-id="${x.id}" type="button">Demo: approve</button><button class="ghost-btn" data-a="no" data-id="${x.id}" type="button">Demo: reject</button></div>`:'')+'</div>').join(''):'<p class="muted">No uploads yet. Share your first document in the Upload tab.</p>'}
function renderLedger(){const u=users[me];$('#ledger').innerHTML=u.ledger.length?u.ledger.map(l=>`<div class="item"><div><b>${esc(l.n)}</b><small>${new Date(l.d).toLocaleDateString()}</small></div><b class="${l.a<0?'neg':'pos'}">${l.a>0?'+':''}${l.a} coins</b></div>`).join(''):'<p class="muted">Your coin activity will appear here.</p>'}
function setCoins(n){const el=$('#coins'),from=+el.textContent||0;if(from===n||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=n;return}const t0=performance.now();(function f(t){const p=Math.min((t-t0)/700,1);el.textContent=Math.round(from+(n-from)*p);if(p<1)requestAnimationFrame(f)})(t0)}
function render(){const u=users[me];$('#authBox').hidden=!!u;$('#dash').hidden=!u;const cta=$('.nav-cta');
if(!u){me=null;cta.textContent='Join free ↗';return}
$('#hello').textContent='Welcome, '+u.name.split(' ')[0];$('#roleLine').textContent=[u.role,u.level,u.school].filter(Boolean).join(' · ');setCoins(u.coins);cta.textContent=u.coins+' coins ↗';
$('#bonusBox').hidden=true;renderUps();renderServices();renderLedger()}
render();
})();
