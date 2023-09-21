import { Fish, config, defaultConfig } from './fish.js';
import * as d3 from 'd3';


var numFishes = config.fishesTotal;
let imageWidth = 25;
let imageHeight = 18.5;
let rockWidth = 200;
let rockHeight = 200;
let mouse = { x: 0, y: 0, isDown: false, isDblClick: false };

var svg = d3.select("#chart");

let currentID = 0;
function createFishes(n) {
	return d3.range(n).map(function (d, i) {
		var fish = new Fish(currentID);
		currentID += 1;
		return fish;
	});
}

var fishes = createFishes(numFishes);

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
	for (let fish of fishes) {
		fish.generateForce(fishes, mouse);
		fish.avoidObstacles();
		fish.update();
	}
}


function updateBoids() {
	updateAll();

	if (!config.ifShowVision) {
		svg.selectAll(".vision").remove();
	}

	svg.selectAll(".boid")
		.attr('x', function (d) { return d.position.x - imageWidth / 2 })
		.attr('y', function (d) { return d.position.y - imageHeight / 2 })
		.attr("transform", function (d) {
			const centerX = d.position.x;
			const centerY = d.position.y;
			const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 180;
			return `rotate(${rotation},${centerX},${centerY})`;
		});

	if (config.ifShowVision) {
		svg.selectAll(".vision")
			.data(fishes)
			.join("path")
			.attr("class", "vision")
			.attr("d", function (d) {
				const x = d.position.x;
				const y = d.position.y;
				const r = config.fishVision;
				const startAngle = Math.atan2(d.velocity.y, d.velocity.x) - 30 - config.viewAngle / 2 * (Math.PI / 180);
				const endAngle = startAngle + config.viewAngle * (Math.PI / 180);
				return d3.arc()({
					innerRadius: 0,
					outerRadius: r,
					startAngle: startAngle,
					endAngle: endAngle
				});
			})
			.attr("transform", function (d) {
				return `translate(${d.position.x},${d.position.y})`;
			})
			.attr("fill", "lightblue")
			.attr("stroke", "lightblue")
			.attr("opacity", 0.2);
	}
}


function renderFishes(fishes) {
	svg.selectAll(".boid")
		.data(fishes)
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
		});
}

renderFishes(fishes);


svg.selectAll(".obstacle")
	.data(config.obstacles)
	.enter()
	.append("image")
	.attr('xlink:href', 'img/rock.png')
	.attr('width', rockWidth)
	.attr('height', rockHeight)
	.attr("class", "obstacle")
	.attr('x', function (d) { return d.x - d.radius; })
	.attr('y', function (d) { return d.y - d.radius; });


let dragHandler = d3.drag()
	.on("drag", function (event, d) {
		d3.select(this)
			.attr("x", d.x = event.x - d.radius)
			.attr("y", d.y = event.y - d.radius);
	})
	.on("end", function (event, d) {

		for (let obstacle of config.obstacles) {
			if (obstacle === d) {
				obstacle.x = d.x + d.radius;
				obstacle.y = d.y + d.radius;
				break;
			}
		}
	});


svg.selectAll(".obstacle").call(dragHandler);



let updateInterval;
function delayedMethod() {
	updateInterval = d3.interval(updateBoids, 27);
}

setTimeout(delayedMethod, 1000);


function drawWaterFlowArrow() {
    const scaleFactor = 15;


    const arrowLength = Math.sqrt(Math.pow(config.waterFlow.getX(), 2) + Math.pow(config.waterFlow.getY(), 2)) * scaleFactor;

    const angle = Math.atan2(config.waterFlow.getY(), config.waterFlow.getX()) * (180 / Math.PI);

    const arrowStartX = 1150; 
    const arrowStartY = 100;  
    const arrowEndX = arrowStartX + arrowLength * Math.cos(angle * (Math.PI / 180));
    const arrowEndY = arrowStartY + arrowLength * Math.sin(angle * (Math.PI / 180));

	svg.append("line")
		.attr("x1", arrowStartX)
		.attr("y1", arrowStartY)
		.attr("x2", arrowEndX)
		.attr("y2", arrowEndY)
		.attr("stroke", "lightseaGreen")
		.attr("stroke-width", 5)
		.attr("marker-end", "url(#arrowhead)");

	svg.append("defs").append("marker")
		.attr("id", "arrowhead")
		.attr("viewBox", "-0 -5 10 10")
		.attr("refX", 0)
		.attr("refY", 0)
		.attr("orient", "auto")
		.attr("markerWidth", 7)
		.attr("markerHeight", 8)
		.attr("xoverflow", "visible")
		.append("svg:path")
		.attr("d", "M 0,-5 L 10 ,0 L 0,5")
		.attr("fill", "lightseaGreen")
		.style("stroke", "none");

	const dragArrowHandler = d3.drag()
		.on("start", function (event) {
			d3.select(this).attr("stroke", "darkblue");  
		})
		.on("drag", function (event) {
			const dx = event.x - arrowStartX; 
			const dy = event.y - arrowStartY;  
	
			const newAngle = Math.atan2(dy, dx);
			const newLength = Math.sqrt(dx * dx + dy * dy) / scaleFactor;
	
			config.waterFlow.setX(newLength * Math.cos(newAngle));
			config.waterFlow.setY(newLength * Math.sin(newAngle));
	

			svg.selectAll("line").remove();
			svg.select("defs").remove();
			drawWaterFlowArrow();
		})
		.on("end", function (event) {
			d3.select(this).attr("stroke", "lightseaGreen");  
		});

	d3.select("line").call(dragArrowHandler);

}


svg.selectAll("line").remove();
svg.select("defs").remove();
drawWaterFlowArrow();

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


		if (prop == 'fishesTotal') {
			let increaseNumber = parseInt(this.value) - numFishes;
			if (increaseNumber > 0) {
				let increaseFishes = createFishes(increaseNumber);
				numFishes = parseInt(this.value);
				fishes = fishes.concat(increaseFishes);
				renderFishes(fishes);
			} else {
				numFishes = parseInt(this.value);
				increaseNumber = Math.abs(increaseNumber);
				for (var i = 0; i < increaseNumber; i++) {
					let deletedFish = fishes.pop();
					let deletedFishId = deletedFish.getID();
					let deletedFishIdElement = d3.select("#" + deletedFishId);
					deletedFishIdElement.remove();
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

	let waterFlowXInput = document.getElementById("speedx");
	waterFlowXInput.placeholder = config.waterFlow.getX();
	waterFlowXInput.value = parseInt(config.waterFlow.getX());

	let waterFlowYInput = document.getElementById("speedy");
	waterFlowYInput.placeholder = config.waterFlow.getY();
	waterFlowYInput.value = parseInt(config.waterFlow.getY());
}


var waterFlowInputs = document.querySelectorAll(".water");
for (let waterFlowInput of waterFlowInputs) {
	waterFlowInput.addEventListener("blur", function () {
		let id = this.id;
		let value = parseFloat(this.value);
		if (id === 'speedx') {
			config.waterFlow.setX(value);
		} else if (id === 'speedy') {
			config.waterFlow.setY(value);
		}
		updateBoids();

		svg.selectAll("line").remove();
		svg.select("defs").remove();
		drawWaterFlowArrow();
	})
}


initConfig();

const resetBt = document.getElementById("resetBt");
resetBt.addEventListener("click", function () {
	config = Object.assign({}, defaultConfig);
	initConfig()
	window.location.href = 'fish.html';
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

