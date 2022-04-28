const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// Create a get api
app.get("/", (req, res) => {
  res.send("Api done");
});
app.listen(port);
