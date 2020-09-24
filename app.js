const express = require("express");
const app = express();
const http = require("http").createServer(app);

const port = 4000;

const options = { pingTimeout: 3000, pingInterval: 5000 };
const io = require("socket.io")(http, options);

// 생성된 중계방 정보-----
var liveRoom = [];
//---------------------

app.use('/script', express.static(__dirname + "/script"));

app.get("/makeRoom", (req, res) => {
  res.sendFile(__dirname + "/makeRoom.html");
});

app.get("/console/:gameId", (req, res) => {
  var gameId = req.params.gameId;
  if (liveRoom.length - 1 < gameId) {
    res.sendFile(__dirname + "/404.html");
  } else {
    res.sendFile(__dirname + "/console.html");
  }
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/404.html");
});


http.listen(port, () => {
  console.log("Connected at " + port);
});
