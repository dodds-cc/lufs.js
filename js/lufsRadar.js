lufsRadar = function(_opt) {
	var opt = {
		delegate: false,
		title: false,
		width:500,
		height:500,
		radarSpeed:1
	};
	extend(opt, _opt);

	this.delegate = opt.delegate;
	this.title = opt.title;
	this.width = opt.width;
	this.height = opt.height;
	this.playing = false;
	this.radarSpeed = opt.radarSpeed;
	this.init();
	this.initial = 0;
};


lufsRadar.prototype.init = function () {
	var _this = this;
	this.container = document.createElement('div');
	this.container.style.width = this.width;
	this.container.style.margin = '0 auto';

	if (this.title) {
		this.containerTitle = document.createElement('h1');
		this.containerTitle.innerHTML = this.title;
		this.container.appendChild(this.containerTitle);
	}
	
	this.runTheClock = false;
	this.timeDisplay = document.createElement('h4');
	this.timeDisplay.innerHTML = '00:00:00';

	this.lufsDisplay = document.createElement('h4');
	this.lufsDisplay.innerHTML = 'Momentary 0.0 LUFS';
	this.lufsDisplay2 = document.createElement('h4');
	this.lufsDisplay2.innerHTML = 'Short Term 0.0 LUFS';
	
	this.controls = {};
	this.controls.playButton = document.createElement('button');
	this.controls.playButton.innerHTML = 'Play';
	this.controls.playButton.onclick = function() {
		_this.controls.playButton.style.display = 'none';
		_this.controls.stopButton.style.display = '';
		_this.delegate.play();
	};
	this.controls.stopButton = document.createElement('button');
	this.controls.stopButton.innerHTML = 'Stop';
	this.controls.stopButton.style.display = 'none';
	this.controls.stopButton.onclick = function() {
		location.reload();
	};

	this.scale = [
		{
			label:-40, 
			colour:'#000000'
		},
		{
			label:-36, 
			colour:'#00AEA9'
		},
		{
			label:-30, 
			colour:'#00C343'
		},
		{	label:-24, 
			colour:'#00FD00'
		},
		{	label:-18, 
			colour:'#FFCC00'
		}
	];

	this.canvas = document.createElement('canvas');
	this.canvas.height = this.height;
	this.canvas.width = this.width;
	this.canvasContext = this.canvas.getContext("2d");
	this.canvasContext.imageSmoothingEnabled = true;
	this.gradient = this.canvasContext.createLinearGradient(0,this.width/2,0,this.width);
	this.canvasContext.strokeStyle = '#252525';

	for (var i = 0; i < this.scale.length; i++) {
		var point = (1/this.scale.length) * i;
		var endPoint =((1/this.scale.length) * (i+1)) - 0.000000000005;
		this.gradient.addColorStop(point, this.scale[i].colour);
		this.gradient.addColorStop(endPoint, this.scale[i].colour);

	}
    this.drawGuides();
	this.container.appendChild(this.canvas);
	this.container.appendChild(this.timeDisplay);
	this.container.appendChild(this.lufsDisplay);
	this.container.appendChild(this.lufsDisplay2);
	this.container.appendChild(this.controls.playButton);
	this.container.appendChild(this.controls.stopButton);

	this.requestAnimationFrameSetup();
};

lufsRadar.prototype.startClock = function() {
	this.startTime = new Date();
	this.runTheClock = true;
};

lufsRadar.prototype.stopClock = function() {
	this.startTime = new Date();
	this.runTheClock = false;
};

lufsRadar.prototype.requestAnimationFrameSetup = function() {
	var _this = this;
	//redraw for the Short Term LUFS
	setInterval(function(){
		_this.renderShortTerm(_this.delegate.returnShortTermLUFS());
	}, 100);
	//redraw for the Momentary LUFS
	setInterval(function(){
		_this.renderMomentary(_this.delegate.returnMomentaryLUFS());
	}, 50);
	//redraw for the duration timer
	setInterval(function(){

		if (_this.runTheClock) {
			currentTime = new Date();
			var updateTime = new Date(currentTime - _this.startTime);
			_this.timeDisplay.innerHTML = updateTime.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		}
	}, 100);
};

lufsRadar.prototype.renderMomentary = function (LUFSObject) {
	var lineHeight;
	if (this.playing) {

		if (LUFSObject === 0) {
			lineHeight = 0;
		} else if (LUFSObject.toFixed(0) > -48 || LUFSObject.toFixed(0) <= -18) {
			lineHeight = (48 + LUFSObject) * ((this.width/2) / 30); 
		} else if (LUFSObject > -18) {
			lineHeight = this.width/2;
		} else if (LUFSObject < -48){
			lineHeight = 0;
		}
	
		this.canvasContext.translate(this.width/2, this.width/2);
	    this.canvasContext.rotate((((3*0.8) * (1/this.radarSpeed))*Math.PI/180));
	    this.canvasContext.translate(-this.width/2, -this.width/2);
	    this.canvasContext.fillStyle = this.gradient;
	    this.canvasContext.fillRect(this.width/2,this.width/2,1, lineHeight);
	    this.canvasContext.translate(0, 0);
	    this.drawGuides();
	    if (LUFSObject !== 0) {
	    this.lufsDisplay.innerHTML = 'Momentary: '+ LUFSObject.toFixed(1) + ' LUFS';
		}
    }
};

lufsRadar.prototype.renderShortTerm = function (LUFSObject) {
	if (this.playing) {
	    this.lufsDisplay2.innerHTML = 'Short Term: ' + LUFSObject.toFixed(1) + ' LUFS';
    }
};

lufsRadar.prototype.drawGuides = function () {
	for (var i = 0; i < this.scale.length; i++) {
		this.canvasContext.beginPath();
	    this.canvasContext.arc(this.width/2, this.width/2, (((this.width/2)/this.scale.length) * (i+1)), 0, 2 * Math.PI, false);
	    this.canvasContext.closePath();
	    this.canvasContext.stroke();
	}
};

lufsRadar.prototype.getElement = function () {
	return this.container;
};