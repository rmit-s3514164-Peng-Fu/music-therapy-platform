from model import schema
from model.authentication import UserManager
from utils import web
from utils import voluptuous_ext as v
import sqlalchemy

import datetime


class MessageException(Exception):
    pass


class MessageManager(object):
    """
    Class to deal with private messages.
    - messages should only be visible between 2 users
    - there should be an option for email notifications for private messages
    - a message may be deleted by either user (requires confirmation)
    - need to be able to check how many unread messages
    """

    REPLY_SCHEMA = {
        v.Required('Content'): v.String(max_length=1024)
    }

    MESSAGE_ADMIN_SCHEMA = {
        v.Required('Content'): v.String(max_length=1024)
    }

    def __init__(self, db):
        self.db = db

    def send_message(self, user_from, user_to, content):
        """
        Send a message to another user.
        Creates a new message, and puts it in both users' inboxes
        :param user_from: the sender
        :param user_to: the recipent
        :param content: the content of the message
        :return:
        """
        with self.db.session_scope() as session:

            # translate users if needed
            if isinstance(user_from, int):
                user_from = UserManager.user_by_id(user_from, session)
            if isinstance(user_to, int):
                user_to = UserManager.user_by_id(user_to, session)

            # create the message
            message = schema.PrivateMessage(owner=user_from, content=content)

            # add to the inboxes
            from_inbox = schema.MessageInbox(r_owner=user_from, r_partner=user_to, message=message, opened=datetime.datetime.now())
            to_inbox = schema.MessageInbox(r_owner=user_to, r_partner=user_from, message=message)

            # commit
            session.add(message)
            session.add(from_inbox)
            session.add(to_inbox)

        # todo: send email notifications if applicable
        # send_email(user_to)

    def _get_message_participant(self, partner_id, user_from):
        with self.db.session_scope() as session:
            # require a conversation to be started first before you're able to reply.
            message = session.query(schema.MessageInbox).filter(schema.MessageInbox.r_owner == user_from, schema.MessageInbox.partner == partner_id).first()
            if message is None:
                # amendment 1: allow users to chat if they have the right settings
                partner = session.query(schema.User).filter(schema.User.u_id == partner_id).one_or_none()
                if not partner or not partner.chat_available:
                    raise MessageException("User is not available to chat")
                return partner

            return message.r_partner

    def api_reply(self, thread_id, params):
        params = v.validate(self.REPLY_SCHEMA, params)
        user_from = web.get_current_user()
        user_to = self._get_message_participant(thread_id, user_from)
        self.send_message(user_from, user_to, params['Content'])
        return True

    def get_available_contacts(self):
        with self.db.session_scope() as session:
            users = session.query(schema.User).filter(*schema.User.chat_available_filter()).all()
            return [dict(Name=user.u_firstname, ReplyTo=user.u_id) for user in users]

    def get_messages(self, user, **limits):
        """
        Retrieve an inbox for a user.
        May be extended to show from particular users, only show unread, only show after specfic date etc
        :param user: the user requesting the inbox
        :param limits: any additional constraints (to be extended)
        :return:
        """
        with self.db.session_scope() as session:
            filters = [schema.MessageInbox.r_owner == user]
            join = (schema.User, schema.User.u_id == schema.MessageInbox.partner)
            select = (schema.MessageInbox.partner.label('ReplyTo'), sqlalchemy.func.sum(
                sqlalchemy.case([(schema.MessageInbox.opened == None, 1)], else_=0)
            ).label('Unread'), schema.User)

            threads = session.query(*select).join(*join).filter(*filters).group_by(schema.MessageInbox.partner, schema.User).all()
            results = [dict(Name=thread.User.u_firstname, Unread=thread.Unread, ReplyTo=thread.ReplyTo) for thread in threads]
            return dict(TotalUnread=sum([r['Unread'] for r in results]), Conversations=results, Available=self.get_available_contacts())

    def get_message_thread(self, user, partner_id):
        with self.db.session_scope() as session:
            messages = session.query(schema.MessageInbox).filter(schema.MessageInbox.r_owner == user, schema.MessageInbox.partner == partner_id).all()
            return [dict(ID=message.message.id, Message=message.message.content, ToMe=message.message.user_from == partner_id, Date=message.message.created) for message in messages]

    def api_get_messages(self, thread_id=None):
        if thread_id is None:
            return self.get_messages(web.get_current_user())
        return self.get_message_thread(web.get_current_user(), thread_id)

    def message_admin(self, user_from, content):
        # TODO: how to get this?
        admin_user = web.get_config()['ADMIN_USER']
        self.send_message(user_from, admin_user, content)

    def api_message_admin(self, params):
        # TODO: do we get the message from the API or do we set it ourselves? is it autogenerated?
        params = v.validate(self.MESSAGE_ADMIN_SCHEMA, params)
        self.message_admin(web.get_current_user(), params['Content'])
        return True

    def delete_message(self, user, message_id):
        """
        Removes a message from an inbox (see requirements above)
        :param user: the user requesting the deletion
        :param message_id: the ID of the message
        :return:
        """
        pass

    def mark_unread(self, user, message_id):
        """
        Mark a message as unread.  Maybe not required.
        :param user:
        :param message_id:
        :return:
        """
        pass