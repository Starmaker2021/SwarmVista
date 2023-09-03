import Point from './Point.js';
import Vector from './Vector.js'
import Speed from './Speed.js'
import Size from './Size.js'

let stageSize = new Size(1300, 930);

export let defaultConfig = {
	boidsTotal: 400,
	boidVision: 60,
	maxSpeed: 5,
	forceToAccRate: 0.5,
	alignmentFactor: 1,
	cohesionFactor: 1,
	seperationFactor: 1,
	ifShowVision: false,
	ifBounce: false,
	ifShowColor: true,
	randomNoiseFactor: 0.1,
};

export let config = Object.assign({}, defaultConfig);

export class Boid {

	constructor(id) {
		this.id = id;
		const randomIntegerX = Math.floor(Math.random() * stageSize.width) + 1;
		const randomIntegerY = Math.floor(Math.random() * stageSize.height) + 1;
		this.position = new Point(randomIntegerX, randomIntegerY);
		const velocityX = Math.floor(Math.random() * config.maxSpeed) + 1;
		const velocityY = Math.floor(Math.random() * config.maxSpeed) + 1;
		this.velocity = new Speed(velocityX, velocityY);
		this.force = new Vector(0, 0);
		if (this.position.x === null) {
			console.log(this);
		}

	}

	getID() {
		return `ID_${this.id}`;
	}

	update() {
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (config.ifBounce) {
			if (this.position.x < 0 || this.position.x > stageSize.width) {
				this.velocity.x = -this.velocity.x;
			}
			if (this.position.y < 0 || this.position.y > stageSize.height) {
				this.velocity.y = -this.velocity.y;
			}

			if (this.position.x < 0) {
				this.position.x = 0;
			} else if (this.position.x > stageSize.width) {
				this.position.x = stageSize.width;
			}
			if (this.position.y < 0) {
				this.position.y = 0;
			} else if (this.position.y > stageSize.height) {
				this.position.y = stageSize.height;
			}

		} else {
			if (this.position.x < 0) {
				this.position.x += stageSize.width;
			} else if (this.position.x > stageSize.width) {
				this.position.x -= stageSize.width;
			}
			if (this.position.y < 0) {
				this.position.y += stageSize.height;
			} else if (this.position.y > stageSize.height) {
				this.position.y -= stageSize.height;
			}
		}

		this.velocity.x += this.force.x * config.forceToAccRate;
		this.velocity.y += this.force.y * config.forceToAccRate;

		let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
		if (velocityMagnitude > config.maxSpeed) {
			this.velocity.x = (this.velocity.x / velocityMagnitude) * config.maxSpeed;
			this.velocity.y = (this.velocity.y / velocityMagnitude) * config.maxSpeed;
		}
	}


	getVectorToBoid(otherBoid) {
		let vector = otherBoid.position.sub(this.position);
		if (vector.x > stageSize.width / 2) {
			vector.x -= stageSize.width;
		} else if (vector.x < -stageSize.width / 2) {
			vector.x += stageSize.width;
		}
		if (vector.y > stageSize.height / 2) {
			vector.y -= stageSize.height;
		} else if (vector.y < -stageSize.height / 2) {
			vector.y += stageSize.height;
		}
		return vector;
	}

	generateMouseForce(mouse) {
		if (mouse) {
			let mousePos = new Point(mouse.x, mouse.y);
			let vectorToMouse = mousePos.sub(this.position);
			let distanceToMouse = vectorToMouse.length();

			if (mouse.isDown) {
				this.force.x += vectorToMouse.x * 0.01;
				this.force.y += vectorToMouse.y * 0.01;
			}

			if (mouse.isDblClick && distanceToMouse < 200) { 
				this.force.x -= vectorToMouse.x * 1000; 
				this.force.y -= vectorToMouse.y * 1000;
			}
		}
	}

	generateForce(boids, mouse) {
		this.force.x = 0;
		this.force.y = 0;
		let alignmentTotal = new Point();
		let cohesionTotal = new Point();
		let seperationTotal = new Point();
		let total = 0;

		for (let boid of boids) {
			let vector = this.getVectorToBoid(boid);
			let distance = vector.length();

			if (distance < config.boidVision && boid != this) {
				total++;
				alignmentTotal.x += boid.velocity.x;
				alignmentTotal.y += boid.velocity.y;
				cohesionTotal.x += vector.x;
				cohesionTotal.y += vector.y;
				seperationTotal.x += -vector.x / distance / distance * config.boidVision;
				seperationTotal.y += -vector.y / distance / distance * config.boidVision;
			}
		}

		if (total != 0) {
			this.force.x += alignmentTotal.x / total * config.alignmentFactor;
			this.force.y += alignmentTotal.y / total * config.alignmentFactor;
			this.force.x += cohesionTotal.x / total * config.cohesionFactor;
			this.force.y += cohesionTotal.y / total * config.cohesionFactor;
			this.force.x += seperationTotal.x * config.seperationFactor;
			this.force.y += seperationTotal.y * config.seperationFactor;
		}

		let noiseX = (Math.random() - 0.5) * 2 * config.randomNoiseFactor;  
		let noiseY = (Math.random() - 0.5) * 2 * config.randomNoiseFactor;
		this.force.x += noiseX;
		this.force.y += noiseY;
		this.generateMouseForce(mouse);
	}
}