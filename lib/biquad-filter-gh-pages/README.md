# Biquad Filter library

> The Biquad Filter is a JavaScript library that implements a cascade of biquad filters

This library implements a [biquad filter](http://en.wikipedia.org/wiki/Digital_biquad_filter) with the possibility of use a cascade of biquad filters where you can specify the coefficients:

```
                       1 + b1*z^-1 + b2*z^-2
One biquad:   H1(z) = -----------------------
                       1 + a1*z^-1 + a2*z^-2

Cascade of biquads:   H(z) = g · H1(z) · H2(z) · ... · Hn(z)
where g is the global gain of the cascade of biquads and n is the number of biquad filters.

```

## Example

A working demo for this module can be found [here](https://ircam-rnd.github.io/biquad-filter/) and in the `examples` folder.

## Coefficients format

The input format of the coefficients for the library is a JavaScript Array with all the coefficients:

For one biquad filter:
```
[g, b1, b2, a1, a2]
```

For two or more biquad filters:
```
[g, b1_1, b2_1, a1_1, a2_1, b1_2, b2_2, a1_2, a2_2, ... , b1_n, b2_n, a1_n, a2_n ]
```

where `n` is the number of biquad filters and `g` is the global gain of the cascade of biquads.

## API

The `binauralFIR` object exposes the following API:

Method | Description
--- | ---
`biquadFilter.setCoefficients(coef)` | Set the coefficients of the filter.
`biquadFilter.process(inputBuffer, outputBuffer)` | Calculate the output of the cascade biquad filter for an inputBuffer. The inputBuffer and the outputBuffer are Arrays with the same length.


## License

This module is released under the [BSD-3-Clause license](http://opensource.org/licenses/BSD-3-Clause).

## Acknowledgments

This code has been developed from both [Acoustic And Cognitive Spaces](http://recherche.ircam.fr/equipes/salles/) and [Analysis of Musical Practices](http://apm.ircam.fr) IRCAM research teams. It is also part of the WAVE project (http://wave.ircam.fr), funded by ANR (The French National Research Agency), ContInt program, 2012-2015.
