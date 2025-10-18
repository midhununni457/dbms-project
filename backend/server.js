const express = require("express"); 
require("./utils/env");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

const PORT = 3001;

app.listen(PORT, () => {
  try {
    console.log(`Server is listening on port ${PORT}`);
  } catch (error) {
    console.error("Error starting server:", error);
  } 
});
