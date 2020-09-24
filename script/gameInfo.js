const getTeamInfo = (teamID, teamName, batters, pitcher) => {

	var batterInfo = [];
	var pitcherInfo = [];

	var count = 0;

	for (i in batters){

		batterInfo[count] = {
			now : 0,
			batters :[{
				ID : batters[i].ID,
				name : batters[i].name,
				position : batters[i].position,
				result : [[],[],[],[],[],[],[],[],[]],	// 이닝별 타격 기록
				stat : {						// 총 타격 기록
					PA : 0,	// 타석
					AB : 0,	// 타수
					R : 0,	// 득점
					H : 0,	// 안타
					_2B : 0,	// 2루타
					_3B : 0,	// 3루타
					HR : 0,	// 홈런
					SO : 0,	// 삼진
					BB : 0,	// 볼넷
					HBP : 0,// 사구
					RBI : 0,// 타점
					SB : 0,	// 도루
					CS : 0,	// 도실
					GDP : 0, 	// 병살타 
					E : 0	// 에러
				}
			}]
		};

		count++;
	}

	pitcherInfo[0] = {
		ID : pitcher[0].ID,
		name : pitcher[0].name,
		stat : {
			IP : 0,	// 이닝
			PA : 0,	// 타석
			NP : 0,	// 투구수
			S : 0,	// 스트라이크 수
			B : 0,	// 볼 수
			AB : 0,	// 타수
			H : 0,	// 피안타
			_2B : 0,	// 2루타
			_3B : 0,	// 3루타
			BB : 0,	// 볼넷
			HBP : 0,// 사구
			HR : 0,	// 피홈런
			SO : 0,	// 탈삼진
			R : 0,	// 실점
			ER : 0	// 자책
		}

	}

	var teamInfo = {
		ID : teamID,
		name : teamName,
		score : [0,0,0,0,0,0,0,0,0],	// 이닝별 스코어
		totalScore : 0,					// 총 스코어
		batterInfo : batterInfo,
		nowBatter : 0,
		pitcherInfo : pitcherInfo,
		nowPitcher : 0
	}

	return teamInfo;

}

const getBatter = (ID, name, position) => {

	var batter = {
		ID : ID,
		name : name,
		position : position,
		result : [[],[],[],[],[],[],[],[],[]],	// 이닝별 타격 기록
		stat : {						// 총 타격 기록
			PA : 0,	// 타석
			AB : 0,	// 타수
			R : 0,	// 득점
			H : 0,	// 안타
			_2B : 0,	// 2루타
			_3B : 0,	// 3루타
			HR : 0,	// 홈런
			SO : 0,	// 삼진
			BB : 0,	// 볼넷
			HBP : 0,// 사구
			RBI : 0,// 타점
			SB : 0,	// 도루
			CS : 0,	// 도실
			GDP : 0, 	// 병살타 
			E : 0	// 에러
		}
	};

	return batter;

}

const getPitcher = (ID, name) => {

	var pitcher = {
		ID : ID,
		name : name,
		stat : {
			IP : 0,	// 이닝
			PA : 0,	// 타석
			NP : 0,	// 투구수
			S : 0,	// 스트라이크 수
			B : 0,	// 볼 수
			AB : 0,	// 타수
			H : 0,	// 피안타
			_2B : 0,	// 2루타
			_3B : 0,	// 3루타
			BB : 0,	// 볼넷
			HBP : 0,// 사구
			HR : 0,	// 피홈런
			SO : 0,	// 탈삼진
			R : 0,	// 실점
			ER : 0	// 자책
		}
	}

	return pitcher;

}

const getGameInfo = (castId, league, away, home, ground) => {

	var gameInfo = {
		castId : castId,
		league : league,
		away : away,
		home : home,
		nowBase : [{}, {}, {}],
		nowInning : 0,
		nowTopBottom : 1,	// 초0, 말1
		nowCount : {
			Ball : 0,
			Strike : 0,
			Out : 0
		},
		textCast : ["", "", "", "", "", "", "", "", ""], 
		ground : ground,
		waitForNextBatter : false
	};

	return gameInfo;

}

const getTeamBatterStat = (teamInfo, whatTheyWant) => {

	var result = 0;

	for (i in teamInfo.batterInfo){
		result += teamInfo.batterInfo[i].batters[teamInfo.batterInfo[i].now].stat[whatTheyWant];
	}

	return result;

}

const posName = ["투수", "포수", "1루수", "2루수", "3루수", "유격수", "좌익수", "중견수", "우익수", "지명타자"];

const TopBottom = ['회초', '회말'];
const ofTeam = ['away', 'home'];
const dfTeam = ['home', 'away'];

// 주자관련 코드
const tagOut = 0;
const forceOut = 1;
const notMove = 2
const to2B = 3;
const to3B = 4;
const toHome = 5;