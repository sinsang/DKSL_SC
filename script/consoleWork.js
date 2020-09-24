// 문자중계 콘솔 작동부 전반 코드
function isEmptyObject(param) {
    return Object.keys(param).length === 0 && param.constructor === Object;
}

const gameId = $(location).attr('pathname').split('/')[2] * 1;

const socket = io();

var liveInfo = [];
var nowPitchCount = 1;

var awaySubPlayers = [];
var homeSubPlayers = [];

var textForSend = "";
var situationType = 0;

var waitForNextBatter = false;

// 상황 이후 목적베이스
var afterSituBase = [0, 0, 0];

const setNowPlayer = function () {
    var tmp = "";
    tmp += "현재 타자 : " + getNowBatter().name + "<br/>";
    tmp += "현재 투수 : " + liveInfo[dfTeam[liveInfo.nowTopBottom]].pitcherInfo[liveInfo[dfTeam[liveInfo.nowTopBottom]].nowPitcher].name;
    $("#nowBatterPitcher").html(tmp);
}

const setCountBoard = function () {
    $("#ballCount").html("<p>B</p>");
    $("#strikeCount").html("<p>S</p>");
    $("#outCount").html("<p>O</p>");
    for (var i = 0; i < liveInfo.nowCount.Ball; i++) 
        $("#ballCount").append("<div></div>");
    
    for (var i = 0; i < liveInfo.nowCount.Strike; i++) 
        $("#strikeCount").append("<div></div>");
    
    for (var i = 0; i < liveInfo.nowCount.Out; i++) 
        $("#outCount").append("<div></div>");
    
}

const clearText = function () {
    textForSend = "";
    afterSituBase = [0, 0, 0];
    $("#scriptContents").html("");
    $("#sendText").unbind("click");
    $("#hit_result").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#fielder").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#location").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runner").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerTagOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerForceOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });
}

const inputText = function (text, className="") {
    if (textForSend != "") {
        alert("이미 입력한 내용부터 전송해주세요.");
        return false;
    } else {
        $("#scriptContents").html("");
        appendText(text, className);
        return true;
    }
}

const appendText = function (text, className="") {
    textForSend += "<div class=\"textCast " + className + "\">" + text + "</div>";
    $("#scriptContents").append(text);
}

const sendText = function () {
    liveInfo.textCast[liveInfo.nowInning - 1] += textForSend;
    socket.emit("renewLive", gameId, liveInfo);
    clearText();
    setNowPlayer();
    renewBase();
}

const clearTextandAction = function () {
    if (confirm("정말 보낼 내용을 초기화하시겠습니까? (상황도 이루어지지 않습니다.)")) {
        clearText();
        // 콘솔 토글작동 상황 버튼 숨김처리
        $("#hit_result").hide();
        $("#fielder").hide();
        $("#location").hide();
        $("#runner").hide();
        $("#runnerForceOutLoca").hide();
        $("#runnerTagOutLoca").hide();
    }
}

const getNowOffenseTeam = function () {
    return liveInfo[ofTeam[liveInfo.nowTopBottom]];
}
const getNowBatter = function () {
    return liveInfo[ofTeam[liveInfo.nowTopBottom]].batterInfo[liveInfo[ofTeam[liveInfo.nowTopBottom]].nowBatter - 1].batters[liveInfo[ofTeam[liveInfo.nowTopBottom]].batterInfo[liveInfo[ofTeam[liveInfo.nowTopBottom]].nowBatter - 1].now];
}
const getBatterByOrder = function (team, order){
    return liveInfo[team].batterInfo[order].batters[liveInfo[team].batterInfo[order].now];
}
const setBatterByOrder = function (team, order, sub){
    liveInfo[team].batterInfo[order].batters[liveInfo[team].batterInfo[order].now] = sub;
}
const getNowDefenceTeam = function () {
    return liveInfo[dfTeam[liveInfo.nowTopBottom]];
}
const getNowPitcher = function () {
    return liveInfo[dfTeam[liveInfo.nowTopBottom]].pitcherInfo[liveInfo[dfTeam[liveInfo.nowTopBottom]].nowPitcher];
}
const getNowTeamPitcher = function (team) {
    return liveInfo[team.pitcherInfo[liveInfo[team].nowPitcher]];
}
const getAwayTeam = function () {
    return liveInfo["away"];
}
const getHomeTeam = function () {
    return liveInfo["home"];
}

