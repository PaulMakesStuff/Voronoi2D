  /**
 * @file Produces a simple 2D voronoi diagram
 * @author Paul Reed <reedpaul7@gmail.com>
 * @version 1.0
 *
 * @license
 * Copyright (c) 2017 Paul Reed
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


let number = 1000;
let width = window.innerWidth;
let height = window.innerHeight;
let sites = [];
let edges = [];
let queue = new Queue();
let sweepY = 0;
let beachline = null;

var canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;

generateVoronoi(number,width,height);
drawVoronoi();

function generateVoronoi(number,width,height)
{
  for(let i = 0; i < number; i++) /* populate the event queue with sites */
  {
    queue.insert({point:{x:Math.random()*width,y:Math.random()*height},
            isSiteEvent:true,
                   node:null});    
  }
  
  beachline = new Node(queue.max().point,0); /* beachline will store a reference to the first node on the line each subsequent node will be linked to the previous node */
  
  while(queue.notEmpty()) /* cycle the event queue */
  {
    let event = queue.max();
    sweepY = event.point.y;
    if(event.isSiteEvent){addEvent(event);}
    else{removeEvent(event);}
  }
}

function drawVoronoi()
{
  context.strokeStyle = "black";
  context.lineWidth = 1.0;
  
  for(let j = 0; j < edges.length; j++)
  {
    drawLine(edges[j].start,edges[j].end);
  }
  
  context.strokeStyle = "red";
  context.lineWidth = 1.0;
  
  for(let i = 0; i < sites.length; i++)
  {
    drawCircle(sites[i],1.2);
  }
  
    context.strokeStyle = "blue";
  
  for(let i =0; i< edges.length; i++)
  {
   // drawCircle(edges[i].start,1.2);
    drawCircle(edges[i].end,1.5);
  }
}

/*
 * draws a circle centred on point, with specified radius, with a starting angle of 0, and an ending angle of 2pi (a circle)
 */

function drawCircle(point,radius)
{
	context.beginPath();
	context.arc(point.x, height-point.y, radius, 0, Math.PI*2);
	context.stroke();
}

/*
 * draws a simple line
 */

function drawLine(startpoint, endpoint)
{
  context.beginPath();
  context.moveTo(startpoint.x,height-startpoint.y);
  context.lineTo(endpoint.x,height-endpoint.y);
  context.closePath();
  context.stroke();
}

/*
 * add an event to the beach line, this is adding a new site to the voronoi diagram
 */

function addEvent(event)
{
  sites.push(event.point); /* add the event coordinate, the sites coordinate to the site array, this is used for drawing the diagram later */
  
  let newNode = new Node(event.point,0); /* create a new node with the new point */
  
  let node = getNodeOverPoint(event.point); /* node which needs to be split in two */  
  
  let start = {x:event.point.x, y:getY(node.point,event.point)};  /* starting point for the two new edges */
  
  let rightEdge = new Edge(start,event.point,node.point); /* two new edges either side of the new site (event) */
  let leftEdge = new Edge(start,node.point,event.point); /* two new edges either side of the new site (event) */
  
  leftEdge.addAdjacent(rightEdge); /* link up the two edges */
  rightEdge.addAdjacent(leftEdge); /* link up the two edges */
  
  let leftNode = new Node(leftEdge, 1); /* create a new node for the left edge - ready for inserting into beachline */
  let rightNode = new Node(rightEdge, 1); /* create a new node for the right edge - ready for inserting into beachline */
  
  let duplicateNode = new Node(node.point,0); /* create a duplicate of the existing node, this is because the node is split */
  
  duplicateNode.setNext(node.next); /* link up all of the nodes to create the finalised beach line */
  rightNode.setNext(duplicateNode);
  newNode.setNext(rightNode);
  leftNode.setNext(newNode);
  node.setNext(leftNode);
  
  if(node){ /* if the node which we have just split contains a circle event we need to remove it as we have just added new edges on either side */
    queue.removeEvent(node.circle);
    node.circle = null;
  }
  
  circleCheck(node); /* now the beachline has been edited, check the node and the newest node to see if a new circle event needs to be created */
  circleCheck(duplicateNode);  
}

/*
 * checks to see if it's possible that the edges on either side will converge enough for this node to disappear.
 * if it is possible we need to store this event in the event queue so we can look out for this
 */

function circleCheck(node)
{ 
  let leftEdge = node.previous?node.previous.edge:null; /* check to see if a left edge exists */
  let rightEdge = node.next?node.next.edge:null; /* check to see if a right edge exists */
  
  let intersection = getEdgeIntersection(leftEdge, rightEdge); /* get the intersection between these two edges if it exists */
  
  if(!intersection){return null;} /* if we don't have a valid intersection, return null */
  
  let dy = node.point.y - intersection.y;
  let dx = node.point.x - intersection.x;
  let rad = Math.sqrt(dx * dx + dy * dy); /* find the radius of the circle */
  
  if((intersection.y - rad) > sweepY){return;} /* if we've already passed the potential bottom of this event, we dont need to do anything */
  
  let circleEvent = {point:{x:intersection.x, y:intersection.y - rad}, isSiteEvent:false, node:node};

  node.circle = circleEvent; /* add a reference to the circle event in the node object */
  queue.insert(circleEvent); /* add this circle event to the event list */
}

/*
 * checks to see if an intersection is possible between the two supplied edges.
 * if no intersection is found the method returns null.
 */

