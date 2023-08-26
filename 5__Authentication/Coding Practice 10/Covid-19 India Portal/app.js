const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { request } = require("http");
const { Module } = require("module");

const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

let db = null;

const initializeDBAndServer = async () => {
  try{
    db = await open({
      filename : dbPath,
      driver : sqlite3.Database
    });
    app.listen(5050, () => {
      console.log("Server Running at http://localhost:5050/");
    });  
  }catch(error){
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();


const authentication = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined){
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined){
    response.status(401);
    response.send("Invalid JWT Token");
  }else{
    jwt.verify(jwtToken, "my_secret_key", async (error, payload) => {
      if(error){
        response.status(401);
        response.send("Invalid JWT Token");
      }else{
        response.username = payload.username;
        next();
      }
    })
  }
}


// --- Create User

app.post("/register/", async(request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUserResponse = await db.get(selectUserQuery);

  if(dbUserResponse === undefined){
    const createUserQuery = `INSERT INTO user (username, name, password, gender, location) VALUES ('${username}', '${name}', '${hashedPassword}', '${gender}', '${location}');`;
    await db.run(createUserQuery);
    response.send("User Created Successfully");
  }else{
    response.status(400);
    response.send("User Already Exists");
  }
})

// API 1 --- User Login

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined){
    response.status(400);
    response.send("Invalid user");
  }else{
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if(isPasswordMatched){
      const payload = {username : username};
      const jwtToken = jwt.sign(payload, "my_secret_key");
      response.send({ jwtToken });
    }else{
      response.status(400);
      response.send("Invalid password");
    }
  }
})

//


// API 2 --- GET Returns a list of all states in the state table

app.get("/states/", authentication, async (request, response) => {
  const getStatesQuery = `SELECT * FROM state;`;
  const statesArray = await db.all(getStatesQuery);
  const result = (data) => {
    return {
      stateId: data.state_id,
      stateName: data.state_name,
      population: data.population
    }
  }
  response.send(statesArray.map((eachState) => result(eachState)));
})


// API 3 --- state based on the state ID

app.get("/states/:stateId/", authentication, async (request, response) => {
  const {stateId} = request.params;
  const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  const result = (data) => {
    return {
      stateId: data.state_id,
      stateName: data.state_name,
      population: data.population
    }
  }
  response.send(result(state));
})

// API 4 --- Create a district in the district table, district_id is auto-incremented

app.post("/districts/", authentication, async(request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body;
  const createDistrictQuery = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES ('${districtName}', '${stateId}', '${cases}', '${cured}', '${active}', '${deaths}');`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
})

// API 5 --- district based on the district ID

app.get("/districts/:districtId/", authentication, async(request, response) => {
  const {districtId} = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  const result = (data) => {
    return {
      districtId: data.district_id,
      districtName: data.district_name,
      stateId: data.state_id,
      cases: data.cases,
      cured: data.cured,
      active: data.active,
      deaths: data.deaths
    }
  }
  response.send(result(district));
})

// API 6 --- Deletes a district from the district table based on the district ID

app.delete("/districts/:districtId/", authentication, async(request, response) => {
  const {districtId} = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
})

// API 7 --- Updates the details of a specific district based on the district ID

app.put("/districts/:districtId/", authentication, async(request, response) => {
  const {districtId} = request.params;
  const {districtName, stateId, cases, cured, active, deaths} = request.body;
  const updateDistrictQuery = `UPDATE district SET district_name = '${districtName}', state_id = '${stateId}', cases = '${cases}', cured = '${cured}', active = '${active}', deaths = '${deaths}' WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
})

// API 8 --- Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get("/states/:stateId/stats/", authentication, async(request, response) => {
  const {stateId} = request.params;
  const getStateStatsQuery = `SELECT SUM(cases), SUM(cured), SUM(active), SUM(deaths) FROM district WHERE state_id = ${stateId};`;
  const stateStats = await db.get(getStateStatsQuery);
  const result = (data) => {
    return {
      totalCases : data['SUM(cases)'],
      totalCured : data['SUM(cured)'],
      totalActive : data['SUM(active)'],
      totalDeaths : data['SUM(deaths)']
    }
  }
  response.send(result(stateStats));
})