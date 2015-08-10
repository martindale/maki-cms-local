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
    path: options.path || process.env.PWD + '/pages'
  };
  self.extends = {
    services: {
      http: {
        middleware: function(req, res, next) {
          return next();
        },
        setup: function(maki) {
          maki.app.use(self.config.base + '/:filePath', function(req, res, next) {
            var localPath = self.config.path + '/' + req.param('filePath') + '.md';
            if (!fs.existsSync(localPath)) {
              return next();
            }

            var input = fs.readFileSync(localPath);
            var front = frontMatter.loadFront(input);
            var rendered = marked(front.__content);

            res.format({
              json: function() {
                res.send(front);
              },
              html: function() {
                res.send(rendered);
              }
            });
          });
        }
      }
    }
  };
}

module.exports = CMS;
