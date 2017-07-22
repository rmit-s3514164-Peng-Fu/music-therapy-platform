/**
 * Created by zengzequn on 19/10/16.
 */
function isValidPassword() {
    var pwd = document.getElementById('newpassword_forgot').value;
    // at least one number, one lowercase and one uppercase letter
    // at least six characters
    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (re.test(pwd)) {
        document.getElementById('spacePwd-first').innerHTML = "Correct Password Input";
    }
    else {
        document.getElementById('spacePwd-first').innerHTML = "at least one number, one lowercase and one uppercase letter at least length of 6 "
    }
}


function reCheckpassword() {
    var repwd = document.getElementById('passwordconfirm').value;
    var perpwd = document.getElementById('u_password').value;
    if (repwd == perpwd) {
        document.getElementById('spacePwd-second').innerHTML = "Correct Password Input";
    } else {
        document.getElementById('spacePwd-second').innerHTML = "The second input incorrect";
    }
}


function cleanSpacepwdfirst() {
    var space = document.getElementById('space');
    space.innerHTML = " ";
}
function cleanSpacepwdscond() {
    var space = document.getElementById('re-space');
    space.innerHTML = " ";
}