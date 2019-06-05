#!/usr/bin/env node
const program = require('commander')
const pkg = require('./package.json')
const { display } = require('@qatonic/core')
const Runtime = require('@qatonic/runtime')
const AdapterFile = require('@qatonic/adapter-file')
const Reporter = require('./src/reporter')

// bootstrap error handling
// process.on('unhandledRejection', function(err, c) {
//   debugger
//   display.a('** Promise unhandled rejection, delegating error **', 'red')
//   throw err
// })

// process.on('uncaughtException', function (err) {
//   display.a('** Error **', 'red')
//   err.stack.forEach(callSite => display.a(`${callSite.getFileName()}:${callSite.getLineNumber()}#${callSite.getFunctionName()}()`))
//   display.a('-- stacktrace --', 'red')
//   display.a(err.message, 'red')
//   process.exit(1)
// })

// parser cli args
program
  .version(pkg.version)
  .option('-w, --workspace <path>', 'Workspace directory (Default: current)', process.cwd())
  .option('-c, --config <name>', 'Specify configuration name (Default: qatonic.json)', 'qatonic.json')
  .option('-e, --env <name>', 'Specify environment (Default: devel)', 'devel')
  .option('-s, --start-runner <runner>', 'Start a runner')
  .option('-v, --verbose', 'Be verbose')
  .option('--very-verbose', 'Be very verbose')
  .option('--skip', 'Skip on error (default: false)', false)
  .parse(process.argv)

// make sure to update display verbosity
display.verbose(program.verbose, program.veryVerbose)

display.v('Configuration:')
const workspace = program.workspace
display.v(` workspace: ${workspace}`)
const configFile = program.config
display.v(` config: ${workspace}/${configFile}`)
const env = program.env
display.v(` environment: ${env}`)
display.v('')
const runnerToStart = program.startRunner

const runtime = new Runtime()
const initObj = {
  loader: new AdapterFile(workspace, env),
  reporter: new Reporter(),
  plugins: ['http'],
  skip: program.skip
}

display.a('initializing runtime...')

runtime.init(initObj)
  .then(async () => {
    display.a('run tests...')

    const runnersToStart = []
    if(runnerToStart)
      runnersToStart.push(runnerToStart)

    const resultRunners = await runtime.start(runnersToStart)
    let ok = true
    for(let key in resultRunners) {
      if(ok && resultRunners[key] !== '✓') {
        ok = false
        break
      }
    }

    if(!ok) {
      process.exit(1)
    }

  })
