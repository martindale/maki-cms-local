var fs = require('fs');
var marked = require('marked');
var frontMatter = require('yaml-front-matter');

function CMS(options) {
  var self = this;
  if (!options) {
    options = {};
  }

  self.config = {
    base: options.base || '/pages',
    path: options.path ? process.env.PWD + options.path : process.env.PWD + '/pages',
    view: options.view || __dirname + '/../views/page.jade'
  };
  self.extends = {
    services: {
      http: {
        middleware: function(req, res, next) {
          return next();
        },
        setup: function(maki) {
          maki.app.use(self.config.base + '/:filePath?', function(req, res, next) {
            var filePath = req.param('filePath');
            var indexPath = self.config.path + '/index.md';
            var localPath = self.config.path + '/' + filePath + '.md';

            var path;
            if (fs.existsSync(localPath)) {
              path = localPath;
            } else if (fs.existsSync(indexPath)) {
              path = indexPath;
            } else {
              return next();
            }

            var input = fs.readFileSync(path);
            var front = frontMatter.loadFront(input);
            var rendered = marked(front.__content);

            res.format({
              json: function() {
                res.send(front);
              },
              html: function() {
                res.render(self.config.view, {
                  content: rendered
                });
              }
            });
          });
        }
      }
    }
  };
}

module.exports = CMS;
