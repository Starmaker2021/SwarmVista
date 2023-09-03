export default class Vector {
	constructor(x, y) {
		if (x === undefined && y === undefined) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = x;
			this.y = y;
		}
	}
	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	setX(x) {
		this.x = x;
	}

	setY(y) {
		this.y = y;
	}
	length() {
		let value = Math.sqrt(this.x ** 2 + this.y ** 2);
		if (value === 0) {
			return 0.001;
		}
		return value;
	}

	normalize() {
		const length = this.length();
		if (length > 0) {
			this.x /= length;
			this.y /= length;
		}
	}
	
	normalize1() {
		const length = this.length();
		if (length > 0) {
			return new Vector(this.x / length, this.y / length);
		} else {
			return new Vector(0, 0);
		}
	}

	dot(other) {
		return this.x * other.x + this.y * other.y;
	}
}


