import { supabase } from './supabase'

// ─── Auth & Onboarding ───────────────────────────────────────

export async function joinWithCode(inviteCode, displayName) {
  console.log('[JOIN] Starting joinWithCode...')

  // 1. Sign in anonymously
  let authData, authErr
  try {
    console.log('[JOIN] Calling signInAnonymously...')
    const result = await supabase.auth.signInAnonymously()
    console.log('[JOIN] signInAnonymously result:', result.error ? 'ERROR: ' + result.error.message : 'OK')
    authData = result.data
    authErr = result.error
  } catch (e) {
    console.error('[JOIN] signInAnonymously threw:', e)
    return { error: { message: e.message || 'Failed to connect. Check your internet connection.' } }
  }
  if (authErr) return { error: authErr }

  // 2. Call server-side function that handles profile + group join (bypasses RLS)
  let data, error
  try {
    console.log('[JOIN] Calling RPC join_group_with_code...')
    const result = await supabase.rpc('join_group_with_code', {
      p_invite_code: inviteCode,
      p_display_name: displayName,
    })
    console.log('[JOIN] RPC result:', result.error ? 'ERROR: ' + result.error.message : 'OK', result.data)
    data = result.data
    error = result.error
  } catch (e) {
    console.error('[JOIN] RPC threw:', e)
    await supabase.auth.signOut()
    return { error: { message: e.message || 'Failed to join group.' } }
  }

  if (error) {
    await supabase.auth.signOut()
    return { error }
  }

  if (data?.error) {
    await supabase.auth.signOut()
    return { error: { message: data.error } }
  }

  return { data: { group: { id: data.group_id, name: data.group_name }, userId: data.user_id } }
}

// ─── Profile ─────────────────────────────────────────────────

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

export async function updateProfile(displayName) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Not authenticated' } }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim() })
    .eq('id', user.id)

  return { error }
}

// ─── Group ───────────────────────────────────────────────────

export async function fetchUserGroup() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const { data: membership, error: memErr } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (memErr || !membership) return { data: null }

  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('id', membership.group_id)
    .single()

  if (groupErr) return { data: null, error: groupErr }

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role, profiles!user_id(id, display_name)')
    .eq('group_id', group.id)

  return {
    data: {
      ...group,
      members: (members || []).filter(m => m.profiles).map(m => ({
        id: m.profiles.id,
        display_name: m.profiles.display_name,
        color: '#BF6B4A',
        role: m.role,
      })),
    }
  }
}

// ─── Drops ───────────────────────────────────────────────────

function shapeDrop(drop) {
  return {
    id: drop.id,
    user_id: drop.user_id,
    group_id: drop.group_id,
    song: {
      id: drop.songs?.id,
      title: drop.songs?.title,
      artist: drop.songs?.artist,
      album: drop.songs?.album,
      album_art: drop.songs?.album_art_url,
      spotify_url: drop.songs?.spotify_track_id
        ? `https://open.spotify.com/track/${drop.songs.spotify_track_id}`
        : null,
      duration_ms: drop.songs?.duration_ms,
    },
    caption: drop.caption,
    mood_tag: drop.mood_tag,
    submitted_at: drop.submitted_at,
    drop_date: drop.drop_date,
    reactions: (drop.reactions || []).map(r => ({
      id: r.id,
      user_id: r.user_id,
      reaction_type: r.reaction_type,
    })),
    comments: (drop.comments || []).map(c => ({
      id: c.id,
      user_id: c.user_id,
      body: c.body,
      created_at: c.created_at,
    })),
  }
}

const DROP_SELECT = `
  id, group_id, user_id, caption, mood_tag, submitted_at, drop_date,
  songs(id, title, artist, album, album_art_url, spotify_track_id, duration_ms),
  reactions(id, user_id, reaction_type),
  comments(id, user_id, body, created_at)
`

