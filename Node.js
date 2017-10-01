
/* linked list node */

function Node(data,type) {
	
  /* linked list node which is used in the beach line */
  /* node could be a parabola (site) object, or an edge object. Type is 0 for site, 1 for edge */
  /* a site object in the beach line may have a circle event associated with it which might mean it will be removed imminently as the adj. edges converge */

  if(type==0)
  {
    this.point = data;
    this.edge = null;
    this.type = 0;
  }
  else
  {
    this.edge = data;
    this.point = null;
    this.type = 1;
  }
    
  this.next = null;
  this.previous = null;
  this.circle = null;

  
  /* set next, method also sets the previous of the next node to this node */
  
	this.setNext = function(N)
	{
		if(N){N.previous = this;}
		this.next = N;
	}
  
}
	
