const validateQuestion = (req, res, next) => {
  const { text, type, options, answer, marks, testId } = req.body;

  if (!text || !type || !testId || !marks) {
    return res.status(400).json({ error: "Text, type, testId, and marks are required" });
  }

  if (!["mcq", "long", "short"].includes(type)) {
    return res.status(400).json({ error: "Invalid question type" });
  }

  if (isNaN(parseFloat(marks)) || parseFloat(marks) <= 0) {
    return res.status(400).json({ error: "Marks must be a positive number" });
  }

  if (type === "mcq") {
    if (!options || !Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .json({ error: "MCQ must have at least two options" });
    }
  }

  if (type !== "mcq" && answer) {
    return res
      .status(400)
      .json({ error: "Answer can only be pre-assigned for MCQ type" });
  }

  next();
};

module.exports = {
  validateQuestion,
};
