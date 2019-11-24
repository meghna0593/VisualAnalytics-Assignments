var dataOrg = []
function getData(btn) {	
	//to hide heatmap
	var element = document.getElementById('heat-map')
	element.style.visibility = 'hidden'
	document.getElementById('clusternum').value=''
    var x = document.getElementById("data_options").value;
	if (btn===2){
		x=0
		document.getElementById("data_options").value = String(0)		 
	}
    console.log('/getCsv/'+x);
    var url = '/getCsv/'+x
    fetch(url)
    .then((resp)=>resp.json())
    .then(function(data){		
	dataOrg = JSON.parse(data['data'])

	uploadFile(x,JSON.parse(data['data']),data['metadata'])
    })
  }

//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(num, dataX, dataC){	

	dataOrg = dataX
    document.getElementById('checkBoxDiv').innerHTML = '';	
    retrieveCsvData(dataC,num)
}

function retrieveCsvData(csvFile,num){
  
  createCheckBoxes(csvFile,num)
  sendData(csvFile);
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

//Bonus functionality
function displayBonusOpt(){
	var element = document.getElementById('heat-map')
	element.style.visibility = 'hidden'
	document.getElementById('clusternum').value=''
	if(document.getElementById('bonusbtn').innerHTML === 'Bonus'){
		//getting a list of categorical data for the drop down menu
		fetch('/getCategorical')
		.then((resp)=>resp.json())
		.then(function(data){	
			console.log(data);
			var div = document.querySelector("#dropDownOption"),
			select = document.createElement("select");
			data['cols'].map((e,i)=>select.options.add( new Option(e,i) ))  
			div.appendChild(select);
			document.getElementById('bonusbtn').innerHTML='Create Radviz Plot'
		})
	}	
	else{
		catId = $('#dropDownOption').children().val()
		//calling api for creating radviz plot from processed dataset (Assignment 1)
		fetch('/getRadvizData/'+catId)
		.then((resp)=>resp.json())
		.then(function(data){
			console.log(JSON.parse(data['data']));
			uploadFile(99,JSON.parse(data['data']),data['metadata'])
		})
	}
}

//Sending data to plot Radviz
function sendData(header){  
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
