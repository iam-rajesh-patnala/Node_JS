const express = require('express');
const app = express();
module.exports = app;
app.use(express.json());

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'moviesData.db');

let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(5050, () => {
      console.log("Server is running at: http://localhost:5050/");
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
}

initializeDBandServer();

// API 1 --- GET all the movies

app.get("/movies/", async (request, response) => {
  const sqlQuery = `SELECT movie_name FROM movie;`;
  const movies = await db.all(sqlQuery);
  const result = (movies) => {
    return {
      movieName: movies.movie_name
    }
  }
  response.send(movies.map((eachMovie) => result(eachMovie)));
})

// API 2 --- POST a new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const {directorId, movieName, leadActor} = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}')`;
  const result = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
})

// API 3 --- GET a particular movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${ movieId };`;
  const movie = await db.get(getMovieQuery);
  const result = (movie) => {
    return {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor
    }
  }
  response.send(result(movie));
})

// API 4 --- UPDATE a particular movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;
  const result = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
})

// API 5 --- DELETE a particular movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const result = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
})

// API 6 --- GET all the directors
app.get("/directors/", async (request, response) => {
  const sqlQuery = `SELECT * FROM director`;
  const directors = await db.all(sqlQuery);
  const result = (directors) => {
    return {
      directorId: directors.director_id,
      directorName: directors.director_name
    }
  }
  response.send(directors.map((eachDirector) => result(eachDirector)));
})

// API 7 --- GET a particular director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const sqlQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const movies = await db.all(sqlQuery);
  const result = (movies) => {
    return {
      movieName: movies.movie_name
    }
  }
  response.send(movies.map((eachMovie) => result(eachMovie)));
})