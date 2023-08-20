const express = require("express");
const app = express();

module.exports = app.get("/", (request, response) => {
  response.send("Express JS");
});

app.listen(3500);
