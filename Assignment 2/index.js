var headerOrg, headerUpdate, dataOrg;
//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(num){
	document.getElementById('checkBoxDiv').innerHTML = '';	
	if(num == 0){
		msg = "<br>Selected CSV file is:winequality-red.csv<b>";
		document.getElementById("msg").innerHTML = msg;	
		retrieveCsvData("data/winequality-red.csv",num);
	}
	else{
		console.log("inside num1");
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
		headerOrg = headerUpdate= d3.keys(data[0]);
		dataOrg = data
		createCheckBoxes(headerUpdate,num)
		//sending data to create radviz graph with header details
		sendData(headerUpdate);
		
	});
}

function updateAnchor(i){
	console.log(i);
	if(headerUpdate.filter(j=>j==headerOrg[i+1]).length == 0){
		//adds one element back
		headerUpdate = headerOrg.map(e=>e)
	}
	else{
		//removes one element
		headerUpdate = headerOrg.filter((e,idx)=>(idx!=i+1))	
	}
		
	sendData(headerUpdate.slice(1))
}

function createCheckBoxes(labels,num){
	var a = d3.select('#checkBoxDiv')
	a.select('#checkBoxDiv')
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
			.attr("id", function(d,i) { return 'a'+i; })
			.on("click", function(d,i) { updateAnchor(i) });
	
}

function sendData(header){
	
	const radvizId = document.querySelector('#radviz');
	const colorAccessor = function(d){ return d[header[header.length-1]]; }; //dimension used for coloring
	const dimensions = header.slice(0,header.length-1) //does not contain the last column	
	console.log(header[header.length-1]);
	
	renderRadviz()
		.radvizDOM(radvizId)
		.data(dataOrg)
		.colorAccessor(colorAccessor)
		.dimensions(dimensions)
		.header(header)
		.call()

}