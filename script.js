const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '×' : '☰';
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
}));
const search = document.getElementById('paperSearch');
const level = document.getElementById('levelFilter');
const subject = document.getElementById('subjectFilter');
const cards = [...document.querySelectorAll('.paper-card')];
const emptyState = document.getElementById('emptyState');
function filterPapers(){
  const query = search.value.trim().toLowerCase(); let visible = 0;
  cards.forEach(card => {
    const matchesQuery = (card.dataset.subject + ' ' + card.dataset.level + ' ' + card.innerText).toLowerCase().includes(query);
    const matchesLevel = level.value === 'all' || card.dataset.level === level.value;
    const matchesSubject = subject.value === 'all' || card.dataset.subject === subject.value;
    const show = matchesQuery && matchesLevel && matchesSubject;
    card.hidden = !show; if(show) visible++;
  });
  emptyState.hidden = visible !== 0;
}
[search, level, subject].forEach(el => el.addEventListener('input', filterPapers));
const toast = document.getElementById('toast'); let toastTimer;
document.querySelectorAll('.notify-button').forEach(button => button.addEventListener('click', () => {
  toast.textContent = `${button.dataset.subject} papers are not uploaded yet. Please check back soon.`;
  toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}));
document.getElementById('year').textContent = new Date().getFullYear();
