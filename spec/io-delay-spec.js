'use strict';

const delay = require('../src/index');
const metrics = require('legion-metrics');
const Io = require('legion-io');

describe('The fetch module for legion Io', function() {
  it('is sane', function(done) {
    delay(1).run({services:{metrics:metrics.Target.create(metrics.merge).receiver()}}).then(done).catch(done.fail);
  });

  it('measures timings correctly', function(done) {
    const target = metrics.Target.create(metrics.merge);

    delay(3).run({services:{metrics:target.receiver()}}).then(function() {
      const metrics = JSON.parse(JSON.stringify(target.get()));

      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeGreaterThan(2995);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeLessThan(3050);

      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeGreaterThan(-5);
      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeLessThan(50);

      done();
    }).catch(done.fail);
  });

  it('supports uniformly distributed delays', function(done) {
    const target = metrics.Target.create(metrics.merge);
    const tasks = [];

    for( let i = 0; i < 1000; i++ )
      tasks.push(delay(1,3));

    Io.all(tasks).run({services:{metrics:target.receiver()}}).then(function() {
      const metrics = JSON.parse(JSON.stringify(target.get()));

      expect(metrics.tags.protocol['delay'].values.delay_duration.$min).toBeGreaterThan(900);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$min).toBeLessThan(1100);

      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeGreaterThan(1750);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeLessThan(2250);

      expect(metrics.tags.protocol['delay'].values.delay_duration.$max).toBeGreaterThan(2900);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$max).toBeLessThan(3100);

      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeGreaterThan(-5);
      expect(metrics.tags.protocol['delay'].values.delay_discrepancy.$avg.avg).toBeLessThan(50);

      done();
    }).catch(done.fail);
  });

  it('supports delays from a user-specified random number generator', function(done) {
    const target = metrics.Target.create(metrics.merge);
    const tasks = [];

    for( let i = 0; i < 1000; i++ )
      tasks.push(delay(() => Math.random() + Math.random() + 1));

    Io.all(tasks).run({services:{metrics:target.receiver()}}).then(function() {
      const metrics = JSON.parse(JSON.stringify(target.get()));

      expect(metrics.tags.protocol['delay'].values.delay_duration.$min).toBeGreaterThan(900);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$min).toBeLessThan(1100);

      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeGreaterThan(1750);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$avg.avg).toBeLessThan(2250);

      expect(metrics.tags.protocol['delay'].values.delay_duration.$max).toBeGreaterThan(2900);
      expect(metrics.tags.protocol['delay'].values.delay_duration.$max).toBeLessThan(3100);

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

