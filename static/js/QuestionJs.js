var personchoose= "123";

function setchoose(va){
	personchoose= va;
}

function reset(questionloction){
	var str= questionloction;
	var temp = str+"_reset";
	var questionloc=document.getElementById(str);
	questionloc.disabled=false;
	var often = document.getElementById("often"+questionloction);
	var rarely = document.getElementById("rarely"+questionloction);
	var sometime= document.getElementById("sometime"+questionloction);
	often.checked=false;
	rarely.checked=false;
	sometime.checked=false;
}


function showresult(questionloction){
	var va= personchoose;
	var modal = document.getElementById('myModal-activity');
	// Get the <span> element that closes the modal
	var span = document.getElementById("close-activity");
	var button = document.getElementById("buttonYesorNo");
 	var questionloc= document.getElementById(questionloction);
	questionloc.disabled = true;
	button.style.visibility='hidden';
	modal.style.display = "block";
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	if (va =="always"){
		document.getElementById("content").innerHTML = "Sounds like you have a really powerful way of using music to reinforce positive experiences.  That is great.  If there are some particularly important times you want to remember, consider making a playlist that is labelled so you can go straight to that group of songs when you want to.  It does not have to be many songs, but it is great to have them labelled for easy access to important memories";
	}
	if (va=="often"){
		document.getElementById("content").innerHTML = "It is easy to get in the habit of listening to music that connects to negative memories.  You probably hope that it will help you process the feelings and get some relief from the negative associations you have with those bad memories, but it does not always work that way.  Please do the following exercise to check whether the ways you are using music is really helping.";
	}

	if (va =="sometime"){
		document.getElementById("content").innerHTML = "It is great that you have been using music to connect you to positive memories at times.  Music is a really powerful way of reinforcing parts of our lives that we want to stay connected to, and you could do it even more than you are currently.  Why not check out our activity for Music and Memories.";
		button.style.visibility='visible';
	}
	if (va=="rarely"){
		document.getElementById("content").innerHTML = "It is great if you are not in the habit of repeatedly listening to songs that connect to negative memories. It can really intensify how bad you feel if you do this and sometimes people get into the habit without noticing.  Hopefully you are using music to connect to positive memories?  If you’d like to try it out, please go to this activity to get some ideas.";
	}
	if (va=="never"){
		document.getElementById("content").innerHTML = "Perhaps you have not thought about using music to connect to positive memories.  It can be a really powerful way of reinforcing the things that make you the way you are.  This might include things like sports songs, love songs, party songs, songs from special events, and other things that have happened in your life when you were listening to a particular piece of music.  Or it could be that they lyrics or the sound of a song reminds you of something positive that happened in your life. Try out the exercise to help you work through some ideas, and remember, you have to be careful if you are using music to connect you to negative memories.  It is not always helpful to reinforce negative experiences and music can make the experience even stronger.  If you are doing this, try out this activity to make sure you are not making yourself feel worse.";
	}
}




function goactivity(){
}
function backtoquestionnaire(){
	document.getElementById('myModal-activity').style.display = "none";
}

function pickone(){

	$(function () {$('#collapse1').collapse('hide')});
	$(function () {$('#collapse2').collapse('hide')});
	$(function () {$('#collapse3').collapse('hide')});
	$(function () {$('#collapse4').collapse('hide')});
	$(function () {$('#collapse5').collapse('hide')});

	var index = parseInt(Math.random()*5,10);
	switch(index){
		case 0:{
			$(function () {
				$('#collapse1').collapse('show')});
			break;
		}
		case 1:{
			$(function () {
				$('#collapse2').collapse('show')});
			break;
		}
		case 2:{
			$(function () {
				$('#collapse3').collapse('show')});
			break;
		}
		case 3:{
			$(function () {
				$('#collapse4').collapse('show')});
			break;
		}
		case 4:{
			$(function () {
				$('#collapse5').collapse('show')});
			break;
		}
	}
	document.getElementById("pick").disabled = true;
}
