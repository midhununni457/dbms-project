const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
