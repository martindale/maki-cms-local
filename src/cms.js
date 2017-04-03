var fs = require('fs');
var marked = require('marked');
var frontMatter = require('yaml-front-matter');

var _ = require('lodash');

function CMS(options) {
  var self = this;
  if (!options) {
    options = {
      components: {}
    };
  }
  
  if (!options.components) options.components = {};

  self.config = {
    base: options.base || '/pages',
    path: options.path ? process.env.PWD + options.path : process.env.PWD + '/pages',
    view: options.view || __dirname + '/../views/page.jade'
  };

  self.provides = {};
  
  var provider = options.name || 'Page'
  self.provides[provider] = {
    public: options.public || false,
    name: options.name || 'Page',
    icon: options.icon || 'book',
    description: options.description || 'Static page.',
    source: options.source,
    routes: {
      query: self.config.base,
      get: self.config.base + '/:filePath'
    },
    attributes: {
      name: { type: String , required: true },
      content: { type: String }
    },
    components: {
      masthead: options.components.masthead || 'maki-pitch',
      query: options.components.query || 'maki-page-list',
      get: options.components.get || 'maki-page-view'
    }
  };

  self.extends = {
    services: {
      http: {
        middleware: function(req, res, next) {
          return next();
        },
        setup: function(maki) {
          var files = fs.readdirSync(self.config.path);
          var route = self.config.base + '/:filePath?';
          maki.routes[route] = provider;
          maki.app.use(route, function(req, res, next) {
            var filePath = req.param('filePath');
            var indexPath = self.config.path + '/index.md';
            var localPath = self.config.path + '/' + filePath + '.md';
            var path = null;

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

            var locals = {
              content: rendered,
              metadata: front,
              page: front
            };
            
            locals = _.extend(locals, front);

            res.format({
              json: function() {
                res.send(locals);
              },
              html: function() {
                res.render(self.config.view, locals);
              }
            });
          });
        }
      }
    }
  };
}

module.exports = CMS;