const getPlayerByPosition = function(team, pos){

    for (i in liveInfo[team].batterInfo){
        if (liveInfo[team].batterInfo[i].batters[liveInfo[team].batterInfo[i].now].position == pos){
            return liveInfo[team].batterInfo[i].batters[liveInfo[team].batterInfo[i].now];
        }
    }

    return false;

}

const getPlayerByID = function(team, ID){

    for (i in liveInfo[team].batterInfo){
        if (liveInfo[team].batterInfo[i].batters[liveInfo[team].batterInfo[i].now].ID == ID){
            return liveInfo[team].batterInfo[i].batters[liveInfo[team].batterInfo[i].now];
        }
    }

    return false;

}

const setRunnerBtn = function () {

    for (i in liveInfo.nowBase){
        if (!isEmptyObject(liveInfo.nowBase[i])){
            $("#runnerAfterHitRunnerSelect").children(".runner[base=" + ((i*1)+1)  + "]").show();
            afterSituBase[(i*1)] = notMove;
        }
        else{
            $("#runnerAfterHitRunnerSelect").children(".runner[base=" + ((i*1)+1)  + "]").hide();
        }
    }

}

const setRunnerAfterHitSendtext = function () {

    setRunnerBtn();

    $("#sendText").click(function(event) {

        if (confirm("전송하시겠습니까? 다음타자로 바로 넘어갑니다")){

            var RBI = moveRunner();

            liveInfo.waitForNextBatter = false;

            getNowOffenseTeam().score[liveInfo.nowInning - 1] += RBI;
            getNowOffenseTeam().totalScore += RBI;

            nextBatter();

            sendText();

            $("#runnerAfterHitRunnerSelect").hide();
            $("#runnerAfterHit").hide();
            $("#pitching").show();
            
        }

    });

}

const runnerSituAfterHit = function (base, p, r) {

    $("#runner").hide();
    $("#runner").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerTagOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerForceOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });

    if (!isEmptyObject(liveInfo.nowBase[base - 1])) {

        $("#runner").show();
        $("#runnerHeader").html("<h2>" + (base) + "루주자 " + liveInfo.nowBase[base - 1].name + " 타격 후 추가진루 상황</h2>");

        var tmp = (base) + "루주자 " + liveInfo.nowBase[base - 1].name + " : ";

        $("#runner").children().each(function (index, el) {

            $(el).click(function (event) {

                switch ($(el).attr("id")) {

                    case "tag": isOut = true;
                        afterSituBase[base - 1] = tagOut;
                        $("#runnerTagOutLoca").show();
                        $("#runnerTagOutLoca").children().each(function (index, el) {
                            $(el).click(function (event) {
                                tmp += $(el).html() + " 태그아웃";
                                appendText(tmp);
                                $("#runnerTagOutLoca").hide();
                            });
                        });
                        break;

                    case "force": isOut = true;
                        afterSituBase[base - 1] = forceOut;
                        $("#runnerForceOutLoca").show();
                        $("#runnerForceOutLoca").children().each(function (index, el) {
                            $(el).click(function (event) {
                                tmp += $(el).html() + " 포스아웃";
                                appendText(tmp);
                                $("#runnerForceOutLoca").hide();
                            });
                        });
                        break;

                    case "notMove": afterSituBase[base - 1] = notMove;
                        break;

                    case "2B": tmp += p + r + " 2루까지 진루";
                        appendText(tmp);
                        afterSituBase[base - 1] = to2B;
                        break;

                    case "3B": tmp += p + r + " 3루까지 진루";
                        appendText(tmp);
                        afterSituBase[base - 1] = to3B;
                        break;

                    case "home": tmp += p + r + " 홈인";
                        appendText(tmp);
                        afterSituBase[base - 1] = toHome;
                        break;

                }

                $("#runner").hide();
                $("#runnerAfterHitRunnerSelect").show();

            });

        });
    }

}

