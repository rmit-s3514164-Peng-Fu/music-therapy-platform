from utils import web
from flask import request
from model.messaging import MessageManager


@web.json_requires_login
@web.json_method
def reply(thread_id):
    params = request.json
    mm = MessageManager(web.get_db())
    return dict(data=mm.api_reply(thread_id, params))


@web.json_requires_login
@web.json_method
def get_messages(thread_id=None):
    mm = MessageManager(web.get_db())
    return dict(data=mm.api_get_messages(thread_id))


@web.json_requires_login
@web.json_method
def message_admin():
    params = request.json
    mm = MessageManager(web.get_db())
    return dict(data=mm.api_message_admin(params))


def register_endpoints(app):
    app.add_url_rule('/api/messages/<int:thread_id>', 'api_reply', reply, methods=['POST'])
    app.add_url_rule('/api/messages/admin', 'api_message_admin', message_admin, methods=['POST'])

    app.add_url_rule('/api/messages/<int:thread_id>', 'api_messages', get_messages, methods=['GET'])
    app.add_url_rule('/api/messages', 'api_messages', get_messages, defaults={'thread_id': None}, methods=['GET'])
