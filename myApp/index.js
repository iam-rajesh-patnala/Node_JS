const express = require('express');
const app = express();

app.get('/', (request, response) => { 
  response.send("Hello Rajesh!");
  // console.log(request);
  console.log(response);
})

// Getting Today's Date 
app.get('/date', (request, response) => { 
  const date = new Date();
  response.send(`Today's date is ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`);
})

// Getting file
app.get('/home-page', (request, response) => {
  response.sendFile('./website/index.html', { root: __dirname });

});


app.listen(2001, () => {
  console.log("Server is running on port 2001");
})