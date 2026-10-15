(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* Themes */
const themeColors={navy:'#101b35',emerald:'#0c3b2e',crest:'#4a1521',night:'#08122a'};
function setTheme(t){document.documentElement.dataset.theme=t;$$('.themes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===t));const m=$('meta[name=theme-color]');if(m)m.content=themeColors[t];store.set('gaceb_theme',t)}
$$('.themes button').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
setTheme(store.get('gaceb_theme','navy'));
/* Quiz */
const Q=[
{s:'Mathematics',q:'Solve 3x + 5 = 20.',o:['x = 3','x = 5','x = 7','x = 15'],a:1,e:'Subtract 5 to get 3x = 15, then divide by 3.'},
{s:'Mathematics',q:'What is the derivative of x²?',o:['x','2x','x²','2'],a:1,e:'Bring the power down and reduce it by one: 2x.'},
{s:'Mathematics',q:'What is log₁₀(1000)?',o:['2','3','10','100'],a:1,e:'10³ = 1000, so the logarithm is 3.'},
{s:'Physics',q:'What is the SI unit of force?',o:['Joule','Watt','Newton','Pascal'],a:2,e:'Force is measured in newtons (N).'},
{s:'Physics',q:'A car travels 120 m in 10 s at constant speed. What is its speed?',o:['1.2 m/s','12 m/s','120 m/s','1200 m/s'],a:1,e:'Speed = distance ÷ time = 120 ÷ 10.'},
{s:'Chemistry',q:'What is the pH of a neutral solution at 25 °C?',o:['0','5','7','14'],a:2,e:'Pure water is neutral, with a pH of 7.'},
{s:'Chemistry',q:'Which of these is a noble gas?',o:['Oxygen','Nitrogen','Argon','Chlorine'],a:2,e:'Argon is in Group 18 and is very unreactive.'},
{s:'Biology',q:'Which organelle releases most energy during aerobic respiration?',o:['Nucleus','Mitochondrion','Ribosome','Vacuole'],a:1,e:'Mitochondria make most of the cell’s ATP.'},
{s:'Biology',q:'Through which structures do plants mainly absorb water?',o:['Stomata','Root hairs','Petals','Xylem'],a:1,e:'Root hairs give a large surface area for absorption.'}];
const subs=['All',...new Set(Q.map(q=>q.s))];let cur='All',list=[];
$('#quizTabs').innerHTML=subs.map(s=>`<button type="button" aria-pressed="${s===cur}">${s}</button>`).join('');
$$('#quizTabs button').forEach(b=>b.addEventListener('click',()=>{cur=b.textContent;$$('#quizTabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));render()}));
function render(){list=Q.filter(q=>cur==='All'||q.s===cur);
$('#quizBox').innerHTML=list.map((q,i)=>`<fieldset class="q"><legend>${i+1}. ${q.q}<small>${q.s}</small></legend>${q.o.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('')}<p class="exp" hidden></p></fieldset>`).join('')+'<button class="button button-gold" id="markBtn" type="button">Mark my answers</button><div id="score" role="status"></div>';
$('#markBtn').addEventListener('click',mark)}
function mark(){let right=0,p=store.get('gaceb_progress',{});
$$('#quizBox .q').forEach((f,i)=>{const q=list[i],c=f.querySelector('input:checked'),ok=c&&+c.value===q.a;if(ok)right++;
f.classList.toggle('ok',!!ok);f.classList.toggle('bad',!ok);const e=f.querySelector('.exp');e.hidden=false;e.textContent=(ok?'Correct. ':c?'Not quite. ':'No answer. ')+'Answer: '+q.o[q.a]+'. '+q.e;
p[q.s]=p[q.s]||{c:0,t:0};p[q.s].t++;if(ok)p[q.s].c++});
$('#score').textContent=`You scored ${right} out of ${list.length}.`;store.set('gaceb_progress',p);progress()}
function progress(){const p=store.get('gaceb_progress',{}),k=Object.keys(p);
$('#progressBox').innerHTML=k.length?k.map(s=>{const pc=Math.round(p[s].c/p[s].t*100);return `<div class="bar-row"><b>${s}</b> · ${pc}% correct (${p[s].c}/${p[s].t})<div class="bar"><i style="width:${pc}%"></i></div></div>`}).join('')+'<p class="muted">Topics under 60% are good ones to revise.</p>':'<p class="muted">Take a quiz and your results will appear here. They are saved on this device only.</p>'}
$('#resetProgress').addEventListener('click',()=>{store.set('gaceb_progress',{});progress()});
render();progress();
/* Study timer */
let mode='focus',left=1500,t=null;const modes={focus:1500,break:300},clock=$('#clock');
const show=()=>{clock.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0')};
function stop(){clearInterval(t);t=null;$('#timerGo').textContent='Start'}
$('#timerGo').addEventListener('click',()=>{if(t){stop();return}$('#timerGo').textContent='Pause';t=setInterval(()=>{left--;show();if(left<=0){stop();$('#timerMsg').textContent=mode==='focus'?'Focus session done. Take a 5 minute break.':'Break over. Ready for another session?';try{navigator.vibrate&&navigator.vibrate(300)}catch(e){}}},1000)});
$('#timerReset').addEventListener('click',()=>{stop();left=modes[mode];show();$('#timerMsg').textContent=''});
$$('#timerModes button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.m;$$('#timerModes button').forEach(x=>x.setAttribute('aria-pressed',x===b));stop();left=modes[mode];show()}));show();
/* Exam countdown */
const cd=store.get('gaceb_exam',{d:'',n:''}),di=$('#examDate'),ni=$('#examName');di.value=cd.d;ni.value=cd.n;
function count(){const o=$('#examOut');if(!di.value){o.textContent='Pick your exam date to start counting down.';return}
const days=Math.ceil((new Date(di.value+'T00:00:00')-new Date().setHours(0,0,0,0))/864e5),n=ni.value||'your exam';
o.textContent=days>0?`${days} day${days===1?'':'s'} until ${n}.`:days===0?`${n} is today. Good luck!`:`${n} date has passed. Set a new date.`;store.set('gaceb_exam',{d:di.value,n:ni.value})}
[di,ni].forEach(e=>e.addEventListener('input',count));count();
})();
