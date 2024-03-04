import { RVOMath, Vector2 } from "./RVO/common";
import { Simulator } from "./RVO/simulator";

interface IAgent {
    id?: number,
    pos: Vector2;
    dst: Vector2;
    volocity: Vector2;
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseRVO extends cc.Component {
    @property(cc.Node) nodeAgent: cc.Node = null;
    @property(cc.Float) public speed: number = 1;
    @property(cc.Float) public radius: number = 20;
    @property(cc.Float) public num: number = 9;

    private _agents_d: IAgent[] = [];
    private _agents_n: cc.Node[] = [];
    protected start(): void {
        let simulator = new Simulator();
        Simulator.instance = simulator;
		this.setup(simulator);

        /** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);
    }

    
    protected update(dt: number): void {
        if (!Simulator.instance) {
            return;
        }
        let simulator = Simulator.instance;

        /** 重置pref-volocity */
        for (var i = 0; i < this._agents_d.length; i++) {
            let agent_data = this._agents_d[i];
            let aid = agent_data.id;
            let pos0 = simulator.getAgentPosition(aid);
            let pos1 = agent_data.dst;

            let volocity = null;
            if (RVOMath.absSq(pos0.minus(pos1)) < RVOMath.RVO_EPSILON) {
                volocity = new Vector2(0, 0);
            } else {
                volocity = RVOMath.normalize(pos1.minus(pos0));
            }
            simulator.setAgentPrefVelocity(aid, volocity);

            agent_data.pos = pos0;
            agent_data.volocity = volocity;
        }

        /** update logic */
        simulator.run();

        /** update ui */
        for (var i = 0; i < this._agents_d.length; i++) {
            let agent_data = this._agents_d[i];
            var pos = Simulator.instance.getAgentPosition(agent_data.id);
            var radius = Simulator.instance.getAgentRadius(agent_data.id);

            let agent_node = this._agents_n[i];
            agent_node.x = pos.x;
            agent_node.y = pos.y;
        }
    }

    //================================================ touch
    private _touchValid: boolean = false;
	private onTouchStart(event: cc.Event.EventTouch): void {
		this._touchValid = true;
	}

	private onTouchEnd(event: cc.Event.EventTouch): void {
		if (!this._touchValid) {
			return;
		}
		this._touchValid = false;

		console.log('[develop] ========', 'hah');
	}


    //================================================ private
    private setup(simulator: Simulator): void {
        simulator.setTimeStep(this.speed);
        simulator.setAgentDefaults(
            400,                // neighbor distance (min = radius * radius)
            30,                 // max neighbors
            600,                // time horizon
            600,                // time horizon obstacles
            this.radius,        // agent radius
            10.0,               // max speed
            new Vector2(1, 1)   // default velocity
        );

        /** 生成agent */
        this.node.destroyAllChildren();
        this._agents_d = [];
        this._agents_n = [];
        var numAgents = this.num;
        for (var i = 0; i < numAgents; i++) {
            var angle = i * (2 * Math.PI) / numAgents;
            var x = Math.cos(angle) * 200;
            var y = Math.sin(angle) * 200;
            let pos = new Vector2(x,y);

            let pos0 = pos;
            let pos1 = pos.scale(-1);
            let volocity = RVOMath.normalize(pos1.minus(pos0));

            this.newAgent(pos0, pos1, volocity);
        }

        simulator.processObstacles();
    }

    private newAgent(pos0: Vector2, pos1: Vector2, volocity: Vector2): void {
        let simulator = Simulator.instance;

        let agent_data: IAgent = {
            pos: pos0,
            dst: pos1,
            volocity: volocity,
        };
        this._agents_d.push(agent_data);

        let node = cc.instantiate(this.nodeAgent);
        node.parent = this.node;
        this._agents_n.push(node);

        let aid = simulator.addAgent(agent_data.pos);
        simulator.setAgentPrefVelocity(aid, agent_data.volocity);
        agent_data.id = aid;
    }
}

// //================================================ private
// 	/** angle a -> b */
// 	private static _stepAngle(a: number, b: number, c: number): number {
// 		a = this._0To360(a);
// 		b = this._0To360(b);

// 		let dir1 = this._isCCW(a, b) ? 1 : -1;
// 		let d = this._0To360(a + c * dir1);
// 		let dir2 = this._isCCW(d, b) ? 1 : -1;
// 		if (dir1 !== dir2) {
// 			d = b;
// 		}

// 		d = this._180To180(d);
// 		return d;
// 	}

// 	/** 0~360 */
// 	private static _0To360(angle: number): number {
// 		angle = angle % 360;
// 		return angle < 0 ? angle + 360 : angle;
// 	}

// 	/** -180~180 */
// 	private static _180To180(angle: number): number {
// 		return angle > 180 ? angle - 360 : angle;
// 	}

// 	/** ccw */
// 	private static _isCCW(from: number, to: number): boolean {
// 		let diff = to - from;
//         let cond1 = 180 > diff && diff > 0;
//         let cond2 = -180 > diff && diff < 0;
//         return cond1 || cond2;
// 	}
