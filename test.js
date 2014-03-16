var unzip = require('./index.js')
var gutil = require('gulp-util')
var fs = require('fs')
var assert = require('assert-plus')
var pj = require('path').join;


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
})
