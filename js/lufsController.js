lufsController = function (_opt) {

	var opt = {
		nodeToAnalyse: null,
		elementToAppendTo: null
	};
	extend(opt, _opt);
	this.audioContext = opt.audioContext;
	this.elementToAppendTo = opt.elementToAppendTo;
	this.nodeToAnalyse = opt.nodeToAnalyse;
	this.init();
	};

lufsController.prototype.init = function() {
	var _this = this;

	this.lufsAnalyserOne = new lufsAnalyser({
		nodeToAnalyse: this.nodeToAnalyse,
		delegate: this,
		redrawCallback: function() {
			//_this.lufsRadarOne.render(_this.getLUFSObject());
		}
	});

	this.lufsRadarOne = new lufsRadar({
		title: 'LUFS.js demo',
		delegate: this,
		radarSpeed:16,
		width:this.elementToAppendTo.offsetWidth,
		height:this.elementToAppendTo.offsetHeight
	});
	this.elementToAppendTo.appendChild(this.lufsRadarOne.getElement());

	
};

lufsController.prototype.getLUFSObject = function() {
	return this.lufsAnalyserOne.getLUFSObject();
};

lufsController.prototype.returnMomentaryLUFS = function () {
	return this.lufsAnalyserOne.returnMomentaryLUFS();
};

lufsController.prototype.returnShortTermLUFS = function () {
	return this.lufsAnalyserOne.returnShortTermLUFS();
};

lufsController.prototype.play = function() {
	return this.lufsAnalyserOne.play();
};

lufsController.prototype.stop = function() {
	return this.lufsAnalyserOne.stop();
};

lufsController.prototype.getDuration = function() {
	return this.lufsAnalyserOne.duration;
};

lufsController.prototype.setState = function(state) {
	if(state == 'playing') {
		this.lufsRadarOne.playing = true;
		this.lufsRadarOne.startClock();
	} else if (state === 'stopped') {
		this.lufsRadarOne.playing = false;
		this.lufsRadarOne.stopClock();
	}
};
