import Point from './Point.js';
import Vector from './Vector.js'
import Speed from './Speed.js'
import Size from './Size.js'

let stageSize = new Size(1300, 930);

export let defaultConfig = {
    birdsTotal: 50,
    birdVision: 60,
    maxSpeed: 5,
    forceToAccRate: 0.2,
    alignmentFactor: 1,
    cohesionFactor: 1,
    seperationFactor: 1,
    energyMax: 300,
    energyThreshold: 20,
    energyConsumeRate: 2,
    energyRecoverRate: 5,
    lowEnergyVision: 300,
    trees: [
        { x: 300, y: 400, radius: 100 },
        { x: 500, y: 600, radius: 100 },
        { x: 700, y: 500, radius: 100 },
        { x: 900, y: 300, radius: 100 },
        { x: 1250, y: 200, radius: 100 },
        { x: 1250, y: 600, radius: 100 },
        { x: 400, y: 200, radius: 100 },
        { x: 1500, y: 400, radius: 100 },

    ],
    weather: 0,//0 for sunny days, 1 for foggy days, 2 for windy days
    windDirection: Math.random() * 2 * Math.PI,
    windStrength: 0.3,
    fogFactor: 0.5,
    ifShowVision: false,
    ifBounce: false,
};

export let config = Object.assign({}, defaultConfig);

export class Bird {
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
        this.state = 'flying';
        this.energy = config.energyMax * (Math.random() * 0.2 + 0.9);
        this.nearestTree = null;
        this.birdVision = config.birdVision;
        this.leaveTreeDistance = 0;
        this.restPosition = null;
        this.energyConsumeRate = config.energyConsumeRate * (Math.random() * 0.2 + 0.9);
        this.energyRecoverRate = config.energyRecoverRate * (Math.random() * 0.2 + 0.9);
        this.energyThreshold = config.energyThreshold * (Math.random() * 0.2 + 0.9);
        this.lowEnergyVision = config.lowEnergyVision;
    }

    getID() {
        return `ID_${this.id}`;
    }

    getWeather() {
        return config.weather;
    }

    isFlying() {
        return this.state === "flying";
    }

    flyingUpdate() {
        this.birdVision = config.birdVision;
        this.lowEnergyVision = config.lowEnergyVision;
        if (config.weather === 2) {
            const windX = config.windStrength * Math.cos(config.windDirection);
            const windY = config.windStrength * Math.sin(config.windDirection);
            this.velocity.x += windX;
            this.velocity.y += windY;
        } else if (config.weather === 1) {
            this.birdVision = config.birdVision * (1 - config.fogFactor);
            this.lowEnergyVision = config.lowEnergyVision * (1 - config.fogFactor);
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

        this.energy -= this.energyConsumeRate;
        var nearestTree = this.findTree();

        if (this.energy < this.energyThreshold && nearestTree != null) {
            this.toTree(nearestTree);
        } else if (this.energy < this.energyThreshold && nearestTree == null) {
            this.birdVision = this.lowEnergyVision;
            this.velocity.x += this.force.x * config.forceToAccRate;
            this.velocity.y += this.force.y * config.forceToAccRate;
            let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (velocityMagnitude > config.maxSpeed) {
                this.velocity.x = (this.velocity.x / velocityMagnitude) * config.maxSpeed;
                this.velocity.y = (this.velocity.y / velocityMagnitude) * config.maxSpeed;
            }
        } else {
            this.velocity.x += this.force.x * config.forceToAccRate;
            this.velocity.y += this.force.y * config.forceToAccRate;
            let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (velocityMagnitude > config.maxSpeed) {
                this.velocity.x = (this.velocity.x / velocityMagnitude) * config.maxSpeed;
                this.velocity.y = (this.velocity.y / velocityMagnitude) * config.maxSpeed;
            }
        }
    }


    findTree() {
        var nearestDistance = 1000000;
        var findnearestTree = false;
        for (let tree of config.trees) {
            let vector = new Vector(tree.x - this.position.x, tree.y - this.position.y);
            let distance = vector.length();
            if (distance < this.birdVision + tree.radius) {
                if (distance < nearestDistance || this.nearestTree == null) {
                    this.nearestTree = tree;
                    nearestDistance = distance;
                    findnearestTree = true;
                }
            }
        }
        if (!findnearestTree) {
            this.nearestTree = null;
        }
        return this.nearestTree;
    }

    toTree(nearestTree) {

        let direction = new Vector(nearestTree.x - this.position.x, nearestTree.y - this.position.y);
        let distance = direction.length();

        if (distance < nearestTree.radius) {
            this.state = 'resting'; 
            this.velocity = new Speed(0, 0); 
            let angle = Math.random() * 2 * Math.PI;
            let r = Math.random() * nearestTree.radius;
            this.position.x = nearestTree.x + r * Math.cos(angle);
            this.position.y = nearestTree.y + r * Math.sin(angle);
        } else {
            direction.normalize(); 
            this.velocity = new Speed(direction.x * config.maxSpeed, direction.y * config.maxSpeed); 
        }
    }


    restingUpdate() {
        this.energy += this.energyRecoverRate;
        if (this.energy > config.energyMax) {
            this.energy = config.energyMax; 
        }

        if (this.energy >= config.energyMax) {
            const velocityX = Math.floor(Math.random() * config.maxSpeed) + 1;
            const velocityY = Math.floor(Math.random() * config.maxSpeed) + 1;
            this.velocity = new Speed(velocityX, velocityY);
            this.state = 'flying';
            this.birdVision = config.birdVision; 
            this.leaveTreeDistance = 60; 
            this.restPosition = { x: this.nearestTree.x, y: this.nearestTree.y }; 

        }
    }

    stateUpdate(birds) {
        if (this.state === 'flying') {
            this.generateForce(birds);
            this.flyingUpdate();
        } else if (this.state === 'resting') {
            this.restingUpdate();
        }
    }

    getVectorToBird(otherBird) {
        let vector = otherBird.position.sub(this.position);
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

    generateForce(birds) {
        if (this.leaveTreeDistance > 0) {
            let vector = new Vector(this.restPosition.x - this.position.x, this.restPosition.y - this.position.y);
            let distance = vector.length();
            if (distance > this.leaveTreeDistance) {
                this.leaveTreeDistance = 0; 
                this.restPosition = null; 
            } else {
                return;
            }
        } else {
            this.force.x = 0;
            this.force.y = 0;
            let alignmentTotal = new Point();
            let cohesionTotal = new Point();
            let seperationTotal = new Point();
            let total = 0;

            for (let bird of birds) {
                if (bird.state === 'flying') {
                    let vector = this.getVectorToBird(bird);
                    let distance = vector.length();

                    if (distance < config.birdVision && bird != this) {
                        total++;
                        alignmentTotal.x += bird.velocity.x;
                        alignmentTotal.y += bird.velocity.y;
                        cohesionTotal.x += vector.x;
                        cohesionTotal.y += vector.y;
                        seperationTotal.x += -vector.x / distance / distance * config.birdVision;
                        seperationTotal.y += -vector.y / distance / distance * config.birdVision;
                    }
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

        }
    }

}