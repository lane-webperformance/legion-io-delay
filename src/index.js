'use strict';

const Io = require('legion-io');
const metrics = require('legion-metrics');

module.exports = function(seconds) {
  if( typeof seconds !== 'number' )
    throw new Error('delay: parameter must be a number in seconds');

  return Io.get()
           .chain(receiver => {
             const delay_start = Date.now();
             return new Promise((resolve,reject) => {
               try {
                 setTimeout(resolve,seconds*1000);
               } catch(e) {
                 reject(e);
               }
             }).then(() => {
               const delay_end = Date.now();
               receiver.tag(metrics.tags.protocol('delay')).receive(metrics.sample({
                 delay_start: metrics.sample.timestamp(delay_start),
                 delay_end: metrics.sample.timestamp(delay_end),
                 delay_duration: metrics.sample.duration(delay_end - delay_start),
                 delay_discrepancy: {
                   value: (delay_end - delay_start) - seconds*1000,
                   unit: 'milliseconds',
                   interpretation: 'Difference between the expected and actual delay as implemented by the setTimeout function.'
                 }
               }));
             });
           });
};

