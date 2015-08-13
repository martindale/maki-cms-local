# maki-cms-local
file-based CMS for Maki

## Quick Start
```javascript
var Maki = require('maki');
var app = new Maki();

var CMS = require('maki-cms-local');
var cms = new CMS({
  base: '/docs', // top-level URL base. becomes: yourserver.com/docs
  path: 'docs/', // local directory to serve from.  Markdown-formatted.
  view: 'docs/'  // absolute path to the Jade view to utilize.
});

app.use(cms);
app.start();
```

All config values are optional, and default to sane values:
```
{
  base: '/pages',
  path: process.env.PWD + '/pages', // looks for `./pages` in your app folder
  view: __dirname + '/../views/page.jade' // looks for `./views/page.jade` in your app folder
}
```
