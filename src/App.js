import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Player from "./Player";
import './App.css';

function App() {
  const CLIENT_ID = "5a881e05966b46e6a834390e80c37713";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");
  
    // Check if the provided access token is available
    const providedToken = "BQAH8-GpbiGlusNw-T0Xb5MGq6BmaOB3eJn2QozAtfz7NkcqoUA9HlhU10k58SDufC8DUIGU91MWukeRi1eC5v54LOHyHRrIFAepgWcWdlEgRO3lzr8uWjwbuv13QqRNAYFs51Pqwjit5vcP-iQW6J9gAG7Ad5i6qPwzBvyGQPRtnbxAOVMpAVOXk_K1GI7Od-3NfUa2zXtPCjb2YzDdDYR8TvBYHfvw9FCpSfSlQSLb_FpX0p-R2w";
  
    if (!storedToken && hash) {
      storedToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
  
      window.location.hash = "";
      window.localStorage.setItem("token", storedToken);
    }
  
    // Use the provided token if available
    if (!storedToken && providedToken) {
      storedToken = providedToken;
      window.localStorage.setItem("token", storedToken);
    }
  
    setToken(storedToken);
  }, []);
  

  const logout = () => {
    setToken("");
    setPlayingTrack(null);
    window.localStorage.removeItem("token");
  };

  const handleLogin = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=${RESPONSE_TYPE}`;
  };

  const search = async (e) => {
    e.preventDefault();
    const { data: artistData } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist"
      }
    });

    const { data: trackData } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "track"
      }
    });

    setArtists(artistData.artists.items);
    setTracks(trackData.tracks.items);
  };

  const playTrack = (uri, title, artist) => {
    setPlayingTrack({ uri, title, artist });
  };

  const renderTracks = () => {
    return tracks.map((track) => (
      <div key={track.id} className="col-md-4 mb-4">
        <div className="card">
          {track.album.images.length ? (
            <img
              className="card-img-top rounded-circle"
              src={track.album.images[1].url}
              alt=""
              style={{ width: '300px', height: '300px' }}
            />
          ) : (
            <div className="card-img-top" style={{ width: '300px', height: '300px', background: '#eee', borderRadius: '15px' }}>
              No Image
            </div>
          )}
          <div className="card-body">
            <h5 className="card-title">{track.name}</h5>
            <p className="card-text">{track.artists.map((artist) => artist.name).join(', ')}</p>
            <button
              className="btn btn-primary"
              onClick={() => playTrack(track.uri, track.name, track.artists.map((artist) => artist.name).join(', '))}
            >
              Play
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const renderArtists = () => {
    return artists.map((artist) => (
      <div key={artist.id} className="col-md-4 mb-4">
        <div className="card">
          {artist.images.length ? (
            <img
              className="card-img-top rounded-circle"
              src={artist.images[1].url}
              alt=""
              style={{ width: '300px', height: '300px' }}
            />
          ) : (
            <div className="card-img-top" style={{ width: '300px', height: '300px', background: '#eee', borderRadius: '15px' }}>
              No Image
            </div>
          )}
          <div className="card-body">
            <h5 className="card-title">{artist.name}</h5>
            <button
              className="btn btn-primary"
              onClick={() => playTrack(artist.uri, artist.name, artist.name)}
            >
              Play
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {token ? (
          <div>
            <button onClick={logout}>Logout</button>
            <form onSubmit={search}>
              <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} />
              <button type="submit">Search</button>
            </form>
            <div className="row">
              {renderArtists()}
              {renderTracks()}
            </div>
          </div>
        ) : (
          <button onClick={handleLogin}>Login with Spotify</button>
        )}
      </header>
      <div>
        <Player accessToken={token} trackUri={playingTrack?.uri} />
      </div>
    </div>
  );
}

export default App;
