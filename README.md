# gulp-unzip
| gulp plugin for unzip file.

- simple usage

```
  var minimatch = require('minimatch')
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip())
    .pipe(gulp.dest('./tmp'))
```

- below sample is extract only css.

```
  var minimatch = require('minimatch')
  gulp.src("./download/bootstrap-3.1.1-dist.zip")
    .pipe(unzip({
      filter : function(entry){
        return minimatch(entry.path, "**/*.min.css")
      }
    }))
    .pipe(concat("bootstrap.css"))
    .pipe(gulp.dest('./tmp'))
```