/**
 * @fileoverview Biquad Filter library
 * @author Arnau.Julia <Arnau.Julia@gmail.com>
 * @version 0.1.0
 */

/**
 * @class BiquadFilter
 * @public
 */
export default class BiquadFilter {
    constructor() {
        this.coefficients = [];
        this.numberOfCascade = 1;
        this.resetMemories();
    }

    /**
     * Set biquad filter coefficients
     * @public
     * @param coef Array of biquad coefficients in the following order: gain, firstBiquad b1, firstBiquad b2, firstBiquad a1, firstBiquad a2, secondBiquad b1, secondBIquad b2, etc.
     */
    setCoefficients(coef) {
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
    getNumberOfCascadeFilters(coef) {
        return (coef.length - 1) / 4;
    }

    /**
     * Reset memories of biquad filters.
     * @public
     */
    resetMemories() {
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
    process(inputBuffer, outputBuffer) {
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
}
