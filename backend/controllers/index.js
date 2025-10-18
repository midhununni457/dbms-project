const UserController = require("./UserController");
const TestController = require("./TestController");
const QuestionController = require("./QuestionController");
const ResponseController = require("./ResponseController");

module.exports = {
  userController: new UserController(),
  testController: new TestController(),
  questionController: new QuestionController(),
  responseController: new ResponseController(),
};
