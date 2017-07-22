from model import schema


class new_user(object):
    def user(self, email, firstname, lastname, password, age, gender):
        with self.db.session_scope() as session:
            new_user = schema.User()
            new_user.u_email = email
            new_user.u_firstname = firstname
            new_user.u_lastname = lastname
            new_user.password = new_user.set_password(password)
            new_user.u_age = age
            new_user.u_gender = gender
            session.add(new_user)
            session.commit()

    def getuser(self, email):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            return user

    def confirm(self, email):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            user.u_isconfirmed = True
            session.commit()

    def checkconfirm(self, email):
        with self.db.session_scope() as session:
            user = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            confirm = user.u_isconfirmed
            return confirm

    def check_email(self, email):
        with self.db.session_scope() as session:
            e = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if e is not None:
                return False
            else:
                return True

    def all_email(self):
        with self.db.session_scope() as session:
            alluser = session.query(schema.User).all()
            allemail = []
            for x in range(0, len(alluser)):
                allemail.append(alluser[x].u_email)
            return allemail

    def profile(self, email):
        with self.db.session_scope() as session:
            prof = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if prof is not None:
                return dict(id=prof.u_id, email=prof.u_email, firstname=prof.u_firstname, lastname=prof.u_lastname,
                            is_admin=prof.u_isadmin)

    def changeProfile(self, email, new_email, firstname, lastname, is_admin):
        with self.db.session_scope() as session:
            prof = session.query(schema.User).filter(schema.User.u_email == email).one_or_none()
            if prof is not None:
                prof.u_email = new_email
                prof.u_firstname = firstname
                prof.u_lastname = lastname
                prof.u_isadmin = is_admin
                session.commit()

    def __init__(self, db):

        self.db = db
