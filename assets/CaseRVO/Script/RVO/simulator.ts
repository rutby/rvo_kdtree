import { Agent } from "./agent";
import { Obstacle, RVOMath } from "./common";
import { KdTree } from "./kdtree";

export class Simulator {
    public static instance: Simulator = null;

	agents = []; // Agent[]
	obstacles = []; // Obstacle[]
	goals = []; // Vector2
	kdTree = new KdTree();
	
	timeStep = 0.25;
	
    defaultAgent = null; // Agent
    time = 0.0;
    
    getGlobalTime() {
    	return this.time;
    };
    
    getNumAgents() {
    	return this.agents.length;
    };
    
    getTimeStep() {
    	return this.timeStep;
    };

    setAgentPrefVelocity(i, velocity) {
        this.agents[i].prefVelocity = velocity;
    };
    
    setTimeStep(timeStep)
    {
        this.timeStep = timeStep;
    };
    
    getAgentPosition(i)
    {
        return this.agents[i].position;
    };
    
    getAgentPrefVelocity(i)
    {
        return this.agents[i].prefVelocity;
    };
    
    getAgentVelocity(i)
    {
        return this.agents[i].velocity;
    };
    
    getAgentRadius(i)
    {
        return this.agents[i].radius;
    };
    
    getAgentOrcaLines(i)
    {
        return this.agents[i].orcaLines;
    };

    addAgent(position)
    {
        if (!this.defaultAgent) {
            throw new Error("no default agent");
        }

        var agent = new Agent();

        agent.position = position;
        agent.maxNeighbors = this.defaultAgent.maxNeighbors;
        agent.maxSpeed = this.defaultAgent.maxSpeed;
        agent.neighborDist = this.defaultAgent.neighborDist;
        agent.radius = this.defaultAgent.radius;
        agent.timeHorizon = this.defaultAgent.timeHorizon;
        agent.timeHorizonObst = this.defaultAgent.timeHorizonObst;
        agent.velocity = this.defaultAgent.velocity;

        agent.id = this.agents.length;
        this.agents.push(agent);

        return this.agents.length - 1;
    };

    //  /** float */ neighborDist, /** int */ maxNeighbors, /** float */ timeHorizon, /** float */ timeHorizonObst, /** float */ radius, /** float*/ maxSpeed, /** Vector2 */ velocity)
    setAgentDefaults(neighborDist, maxNeighbors, timeHorizon, timeHorizonObst, radius,  maxSpeed, velocity)
    {
        if (!this.defaultAgent)
        {
        	this.defaultAgent = new Agent();
        }

        this.defaultAgent.maxNeighbors = maxNeighbors;
        this.defaultAgent.maxSpeed = maxSpeed;
        this.defaultAgent.neighborDist = neighborDist;
        this.defaultAgent.radius = radius;
        this.defaultAgent.timeHorizon = timeHorizon;
        this.defaultAgent.timeHorizonObst = timeHorizonObst;
        this.defaultAgent.velocity = velocity;
    }
    
    run()
    {	
    	this.kdTree.buildAgentTree();

    	for (var i = 0; i < this.getNumAgents(); i++) {
	    	this.agents[i].computeNeighbors();
	        this.agents[i].computeNewVelocity();
	        this.agents[i].update();
    	}
    	
    	this.time += this.timeStep;
    };
    
	reachedGoal()
	{
		for (var i = 0; i < this.getNumAgents (); ++i) {
			if (RVOMath.absSq (this.goals[i].minus(this.getAgentPosition(i))) > RVOMath.RVO_EPSILON) {
				return false;
			};
		}
		return true;
	};

	addGoals(goals) {
		this.goals = goals;
	};
	
    getGoal(goalNo)
    {
        return this.goals[goalNo];
    };
	
    addObstacle( /** IList<Vector2> */ vertices)
    {
        if (vertices.length < 2)
        {
            return -1;
        }

        var obstacleNo = this.obstacles.length;

        for (var i = 0; i < vertices.length; ++i)
        {
            var obstacle = new Obstacle();
            obstacle.point = vertices[i];
            if (i != 0)
            {
                obstacle.prevObstacle = this.obstacles[this.obstacles.length - 1];
                obstacle.prevObstacle.nextObstacle = obstacle;
            }
            if (i == vertices.length - 1)
            {
                obstacle.nextObstacle = this.obstacles[obstacleNo];
                obstacle.nextObstacle.prevObstacle = obstacle;
            }
            obstacle.unitDir = RVOMath.normalize(vertices[(i == vertices.length - 1 ? 0 : i + 1)].minus(vertices[i]));

            if (vertices.length == 2) {
                obstacle.isConvex = true;
            } else {
                obstacle.isConvex = (RVOMath.leftOf(vertices[(i == 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i == vertices.length - 1 ? 0 : i + 1)]) >= 0);
            }

            obstacle.id = this.obstacles.length;

            this.obstacles.push(obstacle);
        }

        return obstacleNo;
    }

    processObstacles()
    {
        this.kdTree.buildObstacleTree();
    };

    queryVisibility(/** Vector2 */ point1, /** Vector2 */ point2, /** float */ radius)
    {
        return this.kdTree.queryVisibility(point1, point2, radius);
    };

    getObstacles()
    {
    	return this.obstacles;
    }
}