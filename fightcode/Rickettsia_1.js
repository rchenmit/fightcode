
var Robot = function(robot){
  robot.clone();
  robot.turn(45);
  this.offset = 1;
};

Robot.prototype.onIdle = function(ev) {
    var robot = ev.robot;
//    robot.rotateCannon(360);                                                                                                                              
//    robot.turn(90);                                                                                                                                       
//    robot.ahead(200);                                                                                                                                     
    robot.fire();
    robot.turn(10);
    robot.ahead(10);
};


Robot.prototype.onScannedRobot = function(ev) {
    var robot = ev.robot;
    var scannedRobot = ev.scannedRobot;
    //robot.ahead(100);                                                                                                                                     
    if (scannedRobot.id != robot.id ) {
        //for (var i=0; i < 10; i++) {
            robot.fire();
        robot.turn(20);
        //}
    }
};


Robot.prototype.onRobotCollision = function(ev) {
    var robot = ev.robot;// You                                                                                                                             
    var otherRobot = ev.collidedRobot; // Them                                                                                                              
    if (otherRobot.parentId == null) { // if its not a clone (ie its an enemy)                                                                              
        if (!cloned){
            robot.clone();
        }
        if (ev.myFault && otherRobot.life > robot.life) { // if they are healthier                                                                          
            // They are healthier than us! Run away!                                                                                                        
            robot.turn(50);
            robot.ahead(100);
            robot.rotateCannon(robot.cannonRelativeAngle()+50);
	    }
	else { // they are NOT healthier, so shoot at them                                                                                                  
            robot.fire();
	    robot.turn(50);
        }

    }
    else { //if its a clone, ie its yourself!                                                                                                               
        //dont do anything                                                                                                                                  
    }
};


Robot.prototype.onWallCollision = function(ev) {
    var robot;
    robot.turn(120);
    robot.fire();
    robot.ahead(100);
    robot.clone()

}

Robot.prototype.onHitByBullet = function(ev) {
    var robot;
    robot = ev.robot;
    robot.turn(90 - ev.bulletBearing);
};

Robot.prototype.onRobotCollided = function(ev) {
  ev.robot.stop();
  this.offset = -1 * this.offset;
  ev.robot.turn(10 * this.offset);
};
