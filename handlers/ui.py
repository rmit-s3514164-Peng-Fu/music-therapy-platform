from flask import render_template, request, jsonify, redirect, url_for, session

from model.activity import ActivityManager
from utils import web
from model.img import img
from model.user import new_user
from model.admin import questionnaires
from model.playlist import PlaylistManager
from model.schema import Playlist, Track
from model.questions import QuestionManager
from model.authentication import UserManager
import json


@web.requires_admin
def admin_questions():
    allq = questionnaires(web.get_db()).all_questions()
    return render_template('admin/questions.html', all_questions=allq)


@web.requires_admin
def userlist():
    allemail = new_user(web.get_db()).all_email()
    return render_template('admin/user.html', allemail=allemail)


@web.requires_admin
def u_email(u_email):
    u_profile = new_user(web.get_db()).profile(u_email)
    if request.method == 'POST':
        email = request.form["email"]
        lastname = request.form["lastname"]
        firstname = request.form["firstname"]
        is_admin = request.form.get('u_isadmin', 'off') == 'on'
        new_user(web.get_db()).changeProfile(u_email, email, firstname, lastname, is_admin)
        url = '/admin/user_profile/' + email
        return redirect(url_for('userlist'))
    return render_template('admin/user_profile.html', id=u_profile['id'], email=u_profile['email'],
                           lastname=u_profile['lastname'], firstname=u_profile['firstname'],
                           is_admin=u_profile['is_admin'])


