const methods = ["get", "post", "put", "delete"];

const asyncWrapper = (callback) => (req, res, next) => {
  return Promise.resolve(callback(req, res, next)).catch(next);
};

class AsyncRouter {
  constructor(router) {
    Object.keys(router).forEach((key) => {
      if (methods.includes(key)) {
        const method = router[key];
        router[key] = (path, ...callbacks) => method.call(router, path, ...callbacks.map((cb) => asyncWrapper(cb)));
      }
    });
    return router;
  }
}

module.exports = AsyncRouter;
