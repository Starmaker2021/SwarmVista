import Vector from './Vector.js';

export default class Point {

  constructor(x, y) {
	  this.x = 0;
	  this.y = 0; 
	  if(x === undefined && y === undefined ){
		 this.x = 0;
		 this.y = 0; 
	  }else{
		  this.x = x;
		  this.y = y;
	  }
    }
	
	getX(){
		return this.x;
	}
	
	getY(){
		return this.y;
	}
	
	setX(x){
		this.x = x;
	}
	
	setY(y){
		this.y = y;
	}
	
	length(){
		return Math.sqrt( this.x **2 + this.y**2);
	}
	
	sub(otherPoint) {
		let x = this.x - otherPoint.x ; 
		let y = this.y - otherPoint.y ;
		return new Vector(x,y);
	}
	
	distance(otherPoint){
		return Math.sqrt((this.x - otherPoint.getX()) **2 + (this.y - otherPoint.getY()) **2 );
	}
	
	toString() {
		let props = Object.entries(this).map(([key, value]) => `${key}: ${value}`);
		return `Point: { ${props.join(', ')} }`;
	}

	    add(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }
	
}




