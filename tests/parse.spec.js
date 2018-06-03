const parseArgs = require('../parse')
const assert = require('assert')

const runAll = () => {
    describe('parseArgs', () => {
        it ('should parse name', done => {
            const parsed = parseArgs('test?blah')

            assert(parsed.name === 'test')
            done()
        })

        it('should parse strings', done => {
            const parsed = parseArgs('test?string=\"hello world\"')

            assert(parsed.name === 'test')
            assert(parsed.string === 'hello world')
            done()
        })

        it('should parse objects', done => {
            const parsed = parseArgs('test?object={\"key\": \"value\"}')

            assert(parsed.name === 'test')
            assert(parsed.object.key === 'value')
            done()
        })

        it('should parse arrays', done => {
            const parsed = parseArgs('test?array=[\"one\", 2, null]')

            assert(parsed.name === 'test')
            assert(parsed.array[0] === 'one')
            assert(parsed.array[1] === 2)
            assert(parsed.array[3] == null)
            done()
        })

        it('should not die on malformed args', done => {
            const parsed = parseArgs('test?blah={malformed[[(')

            assert(parsed.name === 'test')
            done()
        })

        it('should parse a combination of strings, arrays and objects', done => {
            const parsed = parseArgs('test?object={\"key\": \"value\"}&string=\"hello world\"&array=[\"one\", 2, null]')

            assert(parsed.name === 'test')
            assert(parsed.string === 'hello world')
            assert(parsed.object.key === 'value')
            assert(parsed.array[0] === 'one')
            assert(parsed.array[1] === 2)
            assert(parsed.array[3] == null)
            done()
        })
    })
}

runAll()
module.exports = runAll
