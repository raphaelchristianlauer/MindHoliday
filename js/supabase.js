// ═══════════════════════════════════════════
//  MindHoliday – Supabase Client
//  !! DEINE KEYS HIER EINTRAGEN !!
// ═══════════════════════════════════════════

const SUPABASE_URL = 'https://bvgyyvbwbhhdigqxotrx.supabase.co';       // z.B. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_47BQSd9wjCRbWHmPNQZ1-A_TZzdB-M-';       // aus Settings → API

// ── Supabase SDK laden ──────────────────────
// Wird via CDN geladen (kein npm nötig)
let _sb = null;
function sb() {
  if (!_sb) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ── User ────────────────────────────────────
async function sbCreateUser(name, avatar, code) {
  const { data, error } = await sb()
    .from('users')
    .insert([{ name, avatar, code, xp: 0 }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function sbGetUserByCode(code) {
  const { data, error } = await sb()
    .from('users')
    .select('*')
    .eq('code', code)
    .single();
  if (error) return null;
  return data;
}

async function sbGetUserById(id) {
  const { data } = await sb()
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

async function sbCheckNameTaken(name) {
  const { data } = await sb()
    .from('users')
    .select('id')
    .ilike('name', name)
    .single();
  return !!data;
}

async function sbUpdateUser(id, updates) {
  const { error } = await sb()
    .from('users')
    .update({ ...updates, last_seen: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

async function sbUpdateXP(userId, xp) {
  await sb().from('users').update({ xp }).eq('id', userId);
}

// ── Sessions ─────────────────────────────────
async function sbSaveSession(userId, entry) {
  const { data, error } = await sb()
    .from('sessions')
    .insert([{
      user_id: userId,
      drug: entry.drug,
      strain: entry.strain,
      amount: entry.amount,
      unit: entry.unit,
      intensity: entry.intensity,
      wellbeing: entry.wellbeing,
      moods: entry.moods,
      note: entry.note || '',
      xp: entry.xp,
      cheat_note: entry._cheatNote || null,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function sbGetSessions(userId) {
  const { data, error } = await sb()
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data.map(s => ({
    ...s,
    ts: s.created_at,
    id: s.id,
  }));
}

async function sbGetFriendSessions(friendId, limit = 10) {
  const { data } = await sb()
    .from('sessions')
    .select('*')
    .eq('user_id', friendId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

async function sbDeleteAllSessions(userId) {
  await sb().from('sessions').delete().eq('user_id', userId);
}

// ── Friendships ──────────────────────────────
async function sbAddFriend(userId, friendId) {
  // Both directions
  await sb().from('friendships').insert([
    { user_id: userId, friend_id: friendId },
  ]);
}

async function sbGetFriends(userId) {
  const { data } = await sb()
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId);
  if (!data || !data.length) return [];

  const ids = data.map(f => f.friend_id);
  const { data: users } = await sb()
    .from('users')
    .select('*')
    .in('id', ids);
  return users || [];
}

async function sbRemoveFriend(userId, friendId) {
  await sb().from('friendships')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId);
}

// ── Leaderboard ──────────────────────────────
async function sbGetLeaderboard(userIds, mode = 'all') {
  if (mode === 'week') {
    const weekStart = new Date();
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    weekStart.setHours(0, 0, 0, 0);

    // Get weekly XP per user
    const { data } = await sb()
      .from('sessions')
      .select('user_id, xp')
      .in('user_id', userIds)
      .gte('created_at', weekStart.toISOString());

    const xpMap = {};
    (data || []).forEach(s => {
      xpMap[s.user_id] = (xpMap[s.user_id] || 0) + (s.xp || 0);
    });
    return xpMap;
  }
  return null;
}

// ── Notifications ─────────────────────────────
async function sbSendNotification(userId, text) {
  await sb().from('notifications').insert([{ user_id: userId, text }]);
}

async function sbGetNotifications(userId) {
  const { data } = await sb()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

async function sbMarkNotifRead(notifId) {
  await sb().from('notifications').update({ read: true }).eq('id', notifId);
}

async function sbMarkAllNotifsRead(userId) {
  await sb().from('notifications').update({ read: true })
    .eq('user_id', userId).eq('read', false);
}

// ── Realtime subscriptions ───────────────────
let _realtimeSubs = [];

function sbSubscribeToNotifications(userId, onNew) {
  const sub = sb()
    .channel('notifications:' + userId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, payload => onNew(payload.new))
    .subscribe();
  _realtimeSubs.push(sub);
}

function sbSubscribeToFriendSessions(friendIds, onNew) {
  if (!friendIds.length) return;
  const sub = sb()
    .channel('friend-sessions')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'sessions',
      filter: `user_id=in.(${friendIds.join(',')})`,
    }, payload => onNew(payload.new))
    .subscribe();
  _realtimeSubs.push(sub);
}

function sbUnsubscribeAll() {
  _realtimeSubs.forEach(s => s.unsubscribe());
  _realtimeSubs = [];
}

// ── Easter Eggs & Badges ─────────────────────
async function sbUnlockEgg(userId, eggId) {
  await sb().from('easter_eggs')
    .upsert([{ user_id: userId, egg_id: eggId }], { onConflict: 'user_id,egg_id' });
}

async function sbGetUnlockedEggs(userId) {
  const { data } = await sb()
    .from('easter_eggs')
    .select('egg_id')
    .eq('user_id', userId);
  return (data || []).map(e => e.egg_id);
}
