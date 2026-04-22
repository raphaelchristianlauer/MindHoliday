// ═══════════════════════════════════════════
//  Drug XP – app.js
// ═══════════════════════════════════════════

// ── Constants ──────────────────────────────
const LEVELS = [
  { min: 0,    max: 100,   name: 'Neuling',     icon: '🌱' },
  { min: 100,  max: 250,   name: 'Kenner',      icon: '🌿' },
  { min: 250,  max: 500,   name: 'Erfahrener',  icon: '🔥' },
  { min: 500,  max: 900,   name: 'Veteran',     icon: '💎' },
  { min: 900,  max: 1500,  name: 'Legende',     icon: '👑' },
  { min: 1500, max: 99999, name: 'Gottheit',    icon: '⭐' },
];

const DEFAULT_STRAINS = {
  cannabis:   ['OG Kush','Gorilla Glue','Northern Lights','Blue Dream','White Widow','Amnesia Haze','Sour Diesel','Girl Scout Cookies'],
  mdma:       ['Kristall','Pille'],
  lsd:        ['Pappe','Liquid','Gel Tab'],
  psilocybin: ['Golden Teacher','B+','Liberty Cap','Mazatapec'],
  alkohol:    ['Bier','Wein','Whiskey','Vodka','Tequila','Shots','Sekt'],
  kokain:     ['Pulver','Crack'],
  speed:      ['Paste','Pulver','Crystal'],
  ketamin:    ['Pulver','Liquid'],
  andere:     [],
};

let customStrains = {};

function getStrains(drug) {
  const defaults = DEFAULT_STRAINS[drug] || [];
  const custom = customStrains[drug] || [];
  return [...defaults, ...custom];
}

const DRUG_ICONS = {
  cannabis:'🌿', mdma:'💊', lsd:'🔮', psilocybin:'🍄',
  alkohol:'🍺', kokain:'⚗️', speed:'⚡', ketamin:'🧊', andere:'✨',
};

// Substanzspezifische Effekte
const DRUG_MOODS = {
  cannabis: [
    'entspannt','kreativ','schläfrig','hungrig','paranoid',
    'glücklich','gesprächig','focused','anxious','träumerisch','kichernd','tiefgründig'
  ],
  mdma: [
    'euphorisch','liebevoll','gesprächig','energetisch','empathisch',
    'glücklich','tanzend','überwältigt','jaw tension','schwitzend','emotional'
  ],
  lsd: [
    'visuell','tiefgründig','euphorisch','ängstlich','verbunden',
    'zeitverzerrt','kreativ','überwältigend','spirituell','gelacht','paranoid','overwhelmed'
  ],
  psilocybin: [
    'introspektiv','spirituell','euphorisch','emotional','visuell',
    'verbunden','ängstlich','tiefgründig','geerdet','overwhelmed','gelacht','weinend'
  ],
  alkohol: [
    'entspannt','gesprächig','schwindelig','euphorisch','mutig',
    'unkoordiniert','schläfrig','laut','nostalgisch','kater-ahnung','verliebt','aggressiv'
  ],
  kokain: [
    'energetisch','selbstbewusst','gesprächig','fokussiert','euphorisch',
    'paranoid','rastlos','überdreht','herzrasen','unruhig','numb'
  ],
  speed: [
    'energetisch','fokussiert','euphorisch','rastlos','gesprächig',
    'überdreht','schwitzig','jaw tension','numb','herzrasen','antriebsvoll'
  ],
  ketamin: [
    'dissoziiert','entspannt','träumerisch','verwirrt','k-hole',
    'schwindelig','numb','tief','surreal','zeitverzerrt','glücklich'
  ],
  andere: [
    'entspannt','euphorisch','kreativ','schläfrig','gesprächig',
    'focused','glücklich','anxious','energetisch','träumerisch'
  ],
};

