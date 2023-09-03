export default class Speed {
  constructor(x, y) {
	  if(x === undefined && y === undefined ){
		 this.x = 0;
		 this.y = 0; 
	  }else{
		  this.x = x;
		  this.y = y;
	  }
    }
	
	length(){
		return Math.sqrt( this.x **2 + this.y**2);
	}
	add(speed) {
        this.x += speed.x;
        this.y += speed.y;
        return this;
    }
    subtract(speed) {
        this.x -= speed.x;
        this.y -= speed.y;
        return this;
    }
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    limit(max) {
        let magnitude = Math.sqrt(this.x ** 2 + this.y ** 2);
        if (magnitude > max) {
            this.x = (this.x / magnitude) * max;
            this.y = (this.y / magnitude) * max;
        }
        return this;
    }
    
}



