from model import schema
from utils import web
from utils import voluptuous_ext as v
from utils.web import RequestApiException


class PlaylistManager(object):

    track_schema = [{
            v.Required('url'): v.String(),
            v.Required('title'): v.String()
        }]

    new_playlist_schema = {
        v.Required('name'): v.String(),
        v.Optional('tracks', default=[]): track_schema,
        v.Optional('description', default=None): v.String()
    }

    edit_playlist_schema = {
        v.Optional('name', default=None): v.String(),
        v.Optional('tracks', default=None): track_schema
    }

    def __init__(self, db):
        self.db = db

    def add_track_to_playlist(self, playlist, track):
        playlist.tracks.append(schema.Track(l_id=playlist.l_id, t_title=track['title'],
                                            t_url=track['url']))

    def create_playlist(self, name, tracks, description):
        with self.db.session_scope() as session:
            user = session.merge(web.get_current_user())
            playlist = schema.Playlist(l_name=name, l_description=description)
            user.playlists.append(playlist)
            session.commit()
            for track in tracks:
                self.add_track_to_playlist(playlist, track)
            return playlist

    def api_create_playlist(self, params):
        params = v.validate(self.new_playlist_schema, params)
        return self.playlist_to_dict(self.create_playlist(params['name'], params['tracks'], params['description']))

    def api_get_playlists(self):
        with self.db.session_scope() as session:
            user = session.merge(web.get_current_user())
            return [self.playlist_to_dict(playlist) for playlist in user.playlists]

    def edit_playlist(self, playlist_id, name=None, tracks=None):
        with self.db.session_scope() as session:
            playlist = session.query(schema.Playlist).filter(schema.Playlist.l_id == playlist_id, schema.Playlist.u_id == web.get_current_user().u_id).one_or_none()
            if playlist is None:
                raise RequestApiException("Playlist not found")
            if name is not None:
                playlist.l_name = name
            if tracks is not None:
                for track in tracks:
                    self.add_track_to_playlist(playlist, track)
            return playlist

    def api_edit_playlist(self, playlist_id, params):
        params = v.validate(self.edit_playlist_schema, params)
        return self.playlist_to_dict(self.edit_playlist(playlist_id, params['name'], params['tracks']))

    def api_delete_playlist(self, playlist_id):
        with self.db.session_scope() as session:
            user = session.merge(web.get_current_user())
            for i, playlist in enumerate(user.playlists):
                if playlist.l_id == playlist_id:
                    user.playlists.pop(i)
                    return dict(id=playlist_id)
            raise RequestApiException("Playlist not found")

    def api_getPlaylistByID(self, Id):
        with self.db.session_scope() as session:
            playlist =session.query(schema.Playlist).filter(schema.Playlist.l_id == Id).one_or_none()
            if playlist is not None :
                return playlist
            else:
                return False

    def api_getTrackByKeywords(self, keywords):
        with self.db.session_scope() as session:
            track= session.query(schema.Track).filter(schema.Track.t_title.like("%"+keywords+"%")).all()
            if track is not None :
                return track
            else:
                print("None")
                return False


    @staticmethod
    def playlist_to_dict(playlist):
        return dict(id=playlist.l_id, name=playlist.l_name, tracks=[
            dict(title=track.t_title, url=track.t_url) for track in playlist.tracks
        ])