const BADGES_DEF = [
  // ── Fortschritt ──
  { id:'first',       name:'Ersteintrag',    desc:'Erste Session geloggt',       icon:'🎉', check: e => e.length >= 1 },
  { id:'x5',          name:'5 Sessions',     desc:'5 Sessions gesamt',           icon:'5️⃣', check: e => e.length >= 5 },
  { id:'x10',         name:'10 Sessions',    desc:'10 Sessions gesamt',          icon:'🔟', check: e => e.length >= 10 },
  { id:'x25',         name:'25 Sessions',    desc:'25 Sessions gesamt',          icon:'🏅', check: e => e.length >= 25 },
  { id:'x50',         name:'50 Sessions',    desc:'50 Sessions gesamt',          icon:'💯', check: e => e.length >= 50 },
  { id:'x100',        name:'Jahrhundert',    desc:'100 Sessions gesamt',         icon:'🏆', check: e => e.length >= 100 },
  // ── XP & Level ──
  { id:'xp500',       name:'500 XP',         desc:'500 XP gesammelt',            icon:'⚡', check: (e,p) => (p&&p.xp||0) >= 500 },
  { id:'xp1000',      name:'1000 XP',        desc:'1000 XP gesammelt',           icon:'💎', check: (e,p) => (p&&p.xp||0) >= 1000 },
  { id:'xp2000',      name:'2000 XP',        desc:'2000 XP gesammelt',           icon:'👑', check: (e,p) => (p&&p.xp||0) >= 2000 },
  // ── Intensität ──
  { id:'max_high',    name:'Max High',       desc:'Intensität 10/10',            icon:'🚀', check: e => e.some(x => x.intensity >= 10) },
  { id:'chill',       name:'Chill Mode',     desc:'10x Intensität ≤ 3',          icon:'😌', check: e => e.filter(x => x.intensity <= 3).length >= 10 },
  { id:'consistent',  name:'Consistent',     desc:'20 Sessions Ø Intensität 5-7',icon:'🎯', check: e => e.length >= 20 && (() => { const a = e.reduce((s,x)=>s+x.intensity,0)/e.length; return a>=5&&a<=7; })() },
  // ── Wohlbefinden ──
  { id:'happy',       name:'Feel-Good',      desc:'Ø Wohlbefinden ≥ 8',          icon:'😊', check: e => e.length >= 5 && e.reduce((a,b)=>a+b.wellbeing,0)/e.length >= 8 },
  { id:'rough',       name:'Rough Night',    desc:'3x Wohlbefinden ≤ 3',         icon:'🥴', check: e => e.filter(x => x.wellbeing <= 3).length >= 3 },
  // ── Vielfalt ──
  { id:'variety',     name:'Vielseitig',     desc:'3 verschiedene Stoffe',       icon:'🎨', check: e => new Set(e.map(x=>x.drug)).size >= 3 },
  { id:'polyglot',    name:'Polyglot',       desc:'Alle 8 Substanzen probiert',  icon:'🌍', check: e => new Set(e.map(x=>x.drug)).size >= 8 },
  { id:'strains',     name:'Strain Hunter',  desc:'5 verschiedene Strains',      icon:'🔍', check: e => new Set(e.map(x=>x.strain)).size >= 5 },
  { id:'strain10',    name:'Strain Nerd',    desc:'10 verschiedene Strains',     icon:'🧬', check: e => new Set(e.map(x=>x.strain)).size >= 10 },
  // ── Cannabis ──
  { id:'kush5',       name:'Kush Master',    desc:'5x Cannabis geloggt',         icon:'🌿', check: e => e.filter(x=>x.drug==='cannabis').length >= 5 },
  { id:'kush20',      name:'Kush Lord',      desc:'20x Cannabis geloggt',        icon:'🍃', check: e => e.filter(x=>x.drug==='cannabis').length >= 20 },
  { id:'paranoid',    name:'Paranoia Club',  desc:'5x Effekt "paranoid" geloggt',icon:'👁️', check: e => e.filter(x=>x.moods&&x.moods.includes('paranoid')).length >= 5 },
  { id:'munchies',    name:'Munchies',       desc:'10x Effekt "hungrig" geloggt',icon:'🍕', check: e => e.filter(x=>x.moods&&x.moods.includes('hungrig')).length >= 10 },
  { id:'creative',    name:'Kreativkopf',    desc:'10x Effekt "kreativ" geloggt',icon:'🎨', check: e => e.filter(x=>x.moods&&x.moods.includes('kreativ')).length >= 10 },
  // ── MDMA ──
  { id:'mdma5',       name:'Rollin',         desc:'5x MDMA geloggt',             icon:'💊', check: e => e.filter(x=>x.drug==='mdma').length >= 5 },
  { id:'euphoria',    name:'Pure Euphoria',  desc:'5x Effekt "euphorisch"',      icon:'🥳', check: e => e.filter(x=>x.moods&&x.moods.includes('euphorisch')).length >= 5 },
  // ── Psychedelika ──
  { id:'psych5',      name:'Third Eye',      desc:'5x Pilze oder LSD',           icon:'🔮', check: e => e.filter(x=>['lsd','psilocybin'].includes(x.drug)).length >= 5 },
  { id:'deeptrip',    name:'Deep Space',     desc:'Psychedelika mit High ≥ 9',   icon:'🌌', check: e => e.some(x=>['lsd','psilocybin'].includes(x.drug)&&x.intensity>=9) },
  // ── Alkohol ──
  { id:'booze5',      name:'Barfly',         desc:'5x Alkohol geloggt',          icon:'🍺', check: e => e.filter(x=>x.drug==='alkohol').length >= 5 },
  { id:'booze20',     name:'Stammgast',      desc:'20x Alkohol geloggt',         icon:'🍻', check: e => e.filter(x=>x.drug==='alkohol').length >= 20 },
  // ── Noten ──
  { id:'journalist',  name:'Journalist',     desc:'20 Sessions mit Notiz',       icon:'📝', check: e => e.filter(x=>x.note&&x.note.length>0).length >= 20 },
  { id:'novelist',    name:'Novelist',       desc:'Notiz mit 100+ Zeichen',      icon:'📖', check: e => e.some(x=>x.note&&x.note.length>=100) },
  // ── Spezial ──
  { id:'nightowl',    name:'Night Owl',      desc:'5 Sessions nach 23 Uhr',      icon:'🦉', check: e => e.filter(x=>new Date(x.ts).getHours()>=23).length >= 5 },
  { id:'earlybird',   name:'Early Bird',     desc:'3 Sessions vor 8 Uhr',        icon:'🌅', check: e => e.filter(x=>new Date(x.ts).getHours()<8).length >= 3 },
  { id:'weekend',     name:'Weekender',      desc:'10 Sessions am Wochenende',   icon:'🎉', check: e => e.filter(x=>{const d=new Date(x.ts).getDay();return d===0||d===6;}).length >= 10 },
];

const RANK_ICONS = ['🥇','🥈','🥉'];

// ── State ───────────────────────────────────
let profile = null;
let sessions = [];
let friends = [];
let notifications = [];
let filterMode = 'week';
let weekTimerInterval = null;

// ── Storage helpers ─────────────────────────
function save() {
  if (!profile) return;
  const id = profile.id || 'legacy';
  profile.id = id;
  localStorage.setItem('dxp_profile_' + id, JSON.stringify(profile));
  localStorage.setItem('dxp_sessions_' + id, JSON.stringify(sessions));
  localStorage.setItem('dxp_friends_' + id, JSON.stringify(friends));
  localStorage.setItem('dxp_notifs_' + id, JSON.stringify(notifications));
  // keep legacy key in sync for backwards compat
  localStorage.setItem('dxp_profile', JSON.stringify(profile));
}

function load() {
  // Load profile first
  try { profile = JSON.parse(localStorage.getItem('dxp_profile')) || null; } catch(e) { profile = null; }
  if (profile && profile.id) {
    // Load profile-specific data
    const id = profile.id;
    try { sessions = JSON.parse(localStorage.getItem('dxp_sessions_' + id)) || []; } catch(e) { sessions = []; }
    try { friends  = JSON.parse(localStorage.getItem('dxp_friends_'  + id)) || []; } catch(e) { friends  = []; }
    try { notifications = JSON.parse(localStorage.getItem('dxp_notifs_' + id)) || []; } catch(e) { notifications = []; }
  } else {
    // Legacy fallback
    try { sessions = JSON.parse(localStorage.getItem('dxp_sessions')) || []; } catch(e) { sessions = []; }
    try { friends  = JSON.parse(localStorage.getItem('dxp_friends'))  || []; } catch(e) { friends  = []; }
    try { notifications = JSON.parse(localStorage.getItem('dxp_notifs')) || []; } catch(e) { notifications = []; }
  }
  loadCustomStrains();
  try { shownEggs = new Set(JSON.parse(localStorage.getItem('dxp_shown_eggs') || '[]')); } catch(e) { shownEggs = new Set(); }
}

// ── XP / Level helpers ───────────────────────
function calcXP(entry) {
  // --- Anti-Cheat Regeln ---
  // 1. Cooldown: weniger XP wenn letzte Session < 2h zurückliegt
  const now = Date.now();
  const lastSession = sessions[0];
  const timeSinceLast = lastSession ? (now - new Date(lastSession.ts).getTime()) / 3600000 : 99;
  
  // 2. Gleiche Droge in Folge: abnehmende XP (Toleranz-Mechanik)
  const lastSameDrug = sessions.filter(s => s.drug === entry.drug).slice(0, 3);
  const recentSameDrug = lastSameDrug.filter(s => 
    (now - new Date(s.ts).getTime()) < 24 * 3600000
  ).length;

  // 3. Heute schon zu viele Sessions (max 5 mit vollem XP)
  const todayCount = sessions.filter(s => {
    const d = new Date(s.ts);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  }).length;

  // Basis-XP
  let base = 10 + entry.intensity * 3 + entry.wellbeing * 2 + (entry.moods.length * 2);

  // Cooldown-Malus: < 2h = nur 30% XP
  if (timeSinceLast < 2) {
    base = Math.round(base * 0.3);
    entry._cheatNote = 'Cooldown aktiv (< 2h)';
  }
  // Toleranz-Malus: gleiche Droge mehrfach heute
  else if (recentSameDrug >= 2) {
    const factor = Math.max(0.2, 1 - (recentSameDrug - 1) * 0.3);
    base = Math.round(base * factor);
    entry._cheatNote = 'Toleranz-Malus aktiv';
  }
  // Tages-Cap: ab 6. Session nur noch 10% XP
  else if (todayCount >= 5) {
    base = Math.round(base * 0.1);
    entry._cheatNote = 'Tageslimit erreicht';
  }

  return Math.max(1, base);
}