function getEdgeIntersection(left,right)
{
  if(!left||!right){return null;} /* one or more edges are null */
  if(left.m==right.m){return null;} /* the edges are parallel */
  
  let x = (right.c-left.c)/(left.m-right.m);
  let y = (left.m * right.c - right.m * left.c) / (left.m - right.m);

  if(((x-left.start.x)/left.dir.x)<0){return null;}   /* wrong direction l-x */
  if(((y-left.start.y)/left.dir.y)<0){return null;}   /* wrong direction l-y */
  if(((x-right.start.x)/right.dir.x)<0){return null;} /* wrong direction r-x */
  if(((y-right.start.y)/right.dir.y)<0){return null;} /* wrong direction r-y */
  
  return {x:x, y:y};
}

/*
 * gets the y coordinate on a parabola. It takes the parabolas focus point (its site) and the new 
 * point we want to add to the beach line. It then traces a line up to the intersection point with 
 * the parabola. This point is the new starting point for an edge 
 */
 
function getY(focus, eventpoint)
{
  let p = (focus.y - sweepY)/2; /* p is the distance between parabolas focus and its vertex, OR distance from the parabolas vertex to its directrix (the sweep line) */
  let h = focus.x;              /* h is the x coord. of parabola vertex */
  let k = focus.y - p;          /* k is the y coord. of parabola vertex */
  let a = 1/(4*p);
  let b = (-1*h)/(2*p);
  let c = ((h*h)/(4*p))+k;
  return a*eventpoint.x*eventpoint.x+b*eventpoint.x+c; /* use quadratic formula to return y coordinate */ 
}

/*
 * returns the node in the beachline which is directly above the new point we're inserting
 */

function getNodeOverPoint(point)
{
  if(!beachline){return;} /* should not be called, beachline should always be initialised */
  
  let siteNode = beachline; /* beachline stores a references to the left most node in the beachline */
  let edgeNode = siteNode.next; /* it is possible this will be null - this will be the case when the beachline only has one site element */
  let x = null; /* temporary intersection point */
  
  while(edgeNode && edgeNode.next) /* while we actually have an adjacent edge to the right, and another point to the right of that */
  {
    if(edgeNode.edge.dir.x==0){alert("error 1");return edgeNode.edge.start.x;} /* vertical edge, return edge start point.x */
    
    let parabola = getEquationOfParabola(siteNode.point,sweepY); /* takes the sites coordinate, and the current position of the sweep line and returns the equation of the parabola */
  
    let A = parabola.A;
    let B = parabola.B - edgeNode.edge.m;
    let C = parabola.C - edgeNode.edge.c;
    
    let discriminant = (B*B)-(4*A*C);
    let X1 = ((-1*B)+Math.sqrt(discriminant))/(2*A);
    let X2 = ((-1*B)-Math.sqrt(discriminant))/(2*A);
    
    let min = X1<X2?X1:X2;
    let max = X1>X2?X1:X2;
    x = edgeNode.edge.dir.x<0?min:max;
    
    if(point.x == x){alert("warning p.x==x!");}
    
    if(point.x < x){return siteNode;}
    
    siteNode = edgeNode.next;
    edgeNode = siteNode.next; 
  }
  
  
  return siteNode; /* we've reached the end of the beach line to return the last element (or the only element) */
}

/*
 * returns the equation of the parabola in the form, A, B and C.
 */

function getEquationOfParabola(point,sweepY)
{
  let k = (point.y+sweepY)/2;
  let p = (point.y-sweepY)/2;
  let A = 1/(4*p);
  let B = (-1*point.x)/(2*p);
  let C = ((point.x*point.x)/(4*p))+k;
  return {A:A, B:B, C:C};
}

/*
 * remove a parabola from the beachline, at this point edges need to be closes off and the parabola removed.
 */

function removeEvent(event)
{
  let leftEdge = event.node.previous?event.node.previous.edge:null;
  let rightEdge = event.node.next?event.node.next.edge:null;
    
  let intersection = getEdgeIntersection(leftEdge,rightEdge);
  if(!intersection){alert("remove circle event failed");return;} /* this should never happen */
  
  leftEdge.end = intersection; /* both the edges meet - so assign their end point */
  rightEdge.end = intersection; /* both the edges meet - so assign their end  point */
  
  edges.push(leftEdge); /* left edge has had second vertex added to add to edges array */
  edges.push(rightEdge); /* right edges has endpoint assigned, add to edges array */
  
  let leftSite = event.node.previous.previous;
  let rightSite = event.node.next.next;
  
  if(leftSite&&rightSite)
  { 
    let newNode = new Node(new Edge(intersection, leftSite.point, rightSite.point), 1); /* create a n ew edge between the left and right sites */
    
    newNode.setNext(rightSite); /* add the new node to the beach line */
    leftSite.setNext(newNode);
    
    if(leftSite.circle) /* if the left site has a circle event, remove it as we're inserting a new edge */
    {
      queue.removeEvent(leftSite.circle);
      leftSite.circle = null;
    }
    if(rightSite.circle) /* if the right side has a circle event, remove it as we're inserting a new edge */
    {
      queue.removeEvent(rightSite.circle);
      rightSite.circle = null;
    }
    
    circleCheck(newNode.previous); /* now we have reconnected the beach line, check the circle points */
    circleCheck(newNode.next);
  }
}