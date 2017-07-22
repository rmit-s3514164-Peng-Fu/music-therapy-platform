$(window).ready(function() {
    $.ajax('/api/emotion', {
        method: 'GET',
        success: function (data) {
            var datapoints = [];
            data['data'].forEach(function(p){
                datapoints.push({'label': p['Name'], 'y': p['Count']});
            });
            var chart = new CanvasJS.Chart("chartContainer",
                {
                    animationEnabled: true,
                    title: {
                        text: "What do others feel"
                    },
                    data: [
                        {
                            type: "column", //change type to bar, line, area, pie, etc
                            dataPoints: datapoints
                        }
                    ]
                });
            chart.render();
        }
    });
});
