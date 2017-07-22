$(document).ready(function () {

    $("#step1").show();
    $("#step2").hide();
    $("#step3").hide();
    $("#step4").hide();
    $("#step5").hide();
        $("#step6").hide();


    $("#writeMore").hide();
    $("#distracted").hide();
    $("#frustrated").hide();


    $("#tabStep1").click(step1Clicked);
    $("#gotoStep1").click(step1Clicked);
    $("#gotoStep1Again").click(step1Clicked);

    $("#tabStep2").click(step2Clicked);
    $("#gotoStep2").click(step2Clicked);

    $("#tabStep3").click(step3Clicked);
    $("#gotoStep3").click(step3Clicked);
    $("#tabStep4").click(step4Clicked);
    $("#gotoStep4").click(step4Clicked);
    $("#tabStep5").click(step5Clicked);
    $("#gotoStep5").click(step5Clicked);

    $("#tabStep6").click(step6Clicked);
    $("#gotoStep6").click(step6Clicked);

    $("#goBacktoStep1").click(function () {
        $("#audStep3a").get(0).play();

// step1Clicked().delay(5000);
    });


    $("#oneWord").keypress(function () {

// alert("der");
        if ($("#oneWord").val() == "") {
            $("#writeMore").hide(500);

        } else {
            $("#writeMore").show(500);
        }
    });

    $("#moreWord").keypress(function () {

// alert("der");
        if ($("#moreWord").val() == "") {
            $("#distracted").hide();
            $("#audStep2a").get(0).pause();

        } else {
            $("#distracted").show(500);
            $("#audStep2a").get(0).play();
            $("#audStep2").get(0).pause();

            $("#frustrated").delay(15000).show(500);
            // $("#audStep2b").show();
        }
    });


    function step1Clicked() {
        $("#tabStep1").addClass("active");
        $("#step1").show(200);


        $("#step2").hide(200);
        $("#tabStep2").removeClass("active");
        $("#step3").hide(200);
        $("#tabStep3").removeClass("active");
        $("#step4").hide(200);
        $("#tabStep4").removeClass("active");
        $("#step5").hide(200);
        $("#tabStep5").removeClass("active");

        $("#step6").hide(200);
        $("#tabStep6").removeClass("active");



        //audio

        $("#audStep1").get(0).play();

        $("#audStep2").get(0).pause();
        $("#audStep2a").get(0).pause();
        $("#audStep2b").get(0).pause();
        $("#audStep3").get(0).pause();
        $("#audStep3a").get(0).pause();
        $("#audStep4").get(0).pause();
        $("#audStep5a").get(0).pause();
        $("#audStep5").get(0).pause();

    }

    function step2Clicked() {
        $("#tabStep2").addClass("active");
        $("#step2").show(200);


        $("#step1").hide(200);
        $("#tabStep1").removeClass("active");
        $("#step3").hide(200);
        $("#tabStep3").removeClass("active");
        $("#step4").hide(200);
        $("#tabStep4").removeClass("active");
        $("#step5").hide(200);
        $("#tabStep5").removeClass("active");
$("#step6").hide(200);
        $("#tabStep6").removeClass("active");


        //audio

        $("#audStep2").get(0).play();

        $("#audStep1").get(0).pause();
        $("#audStep2a").get(0).pause();
        $("#audStep2b").get(0).pause();
        $("#audStep3").get(0).pause();
        $("#audStep3a").get(0).pause();
        $("#audStep4").get(0).pause();
        $("#audStep5a").get(0).pause();
        $("#audStep5").get(0).pause();

    }


    function step3Clicked() {
        $("#tabStep3").addClass("active");
        $("#step3").show(200);


        $("#step1").hide(200);
        $("#tabStep1").removeClass("active");
        $("#step2").hide(200);
        $("#tabStep2").removeClass("active");
        $("#step4").hide(200);
        $("#tabStep4").removeClass("active");
        $("#step5").hide(200);
        $("#tabStep5").removeClass("active");

$("#step6").hide(200);
        $("#tabStep6").removeClass("active");

        //audio
        $("#audStep3").get(0).play();

        $("#audStep2").get(0).pause();
        $("#audStep2a").get(0).pause();
        $("#audStep2b").get(0).pause();
        $("#audStep1").get(0).pause();
        $("#audStep3a").get(0).pause();
        $("#audStep4").get(0).pause();
        $("#audStep5a").get(0).pause();
        $("#audStep5").get(0).pause();
    }

    function step4Clicked() {
        $("#tabStep4").addClass("active");
        $("#step4").show(200);


        $("#step1").hide(200);
        $("#tabStep1").removeClass("active");
        $("#step2").hide(200);
        $("#tabStep2").removeClass("active");
        $("#step3").hide(200);
        $("#tabStep3").removeClass("active");
        $("#step5").hide(200);
        $("#tabStep5").removeClass("active");
$("#step6").hide(200);
        $("#tabStep6").removeClass("active");


        //audio
        $("#audStep4").get(0).play();

        $("#audStep2").get(0).pause();
        $("#audStep2a").get(0).pause();
        $("#audStep2b").get(0).pause();
        $("#audStep1").get(0).pause();
        $("#audStep3a").get(0).pause();
        $("#audStep3").get(0).pause();
        $("#audStep4a").get(0).pause();
        $("#audStep5").get(0).pause();
    }

    function step5Clicked() {
        $("#tabStep5").addClass("active");
        $("#step5").show(200);


        $("#step1").hide(200);
        $("#tabStep1").removeClass("active");
        $("#step2").hide(200);
        $("#tabStep2").removeClass("active");
        $("#step4").hide(200);
        $("#tabStep4").removeClass("active");
        $("#step3").hide(200);
        $("#tabStep3").removeClass("active");
$("#step6").hide(200);
        $("#tabStep6").removeClass("active");


        //audio
        $("#audStep5").get(0).play();

        $("#audStep2").get(0).pause();
        $("#audStep2a").get(0).pause();
        $("#audStep2b").get(0).pause();
        $("#audStep1").get(0).pause();
        $("#audStep3a").get(0).pause();
        $("#audStep4").get(0).pause();
        $("#audStep4a").get(0).pause();
        $("#audStep3").get(0).pause();
    }
function step6Clicked() {
            $("#tabStep6").addClass("active");
     $("#step6").show(200);

        $("#step1").hide(200);
        $("#tabStep1").removeClass("active");
        $("#step2").hide(200);
        $("#tabStep2").removeClass("active");
        $("#step4").hide(200);
        $("#tabStep4").removeClass("active");
        $("#step3").hide(200);
        $("#tabStep3").removeClass("active");
     $("#step5").hide(200);
        $("#tabStep5").removeClass("active");

}
    // var r = ;
// $("#seekBar").val
// var r=$("#seekBar").val();




});



// Submit the playlist with its corresponding tracks' info (i.e. title, author and permalink_url of a track)
$('#savePlaylistBtn').on('click', function (event) {
    event.preventDefault();
    var formdata = new FormData();
    var plist = document.getElementById('plist');
    var playlistTitle = document.getElementById('playlistTitle');
    formdata.append("playlistTitle", playlistTitle.value);
    if (plist.hasChildNodes()) {
        for (var i = 0; i < plist.children.length; i++) {
            var url = plist.children[i].children[1].href;
            var info = plist.children[i].children[1].textContent;
            var sub = info.split(" - ");
            var tTitle = sub[1];
            for (var j = 1; j < sub.length - 1; j++) {
                if (j == sub.length - 2)
                    break;
                else
                    tTitle = tTitle + " - " + sub[j + 1];
            }
            var detail = JSON.stringify({title: tTitle, author: sub[sub.length - 1], url: url});
            formdata.append('trackDetail', detail);
        }
    }
    var request = new XMLHttpRequest();
    request.open("POST", window.location.href);
    request.send(formdata);
});
