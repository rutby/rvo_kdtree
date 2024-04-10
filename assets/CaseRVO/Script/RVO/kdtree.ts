import { Obstacle, RVOMath } from "./common";
import { Simulator } from "./simulator";

export class FloatPair {
    public a = null;
    public b = null;

    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    public mt(rhs) {
        return this.a < rhs.a || !(rhs.a < this.a) && this.b < rhs.b;
    };
    
    public met(rhs) {
        return (this.a == rhs.a && this.b == rhs.b) || this.mt(rhs); 
    };
    
    public gt(rhs) {
        return !this.met(rhs);
    };
    
    public get(rhs) {
        return !this.mt(rhs);
    };
}

class AgentTreeNode {
    begin: number;
    end: number;
    left: number;
    right: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
}

class ObstacleTreeNode {
    obstacle: Obstacle;
    left: ObstacleTreeNode;
    right: ObstacleTreeNode;
}

export class KdTree {
    public MAXLEAF_SIZE = 100;
	agents = []; // Agent[]
	agentTree = []; // AgentTreeNode[]
	obstacleTree = {}; // ObstacleTreeNode
	
	buildAgentTree() {
		if (this.agents.length != Simulator.instance.getNumAgents()) {
			this.agents = Simulator.instance.agents;
			
			for (var i = 0; i < 2 * this.agents.length; i++) {
				this.agentTree.push(new AgentTreeNode());
			}
		}
		
		if (this.agents.length > 0) {
			this.buildAgentTreeRecursive(0, this.agents.length, 0);
		}
	};
	
	buildAgentTreeRecursive(begin, end, node) {
		this.agentTree[node].begin = begin;
		this.agentTree[node].end = end;
		this.agentTree[node].minX = this.agentTree[node].maxX = this.agents[begin].position.x;
		this.agentTree[node].minY = this.agentTree[node].maxY = this.agents[begin].position.y;
		
		for (let i = begin + 1; i < end; ++i) {
			this.agentTree[node].maxX = Math.max(this.agentTree[node].maxX, this.agents[i].position.x);
			this.agentTree[node].minX = Math.min(this.agentTree[node].minX, this.agents[i].position.x);
			this.agentTree[node].maxY = Math.max(this.agentTree[node].maxY, this.agents[i].position.y);
			this.agentTree[node].minY = Math.min(this.agentTree[node].minY, this.agents[i].position.y);
		}
		
		if (end - begin > this.MAXLEAF_SIZE) {
			/* No leaf node. */
			let isVertical = this.agentTree[node].maxX - this.agentTree[node].minX > 
                             this.agentTree[node].maxY - this.agentTree[node].minY;
			var splitValue = 
                0.5 * (isVertical ? this.agentTree[node].maxX + this.agentTree[node].minX
                                  : this.agentTree[node].maxY + this.agentTree[node].minY);
			
			var left = begin;
			var right = end;
			
			while (left < right) {
				while (left < right && (isVertical ? this.agents[left].position.x : this.agents[left].position.y) < splitValue)
                {
                    ++left;
                }

                while (right > left && (isVertical ? this.agents[right - 1].position.x : this.agents[right - 1].position.y) >= splitValue)
                {
                    --right;
                }

                if (left < right)
                {
                    var tmp = this.agents[left];
                    this.agents[left] = this.agents[right - 1];
                    this.agents[right - 1] = tmp;
                    ++left;
                    --right;
                }
			}
			
			if (left == begin) {
				++left;
				++right;
			}
			
			this.agentTree[node].left = node + 1;
            this.agentTree[node].right = node + 2 * (left - begin);

            this.buildAgentTreeRecursive(begin, left, this.agentTree[node].left);
            this.buildAgentTreeRecursive(left, end, this.agentTree[node].right);
		}
	};
	
	buildObstacleTree() {
		var obstacles = Simulator.instance.obstacles;
		this.obstacleTree = this.buildObstacleTreeRecursive(obstacles);
	};
	
