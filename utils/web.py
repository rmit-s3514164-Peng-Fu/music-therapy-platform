import functools
from flask import make_response, redirect, abort,render_template,session
import json
import flask_login
import datetime

login_manager = flask_login.LoginManager()

class RequestApiException(Exception):
    pass

class JsonEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat()


def get_config():
    from server import app
    return app.config


def is_logged_in():
    return flask_login.current_user.is_authenticated


def get_db():
    from server import db
    return db


def login_user(user, remember=True):
    flask_login.login_user(user, remember=remember)


def logout_user():
    flask_login.logout_user()


def get_current_user():
    user = flask_login.current_user
    return user.user if user.is_authenticated else None

def json_method(f):
    """
    Turn a regular method that returns a dictionary into a JSON call
    """
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            result = f(*args, **kwargs)
            response_code = 200
        except RequestApiException as e:
            response_code = 400
            result = dict(status=False, error=str(e))
        except Exception as e:
            print(e)
            response_code = 500
            result = dict(status=False, error=str(e))

        response = make_response(json.dumps(result, cls=JsonEncoder))
        response.headers['Content-Type'] = 'application/json'
        return response, response_code
    return wrapper


def requires_login(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if flask_login.current_user.is_authenticated:
            return f(*args, **kwargs)
        else:
            # return redirect('/login')
            return redirect('/')
    return wrapper


def json_requires_login(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if flask_login.current_user.is_authenticated:
            return f(*args, **kwargs)
        else:
            return render_template('inforPage.html',infor = 'This page is forbidden',is_logged_in=is_logged_in(), user_email=session['u_email'])
    return wrapper


def requires_admin(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if flask_login.current_user.is_authenticated:
            if flask_login.current_user.u_isadmin:
                return f(*args, **kwargs)
        return render_template('inforPage.html', infor='This page is forbidden',is_logged_in=is_logged_in(), user_email=session['u_email'])
    return wrapper

