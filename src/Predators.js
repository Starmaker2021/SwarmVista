import { Prey, Predator, config, defaultConfig } from './Predator.js';
import * as d3 from 'd3';


var numBoids = config.preysTotal; 
var numPredators = config.predatorTotal; 

let imageWidth = 24;
let imageHeight = 18;
let mouse = { x: 0, y: 0, isDown: false, isDblClick: false };


var svg = d3.select("#chart");
let currentID = 0;
function createPreys(n) {
    return d3.range(n).map(function (d, i) {
        var prey = new Prey(currentID);
        currentID += 1;
        return prey;
    });
}


var preys = createPreys(numBoids);

let currentpredatorID = 0;
function createPredators(n) {
    return d3.range(n).map(function (d, i) {
        var predator = new Predator(currentpredatorID);
        currentpredatorID += 1;
        return predator;
    });
}
console.log("start createPredators!")
var predators = createPredators(numPredators);


svg.on('mousedown', () => { mouse.isDown = true; })
    .on('mouseup', () => { mouse.isDown = false; })
    .on('mousemove', function () {
        var coords = d3.pointer(event);
        mouse.x = coords[0];
        mouse.y = coords[1];
    })
    .on('dblclick', () => {
        mouse.isDblClick = true;
        setTimeout(() => { mouse.isDblClick = false; }, 500); 
    });


function updateAll() {
    let eatenPreys = []; 
    for (let prey of preys) {
        prey.generateForce(preys, mouse, predators);
        prey.update();
    }

    for (let predator of predators) {
        predator.update(preys);
        for (let prey of preys) {
            let distance = Math.sqrt((predator.position.x - prey.position.x) ** 2 + (predator.position.y - prey.position.y) ** 2);
            if (distance < imageWidth) { 
                eatenPreys.push(prey);
                if(predator.width < 240 && predator.height < 180){
                predator.width *= 1.05; 
                predator.height *= 1.05; 
            }
            }
        }
    }

    preys = preys.filter(prey => !eatenPreys.includes(prey));
    svg.selectAll(".boid").data(preys).exit().remove(); 

}

function updateBoids() {
    updateAll();
    svg.selectAll(".vision-circle").remove();
    svg.selectAll(".vision-circle2").remove();
    svg.selectAll(".vision-circle3").remove();

    svg.selectAll(".boid")
        .attr('x', function (d) { return d.position.x - imageWidth / 2 })
        .attr('y', function (d) { return d.position.y - imageHeight / 2 })
        .attr("transform", function (d) {
            const centerX = d.position.x;
            const centerY = d.position.y;
            const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 180; 
            return `rotate(${rotation},${centerX},${centerY})`;
        })
        .each(function (d) { 
            if (config.ifShowVision) {
                svg.append("circle")
                    .attr("class", "vision-circle")
                    .attr("cx", d.position.x)
                    .attr("cy", d.position.y)
                    .attr("r", config.preyVision) 
                    .attr("fill", "none")
                    .attr("stroke", "lightblue");
            }
        })
        .each(function (d) {
            if (d.ifChased && config.ifShowChased) {
                svg.append("circle")
                    .attr("class", "vision-circle3")
                    .attr("cx", d.position.x)
                    .attr("cy", d.position.y)
                    .attr("r", imageWidth)
                    .attr("fill", "rgba(255,0,0,0.3)")
                    .attr("stroke", "none");
            }
        });


    svg.selectAll(".predator")
    .attr('x', function (d) { return d.position.x - d.width / 2 })
    .attr('y', function (d) { return d.position.y - d.height / 2 })
        .attr('width', function (d) { return d.width })
        .attr('height', function (d) { return d.height })
        .attr("transform", function (d) {
            const centerX = d.position.x;
            const centerY = d.position.y;
            const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 180; 
            return `rotate(${rotation},${centerX},${centerY})`;
        })
        .each(function (d) { 
            if (config.ifShowPredatorVision) {
                svg.append("circle")
                    .attr("class", "vision-circle2")
                    .attr("cx", d.position.x)
                    .attr("cy", d.position.y)
                    .attr("r", config.predatorVision)
                    .attr("fill", "none")
                    .attr("stroke", "lightblue");
            }
        })
}



