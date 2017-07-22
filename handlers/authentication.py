from flask import redirect
from flask import request, render_template, url_for, flash, session
from model.authentication import UserManager, load_user
from model.img import img
from model.user import new_user
from model.email import send_confirm_email
from model.token import generate_confirmation_token, confirm_token
from model.playlist import PlaylistManager
from utils import web
from model import email


@web.json_method
def login():
    should_redirect = False
    if web.get_current_user() is None:
        should_redirect = True
    manager = UserManager(web.get_db())
    return dict(redirect='/user' if should_redirect else None, status=manager.api_login_user(request.json))


def logout():
    web.logout_user()
    return redirect('/')


def loginnormal():
    config = web.get_config()
    if request.method == 'POST':
        user_email = request.form["user[email]"]
        user_password = request.form["user[pwd]"]
        manager = UserManager(web.get_db())
        if manager.checkconfirm(user_email) is True:
            login_user = manager.login_user(user_email, user_password, 'standard')
            if login_user is not None:
                id = login_user.get_id()
                name = img(web.get_db()).all_name()
                count = img(web.get_db()).all_count()
                web.login_user(load_user(id))
                session['u_email'] = user_email
                return redirect('/user')
            else:
                return render_template("/inforPage.html",
                                       infor="Sorry, login failed, please check your Email or password and try again!",
                                       **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))
        else:
            send = send_confirm_email
            token = generate_confirmation_token(user_email)
            confirm_url = url_for('confirm_email', token=token, _external=True)
            send(user_email, confirm_url)
            return render_template("/inforPage.html", infor="Sorry Please Confirm by email! Again. Email Send Again",
                                   **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


def signup():
    if request.method == 'POST':
        config = web.get_config()
        user_email = request.form["u_email"]
        user_firstname = request.form["u_firstname"]
        user_lastname = request.form["u_lastname"]
        user_password = request.form["u_password"]
        user_age = request.form["u_age"]
        user_gender = request.form["user[gender]"]
        if new_user(web.get_db()).check_email(user_email):
            new_user(web.get_db()).user(user_email, user_firstname, user_lastname, user_password, user_age, user_gender)
            send = send_confirm_email
            token = generate_confirmation_token(user_email)
            confirm_url = url_for('confirm_email', token=token, _external=True)
            send(user_email, confirm_url)
            return render_template("/inforPage.html",
                                   infor="Please wait for a while and confirm your verification email. Thanks!",
                                   **dict(gauth_key=config['GAUTH_KEY'],
                                          fb_key=config['FB_KEY']))
        else:
            return render_template("/inforPage.html",
                                   infor="Oops, this user has already existed!",
                                   **dict(gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


def confirm_email(token):
    try:
        config = web.get_config()
        email = confirm_token(token)
        if email is False:
            return render_template("/inforPage.html",
                                   infor="Oops, link expired, please sign up again",
                                   **dict(gauth_key=config['GAUTH_KEY'],
                                          fb_key=config['FB_KEY']))
    except:
        flash('The confirmation link is invalid or has expired.', 'danger')
    user = new_user(web.get_db()).getuser(email)

    if user.u_isconfirmed:
        return render_template("/inforPage.html",
                               infor="Account confirmed. Please login.", **dict(gauth_key=config['GAUTH_KEY'],
                                                                                fb_key=config['FB_KEY']))
    else:
        new_user(web.get_db()).confirm(email)
        return render_template("/inforPage.html",
                               infor="Congratulations! Confirmation complete. Thanks for your patient!",
                               **dict(gauth_key=config['GAUTH_KEY'],
                                      fb_key=config['FB_KEY']))


def changpassword():
    if request.method == 'POST':
        config = web.get_config()
        useremail = request.form["change[email]"]
        oldpassword = request.form["change[oldpassword]"]
        newpassword = request.form["change[newpassword]"]
        manager = UserManager(web.get_db())
        if manager.changePassword(useremail, oldpassword, newpassword):
            # should use log out here?
            return render_template("/inforPage.html", infor="Change password successfully, please login again", **dict(
                gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))
        else:
            return render_template("/inforPage.html", infor="Oops! Failed to change password, please check!", **dict(
                gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))


def forgot_confrimurl(token):
    try:
        email = confirm_token(token)
    except:
        flash('The confirmation link is invalid or has expired.', 'danger')
    return render_template("/admin/forgotpassword.html", useremail=email)


def sendemailforgotpassword():
    if request.method == 'POST':
        config = web.get_config()
        useremail = request.form["user[email_forgot]"]
        manager = UserManager(web.get_db())
        if manager.isUserbyEmail(useremail):
            send = send_confirm_email
            token = generate_confirmation_token(useremail)
            confirm_url = url_for('forgot_confrimurl', token=token, _external=True)
            send(useremail, confirm_url)
            return render_template("/inforPage.html", infor="Email sent successfully.", **dict(
                gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']))
        else:
            return render_template("/inforPage.html", infor="The email does not exist, please check your email"
                                   , **dict(
                    gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY'])
                                   )


def forgotpwd():
    config = web.get_config()
    if request.method == 'POST':
        useremail = request.form["user_email"]
        newpassword = request.form["user[password_forgot]"]
        manager = UserManager(web.get_db())
        manager.changePasswordBynew(useremail, newpassword)
        return render_template("/inforPage.html", infor="Password change successfully, please login again.", **dict(
            gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']), is_logged_in=web.is_logged_in(),
                               user_email=session['u_email'])
    else:
        return render_template("/inforPage.html", infor="Password change failed.", **dict(
            gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']), is_logged_in=web.is_logged_in(),
                               user_email=session['u_email'])


def update_user_profile():
    config = web.get_config()
    if request.method == 'POST':
        u_email = session['u_email']
        new_firstname = request.form.get("new_fristname")
        new_lastname = request.form.get("new_lastname")
        new_genre = request.form.get("new_genre")
        password = request.form.get("password")
        new_password = request.form.get("new_password")
        print(new_lastname,new_firstname,new_genre)
        if UserManager(web.get_db()).update_profile(u_email, new_firstname, new_lastname, new_genre, password,
                                                    new_password):
            return render_template("/inforPage.html", infor="Your profile was updated successfully!", **dict(
                gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']), is_logged_in=web.is_logged_in(),
                                   user_email=session['u_email'])
        else:
            return render_template("/inforPage.html",
                                   infor="Failed to update your profile, please check and update again.", **dict(
                    gauth_key=config['GAUTH_KEY'], fb_key=config['FB_KEY']), is_logged_in=web.is_logged_in(),
                                   user_email=session['u_email'])

def register_endpoints(app):
    app.add_url_rule('/api/login', 'api_login', login, methods=['POST'])
    app.add_url_rule('/api/logout', 'api_logout', logout)
    app.add_url_rule('/signup', 'signup', signup, methods=['POST'])
    app.add_url_rule('/changpassword', 'changpassword', changpassword, methods=['POST'])
    app.add_url_rule('/forgotpwd', 'forgotpwd', forgotpwd, methods=["POST"])
    app.add_url_rule('/confirm/<token>', 'confirm_email', confirm_email)
    app.add_url_rule('/forgot_confrimurl/<token>', 'forgot_confrimurl', forgot_confrimurl)
    app.add_url_rule('/sendemailforgotpassword', 'sendemailforgotpassword', sendemailforgotpassword, methods=['POST'])
    app.add_url_rule('/loginnormal', 'usertest', loginnormal, methods=['POST'])
    app.add_url_rule('/update_user_profile', 'update_user_profile', update_user_profile, methods=['POST'])
    # app.add_url_rule('/delete_playlist', 'delete_playlist', delete_playlist, methods=['POST'])
