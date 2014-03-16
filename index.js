var through = require('through2');
var gutil = require('gulp-util')
var unzip = require('unzip')
var fs = require('fs')
var minimatch = require('minimatch')
var defaults = require('lodash.defaults')
module.exports = function(extractOption){
  function transform(file, enc, callback){
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    var opts = defaults(extractOption || {}, {
      maxSize : 0,
      glob : "*",
      filter : function(){ return true },
    })

    var isExtract = function(entry){
      if(!opts.filter()){
        return false
      }
      if(opts.maxSize > 0 && opts.maxSize < entry.size){
        return false
      }
      if(!minimatch(entry.path, opts.glob)){
        return false
      }
      return true
    }
    
    // unzip file
    var self = this
    file.pipe(unzip.Parse())
      .on('entry', function(entry){
        var chunks = []
        if(!isExtract(entry)){
          entry.autodrain()
          return
        }
        
        entry.pipe(through.obj(function(chunk, enc, cb){
          // gutil.log("Find file: "+ entry.path)
          chunks.push(chunk)
          cb()
        }, function(cb){
          if(chunks.length > 0){
            self.push(new gutil.File({
              cwd : "./",
              path : entry.path,
              contents: Buffer.concat(chunks)
            }))
          }
          cb()
        }))
      }).on('close', function(){
        callback()
      })
  }
  return through.obj(transform);
}