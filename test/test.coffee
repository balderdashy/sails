
should = require('chai').should()
spawn = require('child_process').spawn

describe 'the sails cli', ->
    it 'should create a new app and lift', (done) ->
        sails = spawn '../bin/sails.js', ['new', 'testProject']
        sails.on 'exit', ->
            done()
            
