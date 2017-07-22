window.onload = function () {


    $("#btnChart").on("click", function () {

        var angry = document.getElementById("joy").value;
        var sad = document.getElementById("peaceful").value;
        var normal = document.getElementById("sadness").value;
        var normal = document.getElementById("angry").value;

        var happy = document.getElementById("longing").value;
        var motivated = document.getElementById("satisfied").value;

        var data = [
            {label: "Joy", y: parseInt(angry)},
            {label: "Peaceful", y: parseInt(sad)},
            {label: "Sadness", y: parseInt(normal)},
            {label: "Angry", y: parseInt(happy)},
            {label: "Longing", y: parseInt(motivated)},
            {label: "Satisfied", y: parseInt(motivated)}

        ];

        var dps = [];

        $.each(data, function (i, item) {
            dps.push({label: item.label, y: item.y});
            // alert(dps[0]);
        });


        var chart = new CanvasJS.Chart("chartContainer", {
            title: {
                text: "What do other's feel about this music"
            },
            // data: [
            // {

            // 	type: "column",
            // 	dataPoints: [
            // 		{ label: "Angry",  y: 10  },
            // 		{ label: "Sad", y: 15  },
            // 		{ label: "Normal", y: 25  },
            // 		{ label: "Happy",  y: 30  },
            // 		{ label: "Motivated",  y: 28  }
            // 	]
            // }
            // ]

            data: [
                {

                    type: "column",
                    dataPoints: dps
                }
            ]
        });
        chart.render();

        return false;
    })

}

