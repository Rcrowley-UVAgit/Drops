// Demo data for testing without Supabase
export const demoUsers = [
  { id: '1', display_name: 'Ryan', avatar_url: null },
  { id: '2', display_name: 'Alex', avatar_url: null },
  { id: '3', display_name: 'Jordan', avatar_url: null },
  { id: '4', display_name: 'Sam', avatar_url: null },
  { id: '5', display_name: 'Taylor', avatar_url: null },
  { id: '6', display_name: 'Morgan', avatar_url: null },
]

export const demoGroup = {
  id: 'g1',
  name: 'The Aux Cord',
  drop_time: '12:00',
  cycle_order: ['1', '2', '3', '4', '5', '6'],
  cycle_index: 2,
  streak_count: 12,
}

export const demoSongs = [
  {
    id: 's1', title: 'Redbone', artist: 'Childish Gambino',
    album: 'Awaken, My Love!',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273647536e229ac8eee1cebd10e',
    spotify_track_id: '0wXuerDYiBnERgIpbb3JBR', duration_ms: 326933,
  },
  {
    id: 's2', title: 'Pink + White', artist: 'Frank Ocean',
    album: 'Blonde',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
    spotify_track_id: '3xKsf9qdS1CyvXSMEid6g8', duration_ms: 193120,
  },
  {
    id: 's3', title: 'Ivy', artist: 'Frank Ocean',
    album: 'Blonde',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
    spotify_track_id: '2ZWlPOoWh0626oTaHrnl2a', duration_ms: 249080,
  },
  {
    id: 's4', title: 'Nights', artist: 'Frank Ocean',
    album: 'Blonde',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
    spotify_track_id: '7eqoqGkKe8gLdEBMb0RHFA', duration_ms: 307507,
  },
  {
    id: 's5', title: 'HUMBLE.', artist: 'Kendrick Lamar',
    album: 'DAMN.',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699',
    spotify_track_id: '7KXjTSCq5nL1LoYtL7XAwS', duration_ms: 177000,
  },
  {
    id: 's6', title: 'Myth', artist: 'Beach House',
    album: 'Bloom',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b27388e87d22ab0a5dae09a21e9b',
    spotify_track_id: '0DPHOelJcJkBIbbaghrKFA', duration_ms: 245000,
  },
]

