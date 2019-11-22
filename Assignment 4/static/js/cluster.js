function createCluster(){

    var fname = document.getElementById("data_options").value
    var clusternum = document.getElementById('clusternum').value
    var element = document.getElementById('heat-map')
    element.style.visibility = 'hidden'   
    if (clusternum===''){
        clusternum = 5
    }
    var url = '/getClusterData?clstr='+clusternum+'&file='+fname;    
    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){
        uploadFile(fname,JSON.parse(data['data']),data['metadata'])
    })
}