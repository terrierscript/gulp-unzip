const Stream = require('stream'),
  through = require('through2').obj,
  unzip = require('unzipper'),
  Vinyl = require('vinyl');

module.exports = (options = {}) => {
  

  function transform(file, enc, callback){
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    let stream = new Stream.PassThrough();

		if ( file.isBuffer() && !file.pipe ) {
			stream.end( file.contents );
		} else {
      stream = file;
    }

    const opts = {};
    opts.filter = options.filter || (() => true);
    opts.keepEmpty = options.keepEmpty || false;

    stream.pipe(unzip.Parse())
      .on('entry', entry => {
        const chunks = [];
        if(!opts.filter(entry)){
          entry.autodrain();
          return;
        }
        
        entry.pipe(through((chunk, enc, cb) => {
          chunks.push(chunk);
          cb();
        }, cb => {
          if(entry.type === 'File' && (chunks.length > 0 || opts.keepEmpty)){
            this.push(new Vinyl({
              cwd : "./",
              path : entry.path,
              contents: Buffer.concat(chunks)
            }));
          }
          cb();
        }));
      }).on('close', callback);
  }
  return through(transform);
};
