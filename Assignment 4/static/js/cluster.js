function createCluster(){
    
    var fname = document.getElementById("data_options").value
    var clusternum = document.getElementById('clusternum').value
    var element = document.getElementById('heat-map')
    element.style.visibility = 'hidden'   
    if (clusternum===''){
        clusternum = 5 //default value for cluster
        document.getElementById('clusternum').value=5
    }
    var url = '/getClusterData?clstr='+clusternum+'&file='+fname;    

    //calling api to fetch data for clustering data points
    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){
        uploadFile(fname,JSON.parse(data['data']),data['metadata'])
    })
}