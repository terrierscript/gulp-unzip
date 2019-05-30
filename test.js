/* eslint-env mocha */

const unzip = require('./index.js')

const fs = require('fs')

const assert = require('assert-plus')

const pj = require('path').join

const minimatch = require('minimatch')

const Vinyl = require('vinyl')

function createVinyl (filename, contents) {
  const base = pj(__dirname, 'fixture')
  const filePath = pj(base, filename)

  return new Vinyl({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents || fs.readFileSync(filePath)
  })
}

describe('gulp-unzip', () => {
  describe('basic behaviour', () => {
    it('null file', done => {
      const stream = unzip()
      const mock = new Vinyl()

      stream.on('data', file => {
        assert.deepEqual(file, mock)
        done()
      })
      stream.write(mock)
      stream.end()
    })

    it('basic', done => {
      const stream = unzip()
      const mock = createVinyl('basic/zipped.zip')

      stream.on('data', file => {
        const expect = fs.readFileSync('fixture/basic/' + file.path)
        assert.deepEqual(expect, file.contents)
      }).on('end', done)
      stream.write(mock)
      stream.end()
    })

    it('large_file', done => {
      const stream = unzip()
      const mock = createVinyl('largefile/zipped.zip')

      stream.on('data', file => {
        const expect = fs.readFileSync('fixture/largefile/' + file.path)
        assert.deepEqual(expect, file.contents)
      }).on('end', done)
      stream.write(mock)
      stream.end()
    })
  })

  describe('filter option', () => {
    it('false filter', done => {
      const stream = unzip({
        filter: () => false
      })
      const mock = createVinyl('basic/zipped.zip')

      stream.on('data', file => {
        throw Error('entried')
      }).on('end', done)
      stream.write(mock)
      stream.end()
    })

    it('only extract css with filter', done => {
      const stream = unzip({
        filter: entry => minimatch(entry.path, '**/*.min.css')
      })
      const mock = createVinyl('sometypes/bootstrap-3.1.1-dist.zip')

      stream.on('data', file => {
        assert.ok(/.*\.min\.css/.test(file.path))
      }).on('end', done)
      stream.write(mock)
      stream.end()
    })
  })

  describe('keepEmpty option', () => {
    it('true', done => {
      const stream = unzip({ keepEmpty: false })
      const mock = createVinyl('basic/zipped.zip')
      let didSeeEmpty = false

      stream.on('data', file => {
        if (file.contents.length === 0) {
          didSeeEmpty = true
        }
      }).on('end', () => {
        if (didSeeEmpty) {
          throw new Error('saw empty')
        }
        done()
      })
      stream.write(mock)
      stream.end()
    })

    it('false', done => {
      const stream = unzip({ keepEmpty: true })
      const mock = createVinyl('basic/zipped.zip')
      let didSeeEmpty = false

      stream.on('data', file => {
        if (file.contents.length === 0) {
          didSeeEmpty = true
        }
      }).on('end', () => {
        if (!didSeeEmpty) {
          throw new Error('did not see empty')
        }
        done()
      })
      stream.write(mock)
      stream.end()
    })
  })
})
