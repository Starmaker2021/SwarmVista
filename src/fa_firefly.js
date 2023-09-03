import {
	FireFly,
	config,
	defaultConfig
} from './FireFly.js';
import * as d3 from 'd3';

let updateInterval;
let imageWidth = 20;
let imageHeight = 15;

var svg = d3.select("#plot");

var svgDefs = svg.append('defs');

var blurFilter = svgDefs.append('filter')
	.attr('id', 'blurFilter');

blurFilter.append('feGaussianBlur')
	.attr('in', 'SourceGraphic')
	.attr('stdDeviation', 0); 

var darkenFilter = svgDefs.append('filter')
	.attr('id', 'darkenFilter');

darkenFilter.append('feComponentTransfer')
	.append('feFuncR')
	.attr('type', 'linear')
	.attr('slope', 1); 

darkenFilter.append('feComponentTransfer')
	.append('feFuncG')
	.attr('type', 'linear')
	.attr('slope', 1); 

darkenFilter.append('feComponentTransfer')
	.append('feFuncB')
	.attr('type', 'linear')
	.attr('slope', 1); 


var blurFilter2 = svgDefs.append('filter')
	.attr('id', 'blurFilter2');

blurFilter2.append('feGaussianBlur')
	.attr('in', 'SourceGraphic')
	.attr('stdDeviation', 0); 


var darkenFilter2 = svgDefs.append('filter')
	.attr('id', 'darkenFilter2');

darkenFilter2.append('feComponentTransfer')
	.append('feFuncR')
	.attr('type', 'linear')
	.attr('slope', 1); 

darkenFilter2.append('feComponentTransfer')
	.append('feFuncG')
	.attr('type', 'linear')
	.attr('slope', 1); 

darkenFilter2.append('feComponentTransfer')
	.append('feFuncB')
	.attr('type', 'linear')
	.attr('slope', 1); 


var overlay = svg.append("rect")
	.attr("width", config.width)
	.attr("height", config.height)
	.attr("fill", "black")
	.attr("opacity", config.lightFactor);  

var numAnimal = config.numAnimal; 
let fruitWidth = 60;
let fruitHeight = 60;
svg.append('image')
	.attr("id", "fruit1")
	.attr("class", "fruitImg")
	.attr('xlink:href', 'img/fruit.png')
	.attr('x', config.fruitPoint.x - fruitWidth / 2)
	.attr('y', config.fruitPoint.y - fruitHeight / 2)
	.attr('width', fruitWidth)
	.attr('height', fruitHeight);


svg.append('image')
	.attr("id", "fruit2")
	.attr("class", "secondFruitImg")
	.attr('xlink:href', 'img/secondFruit.png')
	.attr('x', config.secondFruitPoint.x - fruitWidth / 2)
	.attr('y', config.secondFruitPoint.y - fruitHeight / 2)
	.attr('width', fruitWidth)
	.attr('height', fruitHeight);

function updateFruit() {
	svg.selectAll(".fruitImg")
		.attr('x', config.fruitPoint.x - fruitWidth / 2)
		.attr('y', config.fruitPoint.y - fruitHeight / 2);
}

function updateSecondFruit() {
	svg.selectAll(".secondFruitImg")
		.attr('x', config.secondFruitPoint.x - fruitWidth / 2)
		.attr('y', config.secondFruitPoint.y - fruitHeight / 2);
}


function dragstarted(event) {
	event.subject.active = true;
}

function dragged(event, d) {
	d3.select(this)
		.attr("x", event.x - fruitWidth / 2)
		.attr("y", event.y - fruitHeight / 2);

	if (this.id === "fruit1") {
		config.fruitPoint.x = event.x;
		config.fruitPoint.y = event.y;

		document.getElementById("fruitX").value = event.x;
		document.getElementById("fruitY").value = event.y;
	} else if (this.id === "fruit2") {
		config.secondFruitPoint.x = event.x;
		config.secondFruitPoint.y = event.y;

		document.getElementById("fruit2X").value = event.x;
		document.getElementById("fruit2Y").value = event.y;
	}
}

function dragended(event) {
	if (!event.active) d3.forceSimulation().alphaTarget(0);
	event.subject.active = false;
}

const drag = d3.drag()
	.on("start", dragstarted)
	.on("drag", dragged)
	.on("end", dragended);


