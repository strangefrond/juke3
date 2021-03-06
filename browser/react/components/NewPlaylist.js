import React from 'react';
import Warning from './Warning.js'

const NewPlaylist = function (props) {
return (
<div className="well">
  <form onSubmit={props.onSubmit} className="form-horizontal">
    <fieldset>
      <legend>New Playlist</legend>
      <div className="form-group">
        <label className="col-xs-2 control-label">Name</label>
        <div className="col-xs-10">
          <input value={props.playlistName} onChange={props.changeHandler} className="form-control" type="text"/>
        </div>
      </div>
      <div className="form-group">
        <div className="col-xs-10 col-xs-offset-2">
          <button type="submit" style={{float: 'left'}} disabled={!props.valid} className="btn btn-success">Create Playlist</button> <Warning warning={props.warning} />

        </div>
      </div>
    </fieldset>
  </form>
</div>
)}

export default NewPlaylist;
