function getData() {
    var x = document.getElementById("data_options").value;
    console.log('/getCsv/'+x);
    var url = '/getCsv/'+x
    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){
      data.shift()
      console.log(data);
      
    })
  }