svg.select(".fruitImg").call(drag);
svg.select(".secondFruitImg").call(drag);


let currentBlur = 0;
let currentDarkness = 1;

svg.select(".fruitImg").on("click", function () {
	config.fruitConcentration += 5;  
	currentBlur += 1; 
	d3.select("#blurFilter").select("feGaussianBlur")
		.attr("stdDeviation", currentBlur);

	currentDarkness *= 0.8; 
	d3.select("#darkenFilter").selectAll("feFuncR, feFuncG, feFuncB")
		.attr("slope", currentDarkness);

	d3.select(this)
		.style("filter", "url(#blurFilter) url(#darkenFilter)"); 
});



let currentBlur2 = 0;
let currentDarkness2 = 1; 

svg.select(".secondFruitImg").on("click", function () {
	config.secondFruitPointConcentration += 5;  
	currentBlur2 += 1; 
	d3.select("#blurFilter2").select("feGaussianBlur")
		.attr("stdDeviation", currentBlur2);

	currentDarkness2 *= 0.8; 
	d3.select("#darkenFilter2").selectAll("feFuncR, feFuncG, feFuncB")
		.attr("slope", currentDarkness2);

	d3.select(this)
		.style("filter", "url(#blurFilter2) url(#darkenFilter2)"); 
});

let currentID = 0;

function createAnimals(n) {
	return d3.range(n).map(function (d, i) {
		var fireFly = new FireFly(currentID);
		currentID += 1;
		return fireFly;
	});
}

var fireFlys = createAnimals(numAnimal);
console.log(fireFlys);


function renderFireFlys() {
	svg.selectAll(".boid")
		.attr('x', function (d) {
			return d.x - imageWidth / 2
		})
		.attr('y', function (d) {
			return d.y - imageHeight / 2
		})
		.attr("transform", function (d) {
			const centerX = d.x;
			const centerY = d.y;
			const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90; 
			return `rotate(${rotation},${centerX},${centerY})`;
		})
}

function renderPaths() {
	for (let drosophila of fireFlys) {
		if (config.ifShowPath && drosophila.path.length > 1) {

			let lineColor = "rgba(100, 100, 100, 0.5)"; 
			svg.append("path")
				.datum(drosophila.path)
				.attr("fill", "none")
				.attr("stroke", lineColor)
				.attr("stroke-width", 0.5) 
				.attr("stroke-dasharray", "2,3") 
				.attr("d", d3.line()
					.x(function (d) { return d.x; })
					.y(function (d) { return d.y; }));
		}
	}
}

function updateFireFlys() {

	let allArrived = true;
	for (let fireFly of fireFlys) {

		let nextPoint = fireFly.getNextPoint();
		if (nextPoint == null) {
			fireFly.calculateNextPoint(fireFlys);
		}

		let arrived = fireFly.move();
		if (arrived == false) {
			allArrived = false;
		}
	}

	renderPaths();
	renderFireFlys();
	if (allArrived == true) {
		if (updateInterval != null) {
			updateInterval.stop();
			updateInterval = null;
		}
		setTimeout(startEpoch, 1000);
	}
}

let globalBestPoint = null;
let globalMinAdaptability = 999999999999;

function startEpoch() {
	for (let fireFly of fireFlys) {
		fireFly.calculateNextPoint(fireFlys);
	}

	if (updateInterval != null) {
		updateInterval.stop();
		updateInterval = null;
	}
	updateInterval = d3.interval(updateFireFlys, 100);
}

function render(fireFlys) {
	svg.selectAll(".boid")
		.data(fireFlys)
		.enter()
		.append("image")
		.attr('xlink:href', 'img/yhc.png')
		.attr('id', function (d) {
			return d.getID()
		})
		.attr('width', imageWidth)
		.attr('height', imageHeight)
		.attr("class", "boid")
		.attr('x', function (d) {
			return d.x - imageWidth / 2
		})
		.attr('y', function (d) {
			return d.y - imageHeight / 2
		})
		.attr("transform", function (d) {
			const centerX = d.x;
			const centerY = d.y;
			const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90; 
			return `rotate(${rotation},${centerX},${centerY})`;
		});
}

render(fireFlys);

