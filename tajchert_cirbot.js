
var Robot = function(robot) {
};
Robot.prototype.onIdle = function(ev) {
    var robot = ev.robot;
    robot.clone();
    robot.ahead(Math.floor((Math.random()*7)+4));
    robot.turn(10);
  
};
Robot.prototype.onScannedRobot = function(ev) {
    var robot = ev.robot;
    var enemy = ev.scannedRobot;
    var bFriendly = ( robot.parentId !=null && robot.parentId==enemy.id);
    bFriendly |= ( enemy.parentId !=null && enemy.parentId==robot.id);
    if(!bFriendly)
	{
    robot.turn(1);
    robot.fire();
	    robot.turn(-33);
    } 
};
Robot.prototype.onWallCollision = function(ev) {
    var robot = ev.robot;
    robot.turn(90 +ev.bearing);
};
Robot.prototype.onRobotCollision = function(ev) {
    var robot = ev.robot;
    var enemy = ev.scannedRobot;
    var bFriendly = ( robot.parentId !=null && robot.parentId==enemy.id);
    bFriendly |= ( enemy.parentId !=null && enemy.parentId==robot.id);
    if(!bFriendly){
      robot.fire(1);
      robot.fire(1);
    }
  if(bFriendly){
    robot.back(Math.floor((Math.random()*55)+11));
  }
  robot.turn(-38);
};
Robot.prototype.onHitByBullet = function(ev) {
    var robot = ev.robot;
  robot.ahead(50);
};
