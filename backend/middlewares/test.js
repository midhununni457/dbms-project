const isValidTestID = (req, res, next) => {
  const { testId } = req.params;

  try {
    parseInt(testId);
  } catch (e) {
    throw new BadRequestError("Provide a valid Test ID");
  }

  next();
};

module.exports = { isValidTestID };
