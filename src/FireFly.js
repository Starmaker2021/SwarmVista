import Point from './Point.js';
import Speed from './Speed.js';


export let defaultConfig = {
	numAnimal: 20,
	belta0: 1.0, //initial attraction
	gama: 1.0, // Light absorption coefficient of the propagation medium
	alpha: 20.0,// noise
	width: 1300,
	height: 930,
	fruitPoint: new Point(400, 300),
	secondFruitPoint: new Point(600,600),
	speed: 5,
	bias: 100,
	lightFactor: 0.5,
	ifShowPath:false,
	fruitConcentration: 1,
	secondFruitPointConcentration: 1,
	distanceFactor: 0.6,
	concentrationFactor:5,
};

export let config = Object.assign({}, defaultConfig);


export class FireFly extends Point {

	constructor(id) {
		const randomIntegerX = Math.floor(Math.random() * config.width) + 1;
		const randomIntegerY = Math.floor(Math.random() * config.height) + 1;
		super(randomIntegerX, randomIntegerY);
		this.id = id;
		let velocityX = Math.random() * config.speed;
		let velocityY = Math.sqrt(config.speed ** 2 - velocityX ** 2);
		this.velocity = new Speed(velocityX, velocityY);
		this.nextPoint = null;
		this.path = [];  
	}
	
	getNextPoint(){
		return this.nextPoint;
	}


	adaptability() {
		let adp1 = config.distanceFactor*super.distance(config.fruitPoint)/(config.concentrationFactor*config.fruitConcentration);
		let adp2 = config.distanceFactor*super.distance(config.secondFruitPoint)/(config.concentrationFactor*config.secondFruitPointConcentration);
		console.log(adp1,adp2);
		if(adp1<adp2){
			return adp1;
		}else{
			return adp2;
		}
	}

	getID(){
		return `ID_${this.id}`;
	}


	// belta = belta0 * np.exp((-gama) * (d ** 2))
	attraction(fireFly) {
		let d = super.distance(fireFly) * 0.001 ;
		let belta = config.belta0 * Math.exp((-config.gama) * (d ** 2));
		return belta;
	}


	calculateNextPoint(fireFlys) {
		let nextPointX = super.getX();
		let nextPointY = super.getY();

		const minAdaptability = fireFlys.map(fireFly => fireFly.adaptability()).reduce((min, current) => {
			return current < min ? current : min;
		}, fireFlys[0].adaptability());

		console.log("minAdaptability: " + minAdaptability);
		if (this.adaptability() == minAdaptability) {
			nextPointX = nextPointX + config.alpha * (Math.random() - 0.5);
			nextPointY = nextPointY + config.alpha * (Math.random() - 0.5);
		} else {
			for (let fireFly of fireFlys) {
				if (fireFly.adaptability() < this.adaptability()) {
					let belta = this.attraction(fireFly);
					nextPointX = nextPointX + belta * (fireFly.getX() - nextPointX ) + config.alpha * (Math.random() - 0.5)
					nextPointY = nextPointY + belta * (fireFly.getY() - nextPointY ) + config.alpha * (Math.random() - 0.5)
					if (nextPointX < 0) {
						nextPointX = 0;
					}
					if (nextPointX > config.width) {
						nextPointX = config.width;
					}

					if (nextPointY < 0) {
						nextPointY = 0;
					}
					if (nextPointY > config.height) {
						nextPointY = config.height;
					}
				}
			}
		}

		this.nextPoint = new Point(nextPointX, nextPointY);
		let distanceX = this.nextPoint.x - super.getX();
		let distanceY = this.nextPoint.y - super.getY();
		let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
		this.velocity.x = distanceX / distance * config.speed;
		this.velocity.y = distanceY / distance * config.speed;
	}

	move() {
		if (super.distance(this.nextPoint) <= config.speed) {
			super.setX(this.nextPoint.x);
			super.setY(this.nextPoint.y);
			this.path.push(new Point(this.x, this.y));
			if (this.path.length > 6) {
				this.path.shift();
			}
			return true;
		}

		let x = super.getX() + this.velocity.x;
		super.setX(x);

		let y = super.getY() + this.velocity.y;
		super.setY(y);

		return false;
	}



}
