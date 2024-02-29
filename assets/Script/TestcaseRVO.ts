import { RVOMath, Vector2 } from "./RVO/common";
import { Simulator } from "./RVO/simulator";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseRVO extends cc.Component {
    @property(cc.Node) nodeAgent: cc.Node = null;
    @property(cc.Float) public speed: number = 1;
    @property(cc.Float) public radius: number = 20;
    @property(cc.Float) public num: number = 9;

    protected start(): void {
        let simulator = new Simulator();
        Simulator.instance = simulator;
		this.setup(simulator);

        this.schedule(() => {
		    this.setPreferredVelocities(simulator);
			simulator.run();
            if (simulator.reachedGoal()) {
                console.log('[develop] ========', 'reachedGoal');
                this.unscheduleAllCallbacks();
            }
        }, 0);
    }

    private _agents: cc.Node[] = [];
    protected update(dt: number): void {
        if (!Simulator.instance) {
            return;
        }

        var numAgents = Simulator.instance.getNumAgents();
				
        for (var i=0; i<numAgents; i++) {
            if (!this._agents[i]) {
                let node = cc.instantiate(this.nodeAgent);
                node.parent = this.node;
                this._agents[i] = node;
            }

            var pos = Simulator.instance.getAgentPosition(i);
            var radius = Simulator.instance.getAgentRadius(i);
            this._agents[i].x = pos.x;
            this._agents[i].y = pos.y;
        }
    }

    //================================================ private
    private setPreferredVelocities(simulator) {
        var stopped = 0;
        for (var i = 0; i < simulator.getNumAgents (); ++i) {
            if (RVOMath.absSq(simulator.getGoal(i).minus(simulator.getAgentPosition(i))) < RVOMath.RVO_EPSILON) {
                // Agent is within one radius of its goal, set preferred velocity to zero
                simulator.setAgentPrefVelocity (i, new Vector2 (0.0, 0.0));
                stopped++;
            } else {
                // Agent is far away from its goal, set preferred velocity as unit vector towards agent's goal.
                simulator.setAgentPrefVelocity(i, RVOMath.normalize (simulator.getGoal(i).minus(simulator.getAgentPosition(i))));
            }
        }
        return stopped;
    }

    private setup(simulator): void {
        // Specify global time step of the simulation.
        simulator.setTimeStep(this.speed);

        // Specify default parameters for agents that are subsequently added.
        var velocity = new Vector2(1, 1);
        var radius = this.radius;
        simulator.setAgentDefaults(
                400, // neighbor distance (min = radius * radius)
                30, // max neighbors
                600, // time horizon
                600, // time horizon obstacles
                radius, // agent radius
                10.0, // max speed
                velocity // default velocity
            );
        var NUM_AGENTS = this.num;
        for (var i=0; i<NUM_AGENTS; i++) {
            var angle = i * (2*Math.PI) / NUM_AGENTS;
            var x = Math.cos(angle) * 200;
            var y = Math.sin(angle) * 200;
            simulator.addAgent(new Vector2 (x,y));
        }

        // Create goals
        var goals = [];
        for (var i = 0; i < simulator.getNumAgents (); ++i) {
            goals.push(simulator.getAgentPosition(i).scale(-1));
        }
        simulator.addGoals(goals);

        // Add (polygonal) obstacle(s), specifying vertices in counterclockwise order.
        // var vertices = [];

        // if ($("obstacles").checked) {
        //     for (var i=0; i<3; i++) {
        //         var angle = i * (2*Math.PI) / 3;
        //         var x = Math.cos(angle) * 50;
        //         var y = Math.sin(angle) * 50;
        //         vertices.push(new Vector2(x,y));
        //     }
        // }

        // simulator.addObstacle (vertices);

        // Process obstacles so that they are accounted for in the simulation.
        simulator.processObstacles();
    }
}
