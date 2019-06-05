const sinon = require('sinon')
const Reporter = require('../src/reporter')
const { Qualifier } = require('@qatonic/core')

const NOW = +new Date()
const QUALIFIER = Qualifier.parse('g.r')

describe('Reporter', () => {

  before(() => this.clock = sinon.useFakeTimers(NOW))

  after(() => this.clock.restore())

  describe('#_updateRunner()', () => {

    it('throw when undefined', () => {
      const r = new Reporter()
      assert.throws(r._updateRunner)
    })

    it('throw when not Qualifier', () => {
      const r = new Reporter()
      assert.throws(() => r._updateRunner('g.c'))
    })

    it('update runner', () => {
      const r = new Reporter()
      r._updateRunner(QUALIFIER, 'foo', 'bar')
      assert.hasAllKeys(r._runners, ['g.r'])
    })

  })

  describe('#_createSteps()', () => {

    it('create step', () => {
      const r = new Reporter()
      r._createStep(QUALIFIER)
      assert.hasAllKeys(r._steps, ['g.r'])
      assert.lengthOf(r._steps['g.r'], 1)
      assert.deepEqual(r._steps['g.r'], [ { start: NOW } ])
    })
  })

  describe('#_updateLastStep()', () => {

    it('throw when there are no steps', () => {
      const r = new Reporter()
      assert.throws(()=> r._updateLastStep(QUALIFIER), 'There are no steps')
    })

    it('update step object', () => {
      const r = new Reporter()
      r._createStep(QUALIFIER)
      r._updateLastStep(QUALIFIER, 'foo', 'bar')
      const expected = {
        start: NOW,
        foo: 'bar'
      }
      assert.deepEqual(r._steps[QUALIFIER.id][0], expected)
    })

    it('update the last step', () => {
      const r = new Reporter()
      r._createStep(QUALIFIER)
      r._createStep(QUALIFIER)
      r._updateLastStep(QUALIFIER, 'foo', 'bar')
      const expected = {
        start: NOW,
        foo: 'bar'
      }
      assert.deepEqual(r._steps[QUALIFIER.id][1], expected)
    })
  })

})
