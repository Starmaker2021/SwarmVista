import Point from './Point.js';
import Vector from './Vector.js'
import Speed from './Speed.js'
import Size from './Size.js'

let stageSize = new Size(1300, 930);


export let defaultConfig = {
    fishesTotal: 200,
    fishVision: 60,
    maxSpeed: 5,
    forceToAccRate: 0.2,
    alignmentFactor: 1,
    cohesionFactor: 1,
    seperationFactor: 1,
    obstacles: [ 
        { x: 300, y: 300, radius: 95 }, 
        { x: 900, y: 200, radius: 95 },
        { x: 1200, y: 500, radius: 95 },
        { x: 1200, y: 800, radius: 95},
        { x: 800, y: 500, radius: 95 },
        { x: 400, y: 600, radius: 95 },
    ],
    temperature: 20, 
    waterFlow: new Vector(0, 0), 
    viewAngle: 270, 
    ifShowVision: false, 
    ifBounce: false,
    waterFlowStrength: 1, 
    randomNoiseFactor: 0.1, 
};



export let config = Object.assign({}, defaultConfig);

export class Fish {

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
        let maxSpeed = config.maxSpeed * config.temperature / 20; 
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

        this.velocity.x += config.waterFlow.x*config.waterFlowStrength*0.1;
        this.velocity.y += config.waterFlow.y*config.waterFlowStrength*0.1;

        let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (velocityMagnitude > config.maxSpeed) {
            this.velocity.x = (this.velocity.x / velocityMagnitude) * maxSpeed;
            this.velocity.y = (this.velocity.y / velocityMagnitude) * maxSpeed;
        }

    }

    getVectorToFish(otherFish) {
        let vector = otherFish.position.sub(this.position);
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


            if (mouse.isDblClick && distanceToMouse < 100) { 
                this.force.x -= vectorToMouse.x * 10; 
                this.force.y -= vectorToMouse.y * 10;
            }
        }
    }

    generateForce(fishes,mouse) {
        this.force.x = 0;
        this.force.y = 0;

        let alignmentTotal = new Point();
        let cohesionTotal = new Point();
        let seperationTotal = new Point();
        let total = 0;


        let alignmentFactor = config.alignmentFactor * config.temperature / 20; 
        let cohesionFactor = config.cohesionFactor * config.temperature / 20; 
        let seperationFactor = config.seperationFactor * config.temperature / 20; 
       
        let velocityVector = new Vector(this.velocity.x, this.velocity.y);

        for (let fish of fishes) {
            let vector = this.getVectorToFish(fish);
            let distance = vector.length();
            let angle = Math.acos(velocityVector.dot(vector) / (velocityVector.length() * vector.length()));

            if (distance < config.fishVision && angle < config.viewAngle && fish != this) {
                total++;
                alignmentTotal.x += fish.velocity.x;
                alignmentTotal.y += fish.velocity.y;
                cohesionTotal.x += vector.x;
                cohesionTotal.y += vector.y;
                seperationTotal.x += -vector.x / distance / distance * config.fishVision;
                seperationTotal.y += -vector.y / distance / distance * config.fishVision;
            }
        }

        if (total != 0) {
            this.force.x += alignmentTotal.x / total * alignmentFactor;
            this.force.y += alignmentTotal.y / total * alignmentFactor;
            this.force.x += cohesionTotal.x / total * cohesionFactor;
            this.force.y += cohesionTotal.y / total * cohesionFactor;
            this.force.x += seperationTotal.x * seperationFactor;
            this.force.y += seperationTotal.y * seperationFactor;
        }


		let noiseX = (Math.random() - 0.5) * 2 * config.randomNoiseFactor;  
		let noiseY = (Math.random() - 0.5) * 2 * config.randomNoiseFactor;
		this.force.x += noiseX;
		this.force.y += noiseY;
        this.generateMouseForce(mouse);

    }
    avoidObstacles() {
        for (let obstacle of config.obstacles) {
            let vector = new Vector(obstacle.x - this.position.x, obstacle.y - this.position.y);
            let distance = vector.length();

            if (distance < obstacle.radius + config.fishVision) {
                this.force.x -= (obstacle.radius + config.fishVision - distance) * vector.x / distance;
                this.force.y -= (obstacle.radius + config.fishVision - distance) * vector.y / distance;
            }
        }
    }




}