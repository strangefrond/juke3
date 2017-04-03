import React, { Component } from 'react';
import {hashHistory} from 'react-router';

import axios from 'axios';

import initialState from '../initialState';
import AUDIO from '../audio';

import Albums from '../components/Albums.js';
import Album from '../components/Album';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

import { convertAlbum, convertAlbums, convertSong, skip } from '../utils';

export default class AppContainer extends Component {

  constructor(props) {
    super(props);
    this.state = initialState;

    this.toggle = this.toggle.bind(this);
    this.toggleOne = this.toggleOne.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.selectAlbum = this.selectAlbum.bind(this);
    this.selectArtist = this.selectArtist.bind(this);
    this.selectPlaylist = this.selectPlaylist.bind(this);
    this.addPlaylist = this.addPlaylist.bind(this);
    this.updatePlaylist = this.updatePlaylist.bind(this);
  }

  componentDidMount() {

    Promise
      .all([
        axios.get('/api/albums/'),
        axios.get('/api/artists/'),
        axios.get('/api/playlists/'),
        axios.get('api/songs')
      ])
      .then(res => res.map(r => r.data))
      .then(data => this.onLoad(...data));

    AUDIO.addEventListener('ended', () =>
      this.next());
    AUDIO.addEventListener('timeupdate', () =>
      this.setProgress(AUDIO.currentTime / AUDIO.duration));
  }

  onLoad(albums, artists, playlists,songs) {
    this.setState({
      albums: convertAlbums(albums),
      artists: artists,
      playlists: playlists,
      songs: songs.map(convertSong)
    });
  }

  play() {
    AUDIO.play();
    this.setState({ isPlaying: true });
  }

  pause() {
    AUDIO.pause();
    this.setState({ isPlaying: false });
  }

  load(currentSong, currentSongList) {
    AUDIO.src = currentSong.audioUrl;
    AUDIO.load();
    this.setState({
      currentSong: currentSong,
      currentSongList: currentSongList
    });
  }

  startSong(song, list) {
    this.pause();
    this.load(song, list);
    this.play();
  }

  toggleOne(selectedSong, selectedSongList) {
    if (selectedSong.id !== this.state.currentSong.id)
      this.startSong(selectedSong, selectedSongList);
    else this.toggle();
  }

  toggle() {
    if (this.state.isPlaying) this.pause();
    else this.play();
  }

  next() {
    this.startSong(...skip(1, this.state));
  }

  prev() {
    this.startSong(...skip(-1, this.state));
  }

  setProgress(progress) {
    this.setState({ progress: progress });
  }

  selectAlbum(albumId) {
    axios.get(`/api/albums/${albumId}`)
      .then(res => res.data)
      .then(album => this.setState({
        selectedAlbum: convertAlbum(album)
      }));
  }

  selectPlaylist(playlistId) {
    Promise
      .all([
        axios.get(`/api/playlists/${playlistId}`),
        axios.get(`/api/playlists/${playlistId}/songs`)
      ])
      .then(res => res.map(r => r.data))
      .then(data => this.onLoadPlaylist(...data));
  }


  selectArtist(artistId) {
    Promise
      .all([
        axios.get(`/api/artists/${artistId}`),
        axios.get(`/api/artists/${artistId}/albums`),
        axios.get(`/api/artists/${artistId}/songs`)
      ])
      .then(res => res.map(r => r.data))
      .then(data => this.onLoadArtist(...data));
  }

  addPlaylist(playlistName) {
    return axios.post('/api/playlists', { name: playlistName })
      .then(res => res.data)
      .then(result => {
        this.setState({playlists: this.state.playlists.concat([result])})
        hashHistory.push(`/playlist/${result.id}`)
      });
  }

  updatePlaylist(songId){
    this.state.selectedPlaylist.id &&
    axios.post(`/api/playlists/${this.state.selectedPlaylist.id}/songs`, {id:songId})
    .then((res)=>res.data)
    .then(console.log)
    .catch()
  }

  onLoadArtist(artist, albums, songs) {
    songs = songs.map(convertSong);
    albums = convertAlbums(albums);
    artist.albums = albums;
    artist.songs = songs;

    this.setState({ selectedArtist: artist });
  }

  onLoadPlaylist(playlist, songs) {
    songs = songs.map(convertSong);
    playlist.songs = songs;

    this.setState({ selectedPlaylist: playlist });
  }

  render() {

    const props = Object.assign({}, this.state, {
      toggleOne: this.toggleOne,
      toggle: this.toggle,
      selectAlbum: this.selectAlbum,
      selectArtist: this.selectArtist,
      selectPlaylist: this.selectPlaylist,
      addPlaylist: this.addPlaylist,
      updatePlaylist: this.updatePlaylist
    });
    console.log(props);
    return (
      <div id="main" className="container-fluid">
        <div className="col-xs-2">
          <Sidebar playlists={this.state.playlists} />
        </div>
        <div className="col-xs-10">
          {
            this.props.children && React.cloneElement(this.props.children, props)
          }
        </div>
        <Player
          currentSong={this.state.currentSong}
          currentSongList={this.state.currentSongList}
          isPlaying={this.state.isPlaying}
          progress={this.state.progress}
          next={this.next}
          prev={this.prev}
          toggle={this.toggle}
        />
      </div>
    );
  }
}
