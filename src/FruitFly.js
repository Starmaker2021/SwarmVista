import Point from './Point.js';
import Speed from './Speed.js';
 

export let defaultConfig = {
	numAnimal: 10,
	maxSpeed: 5,
	width: 1300,
	height: 930,
	fruitPoint: new Point(400,300),
	secondFruitPoint: new Point(600,600),
	speed : 5,
	bias :100,
	ifShowPath:false,
	fruitConcentration: 1,
	secondFruitPointConcentration: 1,
	distanceFactor: 0.6,
	concentrationFactor:5,

};


export let config = Object.assign({}, defaultConfig);


export class Drosophila extends Point {

	constructor(id) {
		const randomIntegerX = Math.floor(Math.random() * config.width) + 1;
		const randomIntegerY = Math.floor(Math.random() * config.height) + 1;
		super(randomIntegerX, randomIntegerY);
		this.id = id;
		let velocityX = Math.random() * config.speed;
		let velocityY = Math.sqrt( config.speed ** 2 - velocityX ** 2);
		this.velocity = new Speed(velocityX,velocityY); 
		this.path = []; 

	}

	getID(){
		return `ID_${this.id}`;
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

	
	setNewPosition(bestPoint){
		if(super.distance(bestPoint) == 0){
			this.bestPoint = bestPoint;
			return ;
		}

		this.bestPoint = bestPoint;
		let distanceX = this.bestPoint.x - this.x;
		let distanceY = this.bestPoint.y - this.y;
		let distance = Math.sqrt( distanceX ** 2 + distanceY ** 2);
		this.velocity.x = distanceX / distance * config.speed;
		this.velocity.y = distanceY / distance * config.speed;
	}
	
	moveToBestPoint(){
		if(super.distance(this.bestPoint)<= config.speed * 0.5){
			super.setX(this.bestPoint.x);
			super.setY(this.bestPoint.y);
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
