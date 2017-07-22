from flask import request

from model.activity import ActivityManager
from model.img import img
from model.playlist import PlaylistManager
from model.questions import QuestionManager
from utils import web


@web.json_method
def api_activity(activity_id, step_no):
    am = ActivityManager(web.get_db())
    if request.method == 'GET':
        return dict(data=am.get_activity_step(activity_id, step_no))
    elif request.method == 'POST':

        @web.requires_admin
        def admin_mode():
            return dict(data=am.api_add_widget(activity_id, step_no, request.json))
        return admin_mode()


@web.requires_admin
@web.json_method
def edit_steps(activity_id, step_id=None):
    am = ActivityManager(web.get_db())
    if request.method == 'GET':
        return dict(data=am.api_get_steps(activity_id))
    elif request.method == 'POST':
        return dict(data=am.api_new_step(activity_id, request.json))
    elif request.method == 'DELETE':
        return dict(data=am.api_delete_step(activity_id, step_id))


@web.requires_admin
@web.json_method
def edit_widget(widget_id):
    am = ActivityManager(web.get_db())
    if request.method == 'PUT':
        return dict(data=am.api_edit_widget(widget_id, request.json))
    elif request.method == 'DELETE':
        return dict(data=am.api_delete_widget(widget_id))


@web.json_method
def activity_handler():
    am = ActivityManager(web.get_db())
    if request.method == 'GET':
        return dict(data=am.api_all_activities())

    elif request.method == 'POST':

        @web.requires_admin
        def admin_mode():
            return dict(data=am.api_new_activity(request.json))
        return admin_mode()


@web.json_method
def category_handler():
    qm = QuestionManager(web.get_db())
    if request.method == 'GET':
        return dict(data=qm.api_all_categories())

    @web.requires_admin
    def admin_mode():
        if request.method == 'POST':
            return dict(data=qm.api_new_category(request.json))

    return admin_mode()


@web.json_method
def question_handler(question_id=None):
    qm = QuestionManager(web.get_db())
    if request.method == 'GET':
        return dict(data=qm.api_get_question(question_id))

    # the following functions require administrative privileges
    @web.requires_admin
    def admin_mode():
        if request.method == 'POST':
            return dict(data=qm.api_new_question(request.json))
        elif request.method == 'PUT':
            return dict(data=qm.api_edit_question(question_id, request.json))

    return admin_mode()


@web.json_method
def view_questions():
    qm = QuestionManager(web.get_db())
    return dict(data=qm.api_categories_and_questions())


@web.json_requires_login
@web.json_method
def playlist_handler(playlist_id=None):
    pm = PlaylistManager(web.get_db())
    if request.method == 'GET':
        return dict(data=pm.api_get_playlists())
    elif request.method == 'POST':
        return dict(data=pm.api_create_playlist(request.json))
    elif request.method == 'PUT':
        return dict(data=pm.api_edit_playlist(playlist_id, request.json))
    elif request.method == 'DELETE':
        return dict(data=pm.api_delete_playlist(playlist_id))


@web.json_requires_login
@web.json_method
def emotion_handler():
    return dict(data=img(web.get_db()).api_results())

def register_endpoints(app):
    app.add_url_rule('/api/activity', 'activity_handler', activity_handler, methods=["GET", "POST"])
    app.add_url_rule('/api/activity/<int:activity_id>/steps', 'api_steps', edit_steps, defaults={'step_id': None}, methods=["GET", "POST"])
    app.add_url_rule('/api/activity/<int:activity_id>/steps/<int:step_id>', 'api_steps', edit_steps, methods=["PUT", "DELETE"])
    app.add_url_rule('/api/activity/<int:activity_id>/<int:step_no>', 'api_activity', api_activity, methods=["GET", "POST"])
    app.add_url_rule('/api/activity/widgets/<int:widget_id>', 'api_edit_widget', edit_widget, methods=["PUT", "DELETE"])

    app.add_url_rule('/api/categories', 'category_handler', category_handler, methods=['GET', 'POST'])
    app.add_url_rule('/api/questions', 'question_handler', question_handler, defaults={'question_id': None}, methods=['POST'])
    app.add_url_rule('/api/questions/<int:question_id>', 'question_handler', question_handler, methods=['GET', 'DELETE', 'PUT'])
    app.add_url_rule('/api/questions/view', 'view_questions', view_questions)

    app.add_url_rule('/api/playlist', 'playlist_handler', playlist_handler, defaults={'playlist_id': None}, methods=['GET', 'POST'])
    app.add_url_rule('/api/playlist/<int:playlist_id>', 'playlist_handler', playlist_handler, methods=['PUT', 'DELETE'])

    app.add_url_rule('/api/emotion', 'emotion_handler', emotion_handler)
