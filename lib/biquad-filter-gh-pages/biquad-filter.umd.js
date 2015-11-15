(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BiquadFilter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./dist/biquad-filter');

},{"./dist/biquad-filter":2}],2:[function(require,module,exports){
/**
 * @fileoverview Biquad Filter library
 * @author Arnau.Julia <Arnau.Julia@gmail.com>
 * @version 0.1.0
 */

/**
 * @class BiquadFilter
 * @public
 */
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

var BiquadFilter = (function () {
    function BiquadFilter() {
        _classCallCheck(this, BiquadFilter);

        this.coefficients = [];
        this.numberOfCascade = 1;
        this.resetMemories();
    }

    /**
     * Set biquad filter coefficients
     * @public
     * @param coef Array of biquad coefficients in the following order: gain, firstBiquad b1, firstBiquad b2, firstBiquad a1, firstBiquad a2, secondBiquad b1, secondBIquad b2, etc.
     */

    _createClass(BiquadFilter, [{
        key: "setCoefficients",
        value: function setCoefficients(coef) {
            if (coef) {
                // If there is not a number of biquads, we consider that there is only 1 biquad.
                this.numberOfCascade = this.getNumberOfCascadeFilters(coef);
                // Reset coefficients
                this.coefficients = [];
                // Global gain
                this.coefficients.g = coef[0];
                for (var i = 0; i < this.numberOfCascade; i++) {
                    // Four coefficients for each biquad
                    this.coefficients[i] = {
                        b1: coef[1 + i * 4],
                        b2: coef[2 + i * 4],
                        a1: coef[3 + i * 4],
                        a2: coef[4 + i * 4]
                    };
                }
                // Need to reset the memories after change the coefficients
                this.resetMemories();
                return true;
            } else {
                throw new Error("No coefficients are set");
            }
        }

        /**
         * Get the number of cascade filters from the list of coefficients
         * @private
         */
    }, {
        key: "getNumberOfCascadeFilters",
        value: function getNumberOfCascadeFilters(coef) {
            return (coef.length - 1) / 4;
        }

        /**
         * Reset memories of biquad filters.
         * @public
         */
    }, {
        key: "resetMemories",
        value: function resetMemories() {
            this.memories = [{
                xi1: 0,
                xi2: 0,
                yi1: 0,
                yi2: 0
            }];
            // see http://stackoverflow.com/a/19892144
            for (var i = 1; i < this.numberOfCascade; i++) {
                this.memories[i] = {
                    yi1: 0,
                    yi2: 0
                };
            }
        }

        /**
         * Calculate the output of the cascade of biquad filters for an inputBuffer.
         * @public
         * @param inputBuffer Array of the same length of outputBuffer
         * @param outputBuffer Array of the same length of inputBuffer
         */
    }, {
        key: "process",
        value: function process(inputBuffer, outputBuffer) {
            var x;
            var y = [];
            var b1, b2, a1, a2;
            var xi1, xi2, yi1, yi2, y1i1, y1i2;

            for (var i = 0; i < inputBuffer.length; i++) {
                x = inputBuffer[i];
                // Save coefficients in local variables
                b1 = this.coefficients[0].b1;
                b2 = this.coefficients[0].b2;
                a1 = this.coefficients[0].a1;
                a2 = this.coefficients[0].a2;
                // Save memories in local variables
                xi1 = this.memories[0].xi1;
                xi2 = this.memories[0].xi2;
                yi1 = this.memories[0].yi1;
                yi2 = this.memories[0].yi2;

                // Formula: y[n] = x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]
                // First biquad
                y[0] = x + b1 * xi1 + b2 * xi2 - a1 * yi1 - a2 * yi2;

                for (var e = 1; e < this.numberOfCascade; e++) {
                    // Save coefficients in local variables
                    b1 = this.coefficients[e].b1;
                    b2 = this.coefficients[e].b2;
                    a1 = this.coefficients[e].a1;
                    a2 = this.coefficients[e].a2;
                    // Save memories in local variables
                    y1i1 = this.memories[e - 1].yi1;
                    y1i2 = this.memories[e - 1].yi2;
                    yi1 = this.memories[e].yi1;
                    yi2 = this.memories[e].yi2;

                    y[e] = y[e - 1] + b1 * y1i1 + b2 * y1i2 - a1 * yi1 - a2 * yi2;
                }

                // Write the output
                outputBuffer[i] = y[this.numberOfCascade - 1] * this.coefficients.g;

                // Update the memories
                this.memories[0].xi2 = this.memories[0].xi1;
                this.memories[0].xi1 = x;

                for (var p = 0; p < this.numberOfCascade; p++) {
                    this.memories[p].yi2 = this.memories[p].yi1;
                    this.memories[p].yi1 = y[p];
                }
            }
        }
    }]);

    return BiquadFilter;
})();

exports["default"] = BiquadFilter;
module.exports = exports["default"];

},{"babel-runtime/helpers/class-call-check":4,"babel-runtime/helpers/create-class":5}],3:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":6}],4:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],5:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":3}],6:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":7}],7:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaXF1YWQtZmlsdGVyLmpzIiwiZGlzdC9lczYvYmlxdWFkLWZpbHRlci5lczYuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NyZWF0ZS1jbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ1NxQixZQUFZO0FBQ2xCLGFBRE0sWUFBWSxHQUNmOzhCQURHLFlBQVk7O0FBRXpCLFlBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN4Qjs7Ozs7Ozs7aUJBTGdCLFlBQVk7O2VBWWQseUJBQUMsSUFBSSxFQUFFO0FBQ2xCLGdCQUFJLElBQUksRUFBRTs7QUFFTixvQkFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTVELG9CQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsb0JBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFD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LEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7O0FBRXJELHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTs7QUFFM0Msc0JBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM3QixzQkFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzdCLHNCQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDN0Isc0JBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7QUFFN0Isd0JBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDaEMsd0JBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDaEMsdUJBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUMzQix1QkFBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDOztBQUUzQixxQkFBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQztpQkFDakU7OztBQUdELDRCQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7OztBQUdwRSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDNUMsb0JBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFekIscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNDLHdCQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM1Qyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvQjthQUNKO1NBQ0o7OztXQXpIZ0IsWUFBWTs7O3FCQUFaLFlBQVk7Ozs7QUNWakM7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvYmlxdWFkLWZpbHRlcicpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJpcXVhZCBGaWx0ZXIgbGlicmFyeVxuICogQGF1dGhvciBBcm5hdS5KdWxpYSA8QXJuYXUuSnVsaWFAZ21haWwuY29tPlxuICogQHZlcnNpb24gMC4xLjBcbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBCaXF1YWRGaWx0ZXJcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmlxdWFkRmlsdGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb2VmZmljaWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5udW1iZXJPZkNhc2NhZGUgPSAxO1xuICAgICAgICB0aGlzLnJlc2V0TWVtb3JpZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYmlxdWFkIGZpbHRlciBjb2VmZmljaWVudHNcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIGNvZWYgQXJyYXkgb2YgYmlxdWFkIGNvZWZmaWNpZW50cyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOiBnYWluLCBmaXJzdEJpcXVhZCBiMSwgZmlyc3RCaXF1YWQgYjIsIGZpcnN0QmlxdWFkIGExLCBmaXJzdEJpcXVhZCBhMiwgc2Vjb25kQmlxdWFkIGIxLCBzZWNvbmRCSXF1YWQgYjIsIGV0Yy5cbiAgICAgKi9cbiAgICBzZXRDb2VmZmljaWVudHMoY29lZikge1xuICAgICAgICBpZiAoY29lZikge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm90IGEgbnVtYmVyIG9mIGJpcXVhZHMsIHdlIGNvbnNpZGVyIHRoYXQgdGhlcmUgaXMgb25seSAxIGJpcXVhZC5cbiAgICAgICAgICAgIHRoaXMubnVtYmVyT2ZDYXNjYWRlID0gdGhpcy5nZXROdW1iZXJPZkNhc2NhZGVGaWx0ZXJzKGNvZWYpO1xuICAgICAgICAgICAgLy8gUmVzZXQgY29lZmZpY2llbnRzXG4gICAgICAgICAgICB0aGlzLmNvZWZmaWNpZW50cyA9IFtdO1xuICAgICAgICAgICAgLy8gR2xvYmFsIGdhaW5cbiAgICAgICAgICAgIHRoaXMuY29lZmZpY2llbnRzLmcgPSBjb2VmWzBdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mQ2FzY2FkZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gRm91ciBjb2VmZmljaWVudHMgZm9yIGVhY2ggYmlxdWFkXG4gICAgICAgICAgICAgICAgdGhpcy5jb2VmZmljaWVudHNbaV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGIxOiBjb2VmWzEgKyBpICogNF0sXG4gICAgICAgICAgICAgICAgICAgIGIyOiBjb2VmWzIgKyBpICogNF0sXG4gICAgICAgICAgICAgICAgICAgIGExOiBjb2VmWzMgKyBpICogNF0sXG4gICAgICAgICAgICAgICAgICAgIGEyOiBjb2VmWzQgKyBpICogNF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTmVlZCB0byByZXNldCB0aGUgbWVtb3JpZXMgYWZ0ZXIgY2hhbmdlIHRoZSBjb2VmZmljaWVudHNcbiAgICAgICAgICAgIHRoaXMucmVzZXRNZW1vcmllcygpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBjb2VmZmljaWVudHMgYXJlIHNldFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbnVtYmVyIG9mIGNhc2NhZGUgZmlsdGVycyBmcm9tIHRoZSBsaXN0IG9mIGNvZWZmaWNpZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0TnVtYmVyT2ZDYXNjYWRlRmlsdGVycyhjb2VmKSB7XG4gICAgICAgIHJldHVybiAoY29lZi5sZW5ndGggLSAxKSAvIDQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgbWVtb3JpZXMgb2YgYmlxdWFkIGZpbHRlcnMuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHJlc2V0TWVtb3JpZXMoKSB7XG4gICAgICAgIHRoaXMubWVtb3JpZXMgPSBbe1xuICAgICAgICAgICAgeGkxOiAwLFxuICAgICAgICAgICAgeGkyOiAwLFxuICAgICAgICAgICAgeWkxOiAwLFxuICAgICAgICAgICAgeWkyOiAwXG4gICAgICAgIH1dO1xuICAgICAgICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTk4OTIxNDRcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLm51bWJlck9mQ2FzY2FkZTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLm1lbW9yaWVzW2ldID0ge1xuICAgICAgICAgICAgICAgIHlpMTogMCxcbiAgICAgICAgICAgICAgICB5aTI6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG91dHB1dCBvZiB0aGUgY2FzY2FkZSBvZiBiaXF1YWQgZmlsdGVycyBmb3IgYW4gaW5wdXRCdWZmZXIuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSBpbnB1dEJ1ZmZlciBBcnJheSBvZiB0aGUgc2FtZSBsZW5ndGggb2Ygb3V0cHV0QnVmZmVyXG4gICAgICogQHBhcmFtIG91dHB1dEJ1ZmZlciBBcnJheSBvZiB0aGUgc2FtZSBsZW5ndGggb2YgaW5wdXRCdWZmZXJcbiAgICAgKi9cbiAgICBwcm9jZXNzKGlucHV0QnVmZmVyLCBvdXRwdXRCdWZmZXIpIHtcbiAgICAgICAgdmFyIHg7XG4gICAgICAgIHZhciB5ID0gW107XG4gICAgICAgIHZhciBiMSwgYjIsIGExLCBhMjtcbiAgICAgICAgdmFyIHhpMSwgeGkyLCB5aTEsIHlpMiwgeTFpMSwgeTFpMjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0QnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB4ID0gaW5wdXRCdWZmZXJbaV07XG4gICAgICAgICAgICAvLyBTYXZlIGNvZWZmaWNpZW50cyBpbiBsb2NhbCB2YXJpYWJsZXNcbiAgICAgICAgICAgIGIxID0gdGhpcy5jb2VmZmljaWVudHNbMF0uYjE7XG4gICAgICAgICAgICBiMiA9IHRoaXMuY29lZmZpY2llbnRzWzBdLmIyO1xuICAgICAgICAgICAgYTEgPSB0aGlzLmNvZWZmaWNpZW50c1swXS5hMTtcbiAgICAgICAgICAgIGEyID0gdGhpcy5jb2VmZmljaWVudHNbMF0uYTI7XG4gICAgICAgICAgICAvLyBTYXZlIG1lbW9yaWVzIGluIGxvY2FsIHZhcmlhYmxlc1xuICAgICAgICAgICAgeGkxID0gdGhpcy5tZW1vcmllc1swXS54aTE7XG4gICAgICAgICAgICB4aTIgPSB0aGlzLm1lbW9yaWVzWzBdLnhpMjtcbiAgICAgICAgICAgIHlpMSA9IHRoaXMubWVtb3JpZXNbMF0ueWkxO1xuICAgICAgICAgICAgeWkyID0gdGhpcy5tZW1vcmllc1swXS55aTI7XG5cbiAgICAgICAgICAgIC8vIEZvcm11bGE6IHlbbl0gPSB4W25dICsgYjEqeFtuLTFdICsgYjIqeFtuLTJdIC0gYTEqeVtuLTFdIC0gYTIqeVtuLTJdXG4gICAgICAgICAgICAvLyBGaXJzdCBiaXF1YWRcbiAgICAgICAgICAgIHlbMF0gPSB4ICsgYjEgKiB4aTEgKyBiMiAqIHhpMiAtIGExICogeWkxIC0gYTIgKiB5aTI7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGUgPSAxOyBlIDwgdGhpcy5udW1iZXJPZkNhc2NhZGU7IGUrKykge1xuICAgICAgICAgICAgICAgIC8vIFNhdmUgY29lZmZpY2llbnRzIGluIGxvY2FsIHZhcmlhYmxlc1xuICAgICAgICAgICAgICAgIGIxID0gdGhpcy5jb2VmZmljaWVudHNbZV0uYjE7XG4gICAgICAgICAgICAgICAgYjIgPSB0aGlzLmNvZWZmaWNpZW50c1tlXS5iMjtcbiAgICAgICAgICAgICAgICBhMSA9IHRoaXMuY29lZmZpY2llbnRzW2VdLmExO1xuICAgICAgICAgICAgICAgIGEyID0gdGhpcy5jb2VmZmljaWVudHNbZV0uYTI7XG4gICAgICAgICAgICAgICAgLy8gU2F2ZSBtZW1vcmllcyBpbiBsb2NhbCB2YXJpYWJsZXNcbiAgICAgICAgICAgICAgICB5MWkxID0gdGhpcy5tZW1vcmllc1tlIC0gMV0ueWkxO1xuICAgICAgICAgICAgICAgIHkxaTIgPSB0aGlzLm1lbW9yaWVzW2UgLSAxXS55aTI7XG4gICAgICAgICAgICAgICAgeWkxID0gdGhpcy5tZW1vcmllc1tlXS55aTE7XG4gICAgICAgICAgICAgICAgeWkyID0gdGhpcy5tZW1vcmllc1tlXS55aTI7XG5cbiAgICAgICAgICAgICAgICB5W2VdID0geVtlIC0gMV0gKyBiMSAqIHkxaTEgKyBiMiAqIHkxaTIgLSBhMSAqIHlpMSAtIGEyICogeWkyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXcml0ZSB0aGUgb3V0cHV0XG4gICAgICAgICAgICBvdXRwdXRCdWZmZXJbaV0gPSB5W3RoaXMubnVtYmVyT2ZDYXNjYWRlIC0gMV0gKiB0aGlzLmNvZWZmaWNpZW50cy5nO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIG1lbW9yaWVzXG4gICAgICAgICAgICB0aGlzLm1lbW9yaWVzWzBdLnhpMiA9IHRoaXMubWVtb3JpZXNbMF0ueGkxO1xuICAgICAgICAgICAgdGhpcy5tZW1vcmllc1swXS54aTEgPSB4O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IHRoaXMubnVtYmVyT2ZDYXNjYWRlOyBwKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbW9yaWVzW3BdLnlpMiA9IHRoaXMubWVtb3JpZXNbcF0ueWkxO1xuICAgICAgICAgICAgICAgIHRoaXMubWVtb3JpZXNbcF0ueWkxID0geVtwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcblxuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhpdCwga2V5LCBkZXNjKTtcbn07IiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07Il19
