const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5050, () => {
      console.log("Server is running at: http://localhost:5050/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

//API 1 GET

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const allPlayersArray = await db.all(getPlayersQuery);
  const result = (allPlayersArray) => { 
    return {
      playerId: allPlayersArray.player_id,
      playerName: allPlayersArray.player_name,
      jerseyNumber: allPlayersArray.jersey_number,
      role: allPlayersArray.role
    }
  }
  response.send(allPlayersArray.map((eachPlayer) => result(eachPlayer)));
});

//API 2 POST

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const sqlQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', '${jerseyNumber}', '${role}');`;
  const dbResponse = await db.run(sqlQuery);
  response.send("Player Added to Team");
});

//API 3 GET BY ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(sqlQuery);
  const result = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role
    }
  }
  response.send(result(player));
});

//API 4 UPDATE

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const sqlQuery = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = '${jerseyNumber}', role = '${role}' WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(sqlQuery);
  response.send("Player Details Updated");
});

//API 5 DELETE
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(sqlQuery);
  response.send("Player Removed");
});
