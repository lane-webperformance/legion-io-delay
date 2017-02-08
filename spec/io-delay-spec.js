/* eslint-disable no-console */

'use strict';

const delay = require('../src/index');
const metrics = require('legion-metrics');

describe('The fetch module for legion Io', function() {
  it('is sane', function(done) {
    delay(1).chain(console.log)
               .run(metrics.Target.create(metrics.merge).receiver()).then(done).catch(done.fail);
  });

  it('measures timings correctly', function(done) {
    const target = metrics.Target.create(metrics.merge);

    delay(3).run(target.receiver()).then(function() {
      const metrics = JSON.parse(JSON.stringify(target.get()));
      console.log(JSON.stringify(metrics, null, 2));

      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeGreaterThan(2995);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeLessThan(3050);

      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeGreaterThan(-5);
      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeLessThan(50);

      done();
    }).catch(done.fail);
  });

  it('rejects invalid arguments', function(done) {
    try {
      delay('foo');
      done.fail();
    } catch(e) {
      done();
    }
  });
});

