const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { request } = require("http");
const dbPath = path.join(__dirname, "twitterClone.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5050, () => {
      console.log(`Server Running at http://localhost:5050`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ---------------------------------------------------------------

// MiddleWare To Authenticate JWT Token

const authenticateJWT = (request, response, next) => {
  const { tweet } = request.body
  const { tweetId } = request.params;

  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.payload = payload;
        request.tweetId = tweetId;
        request.tweet = tweet
        next();
      }
    });
  }
};



// ---------------------------------------------------------------

// API 1 --- User Registration

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUserQuery = `INSERT INTO user (username, password, name, gender) VALUES ('${username}', '${hashedPassword}', '${name}', '${gender}');`;
      await db.run(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// API 2 --- User Login

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (isPasswordValid === true) {
      const jwtToken = jwt.sign(dbUser, "MY_SECRET_TOKEN");
      response.send({ jwtToken: jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// API 3 --- Returns the latest tweets of people whom the user follows. Return 4 tweets at a time

app.get("/user/tweets/feed/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id="", name="", username="", gender="" } = payload;

  const getFollowingPeopleQuery = `SELECT following_user_id FROM follower INNER JOIN user ON user.user_id = follower.follower_user_id WHERE user.username = '${username}';`;
  
  const followingPeopleArray = await db.all(getFollowingPeopleQuery);
  const followingPeople = followingPeopleArray.map((eachUser) => eachUser.following_user_id);

  console.log(followingPeople);

  const getTweetsFeedQuery = `SELECT username, 
                                    tweet, 
                                    date_time AS dateTime
                              FROM 
                                  user INNER JOIN tweet ON user.user_id =  tweet.user_id 
                              WHERE
                                  user.user_id IN ('${followingPeople}')
                              ORDER BY
                                  date_time DESC LIMIT 4;`;

  const tweetFeedArray = await db.all(getTweetsFeedQuery);
  response.send(tweetFeedArray);

});
// API 4 --- Returns the list of all names of people whom the user follows

app.get("/user/following/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id="", name="", username="", gender="" } = payload;

  const getFollowersResultQuery = `SELECT name FROM user INNER JOIN follower ON user.user_id = follower.following_user_id WHERE follower.follower_user_id = '${user_id}';`;
  const dbFollowers = await db.all(getFollowersResultQuery);
  response.send(dbFollowers);
});

// API 5 --- Returns the list of all names of people who follows the user

app.get("/user/followers/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id="", name="", username="", gender="" } = payload;

  const getFollowersResultQuery = `SELECT name FROM user INNER JOIN follower ON user.user_id = follower.follower_user_id WHERE follower.following_user_id = '${user_id}';`;
  const dbFollowers = await db.all(getFollowersResultQuery);
  response.send(dbFollowers);
});

// API 6 --- /tweets/:tweetId/

app.get("/tweets/:tweetId/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id="", name="", username="", gender="" } = payload;
  const { tweetId } = request;

  const tweetsQuery = `SELECT * FROM tweet WHERE tweet_id = ${tweetId};`;
  const tweetResult = await db.get(tweetsQuery);

  const userFollowersQuery = `SELECT * FROM follower INNER JOIN user ON user.user_id = follower.following_user_id WHERE follower.follower_user_id = ${user_id};`;
  const userFollowersResult = await db.all(userFollowersQuery);

  if (userFollowersResult.some((each) => each.following_user_id === tweetResult.user_id)) {

    console.log(tweetResult);

    const getTweetDetailsQuery = `SELECT tweet, 
    COUNT(DISTINCT(like.like_id)) AS likes,
    COUNT(DISTINCT(reply.reply_id)) AS replies,
    tweet.date_time AS dateTime
    FROM
      tweet INNER JOIN like ON tweet.tweet_id = like.tweet_id INNER JOIN reply ON reply.tweet_id = tweet.tweet_id 
    WHERE
      tweet.tweet_id = ${tweetId} AND 
      tweet.user_id = ${userFollowersResult[0].user_id};`;
    const tweetDetails = await db.get(getTweetDetailsQuery);
    response.send(tweetDetails);
  } else {
    response.status(401);
    response.send("Invalid Request");
  }
  
});

