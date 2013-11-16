//FightCode can only understand your robot
//if its class is called Robot
var Robot = function(robot) {
  init = robot;
  if (robot.parentId === null) {
    rank = 0;
  } else {
    rank = 1;
  }
  for (var e in robot) {
    console.log(e+" : "+robot[e]);
  }
  robot.notify(function() {robot.log("hello");});
  //robot.ahead(100);
  //ahead2(robot, 100);
};

var init;
var time = 0;
var rank;

function tic() {
  time++;
}

function RobotData(scanData) {
         this.id = scanData.id;
  //this.
  this.scans = [];
  this.scans.unshift(scanData);
}

function RobotScan(scanData) {
  this.scantime = time;
  this.data = scanData;
}

// an array of OtherRobots used to track their information
var otherRobots = [];

// returns the index of the robot in the otherRobots array or null if it doesn't exist
function getOtherRobotIndex(id) {
  for (var i = 0; i < otherRobots.length; i++) {
    if (otherRobots[i].scans[0].data.id == id) {
      otherIndex = i;
      return i;
    }
  }
  return null;
}

// Begin program

Robot.prototype.onIdle = function(ev) {
          tic();
    var robot = ev.robot;
          
          //robot.ahead(1);
    //ahead(robot, 100);
    //rotateCannon(robot, 360);
    //back(robot, 100);
    //rotateCannon(robot, 360);
};

Robot.prototype.onScannedRobot = function(ev) {
          tic();
    var robot = ev.robot;
    robot.fire();
};

Robot.prototype.onRobotCollision = function () {};
Robot.prototype.onWallCollision = function () {};
Robot.prototype.onHitByBullet = function () {};

// begin library

function curry(f, arg) {
  var self = this;
  return function () {
    // arguments needs to be converted into a positional array
    var args2 = [];
    for (var i = 0; i < arguments.length; i++) {
            args2.push(arguments[i]);
    }
    args2.shift(arg);
    f.apply(self, args2);
  };
}

function repeatMotion(r, m, amount) {
  r.log("hoohoo");
  var sign = (amount / Math.abs(amount));
  if (amount == 0) {
    return;
  }
  r.ahead(50*sign);
  tic();
  //r.notify(curry(curry(curry(repeatMotion, r), m), amount -sign));
  r.notify(function (g) { repeatMotion(r, m, amount -sign); });
}

function ahead2(r, amount) {
  //repeatMotion(r, r.ahead, amount);
  repeatMotion(r, function () {}, amount);
}

function back(r, amount) {
        repeatMotion(r, r.ahead, amount); 
}

function move(r, amount) {
  repeatMotion(r, r.move, amount);
}

function rotateCannon(r, degrees) {
  repeatMotion(r, r.rotateCannon, degrees);
}

function turnGunLeft(r, degrees) {
  repeatMotion(r, r.turnGunLeft, degrees);
}

function turnGunRight(r, degrees) {
  repeatMotion(r, r.turnGunRight, degrees);
}

function turn(r, degrees) {
  repeatMotion(r, r.turn, degrees);
}

function turnLeft(r, degrees) {
  repeatMotion(r, r.turnLeft, degrees);
}

function turnRight(r, degrees) {
  repeatMotion(r, r.turnRight, degrees);
}
