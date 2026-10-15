(function(){
const d=document,root=d.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)').matches,$$=s=>[...d.querySelectorAll(s)];
root.classList.add('js');
const h1=d.querySelector('.hero h1');let i=0;
if(h1)(function split(n){[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(d.createTextNode(' '));return}const s=d.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=t;f.appendChild(s)});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')split(c)})})(h1);
const sel='.feature-card,.paper-card,.tool-card,.step,.section-title,.section-heading,.about-copy,.about-mark,.leader-card,.leader-placeholder,.faq details,.gallery figure,.upload-note,.quick-stats>div,.papers-intro';
if(!rm&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const el=e.target;el.classList.add('in');io.unobserve(el);setTimeout(()=>el.classList.remove('reveal','in'),1500)}}),{threshold:.12});
$$(sel).forEach(el=>{el.style.setProperty('--d',Math.min([...el.parentElement.children].indexOf(el),5)*.09+'s');el.classList.add('reveal');io.observe(el)})}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const el=e.target,end=+el.dataset.count,sx=el.dataset.suffix||'';if(rm){el.textContent=end+sx;return}const t0=performance.now();(function f(t){const p=Math.min((t-t0)/1500,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+sx;if(p<1)requestAnimationFrame(f)})(t0)}),{threshold:.6});
$$('[data-count]').forEach(el=>cio.observe(el));
const hd=d.querySelector('.site-header'),sp=d.getElementById('sp'),tt=d.getElementById('toTop');
function onS(){const y=scrollY,h=root.scrollHeight-innerHeight;hd.classList.toggle('scrolled',y>40);sp.style.width=(h>0?y/h*100:0)+'%';tt.classList.toggle('show',y>600)}
addEventListener('scroll',onS,{passive:true});onS();tt.addEventListener('click',()=>scrollTo({top:0,behavior:rm?'auto':'smooth'}));
const tips=['Study in short bursts: 25 focused minutes beat two distracted hours.','Test yourself before you reread. Recalling an answer teaches you more than reading it again.','Start with the topic you like least, while your mind is fresh.','Explain a topic aloud as if teaching a friend. The gaps show up quickly.','Review your mistakes. Every wrong answer points to what to revise next.','Sleep is part of revision. Rest helps your brain store what you learned.','Mix subjects across the week instead of cramming one all night.'];
const te=d.getElementById('tip');
if(te){const tip=tips[new Date().getDate()%tips.length];te.setAttribute('aria-label',tip);if(rm||!('IntersectionObserver' in window))te.textContent=tip;else{let k=0;const go=()=>{te.textContent=tip.slice(0,++k);if(k<tip.length)setTimeout(go,32)};new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();go()}},{threshold:.5}).observe(te)}}
})();
