import { supabase } from './supabase'

// ─── Auth & Onboarding ───────────────────────────────────────

export async function joinWithCode(inviteCode, displayName) {
  console.log('[JOIN] Starting...')

  // 1. Sign in anonymously
  console.log('[JOIN] signInAnonymously...')
  const { data: authData, error: authErr } = await supabase.auth.signInAnonymously()
  if (authErr) {
    console.error('[JOIN] auth error:', authErr.message)
    return { error: authErr }
  }
  const userId = authData.user.id
  console.log('[JOIN] auth OK, userId:', userId)

  // 2. Find group by invite code
  console.log('[JOIN] looking up group...')
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('id, name, cycle_order')
    .ilike('invite_code', inviteCode.trim())
    .single()

  if (groupErr || !group) {
    console.error('[JOIN] group lookup failed:', groupErr?.message || 'not found')
    await supabase.auth.signOut()
    return { error: { message: 'Invalid invite code' } }
  }
  console.log('[JOIN] group found:', group.name)

  // 3. Update profile display name (trigger already created the row)
  console.log('[JOIN] updating profile...')
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim() })
    .eq('id', userId)

  if (profileErr) {
    console.error('[JOIN] profile update error:', profileErr.message)
    // Non-fatal — continue with join
  }

  // 4. Join the group
  console.log('[JOIN] joining group...')
  const { error: memberErr } = await supabase
    .from('group_members')
    .upsert({ group_id: group.id, user_id: userId, role: 'member' }, { onConflict: 'group_id,user_id' })

  if (memberErr) {
    console.error('[JOIN] member insert error:', memberErr.message)
    await supabase.auth.signOut()
    return { error: memberErr }
  }

  // 5. Add to cycle_order if not already present
  const cycleOrder = group.cycle_order || []
  if (!cycleOrder.includes(userId)) {
    console.log('[JOIN] adding to cycle_order...')
    await supabase
      .from('groups')
      .update({ cycle_order: [...cycleOrder, userId] })
      .eq('id', group.id)
  }

  console.log('[JOIN] done!')
  return { data: { group: { id: group.id, name: group.name }, userId } }
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