function renderPreys(preys) {
    svg.selectAll(".boid")
        .data(preys)
        .enter()
        .append("image")
        .attr('xlink:href', 'img/fish.png')
        .attr('width', imageWidth)
        .attr('height', imageHeight)
        .attr("class", "boid")
        .attr("id", function (d) { return d.getID() })
        .attr('x', function (d) { return d.position.x - imageWidth / 2 })
        .attr('y', function (d) { return d.position.y - imageHeight / 2 })
        .attr("transform", function (d) {
            const centerX = d.position.x;
            const centerY = d.position.y;
            const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90; 
            return `rotate(${rotation},${centerX},${centerY})`;
        })
        .each(function (d) { 
            if (config.ifShowVision) {
                svg.append("circle")
                    .attr("cx", d.position.x)
                    .attr("cy", d.position.y)
                    .attr("r", config.preyVision) 
                    .attr("fill", "none")
                    .attr("stroke", "blue");
            }
        });

}

renderPreys(preys);

function renderPredators(predators) {
    svg.selectAll(".predator")
        .data(predators)
        .enter()
        .append("image")
        .attr('xlink:href', 'img/predator.png')
        .attr('width', function (d) { return d.width })
        .attr('height', function (d) { return d.height })
        .attr("class", "predator")
        .attr("id", function (d) { return d.getID() })
        .attr('x', function (d) { return d.position.x - d.width / 2 })
        .attr('y', function (d) { return d.position.y - d.height / 2 })
        .attr("transform", function (d) {
            const centerX = d.position.x;
            const centerY = d.position.y;
            const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90;
            return `rotate(${rotation},${centerX},${centerY})`;
        })
        .each(function (d) {
            if (config.ifShowPredatorVision) {
                svg.append("circle")
                    .attr("cx", d.position.x)
                    .attr("cy", d.position.y)
                    .attr("r", config.predatorVision)
                    .attr("fill", "none")
                    .attr("stroke", "blue");
            }
        });

}

renderPredators(predators);



let updateInterval;
function delayedMethod() {
    updateInterval = d3.interval(updateBoids, 27);
}

setTimeout(delayedMethod, 1000);



var checkboxes = document.querySelectorAll(".form-check-input");
for (let checkbox of checkboxes) {
    checkbox.addEventListener("change", function () {
        const prop = this.name;
        config[prop] = this.checked;
    });
}



var sliders = document.querySelectorAll(".form-range");
for (let slider of sliders) {
    slider.addEventListener("mouseup", function () {
        const previousElement = this.previousElementSibling;
        console.log(this.name);
        const prop = this.name
        var value = parseFloat(this.value);
        config[prop] = value;
        const outputElement = previousElement.querySelector('output');
        outputElement.value = value;
        console.log(value);


        if (prop == 'preysTotal') {
            let newNumBoids = parseInt(this.value);
            if (newNumBoids > numBoids) {
                let increasePreys = createPreys(newNumBoids - numBoids);
                preys = preys.concat(increasePreys);
                renderPreys(preys);
            } else if (newNumBoids < numBoids) {
                preys.splice(newNumBoids);
                svg.selectAll(".boid").data(preys).exit().remove(); 
            }
            numBoids = newNumBoids;
        }


        if (prop == 'predatorTotal') {
            let newNumPredators = parseInt(this.value);
            if (newNumPredators > numPredators) {
                let increasePredators = createPredators(newNumPredators - numPredators);
                predators = predators.concat(increasePredators);
                renderPredators(predators);
            } else if (newNumPredators < numPredators) {
                predators.splice(newNumPredators);
                svg.selectAll(".predator").data(predators).exit().remove(); 
            }
            numPredators = newNumPredators;
        }

    });
}


function initConfig() {
    for (let slider of sliders) {
        const previousElement = slider.previousElementSibling;
        const outputElement = previousElement.querySelector('output');
        const prop = slider.name;
        outputElement.value = config[prop];
        slider.value = config[prop];

    }
}

initConfig();

const resetBt = document.getElementById("resetBt");
resetBt.addEventListener("click", function () {
    config = Object.assign({}, defaultConfig);
    initConfig()
    window.location.href = 'predator.html';
});

const startBt = document.getElementById("startBt");
startBt.addEventListener("click", function () {
    if (this.textContent == "start") {
        this.textContent = "pause";
        updateInterval = d3.interval(updateBoids, 30);
        console.log("start!");
    } else {
        this.textContent = "start";
        updateInterval.stop();
        updateInterval = null;
        console.log("pause!");

    }

});

