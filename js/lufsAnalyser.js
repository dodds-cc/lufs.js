lufsAnalyser = function(_opt) {
	var opt = {
		title: false,
		width:400,
		height:400,
		audioSourceUrl: false,
		delegate:null,
		redrawCallback: function() {}
	};
	extend(opt, _opt);

	this.delegate = opt.delegate;
	this.redrawCallback = opt.redrawCallback;

	this.title = opt.title;
	this.width = opt.width;
	this.height = opt.height;
	this.audioSourceUrl = opt.audioSourceUrl;
	this.duration = false;
	this.audioContext = false;
	this.audioSourceNode = false;

	this.bin400Left = [];
	this.bin400Right = [];
	for (var i = 0; i < 17640; i++) {
		this.bin400Left.push(0);
		this.bin400Right.push(0);
	}
	this.bin3000Left = [];
	this.bin3000Right = [];
	for (var i = 0; i < 132300; i++) {
		this.bin3000Left.push(0);
		this.bin3000Right.push(0);
	}
	this.sumOfBin400 = 0;
	this.sumOfBin3000 = 0;

	this.shortTermCount = 132300;
	this.shortTermNumberOfCycles = 0;

	this.momentaryCount = 17640;
	this.momentaryNumberOfCycles = 0;

	var _this = this;
	this.init();
};

lufsAnalyser.prototype.init = function() {
	var _this = this;
	this.createAudioMatrix();
	this.setMasterGain(1);
	this.connectNodes();
	this.loadSound(this.audioSourceUrl);
	this.playing = false;
	this.lufsObject = {
		momentaryReading : 0,
		shortTermReading :0,
	};

};

lufsAnalyser.prototype.createAudioMatrix = function() {
	this.audioContext = new AudioContext();
	this.audioSourceNode = this.audioContext.createBufferSource();
	this.masterGainNode = this.audioContext.createGain();
	this.javascriptNode = this.audioContext.createScriptProcessor(2048, 2, 2);
	this.filterOne = this.audioContext.createBiquadFilter();
	this.filterTwo = this.audioContext.createBiquadFilter();

	this.leftChannelGain = this.audioContext.createGain();
    this.splitterNode = this.audioContext.createChannelSplitter();
};

lufsAnalyser.prototype.applyKWeighting = function() {
	this.filterOne.type = 'highshelf';
	this.filterOne.frequency.value = 1650;
	this.filterOne.gain.value = 4;
	this.filterTwo.type = 'highpass';
	this.filterTwo.frequency.value = 40;
};

lufsAnalyser.prototype.applyChannelGain = function () {
	this.leftChannelGain.gain.value = 0.3;

};

lufsAnalyser.prototype.setMasterGain = function(gain) {
	this.masterGainNode.gain.value = gain;
};


lufsAnalyser.prototype.loadSound = function(url) {
	var _this = this;
	var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        _this.audioContext.decodeAudioData(request.response, function(buffer) {
        	_this.audioSourceNode.buffer = buffer;
    		_this.audioSourceNode.loop = true;
    		_this.duration = buffer.length;
        }, _this.onError);
    };
    request.send();
};

lufsAnalyser.prototype.connectNodes = function() {

	this.audioSourceNode.connect(this.filterOne);
	this.filterOne.connect(this.filterTwo);
	this.filterTwo.connect(this.leftChannelGain);
	this.leftChannelGain.connect(this.splitterNode);
	this.applyKWeighting();
	this.applyChannelGain();
	this.splitterNode.connect(this.javascriptNode);
	this.javascriptNode.connect(this.audioContext.destination);

	this.audioSourceNode.connect(this.masterGainNode);
	this.masterGainNode.connect(this.audioContext.destination);
	var _this = this;
	this.javascriptNode.onaudioprocess = function(e) {
		_this.processAudioData.call(_this, e);
	};
};

lufsAnalyser.prototype.play = function () {
	this.audioSourceNode.start(0);
	this.playing = true;
	this.delegate.setState('playing');
};

lufsAnalyser.prototype.stop = function () {
	this.audioSourceNode.stop();
	this.playing = false;
	this.delegate.setState('stopped');
};

lufsAnalyser.prototype.getElement = function() {
	return this.container;
};

lufsAnalyser.prototype.onError = function(error) {
	console.log(error);
};
lufsAnalyser.prototype.processAudioData = function(e) {
	if (this.playing) {
		var leftBuffer = e.inputBuffer.getChannelData(0);
		var rightBuffer = e.inputBuffer.getChannelData(1);
		this.extractAudio(leftBuffer, rightBuffer);
		//this.redrawCallback();
	}
};

lufsAnalyser.prototype.extractAudio = function(array, array2) {
	this.pushToMomentary(array, array2);
	this.pushToShortTerm(array, array2);
};

lufsAnalyser.prototype.pushToMomentary = function(array, array2) {
	for (var i = 0; i < array.length; i++) {
		if (this.momentaryCount === 0) {
			this.momentaryCount = 17640;
			this.momentaryNumberOfCycles += 1;
		}
		this.bin400Left[this.momentaryCount] = array[i];
		this.bin400Right[this.momentaryCount] = array2[i];
		//this.bin400Left[this.momentaryCount] = 0.1369; //-18
		//this.bin400Right[this.momentaryCount] = 0.1369; //-18
		//this.bin400Left[this.momentaryCount] = 0.068; //-24
		//this.bin400Right[this.momentaryCount] = 0.068; //-24
		// this.bin400Left[this.momentaryCount] = 0.0044; //-48
		// this.bin400Right[this.momentaryCount] = 0.0044; //-48
		this.momentaryCount -= 1;
	}
};

lufsAnalyser.prototype.pushToShortTerm = function(array, array2) {
	for (var i = 0; i < array.length; i++) {
		if (this.shortTermCount === 0) {
			this.shortTermCount = 132300;
			this.shortTermNumberOfCycles += 1;
		}
		this.bin3000Left[this.shortTermCount] = array[i];
		this.bin3000Right[this.shortTermCount] = array2[i];
		this.shortTermCount -= 1;
	}
};

lufsAnalyser.prototype.returnMomentaryLUFS = function() {
	// if(this.momentaryNumberOfCycles === 0) {
	// 	return 0;
	// 	console.log('returning 0');
	// }
		this.sumOfBin400 = 0;
		for (var j = 0; j < 17640; j++) {
			this.sumOfBin400 += (this.bin400Left[j] * this.bin400Left[j]);
			this.sumOfBin400 += (this.bin400Right[j] * this.bin400Right[j]);
		}
		var average = this.sumOfBin400 / (17640 + 17640);
		this.lufsObject.momentaryReading = -0.691 + (10 * log10(average));


	return this.lufsObject.momentaryReading;
};

lufsAnalyser.prototype.returnShortTermLUFS = function() {
	// if(this.shortTermNumberOfCycles === 0) {
	// 	return 0;
	// }
		this.sumOfBin3000 = 0;
		for (var j = 0; j < 132300; j++) {
			this.sumOfBin3000 += (this.bin3000Left[j] * this.bin3000Left[j]);
			this.sumOfBin3000 += (this.bin3000Right[j] * this.bin3000Right[j]);
		}
		var average = this.sumOfBin3000 / (132300 + 132300);
		this.lufsObject.shortTermReading = -0.691 + (10 * log10(average));
	
	return this.lufsObject.shortTermReading;
};

lufsAnalyser.prototype.getLUFSObject = function() {
	return this.lufsObject;
};
