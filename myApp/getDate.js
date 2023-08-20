const express = require('express');
const app = express();

app.get("/date", (request, response) => {
  const date = new Date();
  response.send(`Today's date is ${date}`);
})


app.listen(2002, () => { 
  console.log("Server is running on port 2002");
});