function callHeatMap(cls, fname){
    
    if(document.getElementById('clusternum').value!=''){
        fname=String(3)
    }

    var url = '/getCorrMat?col='+cls+'&file='+fname;

    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){
        renderHeatMap(data)
    })
}

function renderHeatMap(data){
    Highcharts.chart('heat-map', {

        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            plotBorderWidth: 1
        },
    
    
        title: {
            text: 'Correlation matrix'
        },
    
        xAxis: {
            categories: data['metadata']
        },
    
        yAxis: {
            categories: data['metadata'],
            title: null,
            reversed: true
        },
    
        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },
    
        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 280
        },
    
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
                    this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
            }
        },
    
        series: [{
            name: 'Corr mat',
            borderWidth: 1,
            data: data['data'],
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value.charAt(0);
                            }
                        }
                    }
                }
            }]
        }
    
    });
}