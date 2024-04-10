import KeyboardListener from "../../Script/Components/KeyboardListener";
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
        !CC_BUILD && this.addComponent(KeyboardListener);
        this.nodeAgent.setContentSize(cc.size(this.radius, this.radius));

        /** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);

        this.setup();
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

        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        let pos0 = new Vector2(pos.x, pos.y);
        let pos1 = pos0.scale(-1);
        let volocity = RVOMath.normalize(pos1.minus(pos0));
        this.newAgent(pos0, pos1, volocity);
	}


    //================================================ private
    private setup(): void {
        /** 初始化Simulator */
        Simulator.instance = new Simulator();
        Simulator.instance.setTimeStep(this.speed);
        Simulator.instance.setAgentDefaults(
            400,                // neighbor distance (min = radius * radius)
            30,                 // max neighbors
            600,                // time horizon
            600,                // time horizon obstacles
            this.radius,        // agent radius
            10.0,               // max speed
            new Vector2(1, 1)   // default velocity
        );

        /** 生成Agent */
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
            let pos1 = pos0.scale(-1);
            let volocity = RVOMath.normalize(pos1.minus(pos0));

            this.newAgent(pos0, pos1, volocity);
        }

        Simulator.instance.processObstacles();
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
