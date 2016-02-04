window.onload = function() {
	var audioContext = new AudioContext();
	var nodeToAnalyse = audioContext.createGain();
	var audioElement = new Audio();
	var streamSource = audioContext.createMediaElementSource(audioElement);

	audioElement.controls = true;
	audioElement.crossOrigin = "anonymous";
	audioElement.src = "http://www2.blackblocs.uk/portfolio/streamProxy.php?server=lyd.nrk.no&port=80&path=nrk_radio_jazz_mp3_h";
	audioElement.loop = true;

	streamSource.connect(nodeToAnalyse);
	nodeToAnalyse.connect(audioContext.destination);

	document.getElementById('lufsContainer').appendChild(audioElement);

	var lufsControllerOne = new lufsController(
		{
			nodeToAnalyse: nodeToAnalyse,
			elementToAppendTo: document.getElementById('lufsContainer')
		}
	);
};