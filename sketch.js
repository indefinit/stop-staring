var Pointer = function(x,y,z){
  this.location = createVector(x,y,z);
  this.velocity = createVector(0,0,0);
  this.acceleration = createVector(0,0,0);
  this.r = 130;
  this.maxforce = 24.0;
  this.maxspeed = 13.0;
};

Pointer.prototype = {
  
  applyForce : function(force){
    this.acceleration.add(force);
  },
  applyBehaviors : function(pointers){
    var _separateForce = this.separate(pointers);
    var _seekForce = this.seek(createVector(mouseX, mouseY));
    _separateForce.mult(4);
    _seekForce.mult(1);
    
    this.applyForce(_separateForce);
    this.applyForce(_seekForce);
  },
  
  seek : function(target){
      var desired = p5.Vector.sub(target,this.location);
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce);
      
      return steer;
  },
  
  separate : function(peerPointers){
    var desiredseparation = this.r*2;
    var sum = createVector(0,0,0);
    var count = 0;
    
    for(var other in pointers){
      var d = p5.Vector.dist(this.location, pointers[other].location);
      if((d > 0) && (d < desiredseparation)) {
        var diff = p5.Vector.sub(this.location, pointers[other].location);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    }
    if(count > 0){
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      sum.sub(this.velocity);
      sum.limit(this.maxforce);
    }
    return sum;
  },
  
  update : function(){
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
  },
  
  display : function(){
    stroke(0);
    push();
    translate(this.location.x, this.location.y, 0);
    specularMaterial(255);
    box();
    pop();
  }
};

var t = 0.0,
  u = 0.0,
  yScalar = 50.0,
  xScalar = 10.0,
  radius = 10.0,
  numPointers = 100;

var pointers = [];

function setup() {
  createCanvas(windowWidth, windowHeight, 'webgl');
  for(var i =0; i < numPointers; i++){
    pointers.push( new Pointer(width/2, height/2, 0.0) );
  }
}

function draw() {
  background(255);
  ambientLight(50);
  pointLight(250, 250, 250, -70, 70, 0);
  translate(-width/2,-height/2,-800);
  focus();
}

function focus(){
  for(var pointer in pointers){
    pointers[pointer].applyBehaviors(pointers);
    pointers[pointer].update();
    pointers[pointer].display();
    //console.log(pointers[pointer].location);
  }
}