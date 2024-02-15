const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;

const convertMovieDbObjectToResponseDbObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorDbObjectToResponseDbObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET all Movies API1

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT *
    FROM movie`;

  const moviesList = await db.all(getAllMoviesQuery);
  response.send(
    moviesList.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

//POST movie API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET a movie API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getAMovieQuery = `SELECT * FROM movie
    WHERE movie_id =${movieId};`;

  const getMovie = await db.get(getAMovieQuery);
  response.send(convertMovieDbObjectToResponseDbObject(getMovie));
});

//PUT a movie API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateDetails = request.body;
  const { directorId, movieName, leadActor } = updateDetails;
  const updateMovieQuery = `UPDATE movie
    SET director_id =${directorId},
    movie_name ='${movieName}',
    lead_actor ='${leadActor}'
    WHERE movie_id =${movieId};`;
  const updatedMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE A movie API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie
    WHERE movie_id =${movieId};`;
  const dbResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET ALL DIRECTORS API6
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM
    director;`;

  const directorsList = await db.all(getAllDirectorsQuery);
  response.send(
    directorsList.map((eachMovie) =>
      convertDirectorDbObjectToResponseDbObject(eachMovie)
    )
  );
});

//GET A DIRECTOR API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getADirectorQuery = `SELECT movie_name
    FROM movie 
    WHERE director_id ='${directorId}';`;

  const getDirector = await db.all(getADirectorQuery);
  response.send(
    getDirector.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
