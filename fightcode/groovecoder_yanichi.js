
var Robot;
(function ()
{
  Robot = function (a)
  {
    this.parentState = new s(a);
    this.parentState.strafeDirection = 1;
  };
  var a = Robot.prototype;
  a.onIdle = function (a)
  {
    var b = a.robot;
    try {
      if (b.parentId == null && b.availableClones != 0) {
        b.clone();
        this.cloneState = new s(b);
        this.cloneState.position = null;
        this.cloneState.parentId = b.id;
        this.cloneState.id = null;
        this.cloneState.tracker = this.parentState.tracker;
        this.cloneState.strafeDirection = -1 * this.parentState.strafeDirection;
        this.cloneState.time = this.parentState.time;
        return;
      }
      var c = this.getState(b);
      c.update(b);
      var d = this.otherState(c);
      if (d.parentId == null && d.time != c.time) {
        c.time = Math.max(c.time, d.time);
        d.time = c.time;
      }
      this.next(b);
    } catch (e) {
    }
  };
  a.onRobotCollision = function (a)
  {
    var c = a.robot;
    var d = this.getState(c);
    d.update(c);
    d.tracker.push(a.collidedRobot, d);
    var e = b.FromBearing(c.angle, a.bearing);
    var f = d.direction.dotProduct(e);
    if (f > 0.3) {
      c.move(1, -1);
    } else if (f < -0.3) {
      c.move(1, 1);
    } else {
      c.turn(1);
    }
  };
  a.onScannedRobot = function (a)
  {
    var b = a.robot;
    b.disappear();
    var c = this.getState(b);
    c.update(b);
    c.tracker.push(a.scannedRobot, c);
    this.next(b);
  };
  a.onWallCollision = function (a)
  {
    var b = a.robot;
    var c = this.getState(b);
    c.update(b);
    this.next(b);
  };
  a.onHitByBullet = function (a)
  {
    var c = a.robot;
    c.disappear();
    var e = this.getState(c);
    e.update(c);
    var f = b.FromBearing(c.angle, a.bearing);
    var g = e.arena.marginRect.getDistToIntersection(new d(e.position, f), true);
    var h = e.position.add(f.scale(0.5 * g));
    var i = b.FromAngle(0).signedAngleTo(f.flip());
    var j = new HitByBullet(null, h, null, i, null, null);
    e.tracker.push(j, e);
    this.next(c);
  };
  a.next = function (a)
  {
    try {
      var b = this.getState(a);
      if (!b.isInitialized) {
        this.initialize(a, b);
      }
      if (this.updateCannon(a, b)) {
        if (b.tracker.isHunting(b) && b.arcAndDirection == null) {
          this.setToSeekMode(a, b);
        }
        return;
      }
      this.updateStrafeDirection(a, b);
      if (b.arcAndDirection != null && !b.arcAndDirection.isPastEnd(b, b.arcAndDirection.targetPoint)) {
        b.arcAndDirection.update(b, b.arcAndDirection.targetPoint);
      }
      if (b.tracker.isHunting(b)) {
        this.huntNext(a, b);
      } else {
        this.scanNext(a, b);
      }
    } catch (c) {
    }
  };
  a.scanNext = function (a, b)
  {
    try {
      if (b.arcAndDirection != null && !b.arcAndDirection.isScanArc()) {
        b.strafeDirection = b.arcAndDirection.direction;
        b.arcAndDirection = null;
      }
      if (b.strafeDirection == 0) {
        b.strafeDirection = a.cannonRelativeAngle < 90 ? -1 : 1;
      }
      this.moveToArc(a, b, b.arcAndDirection);
    } catch (c) {
    }
  };
  a.huntNext = function (a, b)
  {
    try {
      var c = b.tracker.lastTrackingScans(null, b).timeSinceLast(b);
      var d = b.position;
      var e = b.tracker.isTracking(b);
      if (a.gunCoolDownTime == 0) {
        if (!e && this.canFire(b)) {
          a.fire();
          this.setToSeekMode(a, b);
          return;
        }
        var f = b.tracker.getAttackPoint(a, b, null);
        var g = d.distanceTo(f);
        var h = d.add(b.cannonDirection.scale(g));
        var i = h.distanceTo(f);
        if (i < (0.6 * b.arena.radius) && this.canFire(b)) {
          a.fire();
          if (b.arcAndDirection == null || b.arcAndDirection.isAttacArc()) {
            this.setToSeekMode(a, b);
          }
          return;
        }
      }
      if (e && c < 25 || (b.arcAndDirection != null && b.arcAndDirection.isAttacArc())) {
        if (b.arcAndDirection == null || !b.arcAndDirection.isAttacArc()) {
          var f = b.tracker.getAttackPoint(a, b, null);
          b.arcAndDirection = new q(b, f, a.gunCoolDownTime, q.attackArcEnum());
        } else if (b.arcAndDirection.isAttacArc() && b.arcAndDirection.isPastEnd(b, b.arcAndDirection.targetPoint)) {
          var f = b.tracker.getAttackPoint(a, b, null);
          b.arcAndDirection.update(b, f);
        }
      } else {
        this.setToSeekMode(a, b);
      }
      this.moveToArc(a, b, b.arcAndDirection);
    } catch (j) {
    }
  };
  a.setToSeekMode = function (a, b)
  {
    try {
      var c = b.tracker.lastTrackingScans(null, b).timeSinceLast(b);
      if (b.arcAndDirection == null || !b.arcAndDirection.isSeekArc()) {
        var d = b.tracker.nextSeekPoint(a, b);
        b.arcAndDirection = new q(b, d.targetPoint, d.targetTimeOffset, d.arcEnum);
      } else if (b.arcAndDirection.isSeekArc()) {
        if (b.arcAndDirection.isPastEnd(b, b.arcAndDirection.targetPoint) && c > 55) {
          var d = b.tracker.nextSeekPoint(a, b);
          b.arcAndDirection = new q(b, d.targetPoint, d.targetTimeOffset, d.arcEnum);
        }
        if (b.arcAndDirection.isPastEnd(b, b.arcAndDirection.targetPoint) && c <= 50) {
          b.arcAndDirection.update(b, b.arcAndDirection.targetPoint);
        }
      }
    } catch (e) {
    }
  };
  a.updateCannon = function (a, b)
  {
    try {
      var c = b.getScanningCannonAngle(a);
      var e = b.angleDiff(c, a.cannonRelativeAngle);
      if (b.tracker.isHunting(b)) {
        var f = b.position;
        if (b.arcAndDirection == null) {
          return false;
        }
        if (b.strafeDirection == 0) {
          b.strafeDirection = -1 * b.sign(this.cannonAngleDiff(a, b, e));
        }
        if (this.isCrashing(a, b, 10)) {
          var g = b.arcAndDirection != null && b.arcAndDirection.arc.radius > 1 ? b.arcAndDirection.getMoveSign(b) : 0;
          var h = b.direction.scale(g);
          var i = new d(f, h);
          var j = b.arena.marginRect.getInterSectingLines(i, true);
          var k = j.length > 0 ? Math.abs(j[0].direction().signedAngleTo(h)) : 0;
          var l = this.cannonAngleDiff(a, b, e);
          if (Math.abs(l) < 1 && (k > 45 || k < 135)) {
            return false;
          }
          a.rotateCannon(b.sign(l) * b.strafeDirection);
          return true;
        }
        if (b.tracker.timeSinceLast(b, null) < 40 && a.gunCoolDownTime > 15 && b.time % 5 == 0) {
          var l = this.cannonAngleDiff(a, b, e);
          a.rotateCannon(b.sign(l) * b.strafeDirection);
          return true;
        }
      } else if (Math.abs(e) > 1) {
        a.rotateCannon(this.parentState.getRotationDirection(a.cannonRelativeAngle, c));
        return true;
      }
      return false;
    } catch (m) {
    }
  };
  a.updateStrafeDirection = function (a, b)
  {
    try {
      var c = b.position;
      if (this.isCrashingWithOpponent(a, b, 1)) {
        b.strafeDirection *= -1;
      }
      var d = b.arena.marginRect.minDistanceToPoint(c) < (b.arena.radius + 5) && this.isCrashing(a, b, 5);
      if (d) {
        var e = this.distToIdeal(a, b);
        if (e < 0) {
          b.strafeDirection *= -1;
          return;
        }
      }
      var f = this.isCrashingWithFriend(a, b, 5);
      var g = this.isShadowedByOther(a, b);
      var h = this.otherState(b);
      var i = this.isShadowedByOther(a, h);
      if (f || g || i) {
        var e = this.distToIdeal(a, b);
        var j = this.distToIdeal(a, h);
        var k = this.strafeArc(a, b);
        var l = k.centerPoint;
        var m = l.vectorTo(c);
        var n = l.vectorTo(h.position);
        var o = m.signedAngleTo(n);
        if (Math.abs(e) <= 110 && b.strafeDirection != (-1 * b.sign(o))) {
          b.strafeDirection = -1 * b.sign(o);
        }
        if (Math.max(Math.abs(e), Math.abs(j)) > 100 && Math.abs(e) > Math.abs(j) && b.strafeDirection != (-1 * b.sign(o))) {
          b.strafeDirection = -1 * b.sign(o);
        }
        return;
      }
      var p = this.distToIdeal(a, b);
      if (p < -100) {
        b.strafeDirection *= -1;
      }
    } catch (q) {
    }
  };
  a.cannonAngleDiff = function (a, b, c)
  {
    var e = b.position;
    var f = this.strafeArc(a, b);
    var g = this.idealPoint(a, b);
    var h = f.centerPoint;
    var i = h.distanceTo(e);
    var j = b.arena.marginRect.getDistToIntersection(new d(h, h.vectorTo(e)), true);
    var k = Math.min(j, h.distanceTo(g));
    var l = k - i;
    var m = Math.atan2(l, 100) * 180 / Math.PI;
    var n = b.strafeDirection * c;
    var o = m - n;
    return o;
  };
  a.isCrashing = function (a, b, c)
  {
    var d = b.arcAndDirection != null && b.arcAndDirection.arc.radius > 1 ? b.arcAndDirection.getMoveSign(b) : 0;
    if (d == 0) {
      return false;
    }
    var e = b.position;
    var f = b.direction.scale(d);
    var g = e.add(f.scale(c));
    return !g.isWithin(b.arena.marginRect, 0);
  };
  a.isCrashingWithFriend = function (a, b, c)
  {
    var d = this.otherState(b);
    if (b.arcAndDirection == null || b.arcAndDirection.arc.radius < 1 || d == null || d.position == null || Math.abs(b.time - d.time) > 10) {
      return false;
    }
    var e = b.position;
    var f = d.position;
    if (e.distanceTo(f) > (2 * b.arena.radius + c)) {
      return false;
    }
    var g = b.direction.scale(b.arcAndDirection.getMoveSign(b));
    var h = e.add(g.scale(c));
    var i = h.distanceTo(d.position);
    if (i < (2 * b.arena.radius)) {
      return true;
    }
    return false;
  };
  a.isCrashingWithOpponent = function (a, b, c)
  {
    if (b.arcAndDirection == null || b.arcAndDirection.arc.radius < 1 || b.tracker.timeSinceLast(b, null) > 50) {
      return false;
    }
    var d = b.position;
    var e = b.tracker.last(null).robot.position;
    if (d.distanceTo(e) > (2 * b.arena.radius + c)) {
      return false;
    }
    var f = b.direction.scale(b.arcAndDirection.getMoveSign(b));
    var g = d.add(f.scale(c));
    var h = g.distanceTo(e);
    if (h < (2 * b.arena.radius)) {
      return true;
    }
    return false;
  };
  a.isShadowedByOther = function (a, b)
  {
    if (b == null || b.position == null) {
      return false;
    }
    var c = this.otherState(b);
    if (b.arcAndDirection == null || c == null || c.position == null || a.gunCoolDownTime > 25 && b.tracker.timeSinceLast(b, null) < 25 || Math.abs(b.time - c.time) > 10) {
      return false;
    }
    var e = b.position;
    var f = c.position;
    var g = b.cannonDirection;
    var h = new d(e, g);
    var i = h.closestPoint(f);
    if (!i.isOnRay(h)) {
      return false;
    }
    var j = f.distanceTo(i);
    return j < (3 * b.arena.radius);
  };
  a.distToIdeal = function (a, b)
  {
    if (!b.tracker.isHunting(b)) {
      return 0;
    }
    var c = b.position;
    var d = this.strafeArc(a, b);
    var e = d.centerPoint;
    var f = this.idealPoint(a, b);
    var g = e.vectorTo(f);
    var h = e.vectorTo(c);
    var i = h.signedAngleTo(g);
    var j = b.sign(i) * b.strafeDirection * d.arcLengthFromAngle(i);
    return j;
  };
  a.moveToArc = function (a, b, c)
  {
    if (c == null) {
      if (b.strafeDirection == 0) {
        b.strafeDirection = 1;
      }
      a.turn(b.strafeDirection);
      return;
    }
    var d = c.arc;
    if (c.direction == 0) {
      c.direction = 1;
    }
    if (d.radius < 1e-3) {
      a.turn(c.direction);
      return;
    }
    var e = d.centerPoint;
    var f = b.position;
    var g = b.direction.scale(c.getMoveSign(b));
    var h = f.add(g);
    var i = e.distanceTo(h);
    if (i > d.radius) {
      a.turn(c.direction);
      return;
    }
    a.move(1, c.getMoveSign(b));
  };
  a.driveWithin = function (a, b)
  {
    var c = b.position;
    var d = b.arena.borderRect.minDistanceToPoint(c);
    var e = b.arena.borderRect.minDistanceToPoint(c.add(b.direction));
    if (Math.abs(d - e) > 0.2) {
      if (e > d) {
        a.move(1, 1);
      } else {
        a.move(1, -1);
      }
    } else {
      a.turn(1);
    }
    b.arcAndDirection = null;
  };
  a.initialize = function (a, b)
  {
    try {
      var c = b.position;
      var d = b.cannonDirection;
      var e = this.otherState(b);
      if (e == null) {
        var f = c.vectorTo(b.arena.centerPoint());
        var g = d.signedAngleTo(f);
        if (g > 0) {
          a.rotateCannon(1);
          b.strafeDirection = 1;
        } else {
          a.rotateCannon(-1);
          b.strafeDirection = -1;
        }
      } else {
        if (e.position == null) {
          return;
        }
        var h = e.position;
        var i = c.vectorTo(h);
        var j = d.signedAngleTo(i);
        a.rotateCannon(-1 * b.sign(j));
        b.strafeDirection = -1 * b.sign(j);
      }
      b.isInitialized = true;
    } catch (k) {
    }
  };
  a.canFire = function (a)
  {
    var b = this.otherState(a);
    if (b == null) {
      return true;
    }
    if (Math.abs(a.time - b.time) > 10) {
      return true;
    }
    var c = a.position;
    var e = new d(c, a.cannonDirection);
    var f = b.position;
    var g = e.closestPoint(f);
    if (!g.isOnRay(e)) {
      return true;
    }
    return g.distanceTo(f) > (1.5 * a.arena.radius);
  };
  a.getState = function (a)
  {
    var b = (a.parentId == null) ? this.parentState : this.cloneState;
    return b;
  };
  a.otherState = function (a)
  {
    var b = a.parentId == null ? this.cloneState : this.parentState;
    return b;
  };
  a.strafeArc = function (a, b)
  {
    var c = b.position;
    var d = b.tracker.isTracking(b);
    var e = b.tracker.isHunting(b);
    if (!d && !e) {
      return new f(b.arena.centerPoint(), b.arena.centerPoint().distanceTo(c));
    }
    if (e && !d) {
      var g = b.tracker.last(null).robot.position;
      return new f(g, g.distanceTo(c));
    }
    var h = b.tracker.predict(b, 0, null);
    return new f(h, c.distanceTo(h));
  };
  a.idealPoint = function (a, b)
  {
    var c = b.position;
    if (!b.tracker.isHunting(b)) {
      return c;
    }
    var d = this.strafeArc(a, b);
    var f = b.tracker.predict(b, 0, null);
    var g = b.tracker.lastTrackingScans(null, b);
    var h = g.last().robot.direction;
    var i = d.centerPoint;
    var j = i.vectorTo(c);
    if (b.tracker.isWallHugger(null, b)) {
      return b.arena.centerPoint();
    }
    var k = d.getIntersectionPoints(new e(f.add(h.scale(-2 * d.radius)), f.add(h.scale(2 * d.radius))));
    if (k.length < 2) {
      return b.arena.centerPoint();
    }
    var l = this.createIdealPoint(b, i, k[0]);
    var m = i.vectorTo(l);
    var n = j.signedAngleTo(m);
    var o = Math.acos(Math.abs(h.normalize().dotProduct(m.normalize()))) * 180 / Math.PI;
    if (Math.abs(n) < 90 && Math.abs(o) < 10) {
      return l;
    }
    var p = this.createIdealPoint(b, i, k[1]);
    var q = i.vectorTo(p);
    var r = j.signedAngleTo(q);
    var s = Math.acos(Math.abs(h.normalize().dotProduct(q.normalize()))) * 180 / Math.PI;
    if (Math.abs(r) < 90 && Math.abs(s) < 10) {
      return p;
    }
    if (Math.abs(n) < Math.abs(r)) {
      return l;
    }
    return p;
  };
  a.createIdealPoint = function (a, b, c)
  {
    var e = a.position;
    var f = b.vectorTo(c);
    var g = b.vectorTo(e);
    var h = a.arena.marginRect.getDistToIntersection(new d(b, f), true);
    var i = a.arena.marginRect.getDistToIntersection(new d(b, f.rotate(10)), true);
    var j = a.arena.marginRect.getDistToIntersection(new d(b, f.rotate(-10)), true);
    var k = Math.min(h, Math.max(i, j));
    if (k > 150) {
      var l = b.add(f.normalize().scale(k));
      l = a.arena.marginRect.trimToWithin(l, 15);
      if (b.distanceTo(l) > 100) {
        return l;
      }
    }
    var m = a.arena.marginRect.getInterSectingLines(new d(b, f), true)[0];
    var n = m.vectorFromPointToClosestPoint(b);
    if (m.direction().dotProduct(f) > 0) {
      var o = m.endPoint.add(m.direction().scale(-30));
      var p = o.add(n.normalize().scale(-150));
      return p;
    } else {
      var o = m.startPoint.add(m.direction().scale(30));
      var p = o.add(n.normalize().scale(-150));
      return p;
    }
  };
  function b(a, b)
  {
    this.x = a;
    this.y = b;
  }

  b.FromAngle = function (a)
  {
    return new b(Math.sin(a * Math.PI / 180), -1 * Math.cos(a * Math.PI / 180));
  };
  b.FromBearing = function (a, c)
  {
    return b.FromAngle(a).rotate(c);
  };
  b.prototype.normalize = function ()
  {
    return new b(this.x / this.length(), this.y / this.length());
  };
  b.prototype.scale = function (a)
  {
    return new b(a * this.x, a * this.y);
  };
  b.prototype.flip = function ()
  {
    return this.scale(-1);
  };
  b.prototype.dotProduct = function (a)
  {
    return a.x * this.x + a.y * this.y;
  };
  b.prototype.signedAngleTo = function (a)
  {
    var b = -1 * (Math.atan2(this.y, this.x) - Math.atan2(a.y, a.x)) * 180 / Math.PI;
    if (b < -179.9) {
      return 360 + b;
    }
    if (b > 180) {
      return b - 360;
    }
    return b;
  };
  b.prototype.positiveAngleto = function (a)
  {
    var b = this.signedAngleTo(a);
    if (b < 0) {
      b += 360;
    }
    return b;
  };
  b.prototype.getPerpendicular = function ()
  {
    return new b(this.y, -1 * this.x);
  };
  b.prototype.rotate = function (a)
  {
    var c = b.FromAngle(0).signedAngleTo(this);
    return b.FromAngle(c + a).scale(this.length());
  };
  b.prototype.isParallelTo = function (a)
  {
    return Math.abs(this.normalize().dotProduct(a.normalize())) > (1 - 1E-6);
  };
  b.prototype.length = function ()
  {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  b.prototype.nextOrtho = function (a)
  {
    var c = b.FromAngle(0).signedAngleTo(this);
    if (c < 0) {
      c += 360;
    }
    var d = c % 90;
    if (Math.abs(d) > 1e-2) {
      if (a < 0) {
        return b.FromAngle(c - d);
      } else {
        return b.FromAngle(c + 90 - d);
      }
    }
    return b.FromAngle(c + a * 90);
  };
  b.prototype.toString = function ()
  {
    return "(" + this.x.toFixed(1) + ", " + this.y.toFixed(1) + ")";
  };
  b.prototype.equals = function (a)
  {
    return(Math.abs(this.x - a.x) + Math.abs(this.y - a.y)) < 1E-3;
  };
  function c(a, b)
  {
    this.x = a;
    this.y = b;
  }

  c.prototype.add = function (a)
  {
    return new c(this.x + a.x, this.y + a.y);
  };
  c.prototype.vectorTo = function (a)
  {
    return new b(a.x - this.x, a.y - this.y);
  };
  c.prototype.distanceTo = function (a)
  {
    return this.vectorTo(a).length();
  };
  c.prototype.isWithin = function (a, b)
  {
    return a.isPointWithin(this, b);
  };
  c.prototype.isOnLine = function (a)
  {
    return a.isPointOnLine(this);
  };
  c.prototype.isOnRay = function (a)
  {
    return a.isPointOnRay(this);
  };
  c.prototype.trimToWithin = function (a, b)
  {
    return a.trimToWithin(this, b);
  };
  c.prototype.equals = function (a)
  {
    return(Math.abs(this.x - a.x) + Math.abs(this.y - a.y)) < 1E-3;
  };
  c.prototype.toString = function ()
  {
    return "(" + this.x.toFixed(1) + ", " + this.y.toFixed(1) + ")";
  };
  function d(a, b)
  {
    this.startPoint = a;
    this.direction = b;
  }

  d.prototype.intersectionPoint = function (a)
  {
    var b = this.startPoint.x;
    var f = this.startPoint.y;
    var g = this.startPoint.x + this.direction.x;
    var h = this.startPoint.y + this.direction.y;
    var i = a.startPoint.x;
    var j = a.startPoint.y;
    var k = 0;
    var l = 0;
    if (a instanceof d) {
      k = a.startPoint.x + a.direction.x;
      l = a.startPoint.y + a.direction.y;
    } else if (a instanceof e) {
      k = a.endPoint.x;
      l = a.endPoint.y;
    }
    var m = ((g - b) * (i * l - k * j) - (k - i) * (b * h - g * f)) / ((b - g) * (j - l) - (f - h) * (i - k));
    var n = ((j - l) * (b * h - g * f) - (f - h) * (i * l - k * j)) / ((b - g) * (j - l) - (f - h) * (i - k));
    return new c(m, n);
  };
  d.prototype.intersectsWith = function (a)
  {
    if (a instanceof d) {
      if (this.direction.isParallelTo(a.direction)) {
        return false;
      }
    }
    if (a instanceof e) {
      if (this.direction.isParallelTo(a.direction())) {
        return false;
      }
    }
    var b = this.intersectionPoint(a);
    if (!this.isPointOnRay(b)) {
      return false;
    }
    if (a instanceof d) {
      return a.isPointOnRay(b);
    }
    if (a instanceof e) {
      return a.isPointOnLine(b);
    }
    return true;
  };
  d.prototype.isPointOnRay = function (a)
  {
    if (this.startPoint.distanceTo(a) < 1E-3) {
      return true;
    }
    var b = this.startPoint.vectorTo(a);
    if (!b.isParallelTo(this.direction)) {
      return false;
    }
    return b.dotProduct(this.direction) > 0;
  };
  d.prototype.offset = function (a)
  {
    return new d(this.startPoint.add(a), this.direction);
  };
  d.prototype.vectorFromPointToClosestPoint = function (a)
  {
    return a.vectorTo(this.closestPoint(a));
  };
  d.prototype.closestPoint = function (a)
  {
    var b = this.startPoint.vectorTo(a);
    var c = b.dotProduct(this.direction);
    if (Math.abs(c) < 1e-4) {
      return this.startPoint;
    }
    var d = this.direction.scale(c);
    var e = this.startPoint.add(d);
    return e;
  };
  d.prototype.equals = function (a)
  {
    return this.startPoint.equals(a.startPoint) && this.direction.equals(a.direction);
  };
  d.prototype.toString = function ()
  {
    return "{" + this.startPoint + "; " + this.direction + "}";
  };
  function e(a, b)
  {
    this.startPoint = a;
    this.endPoint = b;
  }

  e.prototype.direction = function ()
  {
    return this.startPoint.vectorTo(this.endPoint).normalize();
  };
  e.prototype.length = function ()
  {
    return this.startPoint.vectorTo(this.endPoint).length();
  };
  e.prototype.intersectionPoint = function (a)
  {
    var b = new d(this.startPoint, this.direction());
    var c = 0;
    if (a instanceof e) {
      c = new d(a.startPoint, a.direction());
    }
    if (a instanceof d) {
      c = a;
    }
    return b.intersectionPoint(c);
  };
  e.prototype.intersectsWith = function (a)
  {
    var b = new d(this.startPoint, this.direction());
    var c = (a instanceof e) ? new d(a.startPoint, a.direction()) : a;
    if (!b.intersectsWith(c)) {
      return false;
    }
    var f = b.intersectionPoint(c);
    if (a instanceof e) {
      if (!f.isOnLine(a)) {
        return false;
      }
    }
    if (a instanceof d) {
      if (!f.isOnRay(a)) {
        return false;
      }
    }
    return f.isOnLine(this);
  };
  e.prototype.isPointOnLine = function (a)
  {
    if (this.startPoint.distanceTo(a) < 1E-3) {
      return true;
    }
    var b = this.startPoint.vectorTo(a);
    if (!b.isParallelTo(this.direction())) {
      return false;
    }
    var c = b.dotProduct(this.direction());
    return 0 <= c && c <= this.length();
  };
  e.prototype.distanceToPoint = function (a)
  {
    var b = this.startPoint.vectorTo(a);
    return Math.abs(b.dotProduct(this.direction().getPerpendicular()));
  };
  e.prototype.vectorFromPointToClosestPoint = function (a)
  {
    var b = this.closestPoint(a);
    return a.vectorTo(b);
  };
  e.prototype.closestPoint = function (a)
  {
    var b = this.startPoint.vectorTo(a);
    var c = b.dotProduct(this.direction());
    if (Math.abs(c) < 1e-4) {
      return this.startPoint;
    }
    var d = this.direction().scale(c);
    var e = this.startPoint.add(d);
    return e;
  };
  e.prototype.equals = function (a)
  {
    return this.startPoint.equals(a.startPoint) && this.endPoint.equals(a.endPoint);
  };
  e.prototype.toString = function ()
  {
    return "{ " + this.startPoint + "; " + this.endPoint + ";" + this.direction() + "}";
  };
  function f(a, b)
  {
    this.centerPoint = a;
    this.radius = Math.abs(b);
  }

  f.FromRayAndLine = function (a, b)
  {
    var c = b.direction().signedAngleTo(a.direction);
    var d = c > 0 ? 1 : -1;
    var e = a.direction.rotate(d * 90);
    var g = Math.abs(a.startPoint.vectorTo(b.startPoint).dotProduct(b.direction().getPerpendicular()));
    var h = -1 * g / (Math.cos(c * Math.PI / 180) - 1);
    var i = a.startPoint.add(e.scale(-1 * h));
    if (Math.abs(b.distanceToPoint(i) - h) > h / 100) {
      i = a.startPoint.add(e.scale(h));
    }
    return new f(i, h);
  };
  f.getDistanceToStartPoint = function (a, c, e)
  {
    var f = c.direction().signedAngleTo(a.direction);
    var g = f > 0 ? 1 : -1;
    var h = a.direction.rotate(g * 90);
    var i = b.FromAngle(0).signedAngleTo(h);
    if (i < 0) {
      i += 360;
    }
    var j = c.direction().rotate(g * 90);
    var k = b.FromAngle(0).signedAngleTo(j);
    if (k < 0) {
      k += 360;
    }
    var l = Math.abs(a.startPoint.vectorTo(c.startPoint).dotProduct(c.direction().getPerpendicular()));
    var m = -1 * l / (Math.cos(f * Math.PI / 180) - 1);
    if (m < e) {
      return 0;
    }
    m = e;
    var n = b.FromAngle(i);
    var o = new d(a.startPoint.add(n.scale(-1 * m)), a.direction);
    var p = b.FromAngle(k);
    var q = new d(c.startPoint.add(p.scale(-1 * m)), c.direction());
    var r = o.intersectionPoint(q);
    if (o.startPoint.vectorTo(r).dotProduct(o.direction) > 0) {
      return o.startPoint.distanceTo(r);
    }
    return 0;
  };
  f.getTangentPoint = function (a, b, c)
  {
    var e = new d(a, b);
    var f = new d(c, b.getPerpendicular());
    return e.intersectionPoint(f);
  };
  f.prototype.getIntersectionPoints = function (a)
  {
    var b = [];
    var c = this.centerPoint;
    var d = a.distanceToPoint(this.centerPoint);
    if (d > 0.1) {
      var e = a.vectorFromPointToClosestPoint(this.centerPoint);
      if (e.length() > this.radius) {
        return b;
      }
      c = this.centerPoint.add(e);
    }
    var f = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(d, 2));
    var g = c.add(a.direction().scale(f));
    var h = c.add(a.direction().scale(-1 * f));
    if (a.isPointOnLine(g)) {
      b.push(g);
    }
    if (a.isPointOnLine(h)) {
      b.push(h);
    }
    return b;
  };
  f.prototype.arcLengthFromAngle = function (a)
  {
    return 2 * Math.PI * this.radius * Math.abs(a) / 360;
  };
  f.prototype.angleLeft = function (a, b, c)
  {
    var d = 360.0;
    var e = this.centerPoint.vectorTo(a);
    for (var f = 0; f < c.lines.length; f++) {
      var g = c.lines[f];
      var h = this.getIntersectionPoints(g);
      for (var i = 0; i < h.length; i++) {
        var j = this.centerPoint.vectorTo(h[i]);
        var k = e.signedAngleTo(j);
        if (k * b > 0 && Math.abs(k) < d) {
          d = Math.abs(k);
        }
      }
    }
    return d;
  };
  f.prototype.angleLeftToPoint = function (a, b, c)
  {
    var d = this.centerPoint.vectorTo(a);
    var e = this.centerPoint.vectorTo(b);
    var f = d.positiveAngleto(e);
    return c > 0 ? f : 360 - f;
  };
  f.prototype.isPointOnArc = function (a, c, d, e)
  {
    var f = this.centerPoint.distanceTo(a.startPoint);
    if (f < d) {
      return false;
    }
    if (e != null) {
      if (f > e) {
        return false;
      }
    }
    var g = this.centerPoint.vectorTo(a.startPoint).normalize();
    var h = Math.abs(g.dotProduct(a.direction));
    var i = b.FromAngle(c).dotProduct(b.FromAngle(90));
    return h < i;
  };
  f.prototype.signedAngleToTangent = function (a)
  {
    var b = this.positiveTangentDirection(a.startPoint);
    if (b.dotProduct(a.direction) > 0) {
      return a.direction.signedAngleTo(b);
    }
    return a.direction.signedAngleTo(b.flip());
  };
  f.prototype.positiveTangentDirection = function (a)
  {
    return this.centerPoint.vectorTo(a).normalize().rotate(90);
  };
  f.prototype.angleAtPos = function (a)
  {
    if (a.distanceTo(this.centerPoint) < 1) {
      return 0;
    }
    return b.FromAngle(0).positiveAngleto(this.centerPoint.vectorTo(a));
  };
  f.prototype.posAtAngle = function (a)
  {
    var c = b.FromAngle(0).rotate(a);
    return this.centerPoint.add(c.scale(this.radius));
  };
  function g(a, b)
  {
    var d = a;
    var f = new c(b.x, a.y);
    var g = b;
    var h = new c(a.x, b.y);
    this.lines = [new e(d, f), new e(f, g), new e(g, h), new e(h, d)];
    this.minX = Math.min(Math.min(d.x, f.x), Math.min(g.x, h.x));
    this.maxX = Math.max(Math.max(d.x, f.x), Math.max(g.x, h.x));
    this.minY = Math.min(Math.min(d.y, f.y), Math.min(g.y, h.y));
    this.maxY = Math.max(Math.max(d.y, f.y), Math.max(g.y, h.y));
  }

  g.prototype.trimToWithin = function (a, b)
  {
    var d = a.x;
    var e = a.y;
    if (d < (this.minX + b)) {
      d = this.minX + b;
    }
    if (d > (this.maxX - b)) {
      d = this.maxX - b;
    }
    if (e < (this.minY + b)) {
      e = this.minY + b;
    }
    if (e > (this.maxY - b)) {
      e = this.maxY - b;
    }
    return new c(d, e);
  };
  g.prototype.isPointWithin = function (a, b)
  {
    return this.minX - b <= a.x && a.x <= this.maxX + b && this.minY - b <= a.y && a.y <= this.maxY + b;
  };
  g.prototype.getDistToIntersection = function (a, b)
  {
    var c = this.getIntersectionPoints(a, b)[0];
    return a.startPoint.distanceTo(c);
  };
  g.prototype.getIntersectingLine = function (a, b)
  {
    return this.getInterSectingLines(a, b)[0];
  };
  g.prototype.getIntersectionPoints = function (a, b)
  {
    var c = [];
    var e = a;
    if (b) {
      if (!a.startPoint.isWithin(this, 0)) {
        e = new d(this.trimToWithin(a.startPoint, 1), a.direction);
      }
    }
    for (var f = 0; f < this.lines.length; f += 1) {
      var g = this.lines[f];
      if (e.intersectsWith(g)) {
        var h = e.intersectionPoint(g);
        if (e.isPointOnRay(h)) {
          c.push(h);
        }
      }
    }
    if (c.length > 1) {
      if (e.startPoint.distanceTo(c[1]) < e.startPoint.distanceTo(c[0])) {
        var i = c[0];
        c[0] = c[1];
        c[1] = i;
      }
    }
    return c;
  };
  g.prototype.getInterSectingLines = function (a, b)
  {
    var c = [];
    var e = a;
    if (b) {
      if (!a.startPoint.isWithin(this, 0)) {
        e = new d(this.trimToWithin(a.startPoint, 1), a.direction);
      }
    }
    for (var f = 0; f < this.lines.length; f += 1) {
      var g = this.lines[f];
      if (e.intersectsWith(g)) {
        var h = e.intersectionPoint(g);
        if (e.isPointOnRay(h)) {
          c.push(g);
        }
      }
    }
    if (c.length > 1) {
      var i = e.intersectionPoint(c[0]);
      var j = e.intersectionPoint(c[1]);
      if (e.startPoint.distanceTo(j) < e.startPoint.distanceTo(i)) {
        var k = c[0];
        c[0] = c[1];
        c[1] = k;
      }
    }
    return c;
  };
  g.prototype.minDistanceToPoint = function (a)
  {
    var b = Math.max(this.maxX, this.maxY);
    var c = this.isPointWithin(a, 1E-3) ? 1 : -1;
    for (var d = 0; d < this.lines.length; d++) {
      var e = this.lines[d];
      var f = e.distanceToPoint(a);
      if (f < b) {
        b = f;
      }
    }
    return c * b;
  };
  g.prototype.getClosestLines = function (a)
  {
    var b = this.lines.slice(0);
    var c = true;
    do {
      c = false;
      for (var d = 0; d < b.length - 1; d++) {
        if (b[d].distanceToPoint(a) > b[d + 1].distanceToPoint(a)) {
          var e = b[d];
          b[d] = b[d + 1];
          b[d + 1] = e;
          c = true;
        }
      }
    } while (c);
    return b;
  };
  g.prototype.equals = function (a)
  {
    return this.minX === a.minX && this.maxX === a.minX && this.minY === a.minY && this.maxY === a.maxY;
  };
  g.prototype.toString = function ()
  {
    return "minPoint: " + new c(this.minX, this.minY) + " maxPoint: " + new c(this.maxX, this.maxY);
  };
  function h(a)
  {
    this.padding = 26;
    this.radius = 12;
    this.width = a.arenaWidth;
    this.height = a.arenaHeight;
    this.seekRadius = 360 / (2 * Math.PI);
    this.scanRadius = (Math.min(this.width, this.height) / 4 - this.padding);
    this.attackRadius = this.scanRadius - 5;
    this.huntRadius = this.scanRadius + 10;
    var b = new c(this.radius, this.radius);
    var d = new c(this.width - this.radius, this.height - this.radius);
    this.marginRect = new g(b, d);
    var e = new c(0, 0);
    var f = new c(this.width, this.height);
    this.borderRect = new g(e, f);
    this.tempRect = null;
    this.tempRectExpiryTime = 0;
  }

  h.prototype.centerPoint = function ()
  {
    return new c(this.borderRect.maxX / 2, this.borderRect.maxY / 2);
  };
  function i()
  {
    this.parentScans = new o();
    this.cloneScans = new o();
    this.unknownScans = new o();
  }

  i.prototype.push = function (a, b)
  {
    var c = this.last(a.id);
    if (c != null) {
      if (b.time < (c.time + 10)) {
        return;
      }
    }
    var d = new m(a, b.time);
    if (!d.isOpponent(b)) {
      return;
    }
    if (d.isParent()) {
      this.parentScans.push(d);
    } else if (d.isClone()) {
      this.cloneScans.push(d);
    } else if (d.isUnknown()) {
      this.unknownScans.push(d);
    }
  };
  i.prototype.any = function (a)
  {
    if (a == null) {
      return this.parentScans.any() || this.cloneScans.any();
    }
    if (this.parentScans.id == a) {
      return this.parentScans.any();
    }
    if (this.cloneScans.id == a) {
      return this.cloneScans.any();
    }
    return false;
  };
  i.prototype.lastTime = function ()
  {
    if (this.last(null) == null) {
      return -5000;
    }
    return this.last(null).time;
  };
  i.prototype.timeSinceLast = function (a, b)
  {
    if (!this.any(b)) {
      return 10000;
    }
    return a.time - this.last(b).time;
  };
  i.prototype.last = function (a)
  {
    if (!this.any(a)) {
      return null;
    }
    return this.lastScans(a).last();
  };
  i.prototype.lastScans = function (a)
  {
    if (a == null) {
      if (!this.parentScans.any() && !this.cloneScans.any()) {
        return null;
      }
      if (this.parentScans.any() && !this.cloneScans.any()) {
        return this.parentScans;
      }
      if (!this.parentScans.any() && this.cloneScans.any()) {
        return this.cloneScans;
      }
      return this.parentScans.lastTime() > this.cloneScans.lastTime() ? this.parentScans : this.cloneScans;
    }
    var b = this.parentScans.id == a ? this.parentScans : this.cloneScans;
    return b;
  };
  i.prototype.lastTrackingScans = function (a, b)
  {
    var c = this.lastScans(a);
    if (a == null) {
      if (this.parentScans.isTracking(b) && this.cloneScans.isTracking(b)) {
        c = this.parentScans.lastTime() < this.cloneScans.lastTime() ? this.cloneScans : this.parentScans;
      } else if (this.parentScans.isTracking(b) && !this.cloneScans.isTracking(b)) {
        c = this.parentScans;
      } else if (!this.parentScans.isTracking(b) && this.cloneScans.isTracking(b)) {
        c = this.cloneScans;
      }
    }
    return c;
  };
  i.prototype.lastUnknown = function ()
  {
    return this.unknownScans.any() ? this.unknownScans.last() : null;
  };
  i.prototype.predict = function (a, b, c)
  {
    if (!this.any(c)) {
      return null;
    }
    var d = this.lastTrackingScans(c, a);
    if (!d.isTracking(a)) {
      return d.last().robot.position;
    }
    if (d.isWallHugger(a)) {
      return this.predictWallHugger(a, d, b);
    }
    var e = d.speed(a, 5);
    var f = d.timeSinceLast(a);
    var g = f + b;
    var h = d.last().robot.position;
    if (g < 0) {
      return h;
    }
    var i = d.last().robot.direction;
    var j = i;
    var k = h;
    var l = d.averageTurnSpeed(a, 5);
    if (d.stdDevTurnSpeed(a, 5, 0) > 0.1) {
      l = 0;
    }
    for (var m = 0; m < g; m++) {
      k = k.add(j.scale(e));
      j = j.rotate(l);
      if (!k.isWithin(a.arena.marginRect, 0)) {
        e *= -1;
      }
      var n = this.collisionPoint(k, k.add(j.scale(e)), a);
      if (n != null) {
        return n;
      }
    }
    return k;
  };
  i.prototype.isWallHugger = function (a, b)
  {
    var c = this.lastTrackingScans(a, b);
    if (!c.isTracking(b)) {
      return false;
    }
    return c.isWallHugger(b);
  };
  i.prototype.predictWallHugger = function j(a, b, c)
  {
    var f = b.speed(a, 5);
    if (Math.abs(f) < 1e-2) {
      return b.last().robot.position;
    }
    var g = b.timeSinceLast(a) + c;
    var h = b.last().robot.position;
    if (Math.abs(g) < 1) {
      return h;
    }
    var i = b.last().robot.direction.scale(a.sign(f));
    var j = new d(h, i);
    var k = a.arena.marginRect.getInterSectingLines(j, true);
    var l = k.length > 0 ? k[0] : a.arena.marginRect.lines[0];
    if (h.distanceTo(l.startPoint) > h.distanceTo(l.endPoint)) {
      l = new e(l.endPoint, l.startPoint);
    }
    var m = h.add(i.scale(Math.abs(f) * g));
    if (!a.arena.marginRect.isPointWithin(m, 1)) {
      var n = a.arena.marginRect.getDistToIntersection(j, true);
      var o = Math.abs(n / f);
      var p = n > 1 ? h.add(i.scale(n)) : h;
      g -= o;
      var q = l.direction();
      var r = Math.abs(b.lastStep().angleDiff()) > 1 ? b.lastStep().angleDiff() / Math.abs(b.lastStep().angleDiff()) : a.sign(i.signedAngleTo(q));
      while (!i.isParallelTo(q)) {
        i = i.rotate(r);
        g--;
      }
      if (g > 0) {
        m = p.add(i.scale(Math.abs(f) * g));
      }
    }
    return m;
  };
  i.prototype.nextSeekPoint = function (a, b)
  {
    var c = b.tracker.lastTrackingScans(null, b).timeSinceLast(b);
    var d = c < 25 ? 50 - c : 25.0;
    var e = this.lastTrackingScans(null, b);
    if (b.arcAndDirection == null) {
      return new n(this.getSeekPoint(b, d, true, e.id), q.maxSeekArcEnum(), d);
    }
    this.updateSeekStatus(b, e);
    if (e.isTracking(b) && b.arcAndDirection.isAttacArc()) {
      if (!e.hasSoughtStd) {
        return new n(this.predict(b, d, null), q.stdSeekArcEnum(), d);
      }
      if (e.hasSoughtMax && e.hasSoughtMin) {
        return new n(b.position, q.scanArcEnum(), 0);
      }
      if (e.hasSoughtStd && !e.hasSoughtMin && !b.arcAndDirection.isMinSeekArc()) {
        return new n(this.getSeekPoint(b, d, false, e.id), q.minSeekArcEnum(), d);
      }
      if (e.hasSoughtStd && !e.hasSoughtMax && !b.arcAndDirection.isMaxSeekArc()) {
        return new n(this.getSeekPoint(b, d, true, e.id), q.maxSeekArcEnum(), d);
      }
    } else if (e.isTracking(b)) {
      var f = this.getAttackPoint(a, b, e.id);
      var g = b.tracker.lastTrackingScans(null, b).last().robot.position;
      var h = g.vectorTo(f);
      if (!e.hasSoughtMin && !b.arcAndDirection.isMinSeekArc()) {
        var i = this.getSeekPoint(b, d, false, e.id);
        var j = g.vectorTo(i);
        if (h.dotProduct(j) < 0) {
          return new n(i, q.minSeekArcEnum(), d);
        }
        return new n(f, q.attackArcEnum(), a.gunCoolDownTime);
      }
      if (!e.hasSoughtMax && !b.arcAndDirection.isMaxSeekArc()) {
        var k = this.getSeekPoint(b, d, true, e.id);
        var j = g.vectorTo(k);
        if (h.dotProduct(j) < 0) {
          return new n(k, q.maxSeekArcEnum(), d);
        }
        return new n(f, q.attackArcEnum(), a.gunCoolDownTime);
      }
    } else if (e.isHunting(b)) {
      if (e.hasSoughtMax && e.hasSoughtMin) {
        return new n(b.position, q.scanArcEnum(), 0);
      }
      if (!e.hasSoughtMin && !b.arcAndDirection.isMinSeekArc()) {
        return new n(this.getSeekPoint(b, d, false, e.id), q.minSeekArcEnum(), d);
      }
      if (!e.hasSoughtMax && !b.arcAndDirection.isMaxSeekArc()) {
        return new n(this.getSeekPoint(b, d, true, e.id), q.maxSeekArcEnum(), d);
      }
    }
    return new n(b.position, q.scanArcEnum(), 0);
  };
  i.prototype.updateSeekStatus = function (a, b)
  {
    var c = b.timeSinceLast(a);
    if (c < 50) {
      return;
    }
    var d = false;
    var e = false;
    if (c > 50 && a.arcAndDirection.isPastEnd(a, a.arcAndDirection.targetPoint)) {
      if (a.arcAndDirection.isMaxSeekArc()) {
        e = true;
      }
      if (a.arcAndDirection.isMinSeekArc()) {
        d = true;
      }
      if (a.arcAndDirection.isStdSeekArc()) {
        b.hasSoughtStd = true;
      }
    }
    if (a.arcAndDirection.isAttacArc()) {
      var f = this.getSeekPoint(a, 0, true, b.id);
      var g = a.time - a.arcAndDirection.targetTime;
      if (g < 0) {
        g = 5;
      }
      var h = new q(a, f, g, q.maxSeekArcEnum());
      if (h.isPastEnd(a, f)) {
        e = true;
      }
      var i = this.getSeekPoint(a, 0, false, b.id);
      h = new q(a, i, g, q.minSeekArcEnum());
      if (h.isPastEnd(a, i)) {
        d = true;
      }
    }
    if (b.parentId != null) {
      b.hasSoughtMin = d || b.hasSoughtMin;
      b.hasSoughtMax = e || b.hasSoughtMax;
    } else {
      if (d) {
        b.hasSoughtMin = true;
        b.hasSoughtMax = false;
      }
      if (e) {
        b.hasSoughtMin = false;
        b.hasSoughtMax = true;
      }
    }
  };
  i.prototype.getSeekPoint = function k(a, b, c, d)
  {
    var e = this.lastTrackingScans(d, a);
    var f = e.last().robot.direction;
    var g = e.last().robot.position;
    var h = e.speed(a, 5) < 0 ? -1 : 1;
    var i = f.scale(h);
    var j = e.timeSinceLast(a);
    var k = j + b;
    if (Math.abs(k) < 1) {
      return g;
    }
    var l = c ? g.add(i.scale(k)) : g.add(i.scale(-1 * k));
    var m = this.collisionPoint(g, l, a);
    if (m != null) {
      return m;
    }
    return l;
  };
  i.prototype.collisionPoint = function (a, b, c)
  {
    var d = new e(a, b);
    if (d.length() < 0.1) {
      return null;
    }
    var f = c.position;
    var g = d.closestPoint(f);
    var h = g.isOnLine(d);
    var i = g.distanceTo(f);
    if (h && i < 2 * c.arena.radius) {
      return a.add(d.direction().scale(Math.min(a.distanceTo(f), a.distanceTo(f) - 2 * c.arena.radius)));
    }
    return null;
  };
  i.prototype.getTimeToAttackPos = function (a, b, c)
  {
    var d = b.position.distanceTo(this.last(c).robot.position);
    var e = this.predict(b, a.gunCoolDownTime + d / 2, c);
    d = b.position.distanceTo(e);
    return a.gunCoolDownTime + d / 2;
  };
  i.prototype.getAttackPoint = function l(a, b, c)
  {
    var d = this.getTimeToAttackPos(a, b, c);
    var e = this.predict(b, d, c);
    return e;
  };
  i.prototype.isHunting = function (a)
  {
    if (!this.any(null)) {
      return false;
    }
    return this.lastTrackingScans(null, a).isHunting(a);
  };
  i.prototype.isTracking = function (a)
  {
    if (!this.any(null)) {
      return false;
    }
    return this.lastTrackingScans(null, a).isTracking(a);
  };
  function m(a, b)
  {
    this.robot = a;
    this.time = b;
    this.robot.position = new c(a.position.x, a.position.y);
    this.robot.cannonDirection = this.getOpponentCannonDirectionFromAngle(a.cannonAngle, a.angle);
    if (a.id != null) {
      this.robot.direction = this.getOpponentDirectionFromAngle(a.angle);
    }
  }

  m.prototype.getOpponentDirectionFromAngle = function (a)
  {
    return b.FromAngle(a + 90);
  };
  m.prototype.getOpponentCannonDirectionFromAngle = function (a, c)
  {
    return b.FromAngle(a + c + 90);
  };
  m.prototype.isUnknown = function ()
  {
    return this.robot.id == null;
  };
  m.prototype.isParent = function ()
  {
    return this.robot.id != null && this.robot.parentId == null;
  };
  m.prototype.isClone = function ()
  {
    return this.robot.id != null && this.robot.parentId != null;
  };
  m.prototype.isOpponent = function (a)
  {
    if (this.isUnknown()) {
      return true;
    }
    return this.robot.parentId != a.id && this.robot.id != a.parentId;
  };
  function n(a, b, c)
  {
    this.targetPoint = a;
    this.arcEnum = b;
    this.targetTimeOffset = c;
  }

  function o()
  {
    this.data = [];
    this.id = null;
    this.parentId = null;
    this.hasSoughtMax = false;
    this.hasSoughtMin = false;
    this.hasSoughtStd = false;
  }

  o.prototype.push = function (a)
  {
    this.data.push(a);
    this.id = a.robot.id;
    this.parentId = a.robot.parentId;
    this.hasSoughtStd = false;
    this.hasSoughtMin = false;
    this.hasSoughtMax = false;
  };
  o.prototype.speed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0.4;
    }
    if (this.isWallHugger(a)) {
      return this.wallSpeed(a, 5);
    }
    if (this.data.length == 2) {
      return this.lastStep().speed(a);
    }
    var c = this.averageTurnSpeed(a, b);
    var d = this.stdDevTurnSpeed(a, b, 0);
    var e = this.averageMoveRatio(a, 5);
    var f = this.stdDevMoveRatio(a, 5, 0.1);
    var g = this.stepsTo(b);
    var h = 0.0;
    var i = 0;
    for (var j = 0; j < g.length; j++) {
      var k = g[j];
      var l = k.turnSpeed();
      var m = (!(d > 0.1)) || l < c;
      var n = k.suspectFlip(e - 2 * f);
      if (n != true && m) {
        h += Math.abs(k.speed(a));
        i++;
        if (i > 2) {
          break;
        }
      }
    }
    var o = (i == 0) ? this.lastStep().speed(a) : h / i;
    var p = this.lastSpeedSign(a);
    return p * o < 0 ? p * o : o;
  };
  o.prototype.wallSpeed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = 0;
    var d = this.stepsTo(b);
    var e = 0.0;
    for (var f = 0; f < d.length; f++) {
      var g = d[f];
      if (g.hasWallSpeed(a)) {
        var h = g.wallSpeed(a);
        e += Math.abs(h);
        c++;
        if (c > 2) {
          break;
        }
      }
    }
    var i = c > 0 ? e / c : Math.max(Math.abs(this.maxSpeed(a, 5)), Math.abs(this.minSpeed(a, 5)), 0.1);
    var j = this.lastSpeedSign(a);
    return j * i < 0 ? j * i : i;
  };
  o.prototype.lastSpeedSign = function (a)
  {
    if (this.data.length < 2) {
      return 1;
    }
    if (this.data.length == 2) {
      return this.lastStep().speedSign();
    }
    var b = this.averageMoveRatio(a, 5);
    var c = this.stdDevMoveRatio(a, 5, 0.1);
    var d = this.lastStep();
    var e = this.previousStep();
    var f = 3;
    while (!e.hasSpeed()) {
      if (this.data.length <= f) {
        return d.speedSign();
      }
      e = this.stepTo(this.data.length - f);
      f++;
    }
    if ((d.isWallHugger(a) && d.hasWallSpeed(a)) || (!d.isWallHugger(a) && d.turnSpeed() < 0.3 && d.cannonTurnSpeed() < 0.3)) {
      if (d.suspectFlip(b - 2 * c) != true) {
        return d.speedSign();
      }
      return d.speedSign() * e.speedSign() > 0 ? -1 * d.speedSign() : d.speedSign();
    }
    return e.speedSign();
  };
  o.prototype.averageSpeed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = this.stepsTo(b);
    var d = 0.0;
    var e = 0;
    for (var f = 0; f < c.length; f++) {
      var g = c[f];
      if (g.hasSpeed()) {
        d += g.speed(a);
        e++;
      }
    }
    if (e == 0) {
      return 0.1;
    }
    return d / e;
  };
  o.prototype.maxSpeed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = this.stepsTo(b);
    var d = -1.0;
    for (var e = 0; e < c.length; e++) {
      var f = c[e];
      if (f.hasSpeed()) {
        var g = f.speed(a);
        if (g > d) {
          d = g;
        }
      }
    }
    return d;
  };
  o.prototype.minSpeed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = this.stepsTo(b);
    var d = 1.0;
    for (var e = 0; e < c.length; e++) {
      var f = c[e];
      if (f.hasSpeed()) {
        var g = f.speed(a);
        if (g < d) {
          d = g;
        }
      }
    }
    return d;
  };
  o.prototype.stdDevSpeed = function (a, b, c)
  {
    var d = this.averageSpeed(a, b);
    var e = this.stepsTo(b);
    var f = 0.0;
    for (var g = 0; g < e.length; g++) {
      var h = e[g].speed(a);
      f += Math.pow(h - d, 2);
    }
    var i = Math.sqrt(f) / e.length;
    return i < c ? c : i;
  };
  o.prototype.averageMoveRatio = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = this.stepsTo(b);
    var d = 0.0;
    var e = 0;
    for (var f = 0; f < c.length; f++) {
      var g = c[f];
      if (g.hasSpeed()) {
        var h = g.moveRatio();
        d += h;
        e++;
      }
    }
    if (e == 0) {
      return this.lastStep().moveRatio();
    }
    return d / b;
  };
  o.prototype.stdDevMoveRatio = function (a, b, c)
  {
    var d = this.averageMoveRatio(a, b);
    var e = this.stepsTo(b);
    var f = 0;
    var g = 0.0;
    for (var h = 0; h < e.length; h++) {
      var i = e[h];
      if (i.hasSpeed()) {
        var j = i.moveRatio();
        g += Math.pow(j - d, 2);
        f++;
      }
    }
    if (f == 0) {
      return c;
    }
    var k = Math.sqrt(g) / f;
    return k < c ? c : k;
  };
  o.prototype.averageTurnSpeed = function (a, b)
  {
    if (this.data.length < 2) {
      return 0;
    }
    b = this.data.length < (b + 1) ? this.data.length - 1 : b;
    var c = this.stepsTo(b);
    var d = 0.0;
    for (var e = 0; e < c.length; e++) {
      d += c[e].turnSpeed();
    }
    return d / b;
  };
  o.prototype.stdDevTurnSpeed = function (a, b, c)
  {
    var d = this.averageTurnSpeed(a, b);
    var e = this.stepsTo(b);
    var f = 0.0;
    for (var g = 0; g < e.length; g++) {
      var h = e[g].turnSpeed();
      f += Math.pow(h - d, 2);
    }
    var i = Math.sqrt(f) / e.length;
    return i < c ? c : i;
  };
  o.prototype.cannonTurnSpeed = function (a)
  {
    if (this.data.length < 2) {
      return 0;
    }
    a = this.data.length < (a + 1) ? this.data.length - 1 : a;
    var b = this.stepsTo(a);
    var c = 0.0;
    for (var d = 0; d < b.length; d++) {
      c += b[d].cannonTurnSpeed();
    }
    return c / a;
  };
  o.prototype.stepTo = function (a)
  {
    return new p(this.data[a - 1], this.data[a]);
  };
  o.prototype.stepsTo = function (a)
  {
    var b = [];
    var c = 0;
    var d = this.data.length - 1;
    while (c < a && d > 0) {
      b.push(this.stepTo(d));
      c++;
      d--;
    }
    return b;
  };
  o.prototype.last = function ()
  {
    if (!this.any()) {
      return null;
    }
    return this.data[this.data.length - 1];
  };
  o.prototype.lastStep = function ()
  {
    return this.stepTo(this.data.length - 1);
  };
  o.prototype.previousStep = function ()
  {
    return this.stepTo(this.data.length - 2);
  };
  o.prototype.any = function ()
  {
    return this.data.length != 0;
  };
  o.prototype.isWallHugger = function (a)
  {
    var b = this.last().robot.position;
    var c = this.last().robot.direction;
    var d = a.arena.borderRect.getClosestLines(b);
    var e = d[0].distanceToPoint(b);
    if (e < a.arena.radius + 2) {
      if (e < a.arena.radius + 2) {
        if (d[1].distanceToPoint(b) < a.arena.radius + 2) {
          return !a.arena.marginRect.isPointWithin(b.add(c.scale(5)), 0) && !a.arena.marginRect.isPointWithin(b.add(c.scale(5)), 0);
        }
        if (d[0].direction().isParallelTo(c)) {
          return true;
        }
        if (this.data.length == 1) {
          return false;
        }
        return this.lastStep().isWallHugger(a);
      }
    }
    return false;
  };
  o.prototype.timeSinceLast = function (a)
  {
    if (!this.any()) {
      return 10000;
    }
    return a.time - this.last().time;
  };
  o.prototype.isHunting = function (a)
  {
    if (!this.any()) {
      return false;
    }
    if (this.timeSinceLast(a) > 400) {
      return false;
    }
    if (this.last().robot.parentId != null) {
      if (this.hasSoughtMin && this.hasSoughtMax) {
        return false;
      }
      return this.timeSinceLast(a) < 200;
    }
    return true;
  };
  o.prototype.isTracking = function (a)
  {
    if (!this.isHunting(a)) {
      return false;
    }
    if (this.data.length < 2) {
      return false;
    }
    return true;
  };
  o.prototype.lastTime = function ()
  {
    return this.any() ? this.last().time : -5000;
  };
  function p(a, b)
  {
    this.previous = a;
    this.last = b;
  }

  p.prototype.previousRay = function ()
  {
    return new d(this.previous.robot.position, this.previous.robot.direction);
  };
  p.prototype.lastRay = function ()
  {
    return new d(this.last.robot.position, this.last.robot.direction);
  };
  p.prototype.timeStep = function ()
  {
    return this.last.time - this.previous.time;
  };
  p.prototype.vectorStep = function ()
  {
    return this.previous.robot.position.vectorTo(this.last.robot.position);
  };
  p.prototype.angleDiff = function ()
  {
    return this.last.robot.angle - this.previous.robot.angle;
  };
  p.prototype.cannonAngleDiff = function ()
  {
    return this.last.robot.cannonAngle - this.previous.robot.cannonAngle;
  };
  p.prototype.speed = function (a)
  {
    if (this.isWallHugger(a)) {
      return this.wallSpeed(a);
    }
    var b = this.vectorStep().length();
    var c = this.timeStep();
    if (Math.abs(b) < 1e-2) {
      return 0.01;
    }
    var d = this.speedSign();
    var e = d * b / c;
    return e;
  };
  p.prototype.wallSpeed = function (a)
  {
    var b = this.previous.robot.position;
    var c = a.arena.marginRect.getClosestLines(b)[0];
    var d = this.last.robot.position;
    var e = a.arena.marginRect.getClosestLines(d)[0];
    var f = this.timeStep();
    var g = this.angleDiff();
    var h = f - Math.abs(g);
    if (c == e) {
      var i = this.vectorStep().length();
      if (Math.abs(i) < 1e-2) {
        return 0.01;
      }
      return this.speedSign() * i / h;
    }
    var j = this.previousRay();
    var k = this.lastRay();
    var l = j.intersectionPoint(k);
    var m = this.previous.robot.position.distanceTo(l) + l.distanceTo(this.last.robot.position);
    if (Math.abs(m) < 1e-2) {
      return 0.01;
    }
    return this.speedSign() * m / h;
  };
  p.prototype.hasSpeed = function ()
  {
    var a = this.angleDiff();
    var b = this.cannonAngleDiff();
    var c = this.timeStep() - Math.abs(a) - Math.abs(b);
    if (c < 10) {
      return false;
    }
    var d = this.vectorStep().length();
    return d > 10;
  };
  p.prototype.hasWallSpeed = function (a)
  {
    if (!this.isWallHugger(a)) {
      return false;
    }
    var b = this.previous.robot.position;
    var c = a.arena.marginRect.getClosestLines(b)[0];
    var d = this.last.robot.position;
    var e = a.arena.marginRect.getClosestLines(d)[0];
    var f = this.timeStep();
    var g = this.angleDiff();
    if (Math.abs(g) > 10) {
      return false;
    }
    var h = this.cannonAngleDiff();
    var i = f - Math.abs(g);
    if ((i - Math.abs(h)) < 10) {
      return false;
    }
    if (c.distanceToPoint(b) > (a.arena.radius + 2) || e.distanceToPoint(d) > (a.arena.radius + 2)) {
      return false;
    }
    if (this.vectorStep().length() < 10) {
      return false;
    }
    if (c != e) {
      var j = c.direction();
      var k = e.direction();
      if (j.isParallelTo(k)) {
        return false;
      }
      var l = this.previousRay();
      var m = this.lastRay();
      if (l.direction.isParallelTo(m.direction)) {
        return false;
      }
    }
    return true;
  };
  p.prototype.speedSign = function ()
  {
    var a = this.vectorStep();
    if (a.length() < 1) {
      return 1;
    }
    return this.last.robot.direction.dotProduct(a) < 0 ? -1 : 1;
  };
  p.prototype.turnSpeed = function ()
  {
    var a = this.angleDiff() / (this.timeStep());
    return a;
  };
  p.prototype.cannonTurnSpeed = function ()
  {
    var a = this.cannonAngleDiff() / (this.timeStep());
    return a;
  };
  p.prototype.suspectFlip = function (a)
  {
    var b = this.moveRatio();
    var c = b < a && Math.abs(this.turnSpeed()) < 0.3 && Math.abs(this.cannonTurnSpeed()) < 0.3;
    return c;
  };
  p.prototype.moveRatio = function ()
  {
    var a = this.angleDiff();
    var b = this.cannonAngleDiff();
    var c = this.timeStep() - Math.abs(a) - Math.abs(b);
    if (Math.abs(c) < 5) {
      return 1;
    }
    var d = this.vectorStep().length();
    return d / c;
  };
  p.prototype.isWallHugger = function (a)
  {
    var b = this.last.robot.position;
    var c = a.arena.marginRect.getClosestLines(b)[0];
    if (c.distanceToPoint(b) > (a.arena.radius + 2)) {
      return false;
    }
    if (this.last.robot.direction.isParallelTo(c.direction())) {
      return true;
    }
    return this.isTurningAtWall(a);
  };
  p.prototype.isTurningAtWall = function (a)
  {
    var b = this.angleDiff();
    if (Math.abs(b) < 1) {
      return false;
    }
    var c = this.previousRay().intersectionPoint(this.lastRay());
    var d = this.last.robot.position;
    if (a.arena.marginRect.minDistanceToPoint(d) > 2) {
      return false;
    }
    return a.arena.marginRect.minDistanceToPoint(c) < 2;
  };
  function q(a, b, c, d)
  {
    this.targetPoint = b;
    this.cannonRelativeAngle = a.cannonRelativeAngle;
    this.arcEnum = d;
    this.createdTime = a.time;
    this.targetTime = 0;
    this.setup(a, c);
  };
  q.stdSeekArcEnum = function ()
  {
    return 1;
  };
  q.minSeekArcEnum = function ()
  {
    return 2;
  };
  q.maxSeekArcEnum = function ()
  {
    return 3;
  };
  q.attackArcEnum = function ()
  {
    return 4;
  };
  q.scanArcEnum = function ()
  {
    return 5;
  };
  q.cruiseArcEnum = function ()
  {
    return 6;
  };
  q.prototype.setup = function (a, b)
  {
    if (b < 0) {
      b = 0;
    }
    if (this.strafeDirection != a.strafeDirection) {
      this.strafeDirection = a.strafeDirection;
      this.strafeDirectionChangedTime = a.time;
    }
    var c = a.position;
    var d = this.getArcRadius(a, b, this.targetPoint);
    var e = d.radius;
    if (this.targetTime == 0) {
      this.targetTime = a.time + d.timeOffset;
    }
    var g = this.cannonAngleToTarget(a.position, a.cannonDirection, this.targetPoint);
    var h = this.convexDirection(a, false);
    this.arc = Math.abs(e) > 0.1 ? new f(c.add(h.scale(e)), e) : new f(c, e);
    this.direction = (Math.abs(e) > 0) ? a.strafeDirection * a.sign(e) : a.sign(g);
  };
  q.prototype.angleLeftToTarget = function (a)
  {
    var b = this.cannonAngleToTarget(a.position, a.cannonDirection, this.targetPoint);
    return b * this.direction;
  };
  q.prototype.timeLeftToTarget = function (a)
  {
    return this.targetTime - a.time;
  };
  q.prototype.isPastEnd = function (a, b)
  {
    var c = a.position;
    var d = a.cannonDirection;
    var e = this.cannonAngleToTarget(c, d, b);
    if (this.direction > 0 && e > 0) {
      return false;
    }
    if (this.direction < 0 && e < 0) {
      return false;
    }
    return true;
  };
  q.prototype.getArcRadius = function (a, b, c)
  {
    var f = a.position;
    var g = a.cannonDirection;
    var h = Math.abs(this.cannonAngleToTarget(a.position, a.cannonDirection, c));
    if (h > 90 || b > 50 || b < 2) {
      return new r(h, 0);
    }
    var i = h * a.strafeDirection;
    var j = new d(f, g);
    var k = j.closestPoint(c);
    var l = new e(k, f);
    if (l.length() < 0.1) {
      return new r(b, f.vectorTo(c).dotProduct(g));
    }
    var m = 1;
    var n = (Math.abs(i) > b) ? new r(Math.abs(i), 0) : null;
    while (m < Math.max(b, Math.abs(h))) {
      var o = l.direction().rotate(a.strafeDirection * m);
      var p = new d(c, o);
      var q = l.direction().rotate(-1 * a.strafeDirection * m);
      var s = new d(c, q);
      var t = p.intersectionPoint(l);
      var u = s.intersectionPoint(l);
      var v = f.vectorTo(t);
      var w = f.vectorTo(u);
      var x = 2 * Math.PI * v.length() * m / 360;
      var y = 2 * Math.PI * w.length() * m / 360;
      var z = (m + x);
      var A = (m + y);
      var B = v.dotProduct(g);
      var C = w.dotProduct(g);
      if (A > b && C < 0) {
        if (n == null) {
          n = new r(A, C);
        } else {
          var D = A - b;
          var E = n.timeOffset - b;
          if (D < E) {
            n = new r(A, C);
          }
        }
      }
      if (z > b && B > 0) {
        if (n == null) {
          n = new r(z, B);
        } else {
          var F = z - b;
          var E = n.timeOffset - b;
          if (F < E) {
            n = new r(z, B);
          }
        }
      }
      m++;
    }
    if (n == null) {
      return new r(Math.abs(i), 0);
    }
    return n;
  };
  q.prototype.cannonAngleToTarget = function (a, b, c)
  {
    var d = a.vectorTo(c);
    return b.signedAngleTo(d);
  };
  q.prototype.isConvex = function (a)
  {
    var b = a.position.vectorTo(this.arc.centerPoint);
    return b.dotProduct(a.cannonDirection) < 0;
  };
  q.prototype.convexDirection = function (a, b)
  {
    var c = a.direction;
    var d = a.cannonDirection;
    var e = c.signedAngleTo(d) < 0 ? (b == true) ? c.rotate(90) : c.rotate(-90) : (b == true) ? c.rotate(-90) : c.rotate(+90);
    return e;
  };
  q.prototype.getMoveSign = function (a)
  {
    if (this.arc.centerPoint.distanceTo(a.position) < 0.1) {
      return this.direction;
    }
    var b = this.arc.positiveTangentDirection(a.position);
    var c = b.dotProduct(a.direction);
    var d = this.direction * a.sign(c);
    return d;
  };
  q.prototype.update = function (a, b)
  {
    var c = (b != null) ? b.distanceTo(this.targetPoint) : 0;
    if (Math.abs(a.cannonRelativeAngle - this.cannonRelativeAngle) > 1 || a.strafeDirection != this.strafeDirection || c > 3 || this.targetTime < a.time) {
      this.targetPoint = b;
      this.cannonRelativeAngle = a.cannonRelativeAngle;
      this.setup(a, this.targetTime - a.time);
    }
  };
  q.prototype.getPosAtTime = function (a, b)
  {
    var c = this.arc.angleAtPos(a);
    var d = this.arc.radius * 2 * Math.PI / 360;
    var e = c + b / (1 + d) * this.direction;
    return this.arc.posAtAngle(e);
  };
  q.prototype.isSeekArc = function ()
  {
    return this.arcEnum == q.maxSeekArcEnum() || this.arcEnum == q.minSeekArcEnum() || this.arcEnum == q.stdSeekArcEnum();
  };
  q.prototype.isStdSeekArc = function ()
  {
    return this.arcEnum == q.stdSeekArcEnum();
  };
  q.prototype.isMinSeekArc = function ()
  {
    return this.arcEnum == q.minSeekArcEnum();
  };
  q.prototype.isMaxSeekArc = function ()
  {
    return this.arcEnum == q.maxSeekArcEnum();
  };
  q.prototype.isAttacArc = function ()
  {
    return this.arcEnum == q.attackArcEnum();
  };
  q.prototype.isScanArc = function ()
  {
    return this.arcEnum == q.scanArcEnum();
  };
  q.prototype.isCruiseArc = function ()
  {
    return this.arcEnum == q.cruiseArcEnum();
  };
  function r(a, b)
  {
    this.timeOffset = a;
    this.radius = b;
  }

  function s(a)
  {
    this.strafeDirection = 0;
    this.tracker = new i();
    this.arena = new h(a);
    this.id = a.id;
    this.parentId = a.parentId;
    this.update(a);
    this.time = 0;
    this.isInitialized = false;
  }

  s.prototype.update = function (a)
  {
    this.time++;
    this.id = a.id;
    this.parentId = a.parentId;
    this.direction = b.FromAngle(a.angle);
    this.position = new c(a.position.x, a.position.y);
    this.cannonDirection = b.FromAngle(a.cannonAbsoluteAngle - 90);
    this.cannonRelativeAngle = a.cannonRelativeAngle;
    this.gunCoolDownTime = a.gunCoolDownTime;
  };
  s.prototype.getScanningCannonAngle = function (a)
  {
    if (a.cannonRelativeAngle > 90 && a.cannonRelativeAngle < 270) {
      return 180;
    }
    return 0;
  };
  s.prototype.getRotationDirection = function (a, b)
  {
    var c = b - a;
    if (c < -180) {
      c += 360;
    }
    if (c > 180) {
      c -= 360;
    }
    return this.sign(c);
  };
  s.prototype.angleDiff = function (a, b)
  {
    var c = b - a;
    if (Math.abs(c) < 180) {
      return c;
    } else {
      while (Math.abs(c) > 180) {
        c -= this.sign(c) * 360;
      }
      return c;
    }
  };
  s.prototype.sign = function (a)
  {
    if (a < 0) {
      return -1;
    }
    if (a > 0) {
      return 1;
    }
    return 0;
  };
})();
