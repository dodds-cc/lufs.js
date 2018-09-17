window.onload = function() {
	var audioContext = new AudioContext();
	var nodeToAnalyse = audioContext.createGain();
	var audioElement = new Audio();
	var streamSource = audioContext.createMediaElementSource(audioElement);

	audioElement.controls = true;
	audioElement.crossOrigin = "anonymous";
	audioElement.src = "audio/demoSong.mp3";
	audioElement.loop = true;

	streamSource.connect(nodeToAnalyse);
	nodeToAnalyse.connect(audioContext.destination);


	//create input for local files
	var fileSelector = document.createElement("input");
	fileSelector.type = 'file';
	fileSelector.onchange = function(e){
    	var file = e.currentTarget.files[0];
    	var objectUrl = URL.createObjectURL(file);
    	audioElement.src= objectUrl;
	};


	document.getElementById('lufsContainer').appendChild(audioElement);
	document.getElementById('lufsContainer').appendChild(fileSelector);

	var lufsControllerOne = new lufsController(
		{
			nodeToAnalyse: nodeToAnalyse,
			elementToAppendTo: document.getElementById('lufsContainer')
		}
	);
};