function getLevel(xp) {
  const idx = LEVELS.findIndex(l => xp >= l.min && xp < l.max);
  return idx < 0 ? 5 : idx;
}

function getWeekStart() {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekXP(entries) {
  const weekStart = getWeekStart().getTime();
  return entries
    .filter(e => new Date(e.ts).getTime() >= weekStart)
    .reduce((sum, e) => sum + (e.xp || 0), 0);
}

function getWeekSessions(entries) {
  const weekStart = getWeekStart().getTime();
  return entries.filter(e => new Date(e.ts).getTime() >= weekStart).length;
}

// ── Profile setup ────────────────────────────
let selAvatar = '🌿';

function pickAv(el) {
  document.querySelectorAll('.av-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selAvatar = el.getAttribute('data-emoji') || el.textContent.trim();
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'XP-';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function createProfile() {
  const name = document.getElementById('setup-name').value.trim();
  if (!name) { showToast('Bitte Namen eingeben'); return; }

  profile = {
    name,
    avatar: selAvatar,
    code: generateCode(),
    xp: 0,
    id: Date.now().toString(36),
    createdAt: Date.now(),
  };

  sessions = [];
  friends = [];
  notifications = [];
  save();

  const ov2 = document.getElementById('setup-overlay');
  ov2.classList.add('hidden');
  ov2.style.display = '';
  document.getElementById('setup-new-form').style.display = 'none';
  initApp();
  nav('log');
  showToast('Willkommen, ' + name + '!');
}

function logout() {
  // Stop running intervals
  if (weekTimerInterval) { clearInterval(weekTimerInterval); weekTimerInterval = null; }
  profile = null;
  sessions = [];
  friends = [];
  notifications = [];
  showLoginScreen();
  showToast('Abgemeldet');
}

function showLoginScreen() {
  // Check if saved profiles exist
  const saved = getSavedProfiles();
  const overlay = document.getElementById('setup-overlay');
  const loginList = document.getElementById('login-profile-list');

  overlay.style.display = '';
  overlay.classList.remove('hidden');

  if (saved.length > 0) {
    // Show existing profiles to pick from
    document.getElementById('setup-existing').style.display = 'block';
    document.getElementById('setup-new-toggle').style.display = 'block';
    document.getElementById('setup-new-form').style.display = 'none';
    loginList.innerHTML = saved.map(p => `
      <div class="login-profile" onclick="loginAs('${p.key}')">
        <span style="font-size:26px">${p.avatar}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:#fff">${p.name}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4)">${p.xp} XP · Level ${getLevel(p.xp)+1}</div>
        </div>
        <span style="font-size:18px;color:rgba(255,255,255,0.3)">›</span>
      </div>`).join('');
  } else {
    document.getElementById('setup-existing').style.display = 'none';
    document.getElementById('setup-new-toggle').style.display = 'none';
    document.getElementById('setup-new-form').style.display = 'block';
  }
}

function getSavedProfiles() {
  const profiles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('dxp_profile_')) {
      try {
        const p = JSON.parse(localStorage.getItem(key));
        if (p && p.name) profiles.push({ ...p, key: key.replace('dxp_profile_', '') });
      } catch(e) {}
    }
  }
  // Also check legacy single profile (migrate if needed)
  try {
    const legacy = JSON.parse(localStorage.getItem('dxp_profile'));
    if (legacy && legacy.name) {
      const id = legacy.id || 'legacy';
      const alreadyMigrated = profiles.find(p => p.key === id);
      if (!alreadyMigrated) {
        const migrated = {...legacy, id};
        localStorage.setItem('dxp_profile_' + id, JSON.stringify(migrated));
        if (!localStorage.getItem('dxp_sessions_' + id)) {
          localStorage.setItem('dxp_sessions_' + id, localStorage.getItem('dxp_sessions') || '[]');
        }
        profiles.push({...migrated, key: id});
      }
    }
  } catch(e) {}
  return profiles;
}

function loginAs(key) {
  try {
    profile = JSON.parse(localStorage.getItem('dxp_profile_' + key));
    sessions = JSON.parse(localStorage.getItem('dxp_sessions_' + key) || '[]');
    friends = JSON.parse(localStorage.getItem('dxp_friends_' + key) || '[]');
    notifications = JSON.parse(localStorage.getItem('dxp_notifs_' + key) || '[]');
    customStrains = JSON.parse(localStorage.getItem('dxp_custom_strains') || '{}');
    const ov = document.getElementById('setup-overlay');
    ov.classList.add('hidden');
    ov.style.display = '';
    initApp();
    nav('log');
    showToast('Willkommen zurück, ' + profile.name + '!');
  } catch(e) {
    showToast('Fehler beim Laden');
  }
}

function toggleNewForm() {
  const form = document.getElementById('setup-new-form');
  const btn = document.getElementById('setup-new-toggle');
  const isHidden = form.style.display === 'none';
  form.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '↑ Abbrechen' : '+ Neues Profil erstellen';
}

function changeName() {
  const inp = document.getElementById('new-name-inp');
  const msg = document.getElementById('name-change-msg');
  const newName = inp.value.trim();

  // Validation
  if (!newName) {
    msg.style.color = '#E24B4A';
    msg.textContent = 'Bitte einen Namen eingeben.';
    return;
  }
  if (newName.length < 3) {
    msg.style.color = '#E24B4A';
    msg.textContent = 'Mindestens 3 Zeichen.';
    return;
  }
  if (newName === profile.name) {
    msg.style.color = '#E24B4A';
    msg.textContent = 'Das ist bereits dein Name.';
    return;
  }

  // Check locally if another saved profile has this name
  const saved = getSavedProfiles();
  const taken = saved.find(p => p.name.toLowerCase() === newName.toLowerCase() && p.id !== profile.id);
  if (taken) {
    document.getElementById('taken-name-display').textContent = newName;
    document.getElementById('name-taken-overlay').style.display = 'flex';
    inp.value = '';
    return;
  }

  // TODO: When Supabase is connected, check server-side uniqueness here
  // For now: local check only
  const oldName = profile.name;
  profile.name = newName;
  save();

  // Update only the parts that changed – don't call renderProfile()
  // because that would wipe the success message
  updateHeader();
  const pName = document.getElementById('p-name');
  if (pName) pName.textContent = newName;

  inp.value = '';
  msg.style.color = 'var(--green)';
  msg.textContent = '✓ Name geändert zu "' + newName + '"';
  setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
  showToast('Name geändert!');
}

function resetProfile() {
  // Nur Sessions, Friends, Notifs löschen – Profil bleibt
  sessions = [];
  friends = [];
  notifications = [];
  customStrains = {};
  profile.xp = 0;
  localStorage.removeItem('dxp_custom_strains');
  save();
  updateHeader();
  renderHistory();
  renderBoard();
  renderFriends();
  renderProfile();
  renderNotifs();
  nav('log');
  showToast('Alle Daten gelöscht');
}

function confirmReset() {
  document.getElementById('confirm-name').textContent = profile ? profile.name : '';
  const overlay = document.getElementById('confirm-overlay');
  overlay.style.display = 'flex';
}

function closeConfirm() {
  document.getElementById('confirm-overlay').style.display = 'none';
}

function doReset() {
  closeConfirm();
  resetProfile();
}

// ── App init ─────────────────────────────────
function initApp() {
  if (!profile) return;
  updateHeader();
  updateStrains();
  renderHistory();
  renderBoard();
  renderFriends();
  renderProfile();
  renderNotifs();
  startWeekTimer();
}

function updateHeader() {
  if (!profile) return;
  const lvlIdx = getLevel(profile.xp);
  const lv = LEVELS[lvlIdx];
  const pct = Math.min(100, Math.round((profile.xp - lv.min) / (lv.max - lv.min) * 100));
  document.getElementById('hdr-avatar').textContent = profile.avatar;
  document.getElementById('hdr-name').textContent = profile.name;
  document.getElementById('hdr-level').textContent = `Level ${lvlIdx + 1} · ${lv.name}`;
  document.getElementById('hdr-xp').textContent = profile.xp + ' XP';
  document.getElementById('hdr-xpbar').style.width = pct + '%';

  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  badge.style.display = unread > 0 ? 'flex' : 'none';
  badge.textContent = unread;
}

// ── Navigation ───────────────────────────────
function nav(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', ['log','history','board','friends','profile'][i] === screen);
  });
  if (screen === 'board') renderBoard();
  if (screen === 'profile') renderProfile();
  if (screen === 'notifs') { renderNotifs(); updateHeader(); }
}

