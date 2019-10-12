var dataOrg;
//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(num){	
	document.getElementById('checkBoxDiv').innerHTML = '';	
	if(num == 0){
		msg = "<br>Selected CSV file is:winequality-red.csv<b>";
		document.getElementById("msg").innerHTML = msg;	
		retrieveCsvData("data/winequality-red.csv",num);
	}
	else{		
		var selectedFile = document.getElementById("csvFile");
		var msg=""
		if('files' in selectedFile){
			if(selectedFile.files.length==0)
				msg="Please select a file"
			else{
				msg = "<br>Selected CSV file is:<b>"+selectedFile.files[0]["name"]+"</b>";
				document.getElementById("msg").innerHTML = msg;	
				retrieveCsvData("data/"+selectedFile.files[0]["name"]+"",num);
			}
		}
	}
	
}

function retrieveCsvData(csvFile,num){
	d3.csv(csvFile, function(error, data) {
		if(error) throw(error);
		dataOrg = data
		createCheckBoxes(d3.keys(data[0]),num)
		//sending data to create radviz graph with header details
		sendData(d3.keys(data[0]));
		
	});
}

function updateAnchor(){
	var checkedItems = document.getElementsByName('checkbx')
	var headerUpdate = [];

	for (var i=0; i<checkedItems.length; i++) {
	   if (checkedItems[i].checked) {
			headerUpdate.push(checkedItems[i].value);
	   }
	}		
	sendData(headerUpdate);
}

function createCheckBoxes(labels,num){
	d3.selectAll('label').remove() //clearing the checkbox on uploading different files
	
	chkBox = d3.select('#checkBoxDiv')
	chkBox
		.data(labels.slice(0,-1))
		.enter()
		.append('label')
			.attr('for',function(d,i){ return 'a'+i; })
			.attr("class","hello")
			.text(function(d) { return d; })
		.append("input")
			.attr("checked", true)
			.attr("type", "checkbox")
			.attr("class","check")
			.attr("value",function(d,i) { return labels[i]; })
			.attr("name","checkbx")
			.attr("id", function(d,i) { return i; })
			.on("click", function() { updateAnchor() });
	console.log(document.getElementById('#checkBoxDiv'));

}

function sendData(header){
	
	const radvizId = document.querySelector('#radviz');
	const colorAccessor = function(d){ return d[header[header.length-1]]; }; //dimension used for coloring
	const dimensions = header.slice(0,header.length-1) //does not contain the last column	
	
	renderRadviz()
		.radvizDOM(radvizId)
		.data(dataOrg)
		.colorAccessor(colorAccessor)
		.dimensions(dimensions)
		.header(header)
		.call()

}