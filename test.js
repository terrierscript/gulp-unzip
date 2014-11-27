var unzip = require('./index.js')
var gutil = require('gulp-util')
var fs = require('fs')
var assert = require('assert-plus')
var pj = require('path').join;
var minimatch = require('minimatch')

function createVinyl(filename, contents) {
  var base = pj(__dirname, 'fixture');
  var filePath = pj(base, filename);

  return new gutil.File({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents || fs.readFileSync(filePath)
  });
}

describe('gulp-unzip', function(){
  it("null file", function(done){
    var stream = unzip()
    var mock = new gutil.File()
    stream.on('data', function(file){
      assert.deepEqual(file, mock)
      done()
    })
    stream.write(mock)
    stream.end()
  })
  it("basic", function(done){
    var stream = unzip()
    var mock = createVinyl('basic/zipped.zip')
    stream.on('data', function(file){
      var expect = fs.readFileSync('fixture/basic/' + file.path)
      assert.deepEqual(expect, file.contents)
    }).on('end', function(){
      done()
    })
    stream.write(mock)
    stream.end()
  })
  it("large_file", function(done){
    var stream = unzip()
    var mock = createVinyl('largefile/zipped.zip')
    stream.on('data', function(file){
      var expect = fs.readFileSync('fixture/largefile/' + file.path)
      assert.deepEqual(expect, file.contents)
    }).on('end', function(){
      done()
    })
    stream.write(mock)
    stream.end()
  })
  describe("filter option", function(){
    it("false filter", function(done){
      var stream = unzip({
        filter : function(){return false}
      })
      var mock = createVinyl('basic/zipped.zip')
      stream.on('data', function(file){
        throw "entried"
      }).on('end', function(){
        done()
      })
      stream.write(mock)
      stream.end()
    })

    it("only extract css with filter", function(done){
      var stream = unzip({
        filter : function(entry){
          return minimatch(entry.path, "**/*.min.css")
        }
      })
      var mock = createVinyl('sometypes/bootstrap-3.1.1-dist.zip')
      stream.on('data', function(file){
        assert.ok(/.*\.min\.css/.test(file.path))
      }).on('end', function(){
        done()
      })
      stream.write(mock)
      stream.end()
    })
  })

  describe("keepEmpty option", function(){
    it("true", function(done){
      var stream = unzip({ keepEmpty: false })
      var didSeeEmpty = false
      var mock = createVinyl('basic/zipped.zip')
      stream.on('data', function(file){
        if (file.contents.length === 0) {
          didSeeEmpty = true;
        }
      }).on('end', function(){
        if (didSeeEmpty) {
          throw new Error('saw empty')
        }
        done()
      })
      stream.write(mock)
      stream.end()
    })

    it("false", function(done){
      var stream = unzip({ keepEmpty: true })
      var didSeeEmpty = false
      var mock = createVinyl('basic/zipped.zip')
      stream.on('data', function(file){
        if (file.contents.length === 0) {
          didSeeEmpty = true;
        }
      }).on('end', function(){
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
