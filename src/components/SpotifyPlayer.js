import { useEffect, useState } from "react";
import record_needle from "./images/record_needle.png"

//make scrubbing smoother
//make it so progress doesnt update unless scrubbing is happening

const SpotifyPlayer = ({ token }) => {
  const [track, setTrack] = useState(null);
  const [songImage, setSongImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [spotifyImage, setSpotifyImage] = useState("spotify_song_image")
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isDragging) return;
    const fetchCurrentTrack = async () => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me/player", { // gets the data for the current song playing 
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch player state");
        }
  
        const data = await response.json();
        if (!data || !data.item) {
          setTrack(null);
          setIsPlaying(false);
          setSpotifyImage("spotify_song_image_paused"); // Default to paused state
          return;
        }
  
        // Update track info
        setTrack(data.item);
        setSongImage(data.item.album.images[0].url);
        setDuration(data.item.duration_ms);
        if (!isDragging) setProgress(data.progress_ms); 
  
        // Update play/pause state
        const isCurrentlyPlaying = data.is_playing;
        setIsPlaying(isCurrentlyPlaying);
        setSpotifyImage(isCurrentlyPlaying ? "spotify_song_image" : "spotify_song_image_paused");
        
      } catch (error) {
        console.error("Error Fetching Current Track: ", error);
      }
    };
  
    // Fetch the track immediately and refresh every second
    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 1000);
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [token, isDragging]);
  

  const playPause = async () => {
    try {
      // Fetch current playback state to check if a track is playing
      const playbackStateResponse = await fetch("https://api.spotify.com/v1/me/player", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const playbackState = await playbackStateResponse.json();

      // Determine the action based on whether a track is playing
      const action = playbackState.is_playing ? 'pause' : 'play';
      // Make the request to play/pause
      const playPauseResponse = await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //set the pause and play button respective to what action is
      if (action == "pause") {
        setIsPlaying(false)
        setSpotifyImage("spotify_song_image_paused")
      } else {
        setIsPlaying(true)
        setSpotifyImage("spotify_song_image")
      }

      //Console errors if it doesnt work
      if (!playPauseResponse.ok) {
        console.error('Failed to perform play/pause action');
      } else {
        console.log(`Successfully ${action}d playback`);
      }
    } catch (error) {
      console.error('Error:', error);
    }

  };

  const nextSong = async () => {
    //adds "next" to the end of the api which skips the song, after sending a post request
    const response = await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  }

  const prevSong = async () => {
    //adds "next" to the end of the api which skips the song, after sending a post request
    const response = await fetch("https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  const handleSeek = async (event) => {
    const newProgress = Number(event.target.value);
    setProgress(newProgress); // Update the UI instantly
  
    if (!isDragging) {
      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newProgress}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          console.error("Error seeking track:", await response.json());
        } else {
          console.log(`Successfully moved to ${formatTime(newProgress)}`);
        }
      } catch (error) {
        console.error('Error seeking track:', error);
      }
    }
  };
  
  const handleMouseDown = () => setIsDragging(true);

  const handleMouseUp = async (event) => {
    setIsDragging(false);
    const newProgress = Number(event.target.value);
  
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newProgress}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        console.error("Error seeking track:", await response.json());
      } else {
        console.log(`Seeked to ${formatTime(newProgress)}`);
      }
    } catch (error) {
      console.error("Error seeking track:", error);
    }
  };
  

  const formatTime = (time) => {
    const min = Math.floor(time / 60000);
    const sec = Math.floor((time % 60000) / 1000).toFixed(0);
    return min + ":" + (sec < 10 ? '0' : '') + sec; // Convert milliseconds to minutes:seconds
  };

  return (
    <div>
      {track ? (
        <>
          <img className="spotify_record_needle" src={record_needle} alt="recordNeedle" />
          <img className={spotifyImage} src={songImage} alt="Album Cover" />
          <h2 className="spotify_song_title">{track.name} </h2>
          <h2 className="spotify_song_artist"> {track.artists.map(artist => artist.name).join(", ")}</h2>
          <input
            className="song_timer"
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleSeek}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}

          />
          <div className="song_timer_label_container">
            <span className="song_timer_label">{formatTime(progress)} /</span>  <span className="song_timer_label" >{formatTime(duration)}</span>
          </div>
          <div className="spotify_button_container">
            <button className="spotify_button" onClick={prevSong}>⏮</button>
            <button className="spotify_button" onClick={playPause}>{isPlaying == true ? "❚❚" : "▶"}</button>
            <button className="spotify_button" onClick={nextSong}>⏭</button>
          </div>

        </>
      ) : (
        <p className="no_song_playing_message">No song currently playing.</p>
      )}
    </div>
  );
};

export default SpotifyPlayer;
