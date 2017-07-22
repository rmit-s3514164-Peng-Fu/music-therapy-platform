import handlers
import model
from server import app

import unittest
import Flask.ext.test

class FlaskTestCase(unittest.TestCase):
    pass

# Login
# Index page
# Sign up
# Logout
# change password
# send email

def login(self, username, password):
    return self.app.post('/loginnormal',data=dict(
        username= username,
        password=password),follow_redirects=True)

def logout(self):
    return self.app.get('/logout', follow_reditrects=True)

def test_login_logout(self):
    rv=self.login('zequn1030@163.com')



if __name__ == '__main__':
    unittest.main()
