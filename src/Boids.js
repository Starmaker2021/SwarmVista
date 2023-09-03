import { Boid, config, defaultConfig } from './Boid.js';
import * as d3 from 'd3';



var numBoids = config.boidsTotal;
let imageWidth = 24;
let imageHeight = 18;
let mouse = { x: 0, y: 0, isDown: false, isDblClick: false };


var svg = d3.select("#chart");

let currentID = 0;
function createBoids(n) {
	return d3.range(n).map(function (d, i) {
		var boid = new Boid(currentID);
		currentID += 1;
		return boid;
	});
}

var boids = createBoids(numBoids);

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
	for (let boid of boids) {
		boid.generateForce(boids, mouse);
		boid.update();
	}
}

function renderBoids(boids) {
	svg.selectAll(".boid")
		.data(boids)
		.enter()
		.append("path")
		.attr("d", d => {
			const x = d.position.x;
			const y = d.position.y;
			return `M ${x},${y - imageHeight / 2} 
                    L ${x - imageWidth / 3},${y + imageHeight / 2} 
                    L ${x},${y + imageHeight / 5} 
                    L ${x + imageWidth / 3},${y + imageHeight / 2} 
                    Z`;
		})
		.attr("fill", d => config.ifShowColor ? d3.interpolateBlues(d.velocity.length() / config.maxSpeed) : 'gray')
		.attr("class", "boid")
		.attr("id", function (d) { return d.getID() })
		.attr("transform", function (d) {
			const centerX = d.position.x;
			const centerY = d.position.y;
			const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90;
			return `rotate(${rotation},${centerX},${centerY})`;
		})
		.each(function (d) {
			if (config.ifShowVision) {
				svg.append("circle")
					.attr("class", "vision-circle")
					.attr("cx", d.position.x)
					.attr("cy", d.position.y)
					.attr("r", config.boidVision)
					.attr("fill", "none")
					.attr("stroke", "blue");
			}
		});
}

function updateBoids() {
	updateAll();
	svg.selectAll(".vision-circle").remove();
	svg.selectAll(".boid")
		.attr("d", d => {
			const x = d.position.x;
			const y = d.position.y;
			return `M ${x},${y - imageHeight / 2} 
                    L ${x - imageWidth / 3},${y + imageHeight / 2} 
                    L ${x},${y + imageHeight / 5} 
                    L ${x + imageWidth / 3},${y + imageHeight / 2} 
                    Z`;
		})
		.attr("fill", d => config.ifShowColor ? d3.interpolateBlues(d.velocity.length() / config.maxSpeed) : 'gray')
		.attr("transform", function (d) {
			const centerX = d.position.x;
			const centerY = d.position.y;
			const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90;
			return `rotate(${rotation},${centerX},${centerY})`;
		})
		.each(function (d) {
			if (config.ifShowVision) {
				svg.append("circle")
					.attr("class", "vision-circle")
					.attr("cx", d.position.x)
					.attr("cy", d.position.y)
					.attr("r", config.boidVision)
					.attr("fill", "none")
					.attr("stroke", "lightblue");
			}
		});
}


renderBoids(boids);


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


		if (prop == 'boidsTotal') {
			let increaseNumber = parseInt(this.value) - numBoids;
			if (increaseNumber > 0) {
				let increaseBoids = createBoids(increaseNumber);
				numBoids = parseInt(this.value);
				boids = boids.concat(increaseBoids);
				renderBoids(boids);
			} else {
				numBoids = parseInt(this.value);
				increaseNumber = Math.abs(increaseNumber);
				for (var i = 0; i < increaseNumber; i++) {
					let deletedBoid = boids.pop();
					let deletedBoidId = deletedBoid.getID();
					let deletedBoidIdElement = d3.select("#" + deletedBoidId);
					deletedBoidIdElement.remove();
				}
			}
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
	window.location.href = 'boids.html';
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