const setRunnerSitu = function (base, p, r) {
    $("#runner").hide();
    $("#runner").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerTagOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });
    $("#runnerForceOutLoca").children().each(function (index, el) {
        $(el).unbind('click');
    });
    if (base < 0) {
        console.log(r);
        $("#sendText").click(function (event) {
            switch (r) {
                case "안타":
                    hit(p, r);
                    break;
                case "2루타":
                    _2B(p);
                    break;
                case "3루타":
                    _3B(p);
                    break;
                case "내야안타":
                    hit(p, r);
                    break;
                case "번트안타":
                    hit(p, r);
                    break;
                // case "그라운드 홈런" : HR(p); break;
                case "땅볼 아웃":
                case "땅볼로 출루":
                case "플라이 아웃":
                case "직선타":
                case "희생플라이":
                case "희생번트":
                case "병살타":
                case "직선타병살":
                case "삼중살":
                case "번트땅볼 아웃":
                case "번트뜬공 아웃":
                case "야수선택":
                case "실책으로 출루":
                    Out(p, r);
                    break;
            }
            sendText();
            setRunnerAfterHitSendtext();
            setCountBoard();
            renewBase();
        });
        return;
    }
    if (!isEmptyObject(liveInfo.nowBase[base])) {
        $("#runner").show();
        $("#runnerHeader").html("<h2>" + (
            base + 1
        ) + "루주자 " + liveInfo.nowBase[base].name + " 타격 후 상황</h2>");
        var tmp = (base + 1) + "루주자 " + liveInfo.nowBase[base].name + " : ";
        var isOut = false;
        $("#runner").children().each(function (index, el) {
            $(el).click(function (event) {

                $("#ruuner").hide();

                switch ($(el).attr("id")) {
                    case "tag": isOut = true;
                        afterSituBase[base] = tagOut;
                        $("#runnerTagOutLoca").show();
                        $("#runnerTagOutLoca").children().each(function (index, el) {
                            $(el).click(function (event) {
                                tmp += $(el).html() + " 태그아웃";
                                appendText(tmp);
                                setRunnerSitu(base - 1, p, r);
                                $("#runnerTagOutLoca").hide();
                            });
                        });
                        break;
                    case "force": isOut = true;
                        afterSituBase[base] = forceOut;
                        $("#runnerForceOutLoca").show();
                        $("#runnerForceOutLoca").children().each(function (index, el) {
                            $(el).click(function (event) {
                                tmp += $(el).html() + " 포스아웃";
                                appendText(tmp);
                                setRunnerSitu(base - 1, p, r);
                                $("#runnerForceOutLoca").hide();
                            });
                        });
                        break;
                    case "notMove": afterSituBase[base] = notMove;
                        break;
                    case "2B": tmp += "2루까지 진루";
                        appendText(tmp);
                        afterSituBase[base] = to2B;
                        break;
                    case "3B": tmp += "3루까지 진루";
                        appendText(tmp);
                        afterSituBase[base] = to3B;
                        break;
                    case "home": tmp += "홈인";
                        appendText(tmp);
                        afterSituBase[base] = toHome;
                        break;
                }

                if (!isOut) 
                    setRunnerSitu(base - 1, p, r);
                
            });
        });
    } else 
        setRunnerSitu(base - 1, p, r);
    
}

