/**
 * Created by zengzequn on 25/10/16.
 */
function showadminpage(va) {
    if (va == "usermodify") {
        $("#userlistpage").show();
        $("#questionpage").hide();
        $("#activitypage").hide();
        $("#searchplaylist").hide();
        $("#user_modify").addClass("active");
        $("#question_modify").removeClass("active");
        $("#activity_modify").removeClass("active");
        $("#search").removeClass("active");
    }
    if (va == "questionmodify") {
        $("#userlistpage").hide();
        $("#questionpage").show();
        $("#activitypage").hide();
        $("#searchplaylist").hide();
        $("#user_modify").removeClass("active");
        $("#question_modify").addClass("active");
        $("#activity_modify").removeClass("active");
        $("#search").removeClass("active");

    }
    if (va == "activitymodify") {
        $("#userlistpage").hide();
        $("#questionpage").hide();
        $("#activitypage").show();
        $("#searchplaylist").hide();
        $("#user_modify").removeClass("active");
        $("#question_modify").removeClass("active");
        $("#activity_modify").addClass("active");
        $("#search").removeClass("active");

    }
    if (va == "search") {
        $("#userlistpage").hide();
        $("#questionpage").hide();
        $("#activitypage").hide();
        $("#searchplaylist").show();
        $("#user_modify").removeClass("active");
        $("#question_modify").removeClass("active");
        $("#activity_modify").removeClass("active");
        $("#search").addClass("active");

    }
}