// ── Session logging ──────────────────────────
// Sinnvolle Einheiten + Standardmengen pro Droge/Strain
const DRUG_UNITS = {
  cannabis:   { units: ['g','mg','Züge'], default_unit: 'g',     default_amount: 0.5,  placeholder: 'z.B. 0.5' },
  mdma:       { units: ['mg','Stück'],    default_unit: 'mg',    default_amount: 100,  placeholder: 'z.B. 100' },
  lsd:        { units: ['µg','Stück'],    default_unit: 'Stück', default_amount: 1,    placeholder: 'z.B. 1' },
  psilocybin: { units: ['g','mg'],        default_unit: 'g',     default_amount: 2,    placeholder: 'z.B. 2' },
  alkohol:    { units: ['Stück','ml','cl'],default_unit: 'Stück', default_amount: 1,    placeholder: 'z.B. 1' },
  kokain:     { units: ['mg','g','Lines'], default_unit: 'mg',   default_amount: 100,  placeholder: 'z.B. 100' },
  speed:      { units: ['mg','g','Stück'],default_unit: 'mg',    default_amount: 100,  placeholder: 'z.B. 100' },
  ketamin:    { units: ['mg','g','Lines'],default_unit: 'mg',    default_amount: 50,   placeholder: 'z.B. 50' },
  andere:     { units: ['Stück','mg','g','ml'], default_unit: 'Stück', default_amount: 1, placeholder: 'z.B. 1' },
};

