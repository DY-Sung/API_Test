const { ccclass, property } = cc._decorator;

@ccclass
export default class Util {
	static GetWorldAngle(target: cc.Node): number {
		let curr: cc.Node = target;
		let ret: number = curr.angle;

		do {
			curr = curr.parent;
			ret += curr.angle;
		} while (curr.parent != null);

		ret = ret % 360;
		return ret;
	}

	/**
	 * Change parent with keeping it's world position.
	 */
	static ChangeParent(target: cc.Node, newParent: cc.Node): void {
		if (target.parent == newParent) return;

		const oldWorldAngle: number = this.GetWorldAngle(target);
		const newParentWorldAngle: number = this.GetWorldAngle(newParent);
		const newLocalAngle: number = oldWorldAngle - newParentWorldAngle;

		const oldWorldPos: cc.Vec2 = target.convertToWorldSpaceAR(cc.v2(0, 0));
		const newLocalPos: cc.Vec2 = newParent.convertToNodeSpaceAR(oldWorldPos);

		target.parent = newParent;
		target.setPosition(newLocalPos);
		target.angle = newLocalAngle;
	}

	static setPontSize(label: cc.Label, size: number) {
		label.fontSize = size;
		label.lineHeight = size;
	}

	static getRandomInteger(maxRange: number, minRange: number = 0): number {
		return Math.floor(Math.random() * maxRange - minRange) + minRange;
	}
	static getRandomFloat(maxRange: number, minRange: number = 0): number {
		return Math.random() * (maxRange - minRange) + minRange;
	}

	// 앞에 자리를 채운 문자열을 반환하는 함수
	// ex) 1 -> 001
	static fillStringBlank(
		fillLetter: string,
		originLetter: string,
		targetLength: number
	): string {
		const originLength = originLetter.length;
		const fillLength = targetLength - originLength;

		if (fillLength === 0) {
			return originLetter;
		}

		let fillString: string = "";
		for (let i = 0; i < fillLength; i += fillLetter.length) {
			fillString += fillLetter;
		}

		fillString += originLetter;
		return fillString;
	}

	// 1차원 배열의 인덱스를 2차원 배열의 좌표로 변환하여 반환하는 함수
	static Dim1ToDim2(idx: number, widthNum: number): cc.Vec2 {
		const quotient: number = Math.floor(idx / widthNum);
		const remainder: number = idx % widthNum;

		return cc.v2(remainder, quotient);
	}

	// 2차원 배열의 좌표를 1차원 배열의 인덱스로 변환하여 반환하는 함수
	static Dim2ToDim1(cartesian: cc.Vec2, widthNum: number): number {
		return cartesian.y * widthNum + cartesian.x;
	}

	// 초를 00:00:00으로 변환하여 반환하는 함수
	static Second2Time(timeCnt: number): string {
		let hour: string = "0";
		let min: string = "0";
		let sec: string = "0";

		hour = Math.floor(timeCnt / 3600).toString();

		if (hour.length == 1) {
			hour = "0" + hour;
		}

		timeCnt = timeCnt % 3600;

		min = Math.floor(timeCnt / 60).toString();

		if (min.length == 1) {
			min = "0" + min;
		}

		sec = Math.floor(timeCnt % 60).toString();

		if (sec.length == 1) {
			sec = "0" + sec;
		}

		return hour + ":" + min + ":" + sec;
	}
}
