
/*
 * stores one half edge effectively. give it a start point and the left and right neighbours and it 
 * will calc the gradient, and store this in m.
 * it will calc the intersection point with the y axis and store this in c.
 * it will then calc the direction of the edge, which is a vector
 *
 */ 

function Edge(start,leftpoint,rightpoint)
{
  this.start = start;
  this.m = -1 / ((leftpoint.y-rightpoint.y)/(leftpoint.x-rightpoint.x));
  this.c = start.y - this.m * start.x;
  this.dir = {x:-1*(leftpoint.y-rightpoint.y), y:leftpoint.x-rightpoint.x};
  this.adjacent = null;
  this.end = null;

  this.addAdjacent = function(edge)
  {
    this.adjacent = edge;
  }
}
	
