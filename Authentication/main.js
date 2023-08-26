const express = require('express');
const app = express();

app.use(express.json());

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'users.db');


let db = null;

const initializeDBAndServer = async () => {
  try{
    db = await open({
      filename : dbPath,
      driver : sqlite3.Database
    });
    app.listen(5050, () => {
      console.log('Server Running at http://localhost:5050');
    })
  }catch(error){
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();


// API Create a User
app.post('/users/', async (request, response) => {
  const {id, name, email, gender, city, username, password} = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  // console.log(dbUser);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users(id, name, email, gender, city, username, password)
      VALUES 
        (${id}, '${name}', '${email}', '${gender}', '${city}', '${username}', '${hashedPassword}')`;
    await db.run(createUserQuery);
    response.send("User created successfully");

  } else {
    response.status(400);
    response.send("User already exists");
  }
})

// API Login
app.post('/login/', async (request, response) => {
  const {username, password} = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined){
    response.status(400);
    response.send("Invalid user");
  }else{
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched){
      response.send("Login Success");
    }else{
      response.status(400);
      response.send("Invalid password");
    }
  }
})
