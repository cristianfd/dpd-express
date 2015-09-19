var util = require('util'),
  path = require('path'),
  cwd = path.resolve('.'),
  Resource = require(path.join(cwd, 'node_modules', 'deployd/lib/resource')),
  express = require('express');

function Express(name, options) {
  Resource.apply(this, arguments);
  var app = this.app = express(),
    exp = this;

  // handle all routes
  this.path = '/';

  app.set('views', path.join(cwd, options.configPath, 'views'));
}

Express.events = ['init'];

util.inherits(Express, Resource);
module.exports = Express;

Express.prototype.handle = function (ctx, next) {
  ctx.req.dpd = ctx.dpd;
  ctx.req.me = ctx.session && ctx.session.user;
  this.app.call(this.server, ctx.req, ctx.res);
  if(ctx.res._finished) {
    next();
  }
};

Express.prototype.load = function (fn) {
  var e = this;
  Resource.prototype.load.call(this, function () {
    if(e.events && e.events.init) {

      var domain = {
        app: e.app
      };

      e.events.init.run({}, domain);

      e.app.use(function (req, res) {
        res._finished = true;
      });
    }

    fn();
  });
};
