
should = require('chai').should()
spawn = require('child_process').spawn
easyrequest = require 'request'
fs = require 'fs'

testProject = 'sails-example'
sailsBin = '../bin/sails.js'

describe 'the sails cli', ->
    app = null
    finished = false
    before (done) ->
        rm = spawn 'rm', ['-rf', testProject]
        rm.on 'exit', ->
            sails = spawn sailsBin, ['new', testProject]
            sails.stderr.setEncoding 'utf8'
            sails.stdout.setEncoding 'utf8'
            data = ''
            sails.stderr.on 'data', (buffer) ->
                data += buffer
            sails.stdout.on 'data', (buffer) ->
                data += buffer
            sails.on 'exit', (code) ->
                code.should.equal 0
                process.chdir "#{__dirname}/#{testProject}"
                sailsBin = '../../bin/sails.js'
                app = spawn 'node', [sailsBin, 'lift']
                app.on 'exit', ->
                    unless finished
                        throw new Error "Sails server exited prematurely, check for other running sails instances.\n#{data}"
                setTimeout done, 1000
        
    it 'should lift', (done) ->
        easyrequest 'http://localhost:1337', (error, response, body) ->
            response.statusCode.should.equal 200
            done()

    it 'should have a certain structure', (done) ->
        structure = [
            'app.js', 'api', 'api/controllers', 'api/models', 'api/middleware',
            'config', 'config/locales', 'config/local.js', 'config/policy.js', 'config/routes.js',
            'ui', 'ui/dependencies', 'ui/public', 'ui/views', 'ui/public/images', 'ui/public/js',
            'ui/public/styles', 'ui/views/templates'
        ]
        for file in structure
            fs.existsSync("#{__dirname}/#{testProject}/#{file}").should.equal true
        done()

    it 'should generate controllers', (done) ->
        generate = spawn 'node', [sailsBin, 'generate', 'controller', 'hello', 'index']
        generate.on 'exit', ->
            controller = require("./#{testProject}/api/controllers/HelloController")
            should.exist controller.index
            done()

    it 'should generate models', (done) ->
        generate = spawn 'node', [sailsBin, 'generate', 'model', 'User']
        generate.on 'exit', ->
            model = require("./#{testProject}/api/models/User")
            done()
        

    after (done) ->
        finished = true
        app.on 'exit', ->
            rm = spawn 'rm', ['-rf', "../#{testProject}"]
            rm.on 'exit', ->
                done()
        app.kill 'SIGKILL'
