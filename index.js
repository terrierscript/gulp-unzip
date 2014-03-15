var through = require('through2');
var gutil = require('gulp-util')
var unzip = require('unzip')
var fs = require('fs')
module.exports = function(){


  function transform(file, enc, callback){
    var self = this
    
    // inner
    function _unzip(stream, cb){
      stream.pipe(unzip.Parse())
            .on('entry', function(entry){
              if(entry.type == "Directory"){
                return
              }

              entry.pipe(through.obj(function(chunk, enc, cb){
                //gutil.log("Find file: "+ entry.path)
                self.push(new gutil.File({
                  cwd : "./",
                  path : entry.path,
                  contents: chunk
                }))
              }))
            }).on('close', function(){
              cb();
            })
    }

    //
    // gulp
    //
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    console.log(file.pipe)
    console.log(file.isBuffer())
    console.log(file.path)

    if (file.isBuffer()) {

      var stream = fs.createReadStream(file.path)

      return _unzip(stream, callback)
    }

    if (file.isStream()) {
      return _unzip(file, callback)
    }

  }
  return through.obj(transform);
}
