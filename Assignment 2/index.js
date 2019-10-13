var dataOrg;
//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(num){	
	document.getElementById('checkBoxDiv').innerHTML = '';	
	if(num == 0){
		msg = "<br>Selected CSV file is:<b>winequality-red.csv</b>";
		document.getElementById("msg").innerHTML = msg;	
		retrieveCsvData("data/winequality-red.csv",num);
	}
	else{		
		var selectedFile = document.getElementById("csvFile");
		document.getElementById('slider').value="100"
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
		dataOrg = data1 = data
		createCheckBoxes(d3.keys(data[0]),num)
		//sending data to create radviz graph with header details
		sendData(d3.keys(data[0]));
		
	});
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
	console.log(data1[0]);
	
	for (var i=0; i<checkedItems.length; i++) {
	   if (checkedItems[i].checked) {
			headerUpdate.push(checkedItems[i].value);
	   }
	}
	console.log(lastItem);
	headerUpdate.push(lastItem)	
	sendData(headerUpdate);
}

function createCheckBoxes(labels,num){
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



/*
 * ***References***
 *
 * [1] Process local csv file example. (n.d.). Retrieved October 12, 2019, from http://bl.ocks.org/hlvoorhees/9d58e173825aed1e0218. 
 * [2] File Upload TryIt Editor. (n.d.). Retrieved October 12, 2019, from https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_fileupload_files.
 * [3] WYanChao. (n.d.). WYanChao/RadViz. Retrieved October 12, 2019, from https://github.com/WYanChao/RadViz/blob/master/index.js.
 * [4] Biovisualize. (n.d.). biovisualize/radviz. Retrieved October 12, 2019, from https://github.com/biovisualize/radviz/blob/master/radviz.js.
 * [5] How TO - Display Text when Checkbox is Checked. (n.d.). Retrieved October 12, 2019, from https://www.w3schools.com/howto/howto_js_display_checkbox_text.asp.
 */