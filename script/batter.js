var setBatterInfo = (id, pos, name, num, PA, H, _2B, _3B, HR, RBI, R, BB, HBP, SB, CS, result) => {

	var batterInfo = {
		id = id,
		pos = pos,
		name = name,
		num = num,
		PA = PA,
		H = H,
		_2B = _2B,
		_3B = _3B,
		HR = HR,
		RBI = RBI,
		R = R,
		BB = BB,
		HBP = HBP,
		SB = SB,
		CS = CS,
		resultByInning = {
			inning = result.inning,
			code = result.code
		}
	};

	return batterInfo;

}

var setPitcherInfo = (id, name, result, inning, pitchCount, PA, AB, H, _2B, _3B, HR, BB, HBP, SO, R, ER) => {

	var pitcherInfo = {
		id = id,
		name = name,
		result = result,
		inning = inning,
		pitchCount = pitchCount,
		PA = PA,
		AB = AB,
		H = H,
		_2B = _2B,
		_3B = _3B,
		HR = HR,
		BB = BB,
		HBP = HBP,
		R = R,
		ER = ER
	};

	return pitcherInfo;

};