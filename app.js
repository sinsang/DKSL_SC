const express = require("express");
const app = express();
const http = require("http").createServer(app);
const fetch = require("node-fetch");
const cors = require("cors");

const port = 3002;

const options = { pingTimeout: 3000, pingInterval: 5000 };
const io = require("socket.io")(http, options);

// 생성된 중계방 정보-----
var liveRoom = [];
//---------------------

app.use(cors());
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

app.get("/getLiveGames", (req, res) => {

	var liveGames = [];

	for (i in liveRoom){
	 
    var tmp = {
      away : {
        ID : liveRoom[i].away.ID,
        name : liveRoom[i].away.name,
        score : liveRoom[i].away.totalScore
      },
      home : {
        ID : liveRoom[i].home.ID,
        name : liveRoom[i].home.name,
        score : liveRoom[i].home.totalScore
      },
      nowInning : liveRoom[i].nowInning,
      nowTopBottom : liveRoom[i].nowTopBottom,
      ground : liveRoom[i].ground
    } 

    liveGames.push(tmp);

	}

  res.send(liveGames);

});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/404.html");
});

io.on("connect", (socket) => {

  console.log("누군가 들어왔다 " + socket.id);

  // 중계방 생성 요청 시
  socket.on("createLive", (gameInfo) => {
    liveRoom.push(gameInfo);
  });

  // 중계정보 갱신 시
  socket.on("renewLive", (index, gameInfo) => {
    liveRoom[index] = gameInfo;
    socket.in("room" + index).emit("liveCast", liveRoom[index]);
  });

  // 중계방 종료 요청 시
  socket.on("deleteLive", (gameInfo) => {});

  // 중계방 입장 시
  socket.on("joinLive", (gameId) => {
    socket.join("room" + gameId);
  });

  // 문자중계 요청 시
  socket.on("getLiveCast", (gameId) => {
    socket.emit("sendLiveCast", liveRoom[gameId]);
  });

  // 콘솔에서 중계정보 요청 시
  socket.on("getLiveInfo", (gameId) => {

  	var away = [];
  	var home = [];

  	fetch("http://49.50.172.42:3001/getTeamPlayers/" + liveRoom[gameId].away.ID).then((r) => {
  		r.json().then((d) => {
  			if (d.error){
  				console.log(d.error);
  			}
  			else{
  				away = d;
  			}
  		}).then(
        fetch("http://49.50.172.42:3001/getTeamPlayers/" + liveRoom[gameId].home.ID).then((r) => {
          r.json().then((d) => {
            if (d.error){
              console.log(d.error);
            }
            else{
              home = d;
              socket.emit("sendLiveInfo", liveRoom[gameId], away, home);
            }
          })
        })
      )
  	})

  });

  // 로그인 요청 시
  socket.on("login", (name) => {
    console.log(name + " now log in.");
  });

  // 중계방 목룍 요청 시
  socket.on("isThereLive", () => {
    socket.emit("sendLiveRoom", liveRoom);
  });

  // 연결 종료 시
  socket.on("disconnect", () => {
    console.log("user disconnect");
  });
});


http.listen(port, () => {
  console.log("Connected at " + port);
});
