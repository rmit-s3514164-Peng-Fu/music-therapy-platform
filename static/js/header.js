/**
 * Created by zengzequn on 15/10/16.
 */
var currentmodal = null;
function Showdetail() {
    if (currentmodal != null) {
        closeNewModel(currentmodal);
    }
    var newcontact = document.getElementById('model_Newcontactus');
    currentmodal = "model_Newcontactus";
    newcontact.style.display = "block";

}

function loginpage() {
    if (currentmodal != null) {
        closeNewModel(currentmodal);
    }
    var newcontact = document.getElementById('loginpage');
    currentmodal = "loginpage";
    newcontact.style.display = "block";

}

function signup() {
    if (currentmodal != null) {
        closeNewModel(currentmodal);
    }
    var newcontact = document.getElementById('singUp');
    currentmodal = "singUp";
    newcontact.style.display = "block";
}

function resetpassword() {
    if (currentmodal != null) {
        closeNewModel(currentmodal);
    }
    var reset = document.getElementById('forgotpassword');
    currentmodal = "forgotpassword";
    reset.style.display = "block";
}

function changepassword(){
    if (currentmodal!=null){
        closeNewModel(currentmodal);
    }
    var newmodal= document.getElementById('changePassword');
    currentmodal="changePassword";
    newmodal.style.display="block";
}

function closeNewModel(val) {
    var id = val;
    document.getElementById(id).style.display = "none";
}

function isValidEmail() {
    var strEmail = document.getElementById('u_email').value;
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
    if (re.test(strEmail)) {
        document.getElementById('spaceUser').innerHTML = "Correct Email Address";
    } else {
        document.getElementById('spaceUser').innerHTML = "Email Address Incorrect！";
        document.getElementById('user_email').focus();
    }
}

function cleanSpace() {
    var space = document.getElementById('spaceUser');
    space.innerHTML = " ";
}

function isValidPassword() {
    var pwd = document.getElementById('u_password').value;
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
    var repwd = document.getElementById('user_password_confirmation').value;
    var perpwd = document.getElementById('u_password').value;
    if (repwd == perpwd) {
        document.getElementById('spacePwd-second').innerHTML = "Correct Password Input";
    } else {
        document.getElementById('spacePwd-second').innerHTML = "The second input incorrect";
    }
}


function cleanSpacepwdfirst() {
    var space = document.getElementById('spacePwd-first');
    space.innerHTML = " ";
}
function cleanSpacepwdscond() {
    var space = document.getElementById('spacePwd-second');
    space.innerHTML = " ";
}

function isValidage() {
    var age = document.getElementById('u_age').value;
   var reg = new RegExp("^(\\d|[1-9]\\d|100)$");
    if (reg.test(age)) {
        document.getElementById('birthday-age').innerHTML = "Correct Age Input";
    }
    else {
        document.getElementById('birthday-age').innerHTML = "Incorrect Age Input";
    }
}
function cleanspace_age() {
    document.getElementById('birthday-age').innerHTML = " ";
}

function validateForm() {
    var formname = document.forms["login_form"];
    var x = formname["user[email]"].value;
    var y = formname["user[pwd]"].value;
    if (x == null || x == "") {
        alert("Email Address must be filled out");
        return false;
    }
    if (y == null || y == "") {
        alert("Password must be filled out");
        return false;
    }
}

function validateForm_signup() {
    var formname = document.forms["formname_signup"];
    var firstname = formname["u_firstname"].value;
    var lastname = formname["u_lastname"].value;
    var email = formname["u_email"].value;
    var password= formname["u_password"].value;
    var re_password= formname["user[password_confirmation]"].value;
    var age = formname["u_age"].value;
    var gender = formname["user[gender]"].value;

    if ((firstname ==null || firstname == "") ||(lastname ==null|| lastname=="") ){
        alert("First Name or Last Name must be filled out");
        return false;
    }
    if (email==null || email==""){
        alert("Email Address must be filled out");
        return false;
    }
    if ((password== null || password =="")||(re_password==null || re_password=="")){
        alert("Password must be filled out");
        return false;
    }
    if (age==null || age ==""){
        alert("Age must be filled out");
        return false;
    }
    if (gender==null || gender ==""){
        alert("Gender must be filled out");
        return false;
    }
}