// API 7 --- /tweets/:tweetId/likes/

app.get(
  "/tweets/:tweetId/likes/",
  authenticateJWT,
  async (request, response) => {
    const { tweetId } = request;
    const { payload } = request;
    const { user_id = "", name = "", username = "", gender = "" } = payload;
    
    const getLikedUsersQuery = `SELECT * FROM follower JOIN tweet ON tweet.user_id = follower.following_user_id INNER JOIN like ON like.tweet_id = tweet.tweet_id INNER JOIN user ON user.user_id = like.user_id WHERE tweet.tweet_id = ${tweetId} AND follower.follower_user_id = ${user_id};`;
    const likedUsers = await db.all(getLikedUsersQuery);

    if (likedUsers.length !== 0) {
      let likes = [];
      const getNamesArray = (likedUsers) => {
        for (let item of likedUsers) {
          likes.push(item.username);
        }
      };
      getNamesArray(likedUsers);
      response.send({ likes });
    } else {
      response.status(401);
      response.send("Invalid Request");
    }
  }
);

// API 8 --- /tweets/:tweetId/replies/

app.get(
  "/tweets/:tweetId/replies/",
  authenticateJWT,
  async (request, response) => {
    const { payload } = request;
    const { user_id = "", name = "", username = "", gender = "" } = payload;
    const { tweetId } = request;

    const getRepliedUsersQuery = `SELECT * FROM follower INNER JOIN tweet ON tweet.user_id = follower.following_user_id INNER JOIN reply ON reply.tweet_id = tweet.tweet_id INNER JOIN user ON user.user_id = reply.user_id WHERE tweet.tweet_id = ${tweetId} AND follower.follower_user_id = ${user_id};`;

    const repliedUser = await db.all(getRepliedUsersQuery);

    if (repliedUser.length !== 0) {
      let replies = [];
      const getNamesArray = (repliedUser) => {
        for (let item of repliedUser) {
          let object = {
            name: item.name,
            reply: item.reply
          };
          replies.push(object);
        }
      };
      getNamesArray(repliedUser);
      response.send({ replies });
    } else {
      response.status(401);
      response.send("Invalid Request");
    }
  }
);

// API 9 --- /user/tweets/

app.get("/user/tweets/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id="", name="", username="", gender="" } = payload;

  const getTweetDetailsQuery = `SELECT tweet, 
  COUNT(DISTINCT like_id) AS likes,
  COUNT(DISTINCT reply_id) AS replies,
  date_time AS dateTime
  FROM
  tweet LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id LEFT JOIN like ON tweet.tweet_id = like.tweet_id WHERE tweet.user_id = '${user_id}' GROUP BY tweet.tweet_id;`;
  const tweetIds = await db.all(getTweetDetailsQuery);
  console.log(tweetIds);
  response.send(tweetIds);
});

//API 10 --- /user/tweets/

app.post("/user/tweets/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id = "", name = "", username = "", gender = "" } = payload;
  const { tweet } = request;
  const { tweetId } = request;

  const postTweetQuery = `INSERT INTO tweet (tweet, user_id) VALUES ('${tweet}', '${user_id}');`;
  await db.run(postTweetQuery);
  response.send("Created a Tweet");
});

// API 11 --- /tweets/:tweetId/

app.delete("/tweets/:tweetId/", authenticateJWT, async (request, response) => {
  const { payload } = request;
  const { user_id = "", name = "", username = "", gender = "" } = payload;
  const { tweetId } = request;

  const getTheTweetQuery = `SELECT * FROM tweet WHERE tweet.user_id = '${user_id}' AND tweet.tweet_id = '${tweetId}';`;
  const tweetUser = await db.get(getTheTweetQuery);

  console.log(tweetUser);

  if (tweetUser !== undefined) {
    const deleteTweetQuery = `DELETE FROM tweet WHERE tweet.user_id = '${user_id}' AND tweet.tweet_id = '${tweetId}';`;
    await db.run(deleteTweetQuery);
    response.send("Tweet Removed");
  } else {
    response.status(401);
    response.send("Invalid Request");
  }
});
