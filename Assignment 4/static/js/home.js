var dataOrg = []
function getData() {
	//to hide heatmap
	var element = document.getElementById('heat-map')
	element.style.visibility = 'hidden'
    var x = document.getElementById("data_options").value;
    console.log('/getCsv/'+x);
    var url = '/getCsv/'+x
    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){
      // console.log(data['metadata']);
      dataOrg = JSON.parse(data['data'])
      // data.shift()  {fixed acidity: 7.4, volatile acidity: 0.7, citric acid: 0, residual sugar: 1.9, chlorides: 0.076, …}
      uploadFile(x,JSON.parse(data['data']),data['metadata'])
    })
  }

  var dataOrg;
//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(num, dataX, dataC){	
	
    document.getElementById('checkBoxDiv').innerHTML = '';	
	// msg = "<br>Selected CSV data is:<b>"+dataC[x]+"</b>";
    // document.getElementById("msg").innerHTML = msg;
    retrieveCsvData(dataC,num)
	// if(num == 0){
	// 	console.log("inside");
		
	// 	// msg = "<br>Selected CSV file is:<b>winequality-red.csv</b>";
	// 	// document.getElementById("msg").innerHTML = msg;	
  //   // retrieveCsvData("data/winequality-red.csv",num);
  //   retrieveCsvData(dataC,num)
	// }
	// else{		
	// 	// var selectedFile = document.getElementById("csvFile");
	// 	// document.getElementById('slider').value="100"
	// 	// var msg=""
	// 	if('files' in selectedFile){
	// 		if(selectedFile.files.length==0)
	// 			msg="Please select a file"
	// 		else{
	// 			msg = "<br>Selected CSV file is:<b>"+selectedFile.files[0]["name"]+"</b>";
	// 			document.getElementById("msg").innerHTML = msg;	
	// 			// retrieveCsvData("data/"+selectedFile.files[0]["name"]+"",num);
	// 		}
	// 	}
	// }
	
}

function retrieveCsvData(csvFile,num){
  
  createCheckBoxes(csvFile,num)
  sendData(csvFile);
	// d3.csv(csvFile, function(error, data) {
	// 	if(error) throw(error);
	// 	dataOrg = data1 = data
	// 	createCheckBoxes(d3.keys(data[0]),num) //array of cat
	// 	//sending data to create radviz graph with header details
	// 	sendData(d3.keys(data[0]));
		
	// });
}

function changeOpacity(){	
	d3.selectAll('.circle-dt')
		.transition()
		.duration(300)
		.ease(d3.easeLinear)
		.style("opacity", d3.select("#slider").property("value")/100);
	}

function updateAnchor(lastItem){
	var checkedItems = document.getElementsByName('checkbx')
	var headerUpdate = [];
	// console.log(data1[0]);
	
	for (var i=0; i<checkedItems.length; i++) {
	   if (checkedItems[i].checked) {
			headerUpdate.push(checkedItems[i].value);
	   }
	}
	console.log(lastItem);
  headerUpdate.push(lastItem)	
  console.log(headerUpdate);
  
	sendData(headerUpdate);
}

function createCheckBoxes(labels,num){
	console.log(labels);
	
	d3.selectAll('label').remove() //clearing the checkbox on uploading different files
	
	chkBox = d3.select('#checkBoxDiv').selectAll('label')
	chkBox
		.data(labels.slice(0,-1))
		.enter()
		.append('label')
			.attr('for',function(d,i){ return i; })
			.attr("style","font-weight:normal !important;")
			.text(function(d) { return d; })
		.append("input")
			.attr("checked", true)
			.attr("type", "checkbox")
			.attr("class","check")
			.attr("value",function(d,i) { return labels[i]; })
			.attr("name","checkbx")
			.attr("id", function(d,i) { return i; })
			.on("click", function() { updateAnchor(labels[labels.length-1]) });

}

function sendData(header){
	console.log(header);
  
	const radvizId = document.querySelector('#radviz');
	const colorAccessor = function(d){ return d[header[header.length-1]]; };
	const dimensions = header.slice(0,header.length-1) //does not contain the last column	
	
	renderRadviz()
		.radvizDOM(radvizId)
		.data(dataOrg)
		.colorAccessor(colorAccessor)
		.dimensions(dimensions)
		.header(header)
		.call()

}