// Spezifische Overrides für bestimmte Strains
const STRAIN_UNIT_OVERRIDES = {
  'Pille':    { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
  'Kristall': { unit: 'mg',    amount: 100,  placeholder: 'z.B. 100' },
  'Pappe':    { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
  'Liquid':   { unit: 'µg',    amount: 100,  placeholder: 'z.B. 100' },
  'Gel Tab':  { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
  'Pulver':   { unit: 'mg',    amount: 100,  placeholder: 'z.B. 100' },
  'Paste':    { unit: 'mg',    amount: 100,  placeholder: 'z.B. 100' },
  'Crystal':  { unit: 'mg',    amount: 50,   placeholder: 'z.B. 50' },
  'Crack':    { unit: 'mg',    amount: 100,  placeholder: 'z.B. 100' },
  'Lines':    { unit: 'Lines', amount: 1,   placeholder: 'z.B. 1' },
  'Bier':     { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
  'Shots':    { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
  'Sekt':     { unit: 'Stück', amount: 1,   placeholder: 'z.B. 1' },
};

function renderMoods() {
  const drug = document.getElementById('f-drug').value;
  const moods = DRUG_MOODS[drug] || DRUG_MOODS.andere;
  const grid = document.getElementById('mood-grid');
  grid.innerHTML = moods.map(m =>
    `<button class="mood" onclick="toggleMood(this)">${m}</button>`
  ).join('');
}

function updateUnits() {
  const drug = document.getElementById('f-drug').value;
  const strain = document.getElementById('f-strain').value;
  const cfg = DRUG_UNITS[drug] || DRUG_UNITS.andere;
  const override = STRAIN_UNIT_OVERRIDES[strain];

  const unitSel = document.getElementById('f-unit');
  const amountInp = document.getElementById('f-amount');

  // Einheiten aktualisieren
  const units = override ? [override.unit, ...cfg.units.filter(u => u !== override.unit)] : cfg.units;
  unitSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');

  // Standardmenge setzen (nur wenn leer)
  if (!amountInp.value) {
    amountInp.value = override ? override.amount : cfg.default_amount;
    amountInp.placeholder = override ? override.placeholder : cfg.placeholder;
  } else {
    amountInp.placeholder = override ? override.placeholder : cfg.placeholder;
  }
}

function updateStrains() {
  const drug = document.getElementById('f-drug').value;
  const sel = document.getElementById('f-strain');
  const strains = getStrains(drug);
  sel.innerHTML = strains.map(s => `<option value="${s}">${s}</option>`).join('');
  sel.innerHTML += `<option value="__custom__">+ Eigene Sorte...</option>`;
  updateUnits();
  renderMoods();
}

function handleStrainChange() {
  const sel = document.getElementById('f-strain');
  if (sel.value !== '__custom__') {
    updateUnits();
    return;
  }
  // custom strain eingabe
  {
    const name = prompt('Eigene Sorte eingeben:');
    if (name && name.trim()) {
      const trimmed = name.trim();
      const drug = document.getElementById('f-drug').value;
      if (!customStrains[drug]) customStrains[drug] = [];
      if (!customStrains[drug].includes(trimmed)) {
        customStrains[drug].push(trimmed);
        saveCustomStrains();
      }
      updateStrains();
      sel.value = trimmed;
    } else {
      sel.selectedIndex = 0;
    }
  }
}

function saveCustomStrains() {
  localStorage.setItem('dxp_custom_strains', JSON.stringify(customStrains));
}

function loadCustomStrains() {
  try { customStrains = JSON.parse(localStorage.getItem('dxp_custom_strains')) || {}; }
  catch(e) { customStrains = {}; }
}

function toggleMood(btn) { btn.classList.toggle('active'); }

function logSession() {
  const amount = parseFloat(document.getElementById('f-amount').value);
  if (!amount || amount <= 0) { showToast('Bitte Menge eingeben'); return; }

  const entry = {
    id: Date.now(),
    drug:      document.getElementById('f-drug').value,
    strain:    (() => { const v = document.getElementById('f-strain').value; return (!v || v === '__custom__') ? 'Unbekannt' : v; })(),
    amount,
    unit:      document.getElementById('f-unit').value,
    intensity: parseInt(document.getElementById('f-intensity').value),
    wellbeing: parseInt(document.getElementById('f-wellbeing').value),
    moods:     [...document.querySelectorAll('.mood.active')].map(b => b.textContent),
    note:      document.getElementById('f-note').value.trim(),
    ts:        new Date().toISOString(),
  };

  entry.xp = calcXP(entry);
  const prevLevel = getLevel(profile.xp);

  sessions.unshift(entry);
  profile.xp += entry.xp;

  const newLevel = getLevel(profile.xp);
  if (newLevel > prevLevel) {
    addNotif(`Level-Aufstieg! Du bist jetzt Level ${newLevel + 1} – ${LEVELS[newLevel].name} ${LEVELS[newLevel].icon}`);
  }
  // (visual level up handled after save)

  save();
  updateHeader();

  // Reset form
  document.getElementById('f-amount').value = '';
  document.getElementById('f-note').value = '';
  renderMoods(); // re-render clears selection
  document.getElementById('f-intensity').value = 5;
  document.getElementById('v-intensity').textContent = 5;
  document.getElementById('f-wellbeing').value = 7;
  document.getElementById('v-wellbeing').textContent = 7;

  // Check easter eggs
  checkEasterEggs(sessions);

  // Visual effects
  runParticles(entry.drug);
  showXpPopup(entry.xp);

  if (entry._cheatNote) {
    showToast(`+${entry.xp} XP · ${entry._cheatNote}`);
  } else {
    showToast(`+${entry.xp} XP verdient!`);
  }

  // Level up check with visual
  if (newLevel > prevLevel) {
    setTimeout(() => showLevelUp(newLevel), 600);
  }

  nav('history');
  renderHistory();
}

// ── History ──────────────────────────────────
function renderHistory() {
  const el = document.getElementById('history-list');
  if (!sessions.length) {
    el.innerHTML = '<div class="empty">Noch keine Sessions. Leg los!</div>';
    return;
  }
  el.innerHTML = sessions.map(e => `
    <div class="session-card">
      <div class="session-icon">${DRUG_ICONS[e.drug] || '✨'}</div>
      <div class="session-info">
        <div class="session-top">
          <span class="session-name">${e.strain || e.drug}</span>
          <span class="session-xp">+${e.xp} XP</span>
        </div>
        <div class="session-sub">
          ${e.amount}${e.unit} · High ${e.intensity}/10 · Wohl ${e.wellbeing}/10
          · ${new Date(e.ts).toLocaleString('de-DE', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
        </div>
        ${e.note ? `<div class="session-sub" style="margin-top:3px;font-style:italic">"${e.note}"</div>` : ''}
        ${e.moods.length ? `<div class="session-moods">${e.moods.map(m => `<span class="mood-tag">${m}</span>`).join('')}</div>` : ''}
      </div>
    </div>`).join('');
}

// ── Leaderboard ──────────────────────────────
function setFilter(mode, btn) {
  filterMode = mode;
  document.querySelectorAll('.fpill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBoard();
}

function renderBoard() {
  const el = document.getElementById('board-list');
  if (!profile) { el.innerHTML = '<div class="empty">Nicht eingeloggt</div>'; return; }

  const myXP    = filterMode === 'week' ? getWeekXP(sessions) : (profile.xp || 0);
  const mySess  = filterMode === 'week' ? getWeekSessions(sessions) : sessions.length;

  const all = [
    { name: profile.name, avatar: profile.avatar, xp: myXP, sessions: mySess, isMe: true },
    ...friends.map(f => ({
      name: f.name,
      avatar: f.avatar,
      xp: filterMode === 'week' ? (f.weekXp || 0) : (f.xp || 0),
      sessions: filterMode === 'week' ? (f.weekSessions || 0) : (f.sessions || 0),
      isMe: false,
    }))
  ].sort((a, b) => b.xp - a.xp);

  if (!all.length) { el.innerHTML = '<div class="empty">Noch niemand auf dem Board</div>'; return; }

  const maxXP = Math.max(...all.map(p => p.xp), 1);

  el.innerHTML = all.map((p, i) => `
    <div class="board-row ${p.isMe ? 'is-me' : ''}">
      <span class="rank">${i < 3 ? RANK_ICONS[i] : i + 1}</span>
      <span class="board-av">${p.avatar}</span>
      <div class="board-info">
        <div class="board-name">${p.name}${p.isMe ? ' (du)' : ''}</div>
        <div class="board-sub">${p.sessions} Sessions</div>
        <div class="week-bar-wrap">
          <div class="week-bar" style="width:${Math.round(p.xp / maxXP * 100)}%"></div>
        </div>
      </div>
      <span class="board-xp">${p.xp} XP</span>
    </div>`).join('');
}

function startWeekTimer() {
  if (weekTimerInterval) clearInterval(weekTimerInterval);
  function tick() {
    try {
      const now = new Date();
      const next = new Date(now);
      const day = now.getDay();
      const daysUntil = day === 0 ? 1 : (8 - day) % 7 || 7;
      next.setDate(now.getDate() + daysUntil);
      next.setHours(0, 0, 0, 0);
      const diff = next - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const el = document.getElementById('week-timer');
      if (el) el.textContent = (d > 0 ? d + 'T ' : '') +
        String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    } catch(e) {}
  }
  tick();
  weekTimerInterval = setInterval(tick, 1000);
}

// ── Friends ──────────────────────────────────
function copyCode() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(profile.code).then(() => showToast('Code kopiert!'));
  } else {
    showToast('Code: ' + profile.code);
  }
}

function addFriend() {
  const code = document.getElementById('friend-inp').value.trim().toUpperCase();
  const msg  = document.getElementById('friend-msg');
  if (!code) { msg.textContent = 'Bitte Code eingeben'; return; }
  if (code === profile.code) { msg.textContent = 'Das ist dein eigener Code!'; return; }
  if (friends.find(f => f.code === code)) { msg.textContent = 'Schon in deiner Liste'; return; }

  // Simulate finding a player – replace this with a Supabase lookup later
  const names   = ['GrasHopper','CloudNine','PurpleHaze','SkyWalker','MoonRocket','NightOwl'];
  const avatars  = ['🌙','⚗️','🎯','💊','🌿','🍄'];
  const r = Math.floor(Math.random() * names.length);
  const drugs = ['cannabis','mdma','lsd','psilocybin','alkohol'];
  const rDrug = drugs[Math.floor(Math.random() * drugs.length)];
  const rStrains = DEFAULT_STRAINS[rDrug] || ['unbekannt'];
  const rStrain = rStrains[Math.floor(Math.random() * rStrains.length)];
  const isOnline = Math.random() > 0.4;
  const newFriend = {
    id: 'f_' + Date.now(),
    name: names[r],
    avatar: avatars[r],
    code,
    xp: Math.round(Math.random() * 600 + 50),
    weekXp: Math.round(Math.random() * 200),
    sessions: Math.round(Math.random() * 20 + 1),
    weekSessions: Math.round(Math.random() * 5),
    online: isOnline,
    addedAt: Date.now(),
    lastDrug: {
      drug: rDrug,
      strain: rStrain,
      amount: rDrug === 'cannabis' ? (Math.random() * 1.5 + 0.3).toFixed(1) : Math.round(Math.random() * 150 + 50),
      unit: rDrug === 'cannabis' ? 'g' : 'mg',
      intensity: Math.round(Math.random() * 5 + 4),
      xp: Math.round(Math.random() * 30 + 15),
      ts: new Date(Date.now() - Math.random() * 7200000).toISOString(),
    },
  };

  friends.push(newFriend);
  save();
  const fInp = document.getElementById('friend-inp');
  fInp.value = '';
  fInp.blur(); // dismiss keyboard on mobile
  msg.textContent = '';
  renderFriends();
  renderBoard();

  // Local notification – when Supabase is live, this will also
  // send a real push to the friend's device
  addNotif(`🤝 Du hast ${newFriend.name} als Freund hinzugefügt! Dein Code wurde geteilt.`);

  // Simulate: friend "added you back" after a short delay
  setTimeout(() => {
    addNotif(`👋 ${newFriend.name} hat deinen Invite-Code akzeptiert und ist jetzt in deiner Freundesliste!`);
    updateHeader();
  }, 2000);

  showToast(newFriend.name + ' hinzugefügt!');
}

function removeFriend(id) {
  friends = friends.filter(f => f.id !== id);
  save();
  renderFriends();
  renderBoard();
}

function getTimeAgo(ts) {
  if (!ts) return '';
  const parsed = new Date(ts).getTime();
  if (isNaN(parsed)) return '';
  const diff = Date.now() - parsed;
  if (diff < 0) return 'gerade eben';
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

function renderFriends() {
  if (!profile) return;
  document.getElementById('my-code').textContent = profile.code;
  document.getElementById('friend-count').textContent = friends.length;

  const el = document.getElementById('friend-list');
  if (!friends.length) {
    el.innerHTML = '<div class="empty">Noch keine Freunde. Teile deinen Code!</div>';
    return;
  }
  el.innerHTML = friends.map(f => {
    const lastDrug = f.lastDrug;
    const lastDrugIcon = lastDrug ? (DRUG_ICONS[lastDrug.drug] || '✨') : null;
    const timeAgo = lastDrug ? getTimeAgo(lastDrug.ts) : null;
    const statusText = f.online
      ? (lastDrug ? `chillt gerade mit ${lastDrug.strain || lastDrug.drug}` : 'online')
      : (lastDrug ? `zuletzt: ${lastDrug.strain || lastDrug.drug}` : 'noch nichts geloggt');

    return `<div class="friend-card">
      <div class="friend-row">
        <div style="position:relative">
          <span class="friend-av">${f.avatar}</span>
          ${f.online ? '<span class="friend-online-ring"></span>' : ''}
        </div>
        <div class="friend-info">
          <div class="friend-row" style="gap:6px">
            <span class="friend-name">${f.name}</span>
            ${f.online ? '<span class="online-dot"></span>' : ''}
          </div>
          <div class="friend-sub">${f.xp} XP · Level ${getLevel(f.xp||0)+1}</div>
        </div>
        <button class="btn-sm" style="font-size:12px;color:#E24B4A;border-color:#E24B4A"
          onclick="removeFriend('${f.id}')">✕</button>
      </div>

      ${lastDrug ? `
      <div class="friend-last-session">
        <span style="font-size:18px">${lastDrugIcon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text)">${lastDrug.strain || lastDrug.drug}</div>
          <div style="font-size:11px;color:var(--text-3)">${lastDrug.amount}${lastDrug.unit} · High ${lastDrug.intensity}/10 · ${timeAgo}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:12px;font-weight:700;color:var(--green)">+${lastDrug.xp} XP</div>
          ${f.online ? '<div style="font-size:10px;color:var(--green);margin-top:1px">🟢 aktiv</div>' : ''}
        </div>
      </div>` : `
      <div style="font-size:12px;color:var(--text-3);margin-top:8px;padding-top:8px;border-top:0.5px solid var(--border)">
        Noch nichts geloggt
      </div>`}

      <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
        <span style="font-size:11px;color:var(--text-3);min-width:50px">Diese Woche</span>
        <div class="week-bar-wrap" style="flex:1">
          <div class="week-bar" style="width:${Math.round((f.weekXp || 0) / 250 * 100)}%"></div>
        </div>
        <span style="font-size:12px;font-weight:600;color:var(--green)">${f.weekXp || 0} XP</span>
      </div>
    </div>`;
  }).join('');
}

// ── Profile screen ───────────────────────────
function renderProfile() {
  if (!profile) return;
  // Pre-fill name change input placeholder
  const nameInp = document.getElementById('new-name-inp');
  if (nameInp) {
    nameInp.placeholder = 'z.B. ' + profile.name;
    nameInp.value = '';
    const msg2 = document.getElementById('name-change-msg');
    if (msg2) msg2.textContent = '';
  }
  const lvlIdx = getLevel(profile.xp);
  const lv = LEVELS[lvlIdx];
  const pct = Math.min(100, Math.round((profile.xp - lv.min) / (lv.max - lv.min) * 100));

  document.getElementById('p-avatar').textContent = profile.avatar;
  document.getElementById('p-name').textContent = profile.name;
  document.getElementById('p-level').textContent = `Level ${lvlIdx + 1} · ${lv.name}`;
  document.getElementById('p-xpbar').style.width = pct + '%';
  document.getElementById('p-xp-label').textContent = `${profile.xp} / ${lv.max} XP`;

  document.getElementById('s-total').textContent = sessions.length;
  document.getElementById('s-xp').textContent = profile.xp;

  if (sessions.length) {
    const avg = sessions.reduce((a, b) => a + b.intensity, 0) / sessions.length;
    document.getElementById('s-avg').textContent = avg.toFixed(1);
    const counts = {};
    sessions.forEach(e => counts[e.drug] = (counts[e.drug] || 0) + 1);
    const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('s-fav').textContent = fav ? fav[0] : '–';
  }

  document.getElementById('badge-grid').innerHTML = BADGES_DEF.map(b => {
    const unlocked = b.check(sessions, profile);
    return `<div class="badge-item ${unlocked ? 'unlocked' : ''}" title="${b.desc}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      ${unlocked ? '<div class="badge-check">✓</div>' : ''}
    </div>`;
  }).join('');
}

// ── Notifications ─────────────────────────────
function addNotif(text) {
  notifications.unshift({ id: Date.now(), text, time: new Date().toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'}), read: false });
  save();
  updateHeader();
}

function markAllRead() {
  notifications.forEach(n => n.read = true);
  save();
  renderNotifs();
  updateHeader();
}

function renderNotifs() {
  const el = document.getElementById('notif-list');
  if (!notifications.length) {
    el.innerHTML = '<div class="empty">Keine Benachrichtigungen</div>';
    return;
  }
  el.innerHTML = `<div class="notif-wrap">` + notifications.map(n => `
    <div class="notif-item" onclick="readNotif(${n.id})">
      <div class="notif-dot ${n.read ? 'read' : ''}"></div>
      <div>
        <div class="notif-text" style="${n.read ? 'color:var(--text-2)' : ''}">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join('') + `</div>`;
}

function readNotif(id) {
  const n = notifications.find(x => x.id === id);
  if (n) { n.read = true; save(); renderNotifs(); updateHeader(); }
}

// ── Toast ────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Service Worker registration ──────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── Particle System ─────────────────────────
const PARTICLES = {
  cannabis:   { chars: ['💨','🌫️','○','◌'], color: '#5DCAA5', count: 18, speed: 1.2 },
  psilocybin: { chars: ['✦','★','◆','✧'], color: '#7F77DD', count: 22, speed: 0.8 },
  lsd:        { chars: ['✦','◈','⬡','✧'], color: '#D4537E', count: 25, speed: 0.6 },
  mdma:       { chars: ['♥','✦','★','·'], color: '#EF9F27', count: 20, speed: 1.0 },
  kokain:     { chars: ['*','·','❄','✦'], color: '#B5D4F4', count: 30, speed: 2.2 },
  speed:      { chars: ['⚡','·','✦','*'], color: '#FAC775', count: 24, speed: 2.5 },
  ketamin:    { chars: ['◌','○','·','◦'], color: '#85B7EB', count: 16, speed: 0.5 },
  alkohol:    { chars: ['🍺','○','·','◦'], color: '#EF9F27', count: 12, speed: 1.4 },
  andere:     { chars: ['✦','·','★','◌'], color: '#9FE1CB', count: 15, speed: 1.0 },
};

function runParticles(drug) {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const cfg = PARTICLES[drug] || PARTICLES.andere;
  const particles = [];

  for (let i = 0; i < cfg.count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 60,
      char: cfg.chars[Math.floor(Math.random() * cfg.chars.length)],
      size: 14 + Math.random() * 18,
      vx: (Math.random() - 0.5) * 1.8,
      vy: -(cfg.speed + Math.random() * 1.8),
      alpha: 0.9 + Math.random() * 0.1,
      decay: 0.008 + Math.random() * 0.006,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03 + Math.random() * 0.03,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive = true;
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.alpha -= p.decay;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.font = `${p.size}px serif`;
      ctx.fillStyle = cfg.color;
      ctx.textAlign = 'center';
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    if (alive && frame < 180) { frame++; requestAnimationFrame(animate); }
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// ── Floating XP popup ────────────────────────
function showXpPopup(xp) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.textContent = '+' + xp + ' XP';
  const pill = document.getElementById('hdr-xp');
  const rect = pill ? pill.getBoundingClientRect() : null;
  // Only show if header is visible
  if (!rect || rect.top < 0 || rect.width === 0) return;
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = rect.top + 'px';
  el.style.transform = 'translateX(-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);

  // bounce the avatar
  const av = document.getElementById('hdr-avatar');
  av.classList.remove('bounce');
  void av.offsetWidth;
  av.classList.add('bounce');

  // pop the XP pill
  const xpPill = document.getElementById('hdr-xp');
  xpPill.classList.remove('pop');
  void xpPill.offsetWidth;
  xpPill.classList.add('pop');
}

// ── Level Up UI ──────────────────────────────
function showLevelUp(lvlIdx) {
  const lv = LEVELS[lvlIdx];
  document.getElementById('lu-icon').textContent = lv.icon;
  document.getElementById('lu-name').textContent = lv.name;
  document.getElementById('lu-sub').textContent = `Du bist jetzt Level ${lvlIdx + 1}`;
  document.getElementById('levelup-overlay').classList.add('show');
  // mini fireworks
  setTimeout(() => runParticles('lsd'), 300);
}

function closeLevelUp() {
  document.getElementById('levelup-overlay').classList.remove('show');
}

// ── Disclaimer ───────────────────────────
function showDisclaimer(onAccepted) {
  // Skip if already accepted this session
  if (sessionStorage.getItem('disc_ok')) { onAccepted(); return; }

  const el = document.getElementById('disclaimer-screen');
  el.classList.remove('disclaimer-hidden');
  el.classList.remove('disclaimer-out');
  _disclaimerSkipCb = onAccepted;

  document.getElementById('disc-accept').onclick = () => {
    sessionStorage.setItem('disc_ok', '1');
    el.classList.add('disclaimer-out');
    setTimeout(() => { el.classList.add('disclaimer-hidden'); onAccepted(); }, 400);
  };
}

let _disclaimerSkipCb = null;
function skipDisclaimer() {
  const el = document.getElementById('disclaimer-screen');
  el.classList.add('disclaimer-out');
  setTimeout(() => {
    el.classList.add('disclaimer-hidden');
    if (_disclaimerSkipCb) _disclaimerSkipCb();
  }, 400);
}

// ── Audio Engine ──────────────────────────
function createLighterSound(ctx) {
  // Flint spark: short white noise burst + click
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    const t = i / ctx.sampleRate;
    // spark noise fading out fast
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.6;
    // add a low click at the start
    if (i < 200) data[i] += (Math.random() - 0.5) * 0.4;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  // highpass to make it sparkly
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  src.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  // Then: flame whoosh ~80ms later
  setTimeout(() => {
    const bufSize2 = ctx.sampleRate * 0.3;
    const buf2 = ctx.createBuffer(1, bufSize2, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < bufSize2; i++) {
      const t = i / ctx.sampleRate;
      d2[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.3;
    }
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.8, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    src2.connect(lp);
    lp.connect(g2);
    g2.connect(ctx.destination);
    src2.start();
  }, 80);
}

function createBingSound(ctx) {
  // Clean sine tone bing – triangle wave feel
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);

  // Add a subtle harmonic
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1320, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.3);
  g2.gain.setValueAtTime(0, ctx.currentTime);
  g2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc2.connect(g2);
  g2.connect(ctx.destination);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.8);
}

// ── Splash Screen ─────────────────────────
function runSplash(onDone) {
  const splash = document.getElementById('splash');
  const tapScreen = document.getElementById('tap-screen');
  const s1 = document.getElementById('splash-screen1');
  const s2 = document.getElementById('splash-screen2');
  const canvas = document.getElementById('splash-canvas');
  const ctx2d = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Wait for tap to unlock audio
  tapScreen.addEventListener('click', () => {
    tapScreen.style.transition = 'opacity 0.3s';
    tapScreen.style.opacity = '0';
    setTimeout(() => {
      tapScreen.classList.add('hidden');
      // Show disclaimer first, then start intro
      showDisclaimer(() => startIntro());
    }, 300);
  }, { once: true });

  function startIntro() {
    // Init Web Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Smoke particles
    const particles = [];
    function spawnSmoke() {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 70,
          y: canvas.height / 2 - 90,
          vx: (Math.random() - 0.5) * 0.9,
          vy: -(0.5 + Math.random() * 0.7),
          size: 8 + Math.random() * 16,
          alpha: 0.3 + Math.random() * 0.2,
          decay: 0.003 + Math.random() * 0.003,
        });
      }
    }

    let smokeTimer = setInterval(spawnSmoke, 100);
    let animFrame;
    function drawSmoke() {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.35;
        p.alpha -= p.decay;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(93,202,165,${Math.max(0, p.alpha)})`;
        ctx2d.fill();
      }
      animFrame = requestAnimationFrame(drawSmoke);
    }
    drawSmoke();

    // Screen 1: MindHoliday
    s1.style.transition = 'opacity 0.5s';
    s1.style.opacity = '1';
    s1.classList.add('active');

    // 🔥 Lighter sound at start
    setTimeout(() => createLighterSound(audioCtx), 100);

    // Fade out screen 1
    setTimeout(() => {
      s1.style.transition = 'opacity 0.5s';
      s1.style.opacity = '0';
      clearInterval(smokeTimer);
    }, 2400);

    // Screen 2: Valkor Tec Games
    setTimeout(() => {
      s1.classList.remove('active');
      s2.style.transition = 'opacity 0.6s';
      s2.style.opacity = '1';
      s2.classList.add('active');
      // 🔔 Bing sound
      createBingSound(audioCtx);
    }, 2900);

    // Fade out screen 2
    setTimeout(() => {
      s2.style.transition = 'opacity 0.5s';
      s2.style.opacity = '0';
    }, 4000);

    // Done – show app
    setTimeout(() => {
      cancelAnimationFrame(animFrame);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      splash.classList.add('hidden');
      onDone();
    }, 4600);
  }
}

// ── Easter Eggs ───────────────────────────
const EASTER_EGGS = [
  {
    id: 'marylize',
    title: 'Marylize Leguana',
    icon: '🦎',
    text: 'Du hast insgesamt über 20g Cannabis geloggt. Die Leguana ist stolz auf dich.',
    btn: 'Get it 🌿',
    hint: 'ein seltenes Reptil grüßt dich',
    check: (sessions) => {
      const total = sessions
        .filter(s => s.drug === 'cannabis' && s.unit === 'g')
        .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      return total >= 20;
    },
  },
  {
    id: 'jawbreaker',
    title: 'Jawbreaker',
    icon: '💀',
    text: 'Du hast 5x "jaw tension" als Effekt geloggt. Dein Kiefer ruft nach dir.',
    btn: 'Ich weiss...',
    hint: 'magnesium hilft übrigens',
    check: (sessions) =>
      sessions.filter(s => s.moods && s.moods.some(m => m.toLowerCase().includes('jaw'))).length >= 5,
  },
  {
    id: 'philosopher',
    title: 'Der Philosoph',
    icon: '🧠',
    text: 'Du hast 10x "tiefgründig" geloggt. Sokrates wäre stolz.',
    btn: 'Ich denke, also bin ich high',
    hint: 'cogito ergo sum',
    check: (sessions) =>
      sessions.filter(s => s.moods && s.moods.includes('tiefgründig')).length >= 10,
  },
  {
    id: 'nightcrawler',
    title: 'Night Crawler',
    icon: '🌑',
    text: 'Du hast 10 Sessions nach Mitternacht geloggt. Die Nacht gehört dir.',
    btn: 'Schlaf ist für Schwache',
    hint: 'gute nacht... oder auch nicht',
    check: (sessions) =>
      sessions.filter(s => new Date(s.ts).getHours() >= 0 && new Date(s.ts).getHours() < 4).length >= 10,
  },
  {
    id: 'munchieking',
    title: 'Munchie King 👑',
    icon: '🍕',
    text: 'Du hast 20x "hungrig" geloggt. McDonalds sollte dich sponsorn.',
    btn: 'I'm lovin' it',
    hint: 'die kartoffeln rufen',
    check: (sessions) =>
      sessions.filter(s => s.moods && s.moods.includes('hungrig')).length >= 20,
  },
  {
    id: 'polyglot',
    title: 'Der Entdecker',
    icon: '🗺️',
    text: 'Du hast alle 8 Substanzen ausprobiert. Respekt oder Sorge – wir urteilen nicht.',
    btn: 'Wissen ist Macht',
    hint: 'valkor tec games we don't work with the police',
    check: (sessions) => new Set(sessions.map(s => s.drug)).size >= 8,
  },
  {
    id: 'speedrun',
    title: 'Speedrunner',
    icon: '⚡',
    text: 'Du hast 3 Sessions am selben Tag vor 8 Uhr morgens geloggt. Das ist... beeindruckend.',
    btn: 'Any% run',
    hint: 'geh schlafen',
    check: (sessions) => {
      const byDay = {};
      sessions.forEach(s => {
        const h = new Date(s.ts).getHours();
        if (h < 8) {
          const day = new Date(s.ts).toDateString();
          byDay[day] = (byDay[day] || 0) + 1;
        }
      });
      return Object.values(byDay).some(v => v >= 3);
    },
  },
  {
    id: 'paranoidandroid',
    title: 'Paranoid Android',
    icon: '👁️',
    text: 'Du hast 10x "paranoid" geloggt. Sie beobachten dich nicht. Wahrscheinlich.',
    btn: 'Ich vertraue niemandem',
    hint: '...oder doch?',
    check: (sessions) =>
      sessions.filter(s => s.moods && s.moods.includes('paranoid')).length >= 10,
  },
];

let shownEggs = new Set(JSON.parse(localStorage.getItem('dxp_shown_eggs') || '[]'));

function checkEasterEggs(sessions) {
  for (const egg of EASTER_EGGS) {
    if (!shownEggs.has(egg.id) && egg.check(sessions)) {
      shownEggs.add(egg.id);
      localStorage.setItem('dxp_shown_eggs', JSON.stringify([...shownEggs]));
      setTimeout(() => showEgg(egg), 1200);
      break; // show one at a time
    }
  }
}

function showEgg(egg) {
  document.getElementById('egg-icon').textContent = egg.icon;
  document.getElementById('egg-title').textContent = egg.title;
  document.getElementById('egg-text').textContent = egg.text;
  document.getElementById('egg-btn').textContent = egg.btn;
  document.getElementById('egg-hint').textContent = egg.hint;
  const overlay = document.getElementById('egg-overlay');
  overlay.style.display = 'flex';
  // run particles for fun
  runParticles('cannabis');
}

function closeEgg() {
  document.getElementById('egg-overlay').style.display = 'none';
}

// ── Boot ──────────────────────────────────────
load();

// Always show splash, then init app
runSplash(() => {
  if (!profile) {
    showLoginScreen();
  } else {
    const ov3 = document.getElementById('setup-overlay');
    ov3.classList.add('hidden');
    ov3.style.display = '';
    initApp();
  }
});
