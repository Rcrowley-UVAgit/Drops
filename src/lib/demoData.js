// ─── Demo Users ───────────────────────────────────────────────
// "Lucas" is the logged-in demo user
export const demoUsers = {
  meek:   { id: 'meek',   display_name: 'Lucas',  color: '#f59e0b' },
  crow:   { id: 'crow',   display_name: 'Crow',   color: '#3b82f6' },
  morry:  { id: 'morry',  display_name: 'Morry',  color: '#ef4444' },
  freddy: { id: 'freddy', display_name: 'Freddy', color: '#8b5cf6' },
  chuck:  { id: 'chuck',  display_name: 'Chuck',  color: '#10b981' },
  bart:   { id: 'bart',   display_name: 'Bart',   color: '#f97316' },
  logi:   { id: 'logi',   display_name: 'Logi',   color: '#06b6d4' },
  pops:   { id: 'pops',   display_name: 'Pops',   color: '#84cc16' },
  mama:   { id: 'mama',   display_name: 'Mama',   color: '#ec4899' },
  johnny: { id: 'johnny', display_name: 'Johnny', color: '#a855f7' },
};

export const CURRENT_USER = demoUsers.meek;

// ─── Demo Groups ──────────────────────────────────────────────
export const demoGroups = [
  {
    id: 'uw-lads',
    name: 'UW Lads',
    members: ['crow', 'meek', 'morry', 'freddy', 'chuck', 'bart'],
    today_dropper: 'meek',
    drop_status: 'your_turn',
    today_drop: null,
    streak_count: 14,
    cycle_index: 1,
    description: '6 deep. No skips.',
  },
  {
    id: 'fam',
    name: 'Fam',
    members: ['meek', 'logi', 'pops', 'mama'],
    today_dropper: 'pops',
    drop_status: 'dropped',
    today_drop: {
      id: 'drop-fam-today',
      user_id: 'pops',
      song: {
        title: 'September',
        artist: 'Earth, Wind & Fire',
        album: 'The Best of Earth, Wind & Fire, Vol. 1',
        duration_ms: 215000,
        spotify_url: 'https://open.spotify.com/track/5nNmj1cLH3r4aA4XDJ2bgY',
        album_art: 'https://i.scdn.co/image/ab67616d0000b273f34e37a724185e6a87cc24bd',
      },
      caption: 'Pops never misses with this one',
      mood_tag: 'Feel Good',
      submitted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      reactions: [
        { user_id: 'meek', reaction_type: 'classic' },
        { user_id: 'logi', reaction_type: 'classic' },
        { user_id: 'mama', reaction_type: 'listening' },
        { user_id: 'meek', reaction_type: 'listening' },
      ],
      comments: [
        { id: 'c1', user_id: 'mama', body: 'Your father has taste', created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString() },
        { id: 'c2', user_id: 'logi', body: 'certified banger', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'c3', user_id: 'meek', body: 'W drop pops', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ],
    },
    streak_count: 8,
    cycle_index: 2,
    description: 'Family group chat but for music',
  },
  {
    id: 'beta',
    name: 'Beta',
    members: ['meek', 'johnny'],
    today_dropper: 'johnny',
    drop_status: 'waiting',
    today_drop: null,
    streak_count: 3,
    cycle_index: 1,
    description: 'Testing grounds',
  },
];

// ─── Past Drops ───────────────────────────────────────────────
export const demoPastDrops = {
  'uw-lads': [
    {
      id: 'drop-uw-1', user_id: 'crow', drop_date: '2026-03-02',
      song: { title: 'Money Trees', artist: 'Kendrick Lamar', album: 'good kid, m.A.A.d city', spotify_url: 'https://open.spotify.com/track/2HbKqm4o0w5wEeEFXm2s4y', album_art: 'https://i.scdn.co/image/ab67616d0000b273d28d2ebdedb220e479743797' },
      caption: 'Ya bish', mood_tag: 'Late Night', submitted_at: '2026-03-02T14:30:00Z',
      reactions: [ { user_id: 'meek', reaction_type: 'classic' }, { user_id: 'morry', reaction_type: 'repeat' }, { user_id: 'freddy', reaction_type: 'listening' }, { user_id: 'bart', reaction_type: 'classic' } ],
      comments: [ { id: 'c10', user_id: 'meek', body: 'This never gets old', created_at: '2026-03-02T15:00:00Z' }, { id: 'c11', user_id: 'bart', body: 'goated pick Crow', created_at: '2026-03-02T16:00:00Z' } ],
    },
    {
      id: 'drop-uw-2', user_id: 'freddy', drop_date: '2026-03-01',
      song: { title: 'Pink + White', artist: 'Frank Ocean', album: 'Blonde', spotify_url: 'https://open.spotify.com/track/3xKsf9qdS1CyvXSMEid6g8', album_art: 'https://i.scdn.co/image/ab67616d0000b2737005885df706891a3c182a57' },
      caption: 'needed this today', mood_tag: 'Reflective', submitted_at: '2026-03-01T11:15:00Z',
      reactions: [ { user_id: 'meek', reaction_type: 'listening' }, { user_id: 'crow', reaction_type: 'repeat' }, { user_id: 'chuck', reaction_type: 'adding' } ],
      comments: [ { id: 'c20', user_id: 'crow', body: 'Blonde is a masterpiece', created_at: '2026-03-01T12:00:00Z' } ],
    },
    {
      id: 'drop-uw-3', user_id: 'morry', drop_date: '2026-02-28',
      song: { title: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.', spotify_url: 'https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS', album_art: 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699' },
      caption: 'sit down', mood_tag: 'Hype', submitted_at: '2026-02-28T09:45:00Z',
      reactions: [ { user_id: 'meek', reaction_type: 'classic' }, { user_id: 'crow', reaction_type: 'classic' }, { user_id: 'freddy', reaction_type: 'listening' }, { user_id: 'bart', reaction_type: 'adding' }, { user_id: 'chuck', reaction_type: 'repeat' } ],
      comments: [],
    },
  ],
  'fam': [
    {
      id: 'drop-fam-1', user_id: 'mama', drop_date: '2026-03-02',
      song: { title: 'Golden Hour', artist: 'JVKE', album: 'this is what ____ feels like', spotify_url: 'https://open.spotify.com/track/5odlY52u43F5BjByhxg7wg', album_art: 'https://i.scdn.co/image/ab67616d0000b27332c7695d2d4b4c84b3804ad1' },
      caption: 'this song is so beautiful', mood_tag: 'Feel Good', submitted_at: '2026-03-02T16:00:00Z',
      reactions: [ { user_id: 'meek', reaction_type: 'adding' }, { user_id: 'pops', reaction_type: 'listening' }, { user_id: 'logi', reaction_type: 'new' } ],
      comments: [ { id: 'c30', user_id: 'pops', body: 'Good pick honey', created_at: '2026-03-02T17:00:00Z' } ],
    },
    {
      id: 'drop-fam-2', user_id: 'logi', drop_date: '2026-03-01',
      song: { title: 'Redbone', artist: 'Childish Gambino', album: 'Awaken My Love', spotify_url: 'https://open.spotify.com/track/0wXuerDYiBnERgIpbb3JBR', album_art: 'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25' },
      caption: 'stay woke', mood_tag: 'Late Night', submitted_at: '2026-03-01T10:30:00Z',
      reactions: [ { user_id: 'meek', reaction_type: 'classic' }, { user_id: 'mama', reaction_type: 'listening' } ],
      comments: [],
    },
  ],
  'beta': [
    {
      id: 'drop-beta-1', user_id: 'meek', drop_date: '2026-03-02',
      song: { title: 'Ivy', artist: 'Frank Ocean', album: 'Blonde', spotify_url: 'https://open.spotify.com/track/2ZWlPOoWh0626oTaHrnl2a', album_art: 'https://i.scdn.co/image/ab67616d0000b2737005885df706891a3c182a57' },
      caption: 'thought about this one all day', mood_tag: 'Reflective', submitted_at: '2026-03-02T10:30:00Z',
      reactions: [ { user_id: 'johnny', reaction_type: 'repeat' } ],
      comments: [ { id: 'c40', user_id: 'johnny', body: 'hard', created_at: '2026-03-02T11:00:00Z' } ],
    },
  ],
};

// ─── Demo Search Results ──────────────────────────────────────
export const demoSearchResults = [
  { id: 'sr-1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration_ms: 200040, spotify_url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b', album_art: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
  { id: 'sr-2', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration_ms: 238805, spotify_url: 'https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx', album_art: 'https://i.scdn.co/image/ab67616d0000b273712701c5e263efc8726b1464' },
  { id: 'sr-3', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration_ms: 203064, spotify_url: 'https://open.spotify.com/track/39LLxExYz6ewLAo9BFVV7V', album_art: 'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70bc4e6593f4f' },
  { id: 'sr-4', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration_ms: 167303, spotify_url: 'https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e', album_art: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' },
  { id: 'sr-5', title: 'Ivy', artist: 'Frank Ocean', album: 'Blonde', duration_ms: 249000, spotify_url: 'https://open.spotify.com/track/2ZWlPOoWh0626oTaHrnl2a', album_art: 'https://i.scdn.co/image/ab67616d0000b2737005885df706891a3c182a57' },
  { id: 'sr-6', title: 'Nights', artist: 'Frank Ocean', album: 'Blonde', duration_ms: 307000, spotify_url: 'https://open.spotify.com/track/7eqoqGkKwgOaWNNHx90uEZ', album_art: 'https://i.scdn.co/image/ab67616d0000b2737005885df706891a3c182a57' },
  { id: 'sr-7', title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration_ms: 200690, spotify_url: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIeLQ', album_art: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' },
  { id: 'sr-8', title: 'Myth', artist: 'Beach House', album: 'Bloom', duration_ms: 244000, spotify_url: 'https://open.spotify.com/track/2K4aEdgBp5Bv5muFweBkky', album_art: 'https://i.scdn.co/image/ab67616d0000b2731d52060e8e78ce5b5ef2e530' },
];

// ─── Constants ────────────────────────────────────────────────
export const MOOD_TAGS = ['Hype', 'Reflective', 'Late Night', 'Feel Good', 'Heartbreak', 'Energy'];

export const MOOD_COLORS = {
  'Hype':       { bg: 'rgba(239, 68, 68, 0.15)',  text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  'Reflective': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  'Late Night': { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  'Feel Good':  { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  'Heartbreak': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
  'Energy':     { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
};

export const REACTION_TYPES = [
  { type: 'listening', label: 'Listening' },
  { type: 'adding',    label: 'Adding' },
  { type: 'repeat',    label: 'On Repeat' },
  { type: 'new',       label: 'New to Me' },
  { type: 'classic',   label: 'Classic' },
];

// ─── Shotclock Utility ────────────────────────────────────────
export function getShotclock() {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const hours = pst.getHours();
  const minutes = pst.getMinutes();
  const seconds = pst.getSeconds();
  const START = 8, END = 24, TOTAL = (END - START) * 3600;

  if (hours < START) {
    const secsUntil = (START - hours) * 3600 - minutes * 60 - seconds;
    return { progress: 0, remaining: `Starts in ${Math.floor(secsUntil/3600)}h ${Math.floor((secsUntil%3600)/60)}m`, active: false, hours: Math.floor(secsUntil/3600), minutes: Math.floor((secsUntil%3600)/60), seconds: 0 };
  }
  const elapsed = (hours - START) * 3600 + minutes * 60 + seconds;
  if (elapsed >= TOTAL) return { progress: 1, remaining: 'Day ended', active: false, hours: 0, minutes: 0, seconds: 0 };
  const rem = TOTAL - elapsed, h = Math.floor(rem / 3600), m = Math.floor((rem % 3600) / 60), s = rem % 60;
  return { progress: elapsed / TOTAL, remaining: `${h}h ${m}m`, active: true, hours: h, minutes: m, seconds: s };
}

// ─── Helpers ──────────────────────────────────────────────────
export function getUser(id) {
  return demoUsers[id] || { id, display_name: id, color: '#6b7280' };
}
export function getGroupMembers(group) {
  return group.members.map(id => getUser(id));
}
export function formatTimeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function formatDuration(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
