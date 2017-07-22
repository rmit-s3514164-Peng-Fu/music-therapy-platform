$(document).ready(function () {
  $("#learn-more").css("display", "none");
    $("#learn-more").hide();

    //this is for header activity dropdown
    $("#actBefore").click(function () {

        $("#expandAct").toggleClass("expanded");

    });

    //USER CONTROL

    $("#editPl").hide();
    var valueSelected = $('select[name=listPlaylist]').val();

    if (valueSelected != "") {
        $("#deletePlaylist").show(100);
        $("#editPlaylist").show(100);


    } else {
        $("#deletePlaylist").hide(100);
        $("#editPlaylist").hide(100);
    }


    $("select").change(function () {
        valueSelected = $('select[name=listPlaylist]').val();
        if (valueSelected != "") {
            $("#deletePlaylist").show(100);
            $("#editPlaylist").show(100);
            $("#playlistName").val(valueSelected);


        } else {
            $("#deletePlaylist").hide(100);
            $("#editPlaylist").hide(100);
            $("#editPl").hide(500);
            $("#playlistName").val("");

        }

    });


    $("#secPlaylist").hide();
    $("#secQuest").hide();
    $("#secEdPro").hide();


});

//learnmore onclick
 $("#learnMore").click(function () {
        $("#learn-more").toggle(500);
        $('html, body').animate({scrollTop: $('#learn-more').offset().top}, 'slow');
      $("#learn-more").css("display", "block");

    });

    $("#aboutUs").click(function () {
        $("#learn-more").show(500);
        $('html, body').animate({scrollTop: $('#learn-more').offset().top}, 'slow');
      $("#learn-more").css("display", "block");

    });



// USER CP onclick
$("#gotoSecPl").click(function () {
    if ($("#secPlaylist").css("display") == "none") {
        $("#secPlaylist").show();
        $('html, body').animate({scrollTop: $('#secPlaylist').offset().top}, 'slow');
    }
    else {
        $("#secPlaylist").hide();
    }
});

$("#gotoQuest").click(function () {
    if ($("#secQuest").css("display") == "none") {
        $("#secQuest").show();
        // $("#secPlaylist").onfocus();
        $('html, body').animate({scrollTop: $('#secQuest').offset().top}, 'slow');
    }
    else {
        $("#secQuest").hide();
    }
});

$("#gotoEdPro").click(function () {
    if ($("#secEdPro").css("display") == "none") {
        $("#secEdPro").show();
        // $("#secPlaylist").onfocus();
        $('html, body').animate({scrollTop: $('#secEdPro').offset().top}, 'slow');
    }
    else {
        $("#secEdPro").hide();
    }
});

$("#createPlaylist").click(function () {
    // $("#editPl").hide(500);
    $("#editPl").show(500);
    $('select[name=listPlaylist]').val("");
    $("#playlistName").val("");
    $('html, body').animate({scrollTop: $('#saveBtn').offset().top}, 'slow');
});
$("#editPlaylist").click(function () {
    // $("#editPl").hide(500);
    $("#editPl").show(500);
    $("#playlistName").val(valueSelected);
    $('html, body').animate({scrollTop: $('#saveBtn').offset().top}, 'slow');
});

