var x = 100;
var y = 100;
var xspeed = 8.3;
var yspeed = 20.3;
var t = 0.0,
  u = 0.0,
  yScalar = 50.0,
  xScalar = 10.0,
  radius = 10.0,
  gridWidth = 20,
  gridHeight = 20;
var timeUntilBoredom = 200;
var isBored = false;
var pointers = [];
var inactivityTime = null;

function setup() {
  createCanvas(windowWidth, windowHeight, 'webgl');
  for(var i =0; i <= gridWidth; i++){
    for(var j=0; j <= gridHeight; j++){
      pointers.push( new Pointer(new p5.Vector(i * (width / gridWidth),
        j * (height / gridHeight), 0) ));
      console.log(width + " is", height + " is", i * (width / gridWidth),
        j * (height / gridHeight));
    }
  }
}

function draw() {
  background(250);
  translate(-width/2,-height/2,100);
  
  ambientLight(200);
  x = x + xspeed;
  y = y + yspeed;

  //Check for bouncing.
  if ((x > width) || (x < 0)) {
    xspeed = xspeed * -1;
  }
  if ((y > height) || (y < 0)) {
    yspeed = yspeed * -1;
  }
  pointLight(255, 255, 255, x, y, 800);
  // pointLight(255, 255, 255, mouseX - width/2, mouseY - height /2, 800);
  


  focus(mouseX, mouseY);
}

function mouseMoved(){
  resetTimer();
}

function mouseClicked(){
  x = mouseX; //assign x the value of our mouseX position
  y = mouseY; //assign y the value of our mouseY position
  if(x >= width){
    xspeed  = abs(xspeed) * -1.0; //make sure xspeed is negative
  }
  else{
    xspeed = abs(xspeed); //otherwise xspeed is positive
  }
  yspeed = abs(yspeed); //make sure yspeed is always positive
}

function resetTimer() {
  if (inactivityTime !== null) {
    clearTimeout(inactivityTime);
    isBored = false;
  } else {
      inactivityTime = window.setTimeout(boredom, timeUntilBoredom);
  }

}
function boredom(){
  isBored = true;
}

function focus(mouseX, mouseY){
  for(var pointer in pointers){
    // pointers[pointer].applyBehaviors(mouseX, mouseY, pointers);
    pointers[pointer].gaze(mouseX, mouseY);
    pointers[pointer].display();
    //console.log(pointers[pointer].location);
  }
}

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
    ////TODO clean this up!
    this.applyForce(_separateForce);
    if (!isBored) {
    this.applyForce(_seekForce);
    } else {
      this.applyForce(-_seekForce);
    }
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
    specularMaterial(100);
    box(40);
    pop();
  }
};