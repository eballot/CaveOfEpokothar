/* The source code in this file was obtained from http://roguebasin.roguelikedevelopment.org/index.php/Permissive_Field_of_View_in_Javascript */

/** Compute the field of view from (ox, oy) out to radius r. */
function fieldOfView(ox, oy, r, visit, blocked) {
  visit(ox, oy); // origin always visited.
  
  function quadrant(dx, dy) {
    var light = new Light(r);
    for (var dr = 1; dr <= r; dr += 1) {
      for (var i = 0; i <= dr; i++) {
        // Check for light hitting this cell.
        var cell = new Pt(dr - i, i),
            arc = light.hits(cell);
        if (!arc) { continue; }  // unlit

        // Show the lit cell, check if blocking.
        var ax = ox + cell.x * dx,
            ay = oy + cell.y * dy;
        visit(ax, ay);
        if (!blocked(ax, ay)) { continue; }  // unblocked

        // Blocking cells cast shadows.
        if (!light.shade(arc, cell)) { return; }  // no more light
      }
    }
  }

  quadrant(-1, +1); quadrant(+1, +1);
  quadrant(-1, -1); quadrant(+1, -1);
}

/** Helper methods for points. */
function Pt(x, y) { this.x = x; this.y = y; }
Pt.prototype.toString = function() { return '(' + this.x + ',' + this.y + ')'; }
Pt.prototype.copy = function() { return new Pt(this.x, this.y); }

/** Helper methods for lines. */
function Ln(p, q) { this.p = p; this.q = q; }
Ln.prototype.toString = function() { return this.p + '-' + this.q; }
Ln.prototype.copy = function() { return new Ln(this.p.copy(), this.q.copy()); }
Ln.prototype.cw = function(pt) { return this.dtheta(pt) > 0; }
Ln.prototype.ccw = function(pt) { return this.dtheta(pt) < 0; }
Ln.prototype.dtheta = function(pt) {
  var theta = Math.atan2(this.q.y - this.p.y, this.q.x - this.p.x),
      other = Math.atan2(pt.y - this.p.y, pt.x - this.p.x),
      dt = other - theta;
  return ((dt > -Math.PI) ? dt : (dt + 2 * Math.PI)).toFixed(5);
}

/** Helper methods for arcs. */
function Arc(steep, shallow) {
  this.steep = steep;
  this.shallow = shallow;
  this.steepbumps = [];
  this.shallowbumps = [];
}

Arc.prototype.toString = function() {
  return '[' + this.steep + ' : ' + this.shallow + ']';
}

Arc.prototype.copy = function() {
  var c = new Arc(this.steep.copy(), this.shallow.copy());
  for (i in this.steepbumps) {
    c.steepbumps.push(this.steepbumps[i].copy());
  }
  for (i in this.shallowbumps) {
    c.shallowbumps.push(this.shallowbumps[i].copy());
  }
  return c;
}

Arc.prototype.hits = function(pt) {
  return (this.steep.ccw(new Pt(pt.x + 1, pt.y)) &&
          this.shallow.cw(new Pt(pt.x, pt.y + 1)));
}

/** Bump this arc clockwise (a steep bump). */
Arc.prototype.bumpCW = function(pt) {
  // Steep bump.
  var sb = new Pt(pt.x + 1, pt.y);
  this.steepbumps.push(sb);
  this.steep.q = sb;
  for (var i in this.shallowbumps) {
    var b = this.shallowbumps[i];
    if (this.steep.cw(b)) { this.steep.p = b; }
  }
}

/** Bump this arc counterclockwise (a shallow bump). */
Arc.prototype.bumpCCW = function(pt) {
  var sb = new Pt(pt.x, pt.y + 1);
  this.shallowbumps.push(sb);
  this.shallow.q = sb;
  for (var i in this.steepbumps) {
    var b = this.steepbumps[i];
    if (this.shallow.ccw(b)) { this.shallow.p = b; }
  }
}

Arc.prototype.shade = function(pt) {
  var steepBlock = this.steep.cw(new Pt(pt.x, pt.y + 1)),
      shallowBlock = this.shallow.ccw(new Pt(pt.x + 1, pt.y));
  if (steepBlock && shallowBlock) {
    // Completely blocks this arc.
    return [];
  } else if (steepBlock) {
    // Steep bump.
    this.bumpCW(pt);
    return [this];
  } else if (shallowBlock) {
    // Shallow bump.
    this.bumpCCW(pt);
    return [this];
  } else {
    // Splits this arc in twain.
    var a = this.copy(), b = this.copy();
    a.bumpCW(pt); b.bumpCCW(pt);
    return [a, b];
  }
}

/** Helper methods for a collection of arcs covering a quadrant. */
function Light(radius) {
  var wide = new Arc(
      new Ln(new Pt(1, 0), new Pt(0, radius)),
      new Ln(new Pt(0, 1), new Pt(radius, 0)));
  this.arcs = [wide];
}

Light.prototype.hits = function(pt) {
  for (var i in this.arcs) {
    // Cannot just return i, in case it's zero.
    if (this.arcs[i].hits(pt)) { return { i: i }; }
  }
  return false;
}

Light.prototype.shade = function(arci, pt) {
  var arc = this.arcs[arci.i],
      splice = this.arcs.splice;
  // Shade the arc with this point, replace it with new arcs (or none).
  splice.apply(this.arcs, [arci.i, 1].concat(arc.shade(pt)));
  return this.arcs.length > 0;
}
