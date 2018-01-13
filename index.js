var through = require('through2');
var unzip = require('unzipper')
var fs = require('fs')
var defaults = require('defaults')
var fancyLog = require('fancy-log')
var Vinyl = require('vinyl')

module.exports = function(options){
  function transform(file, enc, callback){
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    var opts = {};
    options = options || {};
    opts.filter = options.filter || function () { return true; };
    opts.keepEmpty = options.keepEmpty || false;

    // unzip file
    var self = this
    file.pipe(unzip.Parse())
      .on('entry', function(entry){
        var chunks = []
        if(!opts.filter(entry)){
          entry.autodrain()
          // skip entry
          return
        }

        entry.pipe(through.obj(function(chunk, enc, cb){
          // fancyLog("Find file: "+ entry.path)
          chunks.push(chunk)
          cb()
        }, function(cb){
          if(entry.type == 'File' && (chunks.length > 0 || opts.keepEmpty)){
            self.push(new Vinyl({
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
