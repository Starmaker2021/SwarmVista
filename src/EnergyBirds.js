import { Bird, config, defaultConfig } from './EnergyBird.js';
import * as d3 from 'd3';

var numBoids = config.birdsTotal; 
let imageWidth = 24;
let imageHeight = 18;
let treeWidth = 400;
let treeHeight = 400;


var svg = d3.select("#chart");

let currentID = 0;
function createBirds(n) {
	return d3.range(n).map(function (d, i) {
		var bird = new Bird(currentID);
		currentID += 1;
		return bird;
	});
}

console.log("start createBirds!")
var birds = createBirds(numBoids);


function updateAll() {
	for (let bird of birds) {
		bird.stateUpdate(birds);
	}
}

function updateBoids() {
	updateAll();
	if (!config.ifShowVision) {
	  svg.selectAll(".vision").remove();
	}
  
	svg.selectAll(".boid")
	  .attr('x', function(d){return d.position.x - imageWidth / 2} )
	  .attr('y', function(d){return d.position.y - imageHeight / 2} )
	  .attr("transform", function(d) {
		const centerX = d.position.x;
		const centerY = d.position.y;
		const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 180; 
		return `rotate(${rotation},${centerX},${centerY})`;
	  })
	  .style('opacity', function (d) { return d.isFlying() ? 1 : 0; })
  
if (config.ifShowVision) {
	svg.selectAll(".vision")
	  .data(birds)
	  .join("circle") 
	  .attr("class", "vision")
	  .attr("cx", function(d) {
		return d.position.x; 
	  })
	  .attr("cy", function(d) {
		return d.position.y; 
	  })
	  .attr("r", function(d){
		return d.birdVision; 
	  }) 
	  .attr("fill", "lightblue")
	  .attr("stroke", "lightblue")
	  .style('opacity', function (d) { return d.isFlying() ? 0.2 : 0; }); 
  }
  
  }


  svg.selectAll(".tree")
  .data(config.trees)
  .enter()
  .append("image")
  .attr('xlink:href', 'img/tree.png') 
  .attr('width', treeWidth) 
  .attr('height', treeHeight) 
  .attr("class", "tree")
  .attr('x', function (d) { return d.x - treeWidth / 2; }) 
  .attr('y', function (d) { return d.y - treeHeight / 2; }); 


let dragHandler = d3.drag()
.on("drag", function (event, d) {
	d3.select(this)
		.attr("x", d.x = event.x - treeWidth / 2)
		.attr("y", d.y = event.y - treeHeight / 2);
})
.on("end", function (event, d) {
	for (let obstacle of config.trees) {
		if (obstacle === d) {
			obstacle.x = d.x + treeWidth / 2;
			obstacle.y = d.y + treeHeight / 2;
			break;
		}
	}
});


svg.selectAll(".tree").call(dragHandler);

function renderBirds(birds) {
    svg.selectAll(".boid")
	.data(birds)
	.enter()
	.append("image")
	.attr('xlink:href', 'img/birdfly.png')
	.attr("id", function (d) { return d.getID(); })
	.attr('width', imageWidth)
	.attr('height', imageHeight)
	.attr("class", "boid")
	.attr('x', function (d) { return d.position.x - imageWidth / 2 })
	.attr('y', function (d) { return d.position.y - imageHeight / 2 })
	.attr("transform", function (d) {
		const centerX = d.position.x;
		const centerY = d.position.y;
		const rotation = Math.atan2(d.velocity.y, d.velocity.x) * (180 / Math.PI) + 90; 
		return `rotate(${rotation},${centerX},${centerY})`;
	});
}

renderBirds(birds);

