// Supabase Edge Function: search-songs
// Searches Spotify for tracks and returns formatted results.
// Falls back to MusicBrainz if Spotify fails.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getSpotifyToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return data.access_token;
}

async function searchSpotify(query: string, token: string) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.tracks.items.map((track: any) => ({
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
    album: track.album.name,
    album_art_url: track.album.images[0]?.url || null,
    spotify_track_id: track.id,
    duration_ms: track.duration_ms,
  }));
}

async function searchMusicBrainz(query: string) {
  const url = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=10`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Drops/1.0 (drops-music-app)" },
  });

  if (!response.ok) {
    throw new Error(`MusicBrainz search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.recordings.map((rec: any) => ({
    title: rec.title,
    artist: rec["artist-credit"]?.map((ac: any) => ac.name).join(", ") || "Unknown",
    album: rec.releases?.[0]?.title || "",
    album_art_url: rec.releases?.[0]?.id
      ? `https://coverartarchive.org/release/${rec.releases[0].id}/front-250`
      : null,
    spotify_track_id: null,
    musicbrainz_id: rec.id,
    duration_ms: rec.length || null,
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query parameter required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let tracks;
    try {
      const token = await getSpotifyToken();
      tracks = await searchSpotify(query, token);
    } catch (spotifyError) {
      console.warn("Spotify search failed, falling back to MusicBrainz:", spotifyError);
      tracks = await searchMusicBrainz(query);
    }

    return new Response(
      JSON.stringify({ tracks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