const moveRunnerWhenBB = function (base, move) {

    if (base > 2) 
        return;
     else if (isEmptyObject(liveInfo.nowBase[base])) {
        move = false;
    } else if (move) {
        switch (base) {
            case 0: afterSituBase[base] = to2B;
                break;
            case 1: afterSituBase[base] = to3B;
                break;
            case 2: afterSituBase[base] = toHome;
                break;
        }
        move = true;
    } else {
        afterSituBase[base] = notMove;
        move = false;
    } moveRunnerWhenBB(base + 1, move);

    if (move) {
        var toBase = (base + 2) + "루까지 진루";
        if (base > 1) 
            toBase = "홈인";
        
        appendText((base + 1) + "루주자 " + liveInfo.nowBase[base].name + " : " + toBase);
    }

    return;
}

const moveRunner = function () {
    
    var tmpBase = [{}, {}, {}];
    var RBI = 0;

    for (var i = 2; i >= 0; i--) {
        if (! isEmptyObject(liveInfo.nowBase[i])) {
            switch (afterSituBase[i]) {
                case tagOut:
                case forceOut: liveInfo.nowCount.Out++;
                    break;
                case notMove: tmpBase[i] = liveInfo.nowBase[i];
                    break;
                case to2B: tmpBase[1] = liveInfo.nowBase[i];
                    break;
                case to3B: tmpBase[2] = liveInfo.nowBase[i];
                    break;
                case toHome:
                    liveInfo.nowBase[i].stat.R ++;
                    RBI++;
                    break;
            }
        }
    }

    console.log(RBI);

    afterSituBase = [0, 0, 0];
    
    liveInfo.nowBase = tmpBase;

    return RBI;

}

