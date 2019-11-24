function callHeatMap(cls, fname){
    if(document.getElementById('clusternum').value!==''){
        fname=String(3)
    }
    console.log(cls,fname);
        
    if(cls!==''){    
            
        var url = '/getCorrMat?col='+cls+'&file='+fname;
        //calling api to fetch data for correlation matrix
        fetch(url)
        .then((resp)=>resp.json())
        .then(function(data){
            console.log(data);
            
            renderHeatMap(data)
        })
    }

}

//Creating Correlation Matrix
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
            minColor: '#ff0045',
            maxColor: '#ffba00'
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
                return '<b>' + this.series.xAxis.categories[this.point.x] + ' vs ' +
                    this.series.yAxis.categories[this.point.y] + this.point.value+'</b>';
            }
        },
    
        series: [{
            name: 'Correlation matrix',
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

/**
 * [1] Heat map. Retrieved November 23, 2019, from https://www.highcharts.com/demo/heatmap.
 */