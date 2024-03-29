import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Player from "./Player";
import './App.css';

function App() {
  const CLIENT_ID = "5a881e05966b46e6a834390e80c37713";
  const REDIRECT_URI = "https://shark-app-hr6bm.ondigitalocean.app";
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
    const providedToken = "BQBrcUcsaTY2n4iziK2KvHqERL4etCr7j8dwV1xxzBiHBLF-gch9lsYuOBK6MM8viFhOr9Z4hlX2J6SdrBsMAH10QSE-ivlXrvUDq5Znf3SIJhhk0g0h-Nub9Dd9dottKTeW80nSHaXdeRCrJ4-xGobSUBj_xVovgR3i88VkrQAL0PnuShpREE7p3xs9HLCHqIVqI6mCuwXU3RrKy90us3icyKCx2PlynIRaBnc1AZIbP7-aOXkciQ";
  
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
