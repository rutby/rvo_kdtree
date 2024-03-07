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

interface IVec {
    x: number,
    y: number,
}

interface IAgent {
    position: IVec,
}

/** 纯净版KdTree */
export class KdTreeSimple {
    private maxLeafSize: number = 10;
	private agents: IAgent[] = [];
	private agentTree: AgentTreeNode[] = [];
	
    /** 构建 */
	public build(agents: IAgent[]): void {
		if (this.agents.length != agents.length) {
			this.agents = agents;
			
            this.agentTree = [];
			for (var i = 0; i < 2 * this.agents.length; i++) {
				this.agentTree.push(new AgentTreeNode());
			}
		}
		
		if (this.agents.length > 0) {
			this.buildAgentTreeRecursive(0, this.agents.length, 0);
		}
	};

    /** 范围查询 */
    public query(pos: IVec, range: number): IAgent[] {
        let results: IAgent[] = [];
		this.queryAgentTreeRecursive(pos, range ** 2, 0, results);
        return results;
	}
	
    //================================================ private
    /** 递归构建 */
	private buildAgentTreeRecursive(begin: number, end: number, node: number): void {
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
		
		if (end - begin > this.maxLeafSize) {
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
	
    /** 查询 */
	private queryAgentTreeRecursive(pos: IVec, rangeSq: number, node: number, results: IAgent[]): void {
		if (this.agentTree[node].end - this.agentTree[node].begin <= this.maxLeafSize)
        {
            for (var i = this.agentTree[node].begin; i < this.agentTree[node].end; ++i)
            {
                let pos0 = this.agents[i].position;
                let pos1 = pos;
                if ((pos0.x - pos1.x) ** 2 + (pos0.y - pos1.y) ** 2 < rangeSq) {
                    results.push(this.agents[i]);
                }
            }
        }
        else
        {
            let distSqLeft = Math.max(0, this.agentTree[this.agentTree[node].left].minX - pos.x) ** 2 + 
                Math.max(0, pos.x - this.agentTree[this.agentTree[node].left].maxX) ** 2 + 
                Math.max(0, this.agentTree[this.agentTree[node].left].minY - pos.y) ** 2 + 
                Math.max(0, pos.y - this.agentTree[this.agentTree[node].left].maxY) ** 2;

            let distSqRight = Math.max(0, this.agentTree[this.agentTree[node].right].minX - pos.x) ** 2 +
	            Math.max(0, pos.x - this.agentTree[this.agentTree[node].right].maxX) ** 2 +
	            Math.max(0, this.agentTree[this.agentTree[node].right].minY - pos.y) ** 2 +
	            Math.max(0, pos.y - this.agentTree[this.agentTree[node].right].maxY) ** 2;

            if (distSqLeft < distSqRight)
            {
                if (distSqLeft < rangeSq)
                {
                    this.queryAgentTreeRecursive(pos, rangeSq, this.agentTree[node].left, results);

                    if (distSqRight < rangeSq)
                    {
                        this.queryAgentTreeRecursive(pos, rangeSq, this.agentTree[node].right, results);
                    }
                }
            }
            else
            {
                if (distSqRight < rangeSq)
                {
                    this.queryAgentTreeRecursive(pos, rangeSq, this.agentTree[node].right, results);

                    if (distSqLeft < rangeSq)
                    {
                        this.queryAgentTreeRecursive(pos, rangeSq, this.agentTree[node].left, results);
                    }
                }
            }

        }
	}
}        