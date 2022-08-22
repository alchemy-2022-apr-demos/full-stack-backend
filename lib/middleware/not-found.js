module.exports = (req, res, next) => {
  console.log(req.body);
  console.log(req.method);
  console.log(req.url);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};
