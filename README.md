
[![Build Status](https://travis-ci.org/lane-webperformance/legion-io-delay.svg?branch=master)](https://travis-ci.org/lane-webperformance/legion-io-delay)
[![Dependency Status](https://gemnasium.com/badges/github.com/lane-webperformance/legion-io-delay.svg)](https://gemnasium.com/github.com/lane-webperformance/legion-io-delay)

Implements a delay function for Legion testcases.

	const delay = require('legion-io-delay');

delay(seconds : number)
=======================

Introduces a delay between two actions in a chain.

 * seconds - time to delay, in seconds
