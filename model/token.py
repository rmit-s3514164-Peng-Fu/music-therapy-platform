from itsdangerous import URLSafeTimedSerializer
from utils import web

def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(web.get_config()['SECRET_KEY'])
    return serializer.dumps(email, salt=web.get_config()['SECURITY_PASSWORD'])

def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(web.get_config()['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=web.get_config()['SECURITY_PASSWORD'],
            max_age=expiration
        )
    except:
        return False
    return email