const weatherColors = {
	0: "#FFD700",  
	1: "#A9A9A9",  
	2: "#87CEEB"   
  };

  let windInterval;
  function updateWeatherRelatedUI() {
	svg.selectAll(".cloud").remove();  
    svg.style("filter", null);         
	svg.selectAll(".tree").interrupt();  

	
    const weatherValue = config.weather;
    console.log(weatherValue);
    document.getElementById('fogFactorRow').style.display = weatherValue == 1 ? 'block' : 'none';
    document.getElementById('windStrengthRow').style.display = weatherValue == 2 ? 'block' : 'none';
    

    svg.style('background', weatherColors[weatherValue]);
	function renderClouds() {
		const cloudsData = [
			{ x: 100, y: 100, speed: 0.5 },
			{ x: 500, y: 150, speed: 0.7 },
			{ x: 900, y: 100, speed: 0.6 },
			{ x: 1300, y: 150, speed: 0.8 },
			{ x: 1700, y: 100, speed: 0.5 }
		];

		svg.selectAll(".cloud")
			.data(cloudsData)
			.enter()
			.append("image")
			.attr('xlink:href', 'img/cloud.png')
			.attr("class", "cloud")
			.attr('x', d => d.x)
			.attr('y', d => d.y)
			.attr('width', 200)
			.attr('height', 100);
	
		d3.interval(function () {
			svg.selectAll(".cloud")
				.attr("x", d => (d.x += d.speed))
				.each(function (d) {
					if (d.x > svg.node().getBoundingClientRect().width) {
						d.x = -200; 
					}
				});
		}, 50);
	}


	svg.append("defs")
		.append("filter")
		.attr("id", "foggy")
		.append("feGaussianBlur");

		if (windInterval) {
			windInterval.stop();
			windInterval = null;
		}
		console.log(windInterval);


		switch (config.weather) {
			case 0:
				renderClouds();
				break;
			case 1:
				d3.interval(() => {
					const fogIntensity = Math.random() * config.fogFactor * 5;
					d3.select("#foggy feGaussianBlur")
					  .attr("stdDeviation", fogIntensity);
				}, 1000);
				svg.style("filter", "url(#foggy)");  
				break;
			case 2:
				const trees = svg.selectAll(".tree").nodes();
				windInterval = d3.interval(() => {
                trees.forEach((tree, index) => {
                    d3.select(tree)
                    .transition()
                    .delay(index * 100) 
                    .duration(200)
                    .attr("transform", `translate(${(Math.random() - 0.5) * config.windStrength * 10}, ${(Math.random() - 0.5) * config.windStrength * 10})`)
                    .transition()
                    .duration(200)
                    .attr("transform", "translate(0,0)");  
                });
            }, 1000 * config.windStrength);  
            break;
		}
}


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
	slider.addEventListener("mouseup", function() {
	  const previousElement = this.previousElementSibling;
	  console.log(this.name);
	  const prop = this.name
	  var value = parseFloat(this.value);
	  config[prop] = value;
	  const outputElement = previousElement.querySelector('output');
	  outputElement.value = value;
	  console.log(value);

	  if (prop == 'birdsTotal') {
		let increaseNumber = parseInt(this.value) - numBoids;
		if (increaseNumber > 0) {
			let increaseBirds = createBirds(increaseNumber);
			numBoids = parseInt(this.value);
			birds = birds.concat(increaseBirds);
			renderBirds(birds);
		} else {
			numBoids = parseInt(this.value);
			increaseNumber = Math.abs(increaseNumber);
			for (var i = 0; i < increaseNumber; i++) {
				let deletedBird = birds.pop();
				let deletedBirdId = deletedBird.getID();
				let deletedBirdIdElement = d3.select("#" + deletedBirdId);
				deletedBirdIdElement.remove();
			}
		}
	}
	updateWeatherRelatedUI();
	});
}

var weatherRadios = document.querySelectorAll("input[name='weather']");

for (let radio of weatherRadios) {
    radio.addEventListener("change", function() {
        if (this.checked) {
            config.weather = parseInt(this.value);
            updateWeatherRelatedUI();
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

  const weatherRadios = document.querySelectorAll("input[name='weather']");
  for (let radio of weatherRadios) {
    radio.checked = (radio.value == config.weather);
  }
  updateWeatherRelatedUI();
}

initConfig();

const resetBt = document.getElementById("resetBt");
resetBt.addEventListener("click", function () {
	config = Object.assign({}, defaultConfig);
	initConfig()
	window.location.href = 'bird.html';
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

