
const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseRVO extends cc.Component {
    @property(cc.Float) public speed: number = 1;
    protected start(): void {
    }

    //================================================ private
    private setup(simulator): void {
        // Specify global time step of the simulation.
        // simulator.setTimeStep(this.speed);

        // // Specify default parameters for agents that are subsequently added.
        // var velocity = new Vector2(1, 1);
        // var radius = new Number($("radius").value); // TODO validate
        // simulator.setAgentDefaults(
        //         400, // neighbor distance (min = radius * radius)
        //         30, // max neighbors
        //         600, // time horizon
        //         600, // time horizon obstacles
        //         radius, // agent radius
        //         10.0, // max speed
        //         velocity // default velocity
        //     );
        // var NUM_AGENTS = $("agents").value;
        // for (var i=0; i<NUM_AGENTS; i++) {
        //     var angle = i * (2*Math.PI) / NUM_AGENTS;
        //     var x = Math.cos(angle) * 200;
        //     var y = Math.sin(angle) * 200;
        //     simulator.addAgent(new Vector2 (x,y));
        // }

        // // Create goals
        // var goals = [];
        // for (var i = 0; i < simulator.getNumAgents (); ++i) {
        //     goals.push(simulator.getAgentPosition(i).scale(-1));
        // }
        // simulator.addGoals(goals);

        // // Add (polygonal) obstacle(s), specifying vertices in counterclockwise order.
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

        // // Process obstacles so that they are accounted for in the simulation.
        // simulator.processObstacles();
    }
}
