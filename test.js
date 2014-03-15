var unzip = require('../index.js')
var gutil = require('gulp-util')
describe('gulp-unzip', function(){
  it('unzip buffering', function(done){
    var stream = unzip()
    var mock = new gutil.File({
      cwd : cwd,
      base : cwd + "/fixture",
      path : cwd + "/fixture/zipped.zip",
    })
    stream.on('data', function(unzipped){
      console.log(unzipped)
    })
    stream.on('end', function(){
      done()
    })
    stream.end
  })
})