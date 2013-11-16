var cloned = false;
var Robot = function(robot) {

};

Robot.prototype.onIdle = function(ev) {
    var robot = ev.robot;
    robot.clone();
    robot.fire();
};


Robot.prototype.onScannedRobot = function(ev) {
    var robot = ev.robot;
    var scannedRobot = ev.scannedRobot;
    //robot.ahead(100);                                                                                                                                     
    if (scannedRobot.parentId != robot.id ) {
        for (var i=0; i < 10; i++) {
            robot.fire();
        }
    }
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


Robot.prototype.onWallCollision = function(ev) {
    var robot;
    robot.turn(120);
    robot.fire();
    robot.ahead(100);

    robot.clone();

};

Robot.prototype.onHitByBullet = function(ev) {
    var robot;
    robot = ev.robot;
    robot.turn(90 - ev.bulletBearing);
};
