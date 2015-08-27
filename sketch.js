var Pointer = function(){

  this.location = (arguments[0] instanceof p5.Vector) ?
    arguments[0] : createVector(x,y,z);
  this.velocity = createVector(0,0,0);
  this.acceleration = createVector(0,0,0);
  this.r = 250;
  this.maxforce = 10.0;
  this.maxspeed = 10.0;
  this.gazeAngle = createVector(0,0,0);
};

Pointer.prototype = {
  
  applyForce : function(force){
    this.acceleration.add(force);
  },
  applyBehaviors : function(x, y, pointers){
    var _separateForce = this.separate(pointers);
    var _seekForce = this.seek(createVector(x,y));
    var _gazeForce = this.gaze(x,y);
    _separateForce.mult(30);
    //_seekForce.mult(1);
    
    this.applyForce(_separateForce);
    this.applyForce(_seekForce);
    this.update();
  },
  
  gaze: function(targetX, targetY){
    var desired = p5.Vector.sub(createVector(targetX, targetY, 800), this.location);
    desired.normalize();
    var pitch = atan2(desired.x,desired.z);
    var yaw = atan2(desired.y, sqrt(desired.x*desired.x + desired.z*desired.z));
    var azimuth = atan2(-desired.x, -desired.z);
    this.gazeAngle = createVector(pitch, yaw, azimuth);
    return this;
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
    //this.acceleration.mult(0);
  },
  
  display : function(){
    //stroke(0);
    push();
    translate(this.location.x, this.location.y, 0);
    //rotateX(this.gazeAngle.x);
    rotateX(this.gazeAngle.y);
    rotateY(this.gazeAngle.x);
    pointLight(100, 100, 100, mouseX, mouseY, 800);
    specularMaterial(100);
    box();
    pop();
  }
};

var t = 0.0,
  u = 0.0,
  yScalar = 50.0,
  xScalar = 10.0,
  radius = 10.0,
  gridWidth = 9,
  gridHeight = 9;

var pointers = [];

function setup() {
  createCanvas(windowWidth, windowHeight, 'webgl');
  for(var i =0; i < gridWidth; i++){
    for(var j=0; j < gridHeight; j++){
      pointers.push( new Pointer(new p5.Vector(i * width / gridWidth,
        j * height / gridHeight), 0) );
    }
  }
}

function draw() {
  background(250);
  ambientLight(200);
  
  translate(-width/2,-height/2,-800);
  
  focus(mouseX, mouseY);
}

function focus(mouseX, mouseY){
  for(var pointer in pointers){
    pointers[pointer].applyBehaviors(mouseX, mouseY, pointers);
    pointers[pointer].display();
    //console.log(pointers[pointer].location);
  }
}