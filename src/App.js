import { useEffect, useState } from "react";
import { getSpotifyTokenFromUrl, loginWithSpotify} from "./auth.js";
import SpotifyPlayer from "./components/SpotifyPlayer.js";

import './App.css';
const App = () => {
    const [spotifyToken, setSpotifyToken] = useState(null);

    useEffect(() => {
        const spotifyToken = getSpotifyTokenFromUrl();
        if (spotifyToken) setSpotifyToken(spotifyToken);

    }, []);

    return (
        <div className="app-container">
            <div className="discord_split">
            <button className="login_button" onClick={loginWithSpotify}>Login with Discord</button>
            </div>

            <div className="spotify_split">
            {!spotifyToken && <button className="login_button" onClick={loginWithSpotify}>Login with Spotify</button>}
            {spotifyToken  && <SpotifyPlayer token={spotifyToken}/>}
            </div>
            
            

       
        </div>
    );
};

export default App;
