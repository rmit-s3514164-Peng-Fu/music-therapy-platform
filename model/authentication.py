import json

import requests
from model import schema
from model.token import generate_confirmation_token, confirm_token
from utils import voluptuous_ext as v
from utils import web


class UserException(Exception):
    pass


class UserProxy(object):
    """
    Flask login requires a User object. We use the UserProxy so we don't have to be bound to a SQLalchemy session
    """

    def __init__(self, user):
        self.__id = user.u_id
        self.user = user

    # flask login methods:
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.__id

    # in case we want some user details, such as name or email
    def __getattr__(self, item):
        return getattr(self.user, item)


class UserManager(object):
    """
    Handles creation and retrieval of users.
    Also handles authentication from facebook and google
    """

    # what we're expecting as parameters
    # todo: regular password authentication
    login_schema = {
        v.Exclusive('gauth_token', 'type'): v.Coerce(str),
        v.Exclusive('fb_token', 'type'): v.Coerce(str),
        v.Optional('fb_id', default=''): v.Coerce(str)
    }

    gauth_verify_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=%s'
    fb_verify_url = 'https://graph.facebook.com/v2.7/%s?fields=name,email&access_token=%s'

    def __init__(self, db):
        self.db = db

    def login_loader(self, id):
        """
        Use with Flask Login. Loads a user proxy
        :param id: id of the user (tbl_users.id)
        :return: None if no user, or a UserProxy
        """
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_id == id).one_or_none()
            if user is None:
                return None
            session.expunge(user)
            return UserProxy(user)

    @staticmethod
    def user_by_id(u_id, session=None):
        return session.query(schema.User).filter(schema.User.u_id == u_id).one_or_none()

    def new_user(self, email, data, password=None, type='standard'):
        """
        Create a new user
        :param email: email of user
        :param name: given names (first name and surname combined)
        :param password: optional, for password authentication
        :return:
        """
        data['u_email'] = email
        data['u_type'] = type
        with self.db.session_scope() as session:
            user = schema.User(**data)
            if password:
                user.set_password(password)
            session.add(user)
        # send = email.send_confirm_email
        # token = token.generate_confirmation_token(email)
        # send(email,token)
        return user

    def changePassword(self, email, password, newpassword):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if user is not None:
                if user.password_verify(password):
                    user.set_password(newpassword)
                    return True
                else:
                    return False
        return False

    def changePasswordBynew(self, email, newpassword):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if user is not None:
                user.set_password(newpassword)
            return None

    def isUserbyEmail(self, email):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if user is not None:
                return True
            else:
                return False

    def isPasswordfornormal(self, email, password):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if user.password_verify(password):
                return True
            else:
                return False

    def api_get_userDetail(self,id):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_id == id).one_or_none()
            if user is not None :
                return user
            return False

    def checkconfirm(self,email):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            confirm = user.u_isconfirmed
            return confirm

    def login_user(self, email, password=None, type='standard'):
        """
        Find a user and return it, if all the parameters match
        :return: A UserProxy
        """
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if user is not None:
                if type == 'standard' and not user.password_verify(password):
                    return None
                return UserProxy(user)
            return None

    def verify_fb_token(self, token, user_id):
        """
        Verify that a given facebook token belongs to a user and is valid
        :return: the dict response
        """
        response = requests.get(self.fb_verify_url % (user_id, token))
        if response.status_code != 200:
            raise UserException("Couldn't verify Facebook token")
        return json.loads(response.text)

    def verify_google_token(self, token):
        """
        Verify that a given token token belongs to a user and is valid
        :return: the dict response
        """
        response = requests.get(self.gauth_verify_url % token)
        if response.status_code != 200:
            raise UserException("Couldn't verify Google token")
        return json.loads(response.text)

    def google_login(self, token):
        """
        Login or Register a google user
        """
        response = self.verify_google_token(token)
        user = self.login_user(response['email'], type='google')
        if user is None:
            # need to register a new one
            data = dict(u_firstname=response['given_name'],
                        u_lastname=response['family_name'])
            self.new_user(response['email'], data, type='google')
            user = self.login_user(response['email'], type='google')

            if user is None:
                raise UserException('Failed to create an account')
        return user

    def facebook_login(self, token, user_id):
        """
        Login or Register a facebook user
        """
        response = self.verify_fb_token(token, user_id)
        user = self.login_user(response['email'], type='fb')
        if user is None:
            # register a new one
            data = dict(u_firstname=response['name'])
            self.new_user(response['email'], data, type='fb')
            user = self.login_user(response['email'], type='fb')

            if user is None:
                raise UserException('Failed to create an account')
        return user

    def api_login_user(self, params):
        """
        Try to log in a user with supplied parameters
        May branch to either Google, Facebook or password authentication
        """
        params = v.validate(self.login_schema, params)
        user = None
        if 'gauth_token' in params:
            user = self.google_login(params['gauth_token'])
        elif 'fb_token' in params:
            user = self.facebook_login(params['fb_token'], params['fb_id'])
        if user is None:
            raise UserException('Failed to log in')
        web.login_user(user)
        return True

    def view_profile(self, u_email):
        """
        view the profile info of a user
        :return: a dic which contains the necessary info
        """
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == u_email).one_or_none()
            if user is not None:
                return dict(email=user.u_email, firstname=user.u_firstname, lastname=user.u_lastname,
                            genres=user.u_genre)

    def update_profile(self, u_email, new_firstname, new_lastname, new_genre, password, new_password):
        """
        user updates the profile
        :param new_firstname: user's new first name
        :param new_lastname: user's new last name
        :param new_genre: user's new preferred geners
        :param password: user's old password
        :param new_password: user's new password
        :return: true if update successfully
        """
        with self.db.session_scope() as session:
            prof = session.query(schema.User).filter(schema.User.u_email == u_email).one_or_none()
            if prof is not None:
                prof.u_firstname = new_firstname
                prof.u_lastname = new_lastname
                prof.u_genre = new_genre
                session.commit()
                self.changePassword(prof.u_email, password, new_password)
                return True
            return False


# for use with Flask Login
@web.login_manager.user_loader
def load_user(id):
    return UserManager(web.get_db()).login_loader(id)