function flashFireFly(fireFlyElement, delayTime) {
	fireFlyElement.transition()
		.delay(delayTime) 
		.duration(1000)
		.attr("opacity", 0)
		.transition()
		.duration(1000)
		.attr("opacity", 1)
		.on("end", function () {
			flashFireFly(d3.select(this), 0); 
		});
}



svg.selectAll(".boid").each(function () {
	let randomDelay = Math.random() * 2000;  
	flashFireFly(d3.select(this), randomDelay);
});


function delayedMethod() {
	startEpoch();
}

setTimeout(delayedMethod, 1000);

function removeAllPaths() {
	svg.selectAll("path").remove();
}

var checkboxes = document.querySelectorAll(".form-check-input");
for (let checkbox of checkboxes) {
	checkbox.addEventListener("change", function () {
		const prop = this.name;
		config[prop] = this.checked;

		if (prop === 'ifShowPath' && !this.checked) {
			removeAllPaths();  
		}
	});
}


function restartEpoch() {
	if (updateInterval != null) {
		updateInterval.stop();
		updateInterval = null;
	}
	setTimeout(startEpoch, 1000);
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

		if (prop === "lightFactor") {
			overlay.attr("opacity", config.lightFactor);
		}

		if (prop == 'numAnimal') {
			let increaseNumber = parseInt(this.value) - numAnimal;
			if (increaseNumber > 0) {
				let increaseAnimals = createAnimals(increaseNumber);
				render(increaseAnimals);
				numAnimal = parseInt(this.value);
				fireFlys = fireFlys.concat(increaseAnimals);
			} else {
				numAnimal = parseInt(this.value);
				increaseNumber = Math.abs(increaseNumber);
				for (var i = 0; i < increaseNumber; i++) {
					let deletedAnimal = fireFlys.pop();
					let deletedId = deletedAnimal.getID();
					let deletedElement = d3.select("#" + deletedId);
					console.log(deletedId);
					console.log(deletedElement);
					deletedElement.remove();
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

	let fruitXInput = document.getElementById("fruitX");
	fruitXInput.placeholder = config.fruitPoint.getX();
	fruitXInput.value = parseInt(config.fruitPoint.getX());
	let fruitYInput = document.getElementById("fruitY");
	fruitYInput.placeholder = config.fruitPoint.getY();
	fruitYInput.value = parseInt(config.fruitPoint.getY());

	let fruit2XInput = document.getElementById("fruit2X");
	fruit2XInput.placeholder = config.secondFruitPoint.getX();
	fruit2XInput.value = parseInt(config.secondFruitPoint.getX());
	let fruit2YInput = document.getElementById("fruit2Y");
	fruit2YInput.placeholder = config.secondFruitPoint.getY();
	fruit2YInput.value = parseInt(config.secondFruitPoint.getY())
}



var fruitFruitInputs = document.querySelectorAll(".fruit");
for (let fruitFruitInput of fruitFruitInputs) {
	fruitFruitInput.addEventListener("blur", function () {
		let id = this.id;
		let value = parseInt(this.value);
		if (id == 'fruitX') {
			config.fruitPoint.setX(value);
		} else {
			config.fruitPoint.setY(value);
		}
		updateFruit();
		restartEpoch();
	})
}


var secondfruitFruitInputs = document.querySelectorAll(".secondfruit");
for (let fruitFruitInput of secondfruitFruitInputs) {
	fruitFruitInput.addEventListener("blur", function () {
		let id = this.id;
		let value = parseInt(this.value);
		if (id == 'fruit2X') {
			config.secondFruitPoint.setX(value);
		} else {
			config.secondFruitPoint.setY(value);
		}
		updateSecondFruit();	
		restartEpoch();
	})
}


initConfig();

const resetBt = document.getElementById("resetBt");
resetBt.addEventListener("click", function () {
	config = Object.assign({}, defaultConfig);
	initConfig()
	window.location.href = 'fa_firefly.html';
});


const startBt = document.getElementById("startBt");
startBt.addEventListener("click", function () {
	if (this.textContent == "start") {
		this.textContent = "pause";
		if (updateInterval != null) {
			updateInterval.stop();
			updateInterval = null;
		}
		updateInterval = d3.interval(updateFireFlys, 100);
		console.log("start!");
	} else {
		this.textContent = "start";
		if (updateInterval != null) {
			updateInterval.stop();
			updateInterval = null;
		}
		console.log("pause!");

	}

});
