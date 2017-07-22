from flask import Flask
from handlers import authentication, ui, messaging, api
from utils.web import login_manager
from model.orm import ORM
import os

app = Flask(__name__, template_folder='views')
app.secret_key = 'W79=nRjx#-m_m9e!7&eTaGyfkw7LS%Gf%ZxsfPqW*'

# config currently comes from environment variables (for heroku)
# here are the current values
#
# DB_URL    : (required) : a sqlalchemy url specifying a connection string to a database
# GAUTH_KEY : (required) : The Google url to use for Google login
# FB_KEY    : (required) : The Facebook app id for Facebook login
# MAIL_USERNAME : The email used to send email confirmation
# MAIL_PASSWORD : Password of the email

ui.register_endpoints(app)
authentication.register_endpoints(app)
messaging.register_endpoints(app)
api.register_endpoints(app)

app.config.update(os.environ)


db = ORM()
login_manager.init_app(app)


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000)
