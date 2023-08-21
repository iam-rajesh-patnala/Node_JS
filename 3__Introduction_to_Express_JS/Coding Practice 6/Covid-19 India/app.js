const express = require('express');
const app = express();
module.exports = app;
app.use(express.json());

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const { request } = require('http');

const dbPath = path.join(__dirname, 'covid19India.db');

let db = null;

const initializeDBAndServer = async () => {
  try{
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(5050, () => {
      console.log("Server is running at: http://localhost:5050/");
    })
  }catch(error){
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();

// API 1 - Get states
app.get("/states/", async (request, response) => {
  const sqlQuery = `SELECT * FROM state;`;
  const states = await db.all(sqlQuery);
  const result = (data) => {
    return {
      stateId: data.state_id,
      stateName: data.state_name,
      population: data.population
    }
  }
  response.send(states.map((eachState) => result(eachState)));
})

// API 2 - Get specific state
app.get("/states/:stateId/", async (request, response) => {
  const {stateId} = request.params;
  const sqlQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const state = await db.get(sqlQuery);
  const result = (data) => {
    return {
      stateId: data.state_id,
      stateName: data.state_name,
      population: data.population
    }
  }
  response.send(result(state));
})

// API 3 --- Create a new district
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths} = request.body;
  const sqlQuery = `INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES ("${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const district = await db.run(sqlQuery);
  response.send("District Successfully Added");
})

// API 4 --- specific district
app.get("/districts/:districtId/", async (request, response) => {
  const {districtId} = request.params;
  const sqlQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const district = await db.get(sqlQuery);
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
  };
  response.send(result(district));
})


// API 5 --- Delete specific district
app.delete("/districts/:districtId/", async (request, response) => {
  const {districtId} = request.params;
  const sqlQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  const district = await db.run(sqlQuery);
  response.send("District Removed");
})


// API 6 --- update district
app.put("/districts/:districtId/", async (request, response) => {
  const {districtId} = request.params;
  const {districtName, stateId, cases, cured, active, deaths} = request.body;
  const sqlQuery = `UPDATE district SET district_name = "${districtName}", state_id = ${stateId}, cases = ${cases}, cured = ${cured}, active = ${active}, deaths = ${deaths} WHERE district_id = ${districtId};`;
  const district = await db.run(sqlQuery);
  response.send("District Details Updated");
})

// API 7 --- GET stats of specific state
// app.get("/states/:stateId/stats/", async (request, response) => {
//   const {stateId} = request.params;
//   const sqlQuery = `SELECT SUM(cases) AS totalCases, SUM(cured) AS totalCured, SUM(active) AS totalActive, SUM(deaths) AS totalDeaths FROM district WHERE state_id = ${stateId};`;
//   const stats = await db.get(sqlQuery);
//   response.send(stats);
// })
// API 7 --- GET stats of specific state
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const sqlQuery = `SELECT SUM(cases), SUM(cured), SUM(active), SUM(deaths) FROM district WHERE state_id = ${stateId};`;
  const stats = await db.get(sqlQuery);
  console.log(stats);
  const result = (data) => {
    return {
      totalCases: data["SUM(cases)"],
      totalCured: data["SUM(cured)"],
      totalActive: data["SUM(active)"],
      totalDeaths: data["SUM(deaths)"],
    };
  };
  response.send(result(stats));
});

// API 8 --- GET state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const {districtId} = request.params;
  const sqlQuery = `SELECT state_id FROM district WHERE district_id = ${districtId};`;
  const stateId = await db.get(sqlQuery);

  const sqlQuery2 = `SELECT state_name FROM state WHERE state_id = ${stateId.state_id};`;
  const stateName = await db.get(sqlQuery2);

  const result = (data) => {
    return{
      stateName : data.state_name
    }
  };
  response.send(result(stateName));
})