const express = require("express");
require("./utils/env");
const routes = require("./routes");
const { NotFoundError } = require("./utils/error");
const errorHandler = require("./middlewares/error");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  try {
    console.log(`Server is listening on port ${PORT}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
});