const renewPlayerList = function () {

	$(".players").unbind("click");

    $("#awayTeamPlayers").children("ul").html("");
    $("#homeTeamPlayers").children("ul").html("");
    $("#awayTeamPlayers").children("ul").append("<div class=\"list-group-item-heading\" id=\"awayTeamName\">" + liveInfo.away.name + "</div>");

    // 타자
    for (i in liveInfo.away.batterInfo) 
        $("#awayTeamPlayers").children("ul").append("<div class=\"list-group-item players\" id=\"awayPlayers\" order=\"" + (i) + "\" pos=\"" + liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].position + "\" player-name=\"" + liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].name + "\" player-id=\"" + liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].ID + "\">" + liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].name + " - " + getKeyByValue(posCode, liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].position) + "</div>");
    $("#homeTeamPlayers").children("ul").append("<div class=\"list-group-item-heading\" id=\"homeTeamName\">" + liveInfo.home.name + "</div>");
    for (i in liveInfo.home.batterInfo) 
        $("#homeTeamPlayers").children("ul").append("<div class=\"list-group-item players\" id=\"homePlayers\" order=\"" + (i) + "\" pos=\"" + liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].position + "\" player-name=\"" + liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now].name + "\" player-id=\"" + liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now].ID + "\">" + liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now].name + " - " + getKeyByValue(posCode, liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now].position) + "</div>");
    // 투수
    $("#awayTeamPlayers").children("ul").append("<div class=\"list-group-item players\" id=\"awayPlayers\" player-name=\"" + liveInfo.away.pitcherInfo[liveInfo.away.nowPitcher].name + "\" player-id=\"" + liveInfo.away.pitcherInfo[liveInfo.away.nowPitcher].ID + "\" pos=\"pitcher\">" + liveInfo.away.pitcherInfo[liveInfo.away.nowPitcher].name + "</div>");
    $("#homeTeamPlayers").children("ul").append("<div class=\"list-group-item players\" id=\"homePlayers\" player-name=\"" + liveInfo.away.pitcherInfo[liveInfo.away.nowPitcher].name + "\" player-id=\"" + liveInfo.home.pitcherInfo[liveInfo.home.nowPitcher].ID + "\" pos=\"pitcher\">" + liveInfo.home.pitcherInfo[liveInfo.home.nowPitcher].name + "</div>");

    // 현재타자 표시
    $(".players[player-id=" + getNowBatter().ID + "][pos!=pitcher]").append("  <strong>현재타자</strong>");

    // 현재주자 표시
    for (i in liveInfo.nowBase){
        $(".players[player-id=" + liveInfo.nowBase[i].ID + "][pos!=pitcher]").append("  <strong>" + (i*1 + 1) + "루 주자</strong>");
    }

    // 포지션 겹침 경고
    for (i in liveInfo.away.batterInfo){
        for (j in liveInfo.away.batterInfo){
            if (liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now] != liveInfo.away.batterInfo[j].batters[liveInfo.away.batterInfo[j].now]){
                if (liveInfo.away.batterInfo[i].batters[liveInfo.away.batterInfo[i].now].position == liveInfo.away.batterInfo[j].batters[liveInfo.away.batterInfo[j].now].position){
                    $(".players[player-id=" + liveInfo.away.batterInfo[j].batters[liveInfo.away.batterInfo[j].now].ID + "][pos!=pitcher]").append("  <strong style=\"color: red;\">!포지션 겹침!</strong>");
                }
            }
        }
    }
    // 포지션 겹침 경고
    for (i in liveInfo.home.batterInfo){
        for (j in liveInfo.home.batterInfo){
            if (liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now] != liveInfo.home.batterInfo[j].batters[liveInfo.home.batterInfo[j].now]){
                if (liveInfo.home.batterInfo[i].batters[liveInfo.home.batterInfo[i].now].position == liveInfo.home.batterInfo[j].batters[liveInfo.home.batterInfo[j].now].position){
                    $(".players[player-id=" + liveInfo.home.batterInfo[j].batters[liveInfo.home.batterInfo[j].now].ID + "][pos!=pitcher]").append("  <strong style=\"color: red;\">!포지션 겹침!</strong>");
                }
            }
        }
    }

    // 대기선수 갱신 (현재 라인업에 들어가있는 명단 제거)
    for (i in getAwayTeam().batterInfo){
        for (j = 0; j <= getAwayTeam().batterInfo[i].now; j++){
            for (k in awaySubPlayers){
                if (awaySubPlayers[k].playerId == (getAwayTeam().batterInfo[i].batters[j].ID * 1)){
                    awaySubPlayers.splice(k, 1);
                    break;
                }
            }
        }
    }
    for (i in getHomeTeam().batterInfo){
        for (j = 0; j <= getHomeTeam().batterInfo[i].now; j++){
            for (k in homeSubPlayers){
                if (homeSubPlayers[k].playerId == (getHomeTeam().batterInfo[i].batters[j].ID * 1)){
                    homeSubPlayers.splice(k, 1);
                    break;
                }
            }
        }
    }

    // 선수명단 조작
    $(".players").click(function(event) {

        var mousePos = getMousePos(event);
        var team = event.target.id;

        var playerId = $(this).attr("player-id");
        var playerName = $(this).attr("player-name");
        var playerPos = $(this).attr("pos");

        var order = $(this).attr("order");
            
        $("#playerOption").show();
        $("#playerOption").css({
            left : mousePos.x,
            top : mousePos.y
        });
        $("#playerOptionHeader").html($(this).attr("player-name"));
        $("#playerChange").html("선수 교체");

        if (getNowBatter().ID == $(this).attr("player-id")*1 && $(this).attr("pos") != "pitcher"){
            $("#playerOptionHeader").append("  <strong>현재타자</strong>");
            $("#playerChange").html("대타 교체");
        }

        for (i in liveInfo.nowBase){
            if ($(this).attr("player-id") == liveInfo.nowBase[i].ID && $(this).attr("pos") != "pitcher"){
                $("#playerOptionHeader").append("  <strong>" + (i*1 + 1) + "루 주자</strong>");
                $("#playerChange").html("대주자 교체");
            }
        }

        // 선수교체
        $("#playerChange").click(function(event) {

            $("#playerOption").hide();
            $("#subPlayersDiv").show();
            $("#subPlayersDivBack").show();
        
            var subPlayers = [];

            switch (team){
                case "awayPlayers": team = "away"; subPlayers = awaySubPlayers; break;
                case "homePlayers": team = "home"; subPlayers = homeSubPlayers; break;
            }

            $("#subPlayersDiv").html("");
            $("#subPlayersDiv").append("<div class=\"btn-group-sm\" style=\"margin-left: 10px; margin-top: 10px;\">");
            $("#subPlayersDiv").append("<div class=\"btn-group-justified\"><h4>" + liveInfo[team].name + " 대기 선수 명단</h4><br/><h4>교체 대상 => " + playerName + "</h4></div><br/>");
            for (i in subPlayers){
                $("#subPlayersDiv").append("<button class=\"btn btn-default subPlayers\" player-id=\"" + subPlayers[i].playerId + "\">" + subPlayers[i].playerName + "</button>")
            }
            $("#subPlayersDiv").append("</div><br/><br/><br/><br/>");
            $("#subPlayersDiv").append("<button class=\"btn btn-default\" id=\"close\">취소</div>");

            $(".subPlayers").click(function(index, el) {
                
                if (playerPos == "pitcher"){
                    if (confirm(playerName + "을(를) " + $(this).html() + "(으)로 교체하시겠습니까?")){
                        changePitcher(team, order, {playerId:$(this).attr("player-id"), playerName:$(this).html()});
                    }
                }
                else {
                    if (confirm(playerName + "을(를) " + $(this).html() + "(으)로 교체하시겠습니까?")){
                        changeBatter(team, order, {playerId:$(this).attr("player-id"), playerName:$(this).html()});
                    }
                }

                $("#subPlayersDiv").hide();
                $("#subPlayersDivBack").hide();

            });

            $("#close").unbind("click");
            // 닫기
            $("#close").click(function(event) {
                $("#subPlayersDiv").hide();
                $("#subPlayersDivBack").hide();
            });

            $(this).unbind("click");

        });

        // 포지션 교체
        $("#posChange").click(function(event) {
            
            $("#playerOption").hide();
            $("#subPlayersDiv").show();
            $("#subPlayersDivBack").show();

            switch (team){
                case "awayPlayers": team = "away"; break;
                case "homePlayers": team = "home"; break;
            }

            $("#subPlayersDiv").html("");
            $("#subPlayersDiv").append("<div class=\"btn-group-sm\" style=\"margin-left: 10px; margin-top: 10px;\">");
            $("#subPlayersDiv").append("<div class=\"btn-group-justified\"><h4>교체 대상 : " + playerName + " / 포지션 : " + posName[playerPos - 1] + "</h4></div><br/>");
            for (i in posName){
                $("#subPlayersDiv").append("<button class=\"btn btn-default posForChange\" pos-id=\"" + i + "\">" + posName[i] + "</button>")
            }
            $("#subPlayersDiv").append("</div><br/><br/><br/><br/>");
            $("#subPlayersDiv").append("<button class=\"btn btn-default\" id=\"close\">취소</div>");
            $(".posForChange[pos-id=" + (playerPos - 1) + "]").hide();

            $(".posForChange").click(function(event) {

                if (confirm(playerName + "의 포지션을 " + $(this).html() + "로 교체하시겠습니까?")){
                    changePosition(team, {playerId:playerId, playerName:playerName, playerPos:playerPos}, $(this).attr("pos-id")*1);
                }

                $("#subPlayersDiv").hide();
                $("#subPlayersDivBack").hide();

            });

            $("#close").unbind("click");
            // 닫기
            $("#close").click(function(event) {
                $("#subPlayersDiv").hide();
                $("#subPlayersDivBack").hide();
            });

            $(this).unbind("click");

        });

    });

}

const getMousePos = function (e) {

    var x = 0;
    var y = 0;

    if (!e){
        var e = window.event;
    }
    if (e.pageX || e.pageY){
        x = e.pageX;
        y = e.pageY;
    }
    else if (e.clientX || e.clientY){
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY = document.body.scrollTop + document.documentElement.scrollTop;
    }

    return { x, y };

}