function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

// window.requestAnimationFrame(redraw);
	// function redraw() {
	// 	_this.render(_this.delegate.returnMomentaryLUFS());
	// 	//_this.renderShortTerm(_this.delegate.returnShortTermLUFS());
	// 	window.requestAnimationFrame(redraw);
	// }