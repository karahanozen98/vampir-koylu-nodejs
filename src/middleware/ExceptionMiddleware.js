module.exports = function (error, req, res, next) {
  if (error) {
    console.log(error);
    res.status(500);
    res.send(error.message);
  } else {
    next();
  }
};
