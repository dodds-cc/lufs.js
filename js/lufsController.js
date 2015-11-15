lufsJS = function () {
		this.init();
	};

lufsJS.prototype.init = function() {
	var _this = this;

	

	this.lufsAnalyserOne = new lufsAnalyser({
		title: '',
		audioSourceUrl: 'audio/itInterwindes.mp3',
		delegate: this,
		audioContext: null,
		redrawCallback: function() {
			//_this.lufsRadarOne.render(_this.getLUFSObject());
		}
	});

	this.lufsRadarOne = new lufsRadar({
		title: 'LUFS.js demo',
		delegate: this,
		radarSpeed:16,
		width:400,
		height:400
	});
	document.body.appendChild(this.lufsRadarOne.getElement());

	
};

lufsJS.prototype.getLUFSObject = function() {
	return this.lufsAnalyserOne.getLUFSObject();
};

lufsJS.prototype.returnMomentaryLUFS = function () {
	return this.lufsAnalyserOne.returnMomentaryLUFS();
};

lufsJS.prototype.returnShortTermLUFS = function () {
	return this.lufsAnalyserOne.returnShortTermLUFS();
};

lufsJS.prototype.play = function() {
	return this.lufsAnalyserOne.play();
};

lufsJS.prototype.stop = function() {
	return this.lufsAnalyserOne.stop();
};

lufsJS.prototype.getDuration = function() {
	return this.lufsAnalyserOne.duration;
};

lufsJS.prototype.setState = function(state) {
	if(state == 'playing') {
		this.lufsRadarOne.playing = true;
		this.lufsRadarOne.startClock();
	} else if (state === 'stopped') {
		this.lufsRadarOne.playing = false;
		this.lufsRadarOne.stopClock();
	}
};