	buildObstacleTreeRecursive(obstacles) {
		if (obstacles.length == 0) {
			return null;
		} else {
			var node = new ObstacleTreeNode();
			var optimalSplit = 0;
            let minLeft = obstacles.length;
            let minRight = minLeft;
			
			for (var i=0; i<obstacles.length; ++i) {
				let leftSize = 0;
				let rightSize = 0;
				
				let obstacleI1 = obstacles[i];
				let obstacleI2 = obstacleI1.nextObstacle;
				
				for (var j=0; j<obstacles.length; j++) {
					if (i == j) {
						continue;
					}
					
					let obstacleJ1 = obstacles[j];
					let obstacleJ2 = obstacleJ1.nextObstacle;
					
					let j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
                    let j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);
					
                    if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON)
                    {
                        ++leftSize;
                    }
                    else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON)
                    {
                        ++rightSize;
                    }
                    else
                    {
                        ++leftSize;
                        ++rightSize;
                    }
                    
                    var fp1 = new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize));
                    var fp2 = new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight));
                    
                    if (fp1.get(fp2)) {
                    	break;
                    }
				}
				
				var fp1 = new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize));
				var fp2 = new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight));
				
				if (fp1.mt(fp2)) {
					minLeft = leftSize;
					minRight = rightSize;
					optimalSplit = i;
				}
			}
			
			{
                /* Build split node. */
				let leftObstacles = [];
                for (var n = 0; n < minLeft; ++n) leftObstacles.push(null);
                
                let rightObstacles = [];
                for (var n = 0; n < minRight; ++n) rightObstacles.push(null);

                let leftCounter = 0;
                let rightCounter = 0;
                i = optimalSplit;

                let obstacleI1 = obstacles[i];
                let obstacleI2 = obstacleI1.nextObstacle;

                for (var j = 0; j < obstacles.length; ++j)
                {
                    if (i == j)
                    {
                        continue;
                    }

                    let obstacleJ1 = obstacles[j];
                    let obstacleJ2 = obstacleJ1.nextObstacle;

                    let j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
                    let j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);

                    if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON)
                    {
                        leftObstacles[leftCounter++] = obstacles[j];
                    }
                    else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON)
                    {
                        rightObstacles[rightCounter++] = obstacles[j];
                    }
                    else
                    {
                        /* Split obstacle j. */
                        let t = RVOMath.det(obstacleI2.point.minus(obstacleI1.point), obstacleJ1.point.minus(obstacleI1.point)) / 
                        	RVOMath.det(obstacleI2.point.minus(obstacleI1.point), obstacleJ1.point.minus(obstacleJ2.point));

                        var splitpoint = obstacleJ1.point.plus( (obstacleJ2.point.minus(obstacleJ1.point)).scale(t) );

                        var newObstacle = new Obstacle();
                        newObstacle.point = splitpoint;
                        newObstacle.prevObstacle = obstacleJ1;
                        newObstacle.nextObstacle = obstacleJ2;
                        newObstacle.isConvex = true;
                        newObstacle.unitDir = obstacleJ1.unitDir;

                        newObstacle.id = Simulator.instance.obstacles.length;

                        Simulator.instance.obstacles.push(newObstacle);

                        obstacleJ1.nextObstacle = newObstacle;
                        obstacleJ2.prevObstacle = newObstacle;

                        if (j1LeftOfI > 0.0)
                        {
                            leftObstacles[leftCounter++] = obstacleJ1;
                            rightObstacles[rightCounter++] = newObstacle;
                        }
                        else
                        {
                            rightObstacles[rightCounter++] = obstacleJ1;
                            leftObstacles[leftCounter++] = newObstacle;
                        }
                    }
                }

                node.obstacle = obstacleI1;
                node.left = this.buildObstacleTreeRecursive(leftObstacles);
                node.right = this.buildObstacleTreeRecursive(rightObstacles);
                return node;
            }
		}
	}
	
	computeAgentNeighbors(agent, rangeSq) {
		this.queryAgentTreeRecursive(agent, rangeSq, 0);
	}
	
	computeObstacleNeighbors(agent, rangeSq) {
		this.queryObstacleTreeRecursive(agent, rangeSq, this.obstacleTree);
	}
	
	queryAgentTreeRecursive(agent, rangeSq, node) {
		if (this.agentTree[node].end - this.agentTree[node].begin <= this.MAXLEAF_SIZE)
        {
            for (var i = this.agentTree[node].begin; i < this.agentTree[node].end; ++i)
            {
                agent.insertAgentNeighbor(this.agents[i], rangeSq);
            }
        }
        else
        {
            let distSqLeft = RVOMath.sqr(Math.max(0, this.agentTree[this.agentTree[node].left].minX - agent.position.x)) + 
	            RVOMath.sqr(Math.max(0, agent.position.x - this.agentTree[this.agentTree[node].left].maxX)) + 
	            RVOMath.sqr(Math.max(0, this.agentTree[this.agentTree[node].left].minY - agent.position.y)) + 
	            RVOMath.sqr(Math.max(0, agent.position.y - this.agentTree[this.agentTree[node].left].maxY));

                let distSqRight = RVOMath.sqr(Math.max(0, this.agentTree[this.agentTree[node].right].minX - agent.position.x)) +
	            RVOMath.sqr(Math.max(0, agent.position.x - this.agentTree[this.agentTree[node].right].maxX)) +
	            RVOMath.sqr(Math.max(0, this.agentTree[this.agentTree[node].right].minY - agent.position.y)) +
	            RVOMath.sqr(Math.max(0, agent.position.y - this.agentTree[this.agentTree[node].right].maxY));

            if (distSqLeft < distSqRight)
            {
                if (distSqLeft < rangeSq)
                {
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left);

                    if (distSqRight < rangeSq)
                    {
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right);
                    }
                }
            }
            else
            {
                if (distSqRight < rangeSq)
                {
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right);

                    if (distSqLeft < rangeSq)
                    {
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left);
                    }
                }
            }

        }
	}
	
	// pass ref range
	queryObstacleTreeRecursive(/** Agent */ agent, rangeSq, /** ObstacleTreeNode */ node) {
        if (node == null)
        {
            return;
        }
        else
        {
            let obstacle1 = node.obstacle;
            let obstacle2 = obstacle1.nextObstacle;

            let agentLeftOfLine = RVOMath.leftOf(obstacle1.point, obstacle2.point, agent.position);

            this.queryObstacleTreeRecursive(agent, rangeSq, (agentLeftOfLine >= 0 ? node.left : node.right));

            let distSqLine = RVOMath.sqr(agentLeftOfLine) / RVOMath.absSq(obstacle2.point.minus(obstacle1.point));

            if (distSqLine < rangeSq)
            {
                if (agentLeftOfLine < 0)
                {
                    /*
                     * Try obstacle at this node only if is on right side of
                     * obstacle (and can see obstacle).
                     */
                    agent.insertObstacleNeighbor(node.obstacle, rangeSq);
                }

                /* Try other side of line. */
                this.queryObstacleTreeRecursive(agent, rangeSq, (agentLeftOfLine >= 0 ? node.right : node.left));
            }
        }
    }

    queryVisibility(/** Vector2 */ q1, /** Vector2 */ q2, radius)
    {
        return this.queryVisibilityRecursive(q1, q2, radius, this.obstacleTree);
    }

    queryVisibilityRecursive(/** Vector2 */ q1, /** Vector2 */ q2, radius, /** ObstacleTreeNode */ node)
    {
        if (node == null)
        {
            return true;
        }
        else
        {
            var obstacle1 = node.obstacle;
            var obstacle2 = obstacle1.nextObstacle;

            var q1LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q1);
            var q2LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q2);
            var invLengthI = 1.0 / RVOMath.absSq(obstacle2.point.minus(obstacle1.point));

            if (q1LeftOfI >= 0 && q2LeftOfI >= 0)
            {
                return this.queryVisibilityRecursive(q1, q2, radius, node.left) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || queryVisibilityRecursive(q1, q2, radius, node.right));
            }
            else if (q1LeftOfI <= 0 && q2LeftOfI <= 0)
            {
                return this.queryVisibilityRecursive(q1, q2, radius, node.right) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || queryVisibilityRecursive(q1, q2, radius, node.left));
            }
            else if (q1LeftOfI >= 0 && q2LeftOfI <= 0)
            {
                /* One can see through obstacle from left to right. */
                return this.queryVisibilityRecursive(q1, q2, radius, node.left) && this.queryVisibilityRecursive(q1, q2, radius, node.right);
            }
            else
            {
                var point1LeftOfQ = RVOMath.leftOf(q1, q2, obstacle1.point);
                var point2LeftOfQ = RVOMath.leftOf(q1, q2, obstacle2.point);
                var invLengthQ = 1.0 / RVOMath.absSq(q2.minus(q1));

                return (point1LeftOfQ * point2LeftOfQ >= 0 && RVOMath.sqr(point1LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && RVOMath.sqr(point2LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && queryVisibilityRecursive(q1, q2, radius, node.left) && queryVisibilityRecursive(q1, q2, radius, node.right));
            }
        }
    }
}        