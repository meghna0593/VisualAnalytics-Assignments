//Dynamic File Upload from 'data' folder of this project directory
function uploadFile(){
	var selectedFile = document.getElementById("csvFile");
	var msg=""
	if('files' in selectedFile){
		if(selectedFile.files.length==0)
			msg="Please select a file"
		else{
			msg = "<br>Selected CSV file is:<b>"+selectedFile.files[0]["name"]+"</b>";
			document.getElementById("msg").innerHTML = msg;
		}
		
	}
}