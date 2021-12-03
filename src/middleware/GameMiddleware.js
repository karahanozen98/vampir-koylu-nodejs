const game = require("../Game");

module.exports = function (req, res, next) {
  req.game = game;
  next();
};
