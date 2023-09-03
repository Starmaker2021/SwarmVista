import Point from './Point.js';
import Vector from './Vector.js'
import Speed from './Speed.js'
import Size from './Size.js'

let stageSize = new Size(1300, 930);

export let defaultConfig = {
    preysTotal: 300,
    preyVision: 60,
    predatorTotal: 5,
    predatorVision: 600,
    maxSpeed: 6,
    preyEscapeSpeed: 8,
    predatorspeed: 3,
    predatorChaseSpeed: 7, 
    forceToAccRate: 0.2,
    predatorforceToAccRate: 0.3,
    alignmentFactor: 1,
    cohesionFactor: 1,
    seperationFactor: 1,
    preyCohesionEscapeFactor: 6, 
    ifShowVision: false,
    ifShowPredatorVision: false,
    ifBounce: false,
    ifShowChased: false,
    predatorNoise: 0.1, 
    preyNoise: 0.1, 
};

export let config = Object.assign({}, defaultConfig);

export class Prey {

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
        this.ifChased = false;
        this.maxSpeed = config.maxSpeed;
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
        if (velocityMagnitude > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / velocityMagnitude) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / velocityMagnitude) * this.maxSpeed;
        }
    }


    getVectorToPrey(otherPrey) {
        let vector = otherPrey.position.sub(this.position);
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
                this.force.x -= vectorToMouse.x * 10; // 
                this.force.y -= vectorToMouse.y * 10;
            }
        }
    }

    generateForce(preys, mouse, predators) {
        this.force.x = 0;
        this.force.y = 0;
        let alignmentTotal = new Point();
        let cohesionTotal = new Point();
        let seperationTotal = new Point();
        let total = 0;

        for (let prey of preys) {
            let vector = this.getVectorToPrey(prey);
            let distance = vector.length();

            if (distance < config.preyVision && prey != this) {
                total++;

                alignmentTotal.x += prey.velocity.x;
                alignmentTotal.y += prey.velocity.y;
                cohesionTotal.x += vector.x;
                cohesionTotal.y += vector.y;
                seperationTotal.x += -vector.x / distance / distance * config.preyVision;
                seperationTotal.y += -vector.y / distance / distance * config.preyVision;
            }
        }
        for (let predator of predators) {
            let vector = this.getVectorToPrey(predator);
            let distance = vector.length();
            if (distance < config.preyVision) {
                this.ifChased = true;
                this.force.x -= vector.x;
                this.force.y -= vector.y;

                config.cohesionFactor = config.preyCohesionEscapeFactor;

                this.maxSpeed = config.preyEscapeSpeed;
                break;
            } else {
                this.ifChased = false;
                this.maxSpeed = config.maxSpeed;
                config.cohesionFactor = 1;
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


        let noiseX = (Math.random() - 0.5) * 2 * config.preyNoise; 
		let noiseY = (Math.random() - 0.5) * 2 * config.preyNoise;
		this.force.x += noiseX;
		this.force.y += noiseY;
        this.generateMouseForce(mouse);
    }
}

export class Predator {
    constructor(id) {
        this.id = id;
        const randomIntegerX = Math.floor(Math.random() * stageSize.width) + 1;
        const randomIntegerY = Math.floor(Math.random() * stageSize.height) + 1;
        this.position = new Point(randomIntegerX, randomIntegerY);

        const velocityX = Math.floor(Math.random() * config.predatorspeed) + 1;
        const velocityY = Math.floor(Math.random() * config.predatorspeed) + 1;
        this.velocity = new Speed(velocityX, velocityY);
        this.force = new Vector(0, 0);
        if (this.position.x === null) {
            console.log(this);
        }
        this.width = 48;
        this.height = 36;
        this.maxSpeed = config.predatorspeed;

    }

    getID() {
        return `ID_${this.id}`;
    }

    update(preys) {
        let visiblePreys = preys.filter(prey => this.getVectorToPrey(prey).length() < config.predatorVision);

        if (visiblePreys.length > 0) {
            let targetPrey = visiblePreys[Math.floor(Math.random() * visiblePreys.length)];
            let vectorToTargePrey = this.getVectorToPrey(targetPrey);
            this.force.x += vectorToTargePrey.x;
            this.force.y += vectorToTargePrey.y;
            this.maxSpeed = config.predatorChaseSpeed;
        } else {
            this.maxSpeed = config.predatorspeed;
            this.force.x += (Math.random() - 0.5) * 0.1;
            this.force.y += (Math.random() - 0.5) * 0.1;

            let noiseX = (Math.random() - 0.5) * 2 * config.predatorNoise; 
            let noiseY = (Math.random() - 0.5) * 2 * config.predatorNoise;
            this.force.x += noiseX;
            this.force.y += noiseY;
        }


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


        this.velocity.x += this.force.x * config.predatorforceToAccRate;
        this.velocity.y += this.force.y * config.predatorforceToAccRate;

        let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (velocityMagnitude > config.predatorspeed) {
            this.velocity.x = (this.velocity.x / velocityMagnitude) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / velocityMagnitude) * this.maxSpeed;
        }
    }


    getVectorToPrey(otherPrey) {
        let vector = otherPrey.position.sub(this.position);
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
}
