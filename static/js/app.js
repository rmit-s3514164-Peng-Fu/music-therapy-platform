

var App = (function(){
    var initialiased = false;
    var initQueue = [];

    var credentials = {};

    function _login_gauth(token) {
        credentials.gauth_token = token;
        if(!initialiased) initQueue.push(_do_token_login);
        else {
            _do_token_login();
        }
    }

    function _login_fb(token, user_id) {
        credentials.fb_token = token;
        credentials.fb_id = user_id;
        if(!initialiased) initQueue.push(_do_token_login);
        else {
            _do_token_login();
        }
    }

    function _do_token_login() {
        $.ajax('/api/login', {
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify(credentials),
            success: function(data) {
                var redirect = data['redirect'];
                if(redirect) {
                    window.location = redirect;
                }
            }
        });
    }

    function __init__() {
        if(initialiased) return;
        initialiased = true;
        initQueue.forEach(function(fn){fn();});

    }
    return {
        login_guath: _login_gauth,
        login_fb: _login_fb,
        init: __init__
    }
}());

$(document).ready(function(){
    App.init();
});
