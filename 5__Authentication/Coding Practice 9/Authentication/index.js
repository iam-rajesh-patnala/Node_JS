const express = require('express');
const app = express();
module.exports = app;
app.use(express.json());
const bcrypt = require('bcrypt');

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const path = require('path');

const dbPath = path.join(__dirname, 'userData.db');

let db = null;

const initializeDbAndServer = async (request, response) => {
  try{
    db = await open({
      filename : dbPath,
      driver : sqlite3.Database
    });
    app.listen(5050, () => {
      console.log('Server Running at http://localhost:5050/');
    })
  }catch(error){
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
}

initializeDbAndServer();

// API 1 - Register

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined){
    if (password.length >= 5){
      const createUserQuery = `INSERT INTO user (username, name, password, gender, location) VALUES ('${username}', '${name}', '${hashedPassword}', '${gender}', '${location}');`;
      await db.run(createUserQuery);
      response.status(200);
      response.send(`User created successfully`);
    }else{
      response.status(400);
      response.send('Password is too short');
    }
  }else{
    response.status(400);
    response.send('User already exists');
  }
})

// API 2 - Login
app.post('/login', async (request, response) => {
  const {username, password} = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined){
    response.status(400);
    response.send('Invalid user');
  }else{
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if(isPasswordValid){
      response.status(200); 
      response.send(`Login success!`);
    }else{
      response.status(400);
      response.send('Invalid password');
    }
  }
})

// API 3 - change password

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined){
    response.status(400);
    response.send('Invalid user');
  }else{
    const isPasswordMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if(isPasswordMatch){
      if(newPassword.length >= 5){
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `UPDATE user SET password = '${hashedPassword}' WHERE username = '${username}';`;
        await db.run(updatePasswordQuery);
        response.status(200);
        response.send('Password updated');
      }else{
        response.status(400);
        response.send('Password is too short');
      }
    }else{
      response.status(400);
      response.send("Invalid current password");
    }
  }
})