export async function fetchTodayDrop(groupId) {
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

  const { data, error } = await supabase
    .from('drops')
    .select(DROP_SELECT)
    .eq('group_id', groupId)
    .eq('drop_date', today)
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .maybeSingle()

  if (error) return { data: null, error }
  if (!data) return { data: null }

  return { data: shapeDrop(data) }
}

export async function fetchDrops(groupId) {
  const today = new Date().toLocaleDateString('en-CA')

  const { data, error } = await supabase
    .from('drops')
    .select(DROP_SELECT)
    .eq('group_id', groupId)
    .lt('drop_date', today)
    .order('drop_date', { ascending: false })
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .limit(50)

  if (error) return { data: [], error }
  return { data: (data || []).map(shapeDrop) }
}

export async function fetchAllDrops(groupId) {
  const { data, error } = await supabase
    .from('drops')
    .select(DROP_SELECT)
    .eq('group_id', groupId)
    .order('drop_date', { ascending: false })
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .limit(100)

  if (error) return { data: [], error }
  return { data: (data || []).map(shapeDrop) }
}

export async function fetchMyDrops() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  const { data, error } = await supabase
    .from('drops')
    .select(DROP_SELECT)
    .eq('user_id', user.id)
    .order('drop_date', { ascending: false })
    .limit(50)

  if (error) return { data: [], error }
  return { data: (data || []).map(shapeDrop) }
}

// ─── Submit Drop ─────────────────────────────────────────────

export async function submitDrop(groupId, song, caption, moodTag) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Not authenticated' } }

  // Upsert song (by spotify track id)
  let songId
  if (song.spotify_url) {
    const trackId = song.spotify_url.split('/track/').pop()?.split('?')[0]

    const { data: existingSong } = await supabase
      .from('songs')
      .select('id')
      .eq('spotify_track_id', trackId)
      .single()

    if (existingSong) {
      songId = existingSong.id
    } else {
      const { data: newSong, error: songErr } = await supabase
        .from('songs')
        .insert({
          title: song.title,
          artist: song.artist,
          album: song.album || null,
          album_art_url: song.album_art || null,
          spotify_track_id: trackId || null,
          duration_ms: song.duration_ms || null,
        })
        .select('id')
        .single()

      if (songErr) return { error: songErr }
      songId = newSong.id
    }
  } else {
    const { data: newSong, error: songErr } = await supabase
      .from('songs')
      .insert({
        title: song.title,
        artist: song.artist,
        album: song.album || null,
        album_art_url: song.album_art || null,
        duration_ms: song.duration_ms || null,
      })
      .select('id')
      .single()

    if (songErr) return { error: songErr }
    songId = newSong.id
  }

  // Insert drop
  const { data: drop, error: dropErr } = await supabase
    .from('drops')
    .insert({
      group_id: groupId,
      user_id: user.id,
      song_id: songId,
      caption: caption || null,
      mood_tag: moodTag || null,
    })
    .select(DROP_SELECT)
    .single()

  if (dropErr) return { error: dropErr }

  // Fire-and-forget: notify group members via edge function
  supabase.functions.invoke('send-drop-notification', {
    body: {
      drop_id: drop.id,
      group_id: groupId,
      user_id: user.id,
      song_title: song.title,
      song_artist: song.artist,
    },
  }).catch(() => {}) // don't block on notification failure

  return { data: shapeDrop(drop) }
}

// ─── Reactions ───────────────────────────────────────────────

export async function toggleReaction(dropId, reactionType) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Not authenticated' } }

  // Check if already exists
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('drop_id', dropId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existing.id)
    return { data: { action: 'removed' }, error }
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({
        drop_id: dropId,
        user_id: user.id,
        reaction_type: reactionType,
      })
    return { data: { action: 'added' }, error }
  }
}

// ─── Comments ────────────────────────────────────────────────

export async function addComment(dropId, body) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      drop_id: dropId,
      user_id: user.id,
      body: body.trim(),
    })
    .select('id, user_id, body, created_at')
    .single()

  return { data, error }
}
