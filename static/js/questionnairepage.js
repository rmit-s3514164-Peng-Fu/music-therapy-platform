/**
 * Created by zengzequn on 30/10/16.
 */
var currentfeedback;
var currentquestion;
var activityopen
var submitbuttonloc;


function setchoose(question, feedback, activity) {
    currentfeedback = feedback;
    currentquestion = question;
    activityopen = activity;
}

function showfeedback(name) {
    var modal = document.getElementById('myModal-activity');
    // Get the <span> element that closes the modal
    var span = document.getElementById("close-activity");
    var button = document.getElementById("buttonYesorNo");


    button.style.visibility = 'hidden';
    modal.style.display = "block";
    var submitbutton = document.getElementById(name);
    submitbuttonloc = submitbutton;
    submitbutton.disabled = true;
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
    if (currentfeedback == null) {
        document.getElementById("content").innerHTML = "Please Choose any one option!"
    }
    else {
        document.getElementById("content").innerHTML = currentfeedback;
    }

    if (activityopen == "True") {
        button.style.visibility = 'visible';

    }
    else {
        currentactivity = null;
        currentfeedback = null;
        activityopen = false;
    }

}

function goactivity() {
    var loc=currentquestion+"activity";
    var id = document.getElementById(loc).value;
    var ur= "/activity#"+id;
    window.open(ur);
    //window.location.href = ur;
}




function reset(questionloction) {
    var str = "button" + questionloction;
    var questionloc = document.getElementById(str);
    questionloc.disabled = false;
}


function backtoquestionnaire() {
    document.getElementById('myModal-activity').style.display = "none";
}
