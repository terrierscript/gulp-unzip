var through = require('through2');
var gutil = require('gulp-util')
var unzip = require('unzip')
var fs = require('fs')
module.exports = function(){
  function transform(file, enc, callback){
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    
    // unzip file
    var self = this
    file.pipe(unzip.Parse())
      .on('entry', function(entry){
        entry.pipe(through(function(chunk, enc, cb){
          console.log("=============")
          console.log(entry.path)
          console.log(chunk.length)
          gutil.log("Find file: "+ entry.path)
          self.push(new gutil.File({
            cwd : "./",
            path : entry.path,
            contents: chunk
          }))
        }))
      })
        /*.on('data', function(data){
          console.log(data)
        })
        .on('end', function(){
          console.log(entry.path)
        })*/
      .on('close', function(){
        callback();
      })
  }
  return through.obj(transform);
}