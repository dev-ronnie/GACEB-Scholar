/*
 * GACEB Scholar — recovery app.js (best-effort replacement)
 * IMPORTANT:
 * 1) Keep your existing Supabase URL and anon key in the configuration below.
 * 2) Load Supabase JS v2 before this file, e.g. @supabase/supabase-js@2.
 * 3) This file uses safe, optional DOM bindings: missing element IDs are ignored.
 * 4) This does NOT bypass Supabase RLS or create missing database tables/buckets.
 */
(() => {
  'use strict';

  const CONFIG = {
    SUPABASE_URL: 'PASTE_YOUR_EXISTING_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'PASTE_YOUR_EXISTING_SUPABASE_ANON_KEY_HERE',
    AVATAR_BUCKET: 'avatars', // Change only if your existing avatar bucket has another name.
    PDF_BUCKET: 'study-pdfs',
    PREMIUM_WEEKLY_UGX: 10000,
    PREMIUM_MONTHLY_UGX: 30000,
    MOBILE_MONEY_NUMBERS: ['0783165723', '0743766451'],
    COIN_PACKAGES: [
      { coins: 150, price: 10000 },
      { coins: 500, price: 25000 },
      { coins: 1000, price: 40000 }
    ],
    DEFAULT_PDF_UNLOCK_COST: 5
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const byId = (id) => document.getElementById(id);
  const hasConfig = () => CONFIG.SUPABASE_URL.startsWith('https://') &&
    !CONFIG.SUPABASE_URL.includes('PASTE_') &&
    CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.includes('PASTE_');

  let supabase = null;
  let currentUser = null;
  let currentProfile = null;
  let isAdmin = false;

  function logError(context, error) {
    console.error(`[GACEB Scholar] ${context}:`, error);
  }
  function notify(message, type = 'info') {
    const box = byId('appMessage') || byId('toast') || byId('messageBox');
    if (box) {
      box.textContent = message;
      box.hidden = false;
      box.dataset.type = type;
      box.setAttribute('role', 'status');
      clearTimeout(box._hideTimer);
      box._hideTimer = setTimeout(() => { box.hidden = true; }, 6000);
    } else if (type === 'error') {
      alert(message);
    } else {
      console.info(message);
    }
  }
  function setText(ids, value) {
    ids.forEach(id => { const el = byId(id); if (el) el.textContent = value == null ? '' : String(value); });
  }
  function setImage(ids, src, alt = '') {
    ids.forEach(id => {
      const el = byId(id);
      if (el && (el instanceof HTMLImageElement || el.tagName === 'IMG')) {
        el.src = src || '';
        if (alt) el.alt = alt;
      }
    });
  }
  function formatUGX(value) {
    return `UGX ${Number(value || 0).toLocaleString('en-UG')}`;
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }
  function getValue(...ids) {
    for (const id of ids) {
      const el = byId(id);
      if (el && 'value' in el) return String(el.value).trim();
    }
    return '';
  }
  function getFormValue(form, keys, fallbackIds = []) {
    if (form) {
      for (const key of keys) {
        const el = form.querySelector(`[name="${key}"], #${CSS.escape(key)}`);
        if (el && 'value' in el && String(el.value).trim()) return String(el.value).trim();
      }
    }
    return getValue(...fallbackIds);
  }
  function setBusy(button, busy, busyText = 'Please wait…') {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function initSupabase() {
    if (!hasConfig()) {
      console.warn('[GACEB Scholar] Add your existing Supabase URL and anon key in CONFIG at the top of app.js.');
      notify('Website configuration is incomplete. Restore the existing Supabase URL and anon key in app.js.', 'error');
      return false;
    }
    const createClient = window.supabase?.createClient;
    if (typeof createClient !== 'function') {
      notify('Supabase library is not loaded. Check that the Supabase JS v2 script loads before app.js.', 'error');
      return false;
    }
    supabase = window.gacebSupabase || createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    window.gacebSupabase = supabase;
    window.supabaseClient = supabase;
    return true;
  }

  async function getProfile(user = currentUser) {
    if (!supabase || !user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) { logError('Loading profile', error); throw error; }
    currentProfile = data || null;
    isAdmin = ['admin', 'teacher', 'owner'].includes(String(data?.role || '').toLowerCase());
    return currentProfile;
  }

  async function ensureProfile(user, extras = {}) {
    if (!supabase || !user) return null;
    let profile = await getProfile(user);
    if (profile) return profile;
    const displayName = extras.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Student';
    const row = { id: user.id, email: user.email || null, full_name: displayName, coins: 0, role: 'student' };
    // Avoid assuming optional profile fields exist. If full_name is not a column, retry without it.
    let result = await supabase.from('profiles').insert(row).select('*').single();
    if (result.error && /full_name|column/i.test(result.error.message || '')) {
      delete row.full_name;
      result = await supabase.from('profiles').insert(row).select('*').single();
    }
    if (result.error) {
      logError('Creating profile (check profiles table columns and RLS)', result.error);
      throw result.error;
    }
    currentProfile = result.data;
    return currentProfile;
  }

  async function refreshProfileUI() {
    if (!currentUser) return;
    const profile = await getProfile(currentUser).catch(() => currentProfile);
    const name = profile?.full_name || profile?.name || currentUser.user_metadata?.full_name || currentUser.email || 'Student';
    const coins = Number(profile?.coins || 0);
    setText(['userName', 'profileName', 'dashboardName', 'welcomeName', 'accountName'], name);
    setText(['userEmail', 'profileEmail', 'accountEmail'], currentUser.email || profile?.email || '');
    setText(['coinBalance', 'coinsBalance', 'userCoins', 'profileCoins', 'dashboardCoins'], coins);
    setText(['userRole', 'profileRole'], profile?.role || 'student');
    const avatar = profile?.avatar_url || profile?.avatar || currentUser.user_metadata?.avatar_url || '';
    setImage(['profilePhoto', 'profileAvatar', 'userAvatar', 'avatarPreview', 'dashboardAvatar'], avatar, 'Profile photo');
    $$('.admin-only, [data-admin-only="true"]').forEach(el => { el.hidden = !isAdmin; });
    $$('.auth-required, [data-auth-required="true"]').forEach(el => { el.hidden = !currentUser; });
    $$('.guest-only, [data-guest-only="true"]').forEach(el => { el.hidden = !!currentUser; });
  }

  async function register(event) {
    event?.preventDefault();
    if (!supabase) return notify('Supabase is not configured.', 'error');
    const form = event?.currentTarget;
    const email = getFormValue(form, ['email', 'registerEmail', 'signupEmail'], ['registerEmail', 'signupEmail', 'regEmail']);
    const password = getFormValue(form, ['password', 'registerPassword', 'signupPassword'], ['registerPassword', 'signupPassword', 'regPassword']);
    const fullName = getFormValue(form, ['full_name', 'fullName', 'name', 'registerName'], ['registerName', 'signupName', 'fullName']);
    const button = form?.querySelector('button[type="submit"]');
    if (!email || !password) return notify('Enter your email and password.', 'error');
    if (password.length < 6) return notify('Password must contain at least 6 characters.', 'error');
    setBusy(button, true, 'Creating account…');
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: fullName ? { full_name: fullName, name: fullName } : {} }
      });
      if (error) throw error;
      if (data.user && data.session) {
        currentUser = data.user;
        await ensureProfile(data.user, { full_name: fullName });
        await refreshProfileUI();
        notify('Account created successfully.');
      } else {
        notify('Registration submitted. Check your email to confirm your account if confirmation is enabled.');
      }
      form?.reset();
    } catch (error) {
      logError('Registration failed', error);
      notify(error.message || 'Registration failed. Please try again.', 'error');
    } finally { setBusy(button, false); }
  }

  async function login(event) {
    event?.preventDefault();
    if (!supabase) return notify('Supabase is not configured.', 'error');
    const form = event?.currentTarget;
    const email = getFormValue(form, ['email', 'loginEmail', 'signinEmail'], ['loginEmail', 'signinEmail']);
    const password = getFormValue(form, ['password', 'loginPassword', 'signinPassword'], ['loginPassword', 'signinPassword']);
    const button = form?.querySelector('button[type="submit"]');
    if (!email || !password) return notify('Enter your email and password.', 'error');
    setBusy(button, true, 'Signing in…');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentUser = data.user;
      await ensureProfile(currentUser);
      await refreshProfileUI();
      notify('Login successful.');
      form?.reset();
      await loadDashboardData();
    } catch (error) {
      logError('Login failed', error);
      notify(error.message || 'Login failed. Check your email and password.', 'error');
    } finally { setBusy(button, false); }
  }

  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) { logError('Logout failed', error); return notify(error.message, 'error'); }
    currentUser = null; currentProfile = null; isAdmin = false;
    notify('You have signed out.');
    await refreshAuthUI();
  }

  async function refreshAuthUI() {
    if (!supabase) return;
    const { data, error } = await supabase.auth.getSession();
    if (error) logError('Checking session', error);
    currentUser = data?.session?.user || null;
    if (currentUser) {
      await getProfile(currentUser).catch(() => null);
      await refreshProfileUI();
      await loadDashboardData();
    } else {
      currentProfile = null; isAdmin = false;
      setText(['userName', 'profileName', 'dashboardName', 'welcomeName'], 'Guest');
      setText(['coinBalance', 'coinsBalance', 'userCoins', 'profileCoins', 'dashboardCoins'], '0');
      $$('.auth-required, [data-auth-required="true"]').forEach(el => { el.hidden = true; });
      $$('.guest-only, [data-guest-only="true"]').forEach(el => { el.hidden = false; });
      $$('.admin-only, [data-admin-only="true"]').forEach(el => { el.hidden = true; });
    }
  }

  async function uploadAvatar(event) {
    event?.preventDefault();
    if (!supabase || !currentUser) return notify('Please log in before uploading a profile photo.', 'error');
    const input = event?.target?.matches('input[type="file"]') ? event.target : (byId('profilePhotoInput') || byId('avatarInput') || byId('profileImageUpload'));
    const file = input?.files?.[0];
    if (!file) return notify('Choose a photo first.', 'error');
    if (!file.type.startsWith('image/')) return notify('Choose an image file.', 'error');
    if (file.size > 5 * 1024 * 1024) return notify('The image must be 5 MB or smaller.', 'error');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${currentUser.id}/avatar-${Date.now()}.${ext}`;
    try {
      const { error: uploadError } = await supabase.storage.from(CONFIG.AVATAR_BUCKET).upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(CONFIG.AVATAR_BUCKET).getPublicUrl(path);
      const avatarUrl = urlData?.publicUrl;
      if (!avatarUrl) throw new Error('Could not obtain the uploaded photo URL.');
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', currentUser.id);
      if (updateError) throw updateError;
      if (currentProfile) currentProfile.avatar_url = avatarUrl;
      setImage(['profilePhoto', 'profileAvatar', 'userAvatar', 'avatarPreview', 'dashboardAvatar'], avatarUrl, 'Profile photo');
      notify('Profile photo uploaded successfully.');
    } catch (error) {
      logError('Profile photo upload failed (check bucket name, storage policies, and avatar_url column)', error);
      notify(`Photo upload failed: ${error.message || 'Check storage configuration.'}`, 'error');
    }
  }

  async function uploadPDF(event) {
    event?.preventDefault();
    if (!supabase || !currentUser) return notify('Please log in before uploading a PDF.', 'error');
    if (!isAdmin && !currentProfile) return notify('Your profile could not be loaded.', 'error');
    const form = event?.currentTarget;
    const fileInput = form?.querySelector('input[type="file"]') || byId('pdfFile') || byId('resourceFile') || byId('studyPdf');
    const file = fileInput?.files?.[0];
    const title = getValue('pdfTitle', 'resourceTitle', 'title') || file?.name?.replace(/\.pdf$/i, '');
    const subject = getValue('pdfSubject', 'resourceSubject', 'subject');
    const level = getValue('pdfLevel', 'resourceLevel', 'classLevel', 'level');
    const description = getValue('pdfDescription', 'resourceDescription', 'description');
    if (!file || file.type !== 'application/pdf') return notify('Choose a PDF file.', 'error');
    if (!title || !subject || !level) return notify('Enter the title, subject, and class/level.', 'error');
    const path = `${currentUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const button = form?.querySelector('button[type="submit"]');
    setBusy(button, true, 'Uploading PDF…');
    try {
      const { error: storageError } = await supabase.storage.from(CONFIG.PDF_BUCKET).upload(path, file, { upsert: false, contentType: 'application/pdf' });
      if (storageError) throw storageError;
      const { data, error } = await supabase.from('resources').insert({
        title, subject, class_level: level, description: description || null,
        storage_path: path, uploaded_by: currentUser.id, status: 'pending',
        access_level: 'free', is_downloadable: true, coin_price: 0
      }).select().single();
      if (error) {
        logError('Saving PDF metadata; uploaded file may remain in Storage', error);
        throw error;
      }
      notify('PDF uploaded and submitted for approval.');
      form?.reset();
      await loadResources();
      return data;
    } catch (error) {
      logError('PDF upload failed', error);
      notify(`PDF upload failed: ${error.message || 'Check storage permissions and resources table.'}`, 'error');
    } finally { setBusy(button, false); }
  }

  async function loadResources() {
    if (!supabase) return [];
    const target = byId('resourcesList') || byId('pdfList') || byId('studyMaterials') || $('[data-resources-list]');
    let query = supabase.from('resources').select('*').order('created_at', { ascending: false }).limit(100);
    if (!isAdmin) query = query.eq('status', 'approved');
    const { data, error } = await query;
    if (error) { logError('Loading resources', error); if (target) target.innerHTML = '<p>Study materials could not be loaded.</p>'; return []; }
    if (target) {
      target.innerHTML = (data || []).map(resource => {
        const title = escapeHTML(resource.title || 'Untitled resource');
        const subject = escapeHTML(resource.subject || 'General');
        const level = escapeHTML(resource.class_level || '');
        const price = Number(resource.coin_price || 0);
        const canOpen = resource.access_level === 'free' && Number(resource.coin_price || 0) === 0;
        const action = canOpen ? 'open-resource' : 'unlock-resource';
        return `<article class="resource-card" data-resource-id="${escapeHTML(resource.id)}"><h3>${title}</h3><p>${subject}${level ? ' · ' + level : ''}</p><p>${canOpen ? 'Free' : `${price || CONFIG.DEFAULT_PDF_UNLOCK_COST} coins to unlock`}</p><button type="button" data-action="${action}" data-resource-id="${escapeHTML(resource.id)}">${canOpen ? 'Open PDF' : 'Unlock PDF'}</button></article>`;
      }).join('') || '<p>No study materials available yet.</p>';
    }
    return data || [];
  }

  async function unlockResource(resourceId) {
    if (!supabase || !currentUser) return notify('Please log in to unlock this PDF.', 'error');
    try {
      const { data: resource, error: resourceError } = await supabase.from('resources').select('*').eq('id', resourceId).single();
      if (resourceError) throw resourceError;
      if (resource.access_level === 'free' && Number(resource.coin_price || 0) === 0) return openResource(resourceId);
      const { data: existing, error: existingError } = await supabase.from('resource_unlocks').select('id').eq('user_id', currentUser.id).eq('resource_id', resourceId).maybeSingle();
      if (!existingError && existing) return openResource(resourceId);
      const price = Number(resource.coin_price || CONFIG.DEFAULT_PDF_UNLOCK_COST);
      const balance = Number(currentProfile?.coins || 0);
      if (balance < price) return notify(`You need ${price} coins. Your balance is ${balance}.`, 'error');
      // Prefer a database RPC so balance deduction and unlock happen atomically and securely.
      const { data: rpcData, error: rpcError } = await supabase.rpc('unlock_resource_with_coins', { p_resource_id: resourceId });
      if (!rpcError) {
        await refreshProfileUI();
        notify('PDF unlocked.');
        return openResource(resourceId);
      }
      logError('unlock_resource_with_coins RPC unavailable; no unsafe client-side coin deduction attempted', rpcError);
      notify('PDF unlocking needs a secure database function named unlock_resource_with_coins. No coins were deducted. Please configure the function/policies before using paid unlocks.', 'error');
    } catch (error) {
      logError('Unlocking resource failed', error);
      notify(error.message || 'Could not unlock this PDF.', 'error');
    }
  }

  async function openResource(resourceId) {
    if (!supabase) return;
    try {
      const { data: resource, error } = await supabase.from('resources').select('*').eq('id', resourceId).single();
      if (error) throw error;
      if (resource.access_level !== 'free' && Number(resource.coin_price || 0) > 0) {
        const { data: unlocked, error: unlockError } = await supabase.from('resource_unlocks').select('id').eq('user_id', currentUser?.id || '').eq('resource_id', resourceId).maybeSingle();
        if (unlockError || !unlocked) return unlockResource(resourceId);
      }
      const { data, error: urlError } = await supabase.storage.from(CONFIG.PDF_BUCKET).createSignedUrl(resource.storage_path, 300);
      if (urlError) throw urlError;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
      else throw new Error('Could not create a PDF viewing link.');
    } catch (error) {
      logError('Opening PDF failed', error);
      notify(`Could not open PDF: ${error.message || 'Check resource storage permissions.'}`, 'error');
    }
  }

  function renderCoinPackages() {
    const target = byId('coinPackages') || byId('coinPacks') || $('[data-coin-packages]');
    if (!target) return;
    target.innerHTML = CONFIG.COIN_PACKAGES.map(pack => `<article class="coin-package"><div class="coin-art" aria-hidden="true">🪙</div><h3>${pack.coins.toLocaleString()} Coins</h3><p>${formatUGX(pack.price)}</p><button type="button" data-action="buy-coins" data-coins="${pack.coins}" data-price="${pack.price}">Buy package</button></article>`).join('');
  }

  async function requestCoinPurchase(coins, price) {
    if (!currentUser || !supabase) return notify('Please log in before purchasing coins.', 'error');
    notify(`To purchase ${coins} coins for ${formatUGX(price)}, send payment to Mobile Money ${CONFIG.MOBILE_MONEY_NUMBERS.join(' or ')}. Then contact the administrator to verify payment. Coins should only be credited after payment is confirmed.`);
    // Deliberately do not add coins from the browser. Payment verification must be server/admin controlled.
  }

  async function loadNotices() {
    if (!supabase) return;
    const target = byId('noticesList') || byId('announcements') || $('[data-notices-list]');
    if (!target) return;
    const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) { logError('Loading notices (table may be named differently)', error); return; }
    target.innerHTML = (data || []).map(n => `<article class="notice"><h3>${escapeHTML(n.title || 'Notice')}</h3><p>${escapeHTML(n.message || n.body || '')}</p></article>`).join('') || '<p>No announcements yet.</p>';
  }

  async function loadCalendar() {
    if (!supabase) return;
    const target = byId('calendarEvents') || byId('calendarList') || $('[data-calendar-list]');
    if (!target) return;
    const { data, error } = await supabase.from('calendar_events').select('*').order('event_date', { ascending: true }).limit(50);
    if (error) { logError('Loading calendar events (table may be named differently)', error); return; }
    target.innerHTML = (data || []).map(e => `<article class="calendar-event"><strong>${escapeHTML(e.title || e.name || 'Event')}</strong><p>${escapeHTML(e.event_date || e.date || '')}</p><p>${escapeHTML(e.description || '')}</p></article>`).join('') || '<p>No upcoming events.</p>';
  }

  async function loadDashboardData() {
    if (!supabase) return;
    await Promise.allSettled([loadResources(), loadNotices(), loadCalendar()]);
  }

  function setupLocalAssistant() {
    const form = byId('aiChatForm') || byId('assistantForm') || byId('chatForm');
    const input = byId('aiChatInput') || byId('assistantInput') || byId('chatInput');
    const messages = byId('aiChatMessages') || byId('assistantMessages') || byId('chatMessages');
    if (!form || !input || !messages) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const userLine = document.createElement('p');
      userLine.className = 'chat-message user-message'; userLine.textContent = text; messages.appendChild(userLine);
      const answer = document.createElement('p');
      answer.className = 'chat-message assistant-message';
      answer.textContent = 'I can help you study. Ask a specific question, or use the study resources, quiz, and planner tools available on GACEB Scholar. This local assistant does not connect to an AI API unless one is configured separately.';
      messages.appendChild(answer);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function setupQuiz() {
    const form = byId('quizForm') || $('[data-quiz-form]');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const questions = $$('[data-correct-answer]', form);
      let score = 0, total = 0;
      questions.forEach(q => {
        total++;
        const correct = q.dataset.correctAnswer;
        const chosen = $('input[type="radio"]:checked, input[type="checkbox"]:checked', q)?.value;
        if (chosen != null && chosen === correct) score++;
      });
      notify(`Quiz score: ${score} / ${total}`);
      const result = byId('quizResult'); if (result) result.textContent = `Score: ${score} / ${total}`;
    });
  }

  function setupPlanner() {
    const form = byId('plannerForm') || $('[data-planner-form]');
    const list = byId('plannerTasks') || $('[data-planner-tasks]');
    if (!form || !list) return;
    const key = currentUser ? `gaceb_planner_${currentUser.id}` : 'gaceb_planner_guest';
    const render = () => {
      let tasks = [];
      try { tasks = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
      list.innerHTML = tasks.map((task, index) => `<li>${escapeHTML(task)} <button type="button" data-delete-task="${index}" aria-label="Delete task">Delete</button></li>`).join('');
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input, textarea');
      if (!input?.value.trim()) return;
      let tasks = []; try { tasks = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
      tasks.push(input.value.trim()); localStorage.setItem(key, JSON.stringify(tasks)); input.value = ''; render();
    });
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-delete-task]'); if (!button) return;
      let tasks = []; try { tasks = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
      tasks.splice(Number(button.dataset.deleteTask), 1); localStorage.setItem(key, JSON.stringify(tasks)); render();
    });
    render();
  }

  function bindForms() {
    const loginForm = byId('loginForm') || byId('signinForm') || $('[data-login-form]');
    const registerForm = byId('registerForm') || byId('signupForm') || $('[data-register-form]');
    const avatarInput = byId('profilePhotoInput') || byId('avatarInput') || byId('profileImageUpload');
    const pdfForm = byId('pdfUploadForm') || byId('resourceUploadForm') || $('[data-pdf-upload-form]');
    loginForm?.addEventListener('submit', login);
    registerForm?.addEventListener('submit', register);
    avatarInput?.addEventListener('change', uploadAvatar);
    pdfForm?.addEventListener('submit', uploadPDF);
    $$('[data-action="logout"], #logoutBtn, #logoutButton').forEach(el => el.addEventListener('click', event => { event.preventDefault(); logout(); }));
    $$('[data-action="refresh-profile"]').forEach(el => el.addEventListener('click', refreshProfileUI));
    // Delegation also handles dynamically rendered resource and coin buttons.
    document.addEventListener('click', event => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === 'logout') { event.preventDefault(); logout(); }
      if (action === 'buy-coins') { event.preventDefault(); requestCoinPurchase(Number(actionEl.dataset.coins), Number(actionEl.dataset.price)); }
      if (action === 'open-resource') { event.preventDefault(); openResource(actionEl.dataset.resourceId); }
      if (action === 'unlock-resource') { event.preventDefault(); unlockResource(actionEl.dataset.resourceId); }
    });
    // Restore mobile nav toggles without assuming a particular CSS framework.
    $$('[data-toggle="menu"], #menuToggle, #mobileMenuToggle').forEach(button => button.addEventListener('click', () => {
      const targetId = button.dataset.target || 'mobileMenu';
      const menu = byId(targetId);
      if (menu) { menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); }
    }));
  }

  function addImageSafetyStyles() {
    if (byId('gacebAppSafetyStyles')) return;
    const style = document.createElement('style');
    style.id = 'gacebAppSafetyStyles';
    style.textContent = `
      img.profile-photo, #profilePhoto, #profileAvatar, #userAvatar, #avatarPreview, #dashboardAvatar { max-width: 100%; object-fit: cover; }
      #profilePhoto, #profileAvatar, #userAvatar, #avatarPreview, #dashboardAvatar { width: 72px; height: 72px; border-radius: 50%; }
      .coin-package { display:inline-flex; flex-direction:column; align-items:center; gap:.5rem; padding:1rem; margin:.5rem; border:1px solid #d8b34a; border-radius:1rem; }
      .coin-art { width:3.5rem; height:3.5rem; display:grid; place-items:center; border-radius:50%; border:3px solid #d8a928; background:radial-gradient(circle at 30% 25%, #fff3a6, #e5ad19 60%, #9b6500); font-size:2rem; }
      .resource-card { overflow-wrap:anywhere; }
      #aiChatMessages, #assistantMessages, #chatMessages { overflow-y:auto; max-height:60vh; }
      #aiChatMessages img, #assistantMessages img, #chatMessages img { max-width:min(100%, 240px); max-height:240px; height:auto; object-fit:contain; }
    `;
    document.head.appendChild(style);
  }

  function exposePublicAPI() {
    window.GACEBScholar = {
      get supabase() { return supabase; },
      get user() { return currentUser; },
      get profile() { return currentProfile; },
      login, register, logout, refreshProfileUI, uploadAvatar, uploadPDF,
      loadResources, openResource, unlockResource, loadDashboardData,
      config: CONFIG
    };
    // Legacy-friendly globals used by some existing inline onclick attributes.
    window.loginUser = login;
    window.registerUser = register;
    window.logoutUser = logout;
    window.uploadProfilePhoto = uploadAvatar;
    window.uploadStudyPDF = uploadPDF;
  }

  async function start() {
    addImageSafetyStyles();
    renderCoinPackages();
    bindForms();
    setupLocalAssistant();
    setupQuiz();
    if (!initSupabase()) { exposePublicAPI(); return; }
    exposePublicAPI();
    await refreshAuthUI();
    supabase.auth.onAuthStateChange((_event, session) => {
      // Defer DB calls so they don't run inside the auth callback's internal lock.
      setTimeout(async () => {
        currentUser = session?.user || null;
        await refreshAuthUI();
      }, 0);
    });
    await loadResources();
    await loadNotices();
    await loadCalendar();
    setupPlanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
