/* eslint-disable arrow-body-style */
//catchAsync takes a function which returns a promise as argument,
//catchAsync will return the function which has access to req, res, next.
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
