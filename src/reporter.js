const {
  display,
  Qualifier,
  ReporterBase
} = require('@qatonic/core')
const _ = require('lodash')

class Reporter extends ReporterBase {

  constructor() {
    super()
    this._runners = {}
    this._steps = {}
    this._name = 'default'
  }

  onRunner(qualifier, description = '') {
    display.v(`runner ${description}`, 'magenta.bold')
    this._createRunner(qualifier)
  }

  onRunnerDone(qualifier) {
    const done = +new Date()
    const started = this._getFromRunner(qualifier, 'started')
    const diff = done - started
    display.a(chalk => {
      return chalk.magenta.bold('runner done') + ' ' + chalk.dim(`(${diff} ms)`)
    })
    this._updateRunner(qualifier, 'done', +new Date())
  }

  onRunnerError(qualifier, errorMessage) {
    display.a(`[${qualifier}] ${errorMessage}`, 'red.bold')
  }

  onStep(qualifier, props, description = '') {
    display.a(`- step ${description}`)
    display.v(chalk =>  chalk.dim('  props:') + chalk.dim(JSON.stringify(props, null, 2)))
    this._createStep(qualifier)
  }

  onStepError(qualifier, idx, context, errorMessage) {
    display.v(`runner ${qualifier}-${idx} ${errorMessage}`, 'red.bold')
    display.v(context, 'dim')
  }

  onStepDone(qualifier) {
    this._updateLastStep(qualifier, 'done', +new Date())
  }

  _createRunner(qualifier) {
    this._updateRunner(qualifier, 'started', +new Date())
  }

  _getFromRunner(qualifier, key) {
    if(!(qualifier instanceof Qualifier)) {
      throw new Error('Invalid qualifier')
    }

    return _.get(_.get(this._runners, qualifier.id), key)
  }

  _updateRunner(qualifier, key, value) {
    if(!(qualifier instanceof Qualifier)) {
      throw new Error('Invalid qualifier')
    }

    const rKey = qualifier.id
    if(_.isUndefined(this._runners[rKey])) {
      this._runners[rKey] = {}
    }

    this._runners[rKey][key] = value
  }

  _createStep(qualifier) {
    if(!(qualifier instanceof Qualifier)) {
      throw new Error('Invalid qualifier')
    }

    const rKey = qualifier.id
    if(_.isUndefined(this._steps[rKey])) {
      this._steps[rKey] = []
    }

    this._steps[rKey].push({ start: +new Date() })
  }

  _updateLastStep(qualifier, key, value) {
    if(!(qualifier instanceof Qualifier)) {
      throw new Error('Invalid qualifier')
    }

    const rKey = qualifier.id
    if(_.isUndefined(this._steps[rKey]) || this._steps.length === 0) {
      throw new Error('There are no steps')
    }

    this._steps[rKey][this._steps[rKey].length - 1][key] = value
  }
}

module.exports = Reporter
