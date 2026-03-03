// ─── Spotify Search ──────────────────────────────────────────
// Two modes:
// 1. Direct client credentials (VITE_SPOTIFY_CLIENT_ID + VITE_SPOTIFY_CLIENT_SECRET in .env)
// 2. Via Supabase Edge Function (Spotify creds stored as Supabase secrets)

import { supabase, isDemoMode } from './supabase'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

let cachedToken = null
let tokenExpiry = 0

// ─── Direct Spotify API (client credentials) ────────────────
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) throw new Error('Failed to get Spotify token')

  const data = await response.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

function mapTracks(items) {
  return items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    duration_ms: track.duration_ms,
    spotify_url: track.external_urls.spotify,
    album_art: track.album.images?.[0]?.url || '',
  }))
}

async function searchDirect(query, limit = 20) {
  const token = await getAccessToken()
  const params = new URLSearchParams({ q: query, type: 'track', limit: String(limit) })
  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Spotify search failed')
  const data = await response.json()
  return mapTracks(data.tracks?.items || [])
}

// ─── Via Supabase Edge Function ──────────────────────────────
async function searchViaEdgeFunction(query) {
  const { data, error } = await supabase.functions.invoke('search-songs', {
    body: { query },
  })
  if (error) throw error
  return data?.tracks || []
}

// ─── Public API ──────────────────────────────────────────────
export const hasDirectCredentials = Boolean(CLIENT_ID && CLIENT_SECRET)

export async function searchSpotify(query, limit = 20) {
  // Try direct API first if credentials exist
  if (hasDirectCredentials) {
    return searchDirect(query, limit)
  }

  // Otherwise try Supabase edge function
  if (!isDemoMode) {
    return searchViaEdgeFunction(query)
  }

  // No search available
  throw new Error('No Spotify search configured')
}
