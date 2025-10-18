const UserController = require("./UserController");
const TestController = require("./TestController");

module.exports = {
  userController: new UserController(),
  testController: new TestController(),
};