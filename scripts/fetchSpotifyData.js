const fs = require('fs');
const path = require('path');

async function fetchSpotifyData() {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.warn('⚠️  Spotify credentials not configured. Skipping Spotify data fetch.');
      return null;
    }

    // Get Spotify access token using Client Credentials flow
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    console.log('🎵 Fetching Spotify access token...');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      console.error('❌ Failed to get Spotify token:', tokenResponse.statusText);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('🎵 Fetching currently playing track...');
    // Get currently playing track
    const playingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If user is not premium or no active device, return null
    if (playingResponse.status === 204 || !playingResponse.ok) {
      console.warn('⚠️  No track currently playing');
      return null;
    }

    const nowPlaying = await playingResponse.json();

    if (!nowPlaying.item) {
      console.warn('⚠️  No track data available');
      return null;
    }

    const track = nowPlaying.item;

    const spotifyData = {
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      albumArt: track.album.images[0]?.url || '',
      albumName: track.album.name,
      isPlaying: nowPlaying.is_playing,
      spotifyUrl: track.external_urls.spotify,
      duration: track.duration_ms,
      progress: nowPlaying.progress_ms || 0,
      fetchedAt: new Date().toISOString(),
    };

    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write data to public directory
    const dataPath = path.join(publicDir, 'spotify-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(spotifyData, null, 2));

    console.log('✅ Spotify data saved to public/spotify-data.json');
    console.log(`   Now playing: ${spotifyData.title} by ${spotifyData.artist}`);

    return spotifyData;
  } catch (error) {
    console.error('❌ Error fetching Spotify data:', error.message);
    return null;
  }
}

// Run the fetch function
fetchSpotifyData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