def index():
    config = web.get_config()
    if 'u_email' in session:
        return render_template('index.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    return render_template('index.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'])


def login():
    config = web.get_config()
    return render_template('login.html', **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


@web.requires_login
def logout():
    web.logout_user()
    return redirect('/')


@web.requires_login
def user():
    config = web.get_config()
    if 'u_email' in session:
        user_profile = web.get_current_user()
        playlist_manager = PlaylistManager(web.get_db())
        playlists = playlist_manager.api_get_playlists()
        if user_profile.u_isadmin :
            return redirect('/admin/adminpage')
        return render_template('user.html', is_logged_in=web.is_logged_in(), user_email=user_profile.u_email,
                               u_email=user_profile.u_email, u_firstname=user_profile.u_firstname,
                               u_lastname=user_profile.u_lastname, u_genre=user_profile.u_genre, playlists=playlists)
    return redirect('/')



def activity_exercise():
    config = web.get_config()
    if 'u_email' in session:
        return render_template('exercise.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    return render_template('exercise.html', **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


def inner_questionnairepage():
    return render_template('inner_questionnairepage.html')


def emo_count():
    imgid = request.args.get('imgid', 0, type=str)
    emo = img(web.get_db()).emo(imgid)
    return jsonify(emo_name=emo)


@web.requires_login
def activity():
    config = web.get_config()
    if 'u_email' in session:
        return render_template('activity/base.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    return render_template("activity/base.html")


@web.requires_admin
def question_editor():
    config = web.get_config()
    return render_template("questions/base.html", **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


@web.requires_admin
def activity_editor():
    return render_template("activity/editor.html")


@web.requires_login
def activity_memory():
    config = web.get_config()
    if request.method == 'POST':
        db = web.get_db()
        with db.session_scope() as sessions:
            Playlist.l_name = request.form["playlistTitle"]
            for track_detail in request.form.getlist('trackDetail'):
                detail = json.loads(track_detail)
                Track.t_title = detail['title']
                Track.t_author = detail['author']
                Track.t_url = detail['url']
            sessions.commit()
    if 'u_email' in session:
        return render_template('memory.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    else:
        return render_template("index.html", **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


def view_activity():
    return render_template("activity/activity_view.html")


@web.requires_admin
def admin_activity():
    return render_template("activity/activity_admin.html")


@web.requires_admin
def admin_activity_steps():
    return render_template("activity/activity_admin_steps.html")


def map():
    return render_template("innerMap.html")


@web.requires_login
def example_messenger():
    config = web.get_config()
    if 'u_email' in session:
        return render_template('message_example.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    return render_template('message_example.html')


def questions():
    return render_template('questions/user_base.html')


def question_editor_list():
    am = ActivityManager(web.get_db())
    return render_template('questions/list.html', activities=am.api_all_activities())


@web.requires_admin
def adminpage():
    config = web.get_config()
    if 'u_email' in session:
        return render_template('/admin/adminpage.html', gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'],
                               is_logged_in=web.is_logged_in(), user_email=session['u_email'])
    return redirect('/')


@web.requires_admin
def searchplaylist():
    if request.method == 'POST':
        keywords = request.form["keywords"]
        allTrack = PlaylistManager(web.get_db()).api_getTrackByKeywords(keywords)
        if allTrack == False:
            return render_template('/admin/searchplaylist.html',
                                   infor_message="There are no any results, Please input Again!")
        else:
            tracklist = {}
            track = {}
            user = {}
            playlist = {}
            i = 0
            alltracklist = {}
            for track_data in allTrack:
                i = i + 1
                track_author = track_data.t_author
                track_playlistid = track_data.l_id
                track_title = track_data.t_title
                track['TrackTitle'] = track_title
                track['TrackAuthor'] = track_author
                playlist_data = PlaylistManager(web.get_db()).api_getPlaylistByID(track_playlistid)
                userID = playlist_data.u_id
                playlist['PlaylistName'] = playlist_data.l_name
                user_detail = UserManager(web.get_db()).api_get_userDetail(userID)
                user['Gender'] = user_detail.u_gender
                user['Age'] = user_detail.u_age
                user['Genger'] = user_detail.u_genre
                tracklist["Track"] = track
                tracklist['Playlist'] = playlist
                tracklist['User'] = user
                alltracklist[i] = tracklist
            return render_template('/admin/searchplaylist.html', alltracklist=alltracklist, infor_message=" ")
    return render_template('/admin/searchplaylist.html')


@web.requires_login
def questionnairepage():
    qm = QuestionManager(web.get_db())
    que_get = qm.api_categories_and_questions()
    return render_template('questionnairepage.html', question=que_get)

def register_endpoints(app):
    app.add_url_rule('/', 'index', index)
    app.add_url_rule('/admin/adminpage', 'adminpage', adminpage)
    app.add_url_rule('/admin/questions', 'admin_questions', admin_questions)
    app.add_url_rule('/admin/user', 'userlist', userlist)
    app.add_url_rule('/admin/user_profile/<u_email>', 'u_email', u_email, methods=["POST", "GET"])
    app.add_url_rule('/login', 'login', login)
    app.add_url_rule('/logout', 'logout', logout)
    app.add_url_rule('/messenger', 'messenger', example_messenger)
    app.add_url_rule('/questions', 'questions', questions)
    app.add_url_rule('/user', 'user', user, methods=["POST", "GET"])
    app.add_url_rule('/emo_count', 'emo_count', emo_count)
    app.add_url_rule('/inner_questionnairepage', 'inner_questionnairepage', inner_questionnairepage)
    app.add_url_rule('/innerMap', 'innerMap', map)
    app.add_url_rule('/activity', 'activity', activity)
    app.add_url_rule('/activity/edit', 'activity_editor', activity_editor)
    app.add_url_rule('/activity_view', 'activity_view', view_activity)
    app.add_url_rule('/activity_admin', 'activity_admin', admin_activity)
    app.add_url_rule('/activity_admin_steps', 'activity_admin_steps', admin_activity_steps)
    app.add_url_rule('/activity/memory', 'activity_memory', activity_memory, methods=["POST", "GET"])
    app.add_url_rule('/activity/exercise', 'activity_exercise', activity_exercise, methods=["POST", "GET"])
    app.add_url_rule('/questions/edit', 'question_editor', question_editor)
    app.add_url_rule('/questions/edit/list', 'question_list', question_editor_list)
    app.add_url_rule('/admin/searchplaylist', 'searchplaylist', searchplaylist, methods=["POST", "GET"])
    app.add_url_rule('/questionnairepage', 'questionnairepage', questionnairepage)
