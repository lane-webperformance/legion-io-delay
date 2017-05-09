'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

function validate(sample_points) {
  for( let i = 0; i < sample_points.length; i++ ) {
    if( !Number.isFinite(sample_points[i]) || sample_points[i] < 0 )
      throw new Error('Not a valid sample point: ' + i);
  }
}

module.exports = function() {
  const f = module.exports.smart.apply(undefined,arguments);

  return Io.get().chain(state => {
    const delay_start = Date.now();
    const milliseconds = f(delay_start)*1000; // *1000 to convert seconds to milliseconds
    return new Promise((resolve,reject) => {
      try {
        setTimeout(resolve,milliseconds);
      } catch(e) {
        reject(e);
      }
    }).then(() => {
      const delay_end = Date.now();
      state.services.metrics.tag(metrics.tags.protocol('delay')).receive(metrics.sample({
        delay_start: metrics.sample.timestamp(delay_start),
        delay_end: metrics.sample.timestamp(delay_end),
        delay_duration: metrics.sample.duration(delay_end - delay_start),
        delay_intended: {
          value: milliseconds,
          unit: 'milliseconds',
          interpretation: 'Delay length randomly selected from a statistical distribution.'
        },
        delay_discrepancy: {
          value: (delay_end - delay_start) - milliseconds,
          unit: 'milliseconds',
          interpretation: 'Difference between the expected and actual delay as implemented by the setTimeout function.'
        }
      }));
    });
  });
};

module.exports.sorted = function(sample_points) {
  validate(sample_points);

  if( sample_points.length === 1 )
    return () => sample_points[0];

  return () => {
    const i = Math.floor(Math.random()*(sample_points.length-1));
    const j = i+1;

    if( sample_points[i] > sample_points[j] )
      throw new Error('Not in correct sort order: ' + sample_points);

    const u = Math.random();
    return (sample_points[i]*(1-u) + sample_points[j]*u);
  };
};

module.exports.smart = function() {
  if( arguments.length === 1 ) {
    if( typeof arguments[0] === 'function' )
      return arguments[0];
  }

  return module.exports.sorted(arguments);
};