export const demoDrops = [
  {
    id: 'd1', group_id: 'g1', user_id: '3', song_id: 's1',
    caption: 'This groove is everything today',
    mood_tag: 'Late Night', submitted_at: new Date().toISOString(),
    drop_date: new Date().toISOString().split('T')[0],
    user: { display_name: 'Jordan', avatar_url: null },
    song: {
      title: 'Redbone', artist: 'Childish Gambino',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b273647536e229ac8eee1cebd10e',
      spotify_track_id: '0wXuerDYiBnERgIpbb3JBR',
    },
    reactions: [
      { id: 'r1', user_id: '1', reaction_type: 'listening' },
      { id: 'r2', user_id: '2', reaction_type: 'adding' },
      { id: 'r3', user_id: '5', reaction_type: 'classic' },
    ],
    comments: [
      { id: 'c1', user_id: '1', body: 'Absolute heater', created_at: new Date(Date.now() - 3600000).toISOString(), user: { display_name: 'Ryan' } },
      { id: 'c2', user_id: '4', body: 'Stay woke vibes fr', created_at: new Date(Date.now() - 1800000).toISOString(), user: { display_name: 'Sam' } },
    ],
  },
  {
    id: 'd2', group_id: 'g1', user_id: '1', song_id: 's2',
    caption: 'Sunny day, sunny song',
    mood_tag: 'Feel Good',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    drop_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    user: { display_name: 'Ryan', avatar_url: null },
    song: {
      title: 'Pink + White', artist: 'Frank Ocean',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
      spotify_track_id: '3xKsf9qdS1CyvXSMEid6g8',
    },
    reactions: [
      { id: 'r4', user_id: '2', reaction_type: 'repeat' },
      { id: 'r5', user_id: '3', reaction_type: 'new' },
    ],
    comments: [
      { id: 'c3', user_id: '2', body: 'Frank never misses', created_at: new Date(Date.now() - 80000000).toISOString(), user: { display_name: 'Alex' } },
    ],
  },
  {
    id: 'd3', group_id: 'g1', user_id: '5', song_id: 's5',
    caption: 'Need this energy rn',
    mood_tag: 'Hype',
    submitted_at: new Date(Date.now() - 172800000).toISOString(),
    drop_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    user: { display_name: 'Taylor', avatar_url: null },
    song: {
      title: 'HUMBLE.', artist: 'Kendrick Lamar',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699',
      spotify_track_id: '7KXjTSCq5nL1LoYtL7XAwS',
    },
    reactions: [
      { id: 'r6', user_id: '1', reaction_type: 'listening' },
      { id: 'r7', user_id: '3', reaction_type: 'classic' },
      { id: 'r8', user_id: '4', reaction_type: 'adding' },
    ],
    comments: [],
  },
  {
    id: 'd4', group_id: 'g1', user_id: '2', song_id: 's6',
    caption: 'dreamy',
    mood_tag: 'Reflective',
    submitted_at: new Date(Date.now() - 259200000).toISOString(),
    drop_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    user: { display_name: 'Alex', avatar_url: null },
    song: {
      title: 'Myth', artist: 'Beach House',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b27388e87d22ab0a5dae09a21e9b',
      spotify_track_id: '0DPHOelJcJkBIbbaghrKFA',
    },
    reactions: [
      { id: 'r9', user_id: '5', reaction_type: 'repeat' },
    ],
    comments: [
      { id: 'c4', user_id: '6', body: 'Beach House always hits different at night', created_at: new Date(Date.now() - 250000000).toISOString(), user: { display_name: 'Morgan' } },
    ],
  },
  {
    id: 'd5', group_id: 'g1', user_id: '4', song_id: 's3',
    caption: 'been thinking about this one all week',
    mood_tag: 'Heartbreak',
    submitted_at: new Date(Date.now() - 345600000).toISOString(),
    drop_date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    user: { display_name: 'Sam', avatar_url: null },
    song: {
      title: 'Ivy', artist: 'Frank Ocean',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
      spotify_track_id: '2ZWlPOoWh0626oTaHrnl2a',
    },
    reactions: [
      { id: 'r10', user_id: '1', reaction_type: 'repeat' },
      { id: 'r11', user_id: '6', reaction_type: 'listening' },
    ],
    comments: [],
  },
  {
    id: 'd6', group_id: 'g1', user_id: '6', song_id: 's4',
    caption: 'the beat switch tho',
    mood_tag: 'Late Night',
    submitted_at: new Date(Date.now() - 432000000).toISOString(),
    drop_date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
    user: { display_name: 'Morgan', avatar_url: null },
    song: {
      title: 'Nights', artist: 'Frank Ocean',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b2737b1b6f41c1645af9757d5616',
      spotify_track_id: '7eqoqGkKe8gLdEBMb0RHFA',
    },
    reactions: [
      { id: 'r12', user_id: '1', reaction_type: 'classic' },
      { id: 'r13', user_id: '3', reaction_type: 'listening' },
      { id: 'r14', user_id: '4', reaction_type: 'adding' },
      { id: 'r15', user_id: '5', reaction_type: 'repeat' },
    ],
    comments: [
      { id: 'c5', user_id: '1', body: 'The beat switch on this is god tier', created_at: new Date(Date.now() - 430000000).toISOString(), user: { display_name: 'Ryan' } },
      { id: 'c6', user_id: '3', body: 'Second half is a whole different song', created_at: new Date(Date.now() - 429000000).toISOString(), user: { display_name: 'Jordan' } },
    ],
  },
]

// Demo search results for the song search component
export const demoSearchResults = [
  { id: 'sr1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', album_art_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', spotify_track_id: '0VjIjW4GlUZAMYd2vXMi3b', duration_ms: 200040 },
  { id: 'sr2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', album_art_url: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946', spotify_track_id: '463CkQjx2Zk1yXoBuierM9', duration_ms: 203064 },
  { id: 'sr3', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', album_art_url: 'https://i.scdn.co/image/ab67616d0000b273712701c5e263efc8726b1464', spotify_track_id: '02MWAaffLxlfxAUY7c5dvx', duration_ms: 238805 },
  { id: 'sr4', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", album_art_url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0', spotify_track_id: '4LRPiXqCikLlN15c3yImP7', duration_ms: 167303 },
  { id: 'sr5', title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', album_art_url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', spotify_track_id: '0V3wPSX9ygBnCm8psDIegu', duration_ms: 200690 },
]

export const MOOD_TAGS = ['Hype', 'Reflective', 'Late Night', 'Feel Good', 'Heartbreak', 'Energy']

export const REACTION_TYPES = [
  { type: 'listening', emoji: '🎧', label: 'Listening Now' },
  { type: 'adding', emoji: '➕', label: 'Adding This' },
  { type: 'repeat', emoji: '🔁', label: 'Been On Repeat' },
  { type: 'new', emoji: '🌟', label: 'Never Heard This' },
  { type: 'classic', emoji: '👑', label: 'Classic' },
]
