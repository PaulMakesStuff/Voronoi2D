function Queue()
{
	/* array to store all of the elements in the queue */
	
	this.array = []
	
	/* insert element into the queue, ensuring that we enter it in order based upon the y coordinate */
	
	this.insert = function(E)
	{
		if(this.array.length==0)
		{
			this.array.push(E);
		}
		else 
		{
			for(var i=0;i<this.array.length;i++)
			{	
				if(this.array[i].point.y<E.point.y) // add to array, larger first
				{
					this.array.splice(i, 0, E);
					break;
				}
				else if(this.array[i].point.y==E.point.y) // if pts share same y coord, order by x coord.
				{
					if(this.array[i].point.x<E.point.x)
					{
						this.array.splice(i,0,E);
						break;
					}
				}
				else if(i+1==this.array.length) // add to the end of the array
				{
					this.array.push(E);
					break;
				}
			}
		}
	}
	
	/* returns the maximum element in the queue and removes it from the queue */
	
	this.max = function()
	{
		R = this.array[0];
		this.array.splice(0,1); // remove first index
		return R;
		
	}
	
	/* returns a count of the number of elements within the queue */
	
	this.count = function()
	{
		return this.array.length;
	}
	
	/* returns the object at the specified index */
	
	this.objectAtIndex = function(i)
	{
		return this.array[i];
	}
	
	this.notEmpty = function()
	{
		return this.array.length>0;
	}
	
	/* returns a copy of the queue in string form */
	
	this.toString = function()
	{
		R = "printList{<br/>";
		for(j=0;j<this.array.length;j++)
		{
			R=R+"("+this.array[j].P.x+", "+this.array[j].P.y+")<br/>";
		}
		R=R+"};<br/>";
		return R;
	}
	
	/* removes the object E from the queue, if it exists, returns null if it wasnt found */
	
	this.removeEvent = function(E)
	{
		if(this.array.length==0){return null;}
		
		for(var i=0;i<this.array.length;i++)
		{
			if(this.array[i]===E)
			{
				this.array.splice(i,1);
			}
		}
		
		
		
	}
}