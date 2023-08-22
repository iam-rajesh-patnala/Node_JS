const express = require('express');
const app = express();
app.use(express.json());
module.exports = app;
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const path = require('path');
const dbPath = path.join(__dirname, 'cricketMatchDetails.db');

let db = null;
const initializeDBandServer = async () => {
  try{
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(5050, () => {
      console.log("Server is running at: http://localhost:5050/");
    });
  }catch(error){
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
}

initializeDBandServer();

// API 1 --- GET  list of all the players 

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details`;
  const playersArray = await db.all(getPlayersQuery);

  const result = (data) => {
    // console.log(data);
    return {
      playerId : data.player_id,
      playerName : data.player_name
    }
  }

  response.send(playersArray.map((eachPlayer) => result(eachPlayer)));
})


// API 2 --- GET  specific player based on the player ID

app.get("/players/:playerId/", async (request, response) => {
  const {playerId} = request.params;
  const playerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  const result = (data) => {
    return{
      playerId : data.player_id,
      playerName : data.player_name
    }
  }
  response.send(result(player));
})

// API 3 --- Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const {playerId} = request.params;
  const {playerName} = request.body;
  const playerQuery = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  const player = await db.run(playerQuery);
  response.send("Player Details Updated");
})


// API 4 --- match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const {matchId} = request.params;
  const matchQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const match = await db.get(matchQuery);
  const result = (data) => {
    return{
      matchId : data.match_id,
      match : data.match,
      year : data.year
    }
  };
  response.send(result(match));
})

// API 5 --- list of all the matches of a player
app.get("/players/:playerId/matches", async(request, response) => {
  const {playerId} = request.params;
  const getPlayerIdQuery = `SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id = ${playerId};`;
  const playerIdAndMatchId = await db.all(getPlayerIdQuery);


  const result = (data) => {
    return{
      matchId : data.match_id,
      match : data.match,
      year : data.year
    }
  }

  response.send(playerIdAndMatchId.map((eachMatch) => result(eachMatch)));
})

// API 6 --- Returns a list of players of a specific match

app.get("/matches/:matchId/players", async(request, response) => {
  const {matchId} = request.params;
  const getMatchIdQuery = `SELECT player_id AS playerId, player_name AS playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId};`;
  const matchIdAndPlayerId = await db.all(getMatchIdQuery);
  response.send(matchIdAndPlayerId);
})

// API 7 --- Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async(request, response) => {
  const {playerId} = request.params;
  const getPlayerIdQuery = `SELECT player_id, player_name, SUM(score), SUM(fours), SUM(sixes) FROM player_match_score NATURAL JOIN player_details WHERE player_id = ${playerId};`;
  const playerIdAndPlayerScores = await db.get(getPlayerIdQuery);
  console.log(playerIdAndPlayerScores);

  const result = (data) => {
    return{
      playerId : data.player_id,
      playerName : data.player_name,
      totalScore : data["SUM(score)"],
      totalFours : data["SUM(fours)"],
      totalSixes : data["SUM(sixes)"]
    }
  }
  response.send(result(playerIdAndPlayerScores));
})