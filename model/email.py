import sendgrid
from utils import web
from flask import url_for
from model.authentication import UserManager

def send_confirm_email(email,token):
    sg = sendgrid.SendGridAPIClient(apikey=web.get_config()['SENDGRID_API_KEY'])
    data = {
        "personalizations": [
            {
                "to": [
                    {
                        "email": email
                    }
                ],
                "subject": "welcome to sep,confirm your account"
            }
        ],
        "from": {
            "email": "sep-music-therapy@gmail.com"
        },
        "content": [
            {
                "type": "text/HTML",
                "value": "<p>Welcome! Thanks for signing up. Please follow this link to activate your account:</p><br>"+token
            }
        ]
    }
    response = sg.client.mail.send.post(request_body=data)
    print(response.status_code)
    print(response.body)
    print(response.headers)

def send_forgot_email(email):
    sg = sendgrid.SendGridAPIClient(apikey=web.get_config()['SENDGRID_API_KEY'])
    if UserManager.getcodebyEmail(email) is not None:
        code = UserManager.getcodebyEmail(email)
        token = url_for('.forgotpassword', code = code)
        data = {
            "personalizations": [
                {
                    "to": [
                        {
                            "email": email
                        }
                    ],
                    "subject": "welcome to sep,confirm your account"
                }
            ],
            "from": {
                "email": "sep-music-therapy@gmail.com"
            },
            "content": [
                {
                    "type": "text/HTML",
                    "value": token
                }
            ]
        }
        response = sg.client.mail.send.post(request_body=data)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    else :
        return None

