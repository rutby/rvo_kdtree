import { KdTreeSimple } from "./KdTreeSimple";

interface IAgent {
    id: number,
    position: cc.Vec2,
    node: cc.Node,
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseKdTree extends cc.Component {
    @property(cc.Node) nodePoint: cc.Node = null;
    @property(cc.Node) nodeCircle: cc.Node = null;
    @property(cc.Float) public num: number = 100;
    @property(cc.Float) public radius: number = 50;

    private _kdTree: KdTreeSimple = null;
    private _points: IAgent[] = [];
    protected start(): void {
        /** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);

        this.nodeCircle.setContentSize(this.radius * 2, this.radius * 2);

        this.setup();   
    }

    protected update(dt: number): void {
        this._kdTree.build(this._points);

        /** 性能测试 300 * 600 的数据时间开销是0.17ms */
        // for(let i = 0; i < 300; i++) {
        //     this.highlight(cc.v2(Math.random() * cc.winSize.width - cc.winSize.width / 2, Math.random() * cc.winSize.height - cc.winSize.height / 2));
        // }
    }

    //================================================ touch
    private _touchValid: boolean = false;
	private onTouchStart(event: cc.Event.EventTouch): void {
		this._touchValid = true;
	}

    private onTouchMoved(event: cc.Event.EventTouch): void {
        if (!this._touchValid) {
			return;
		}

        this.highlight(this.node.convertToNodeSpaceAR(event.getLocation()));
    }

	private onTouchEnd(event: cc.Event.EventTouch): void {
		if (!this._touchValid) {
			return;
		}
		this._touchValid = false;

        this.highlight(this.node.convertToNodeSpaceAR(event.getLocation()));
	}

    private highlight(pos: cc.Vec2): void {
        let results = this._kdTree.query(pos, this.radius) as IAgent[];

        /** ui */
        this.nodeCircle.setPosition(pos);
        for(let agent of this._points) {
            agent.node.children[0].color = cc.Color.WHITE;
        }
        for(let agent of results) {
            agent.node.children[0].color = cc.Color.GREEN;
        }
    }

    //================================================ private
    private setup(): void {
        this._kdTree = new KdTreeSimple();

        this._points = [];
        let minx = cc.winSize.width/2 * -1;
        let maxx = cc.winSize.width/2 * +1;
        let miny = cc.winSize.height/2 * -1;
        let maxy = cc.winSize.height/2 * +1;
        for(let i = 0; i < this.num; i++) {
            let x = Math.random() * (maxx - minx) + minx;
            let y = Math.random() * (maxy - miny) + miny;
            let pos = cc.v2(x, y);
            let node = cc.instantiate(this.nodePoint);
            node.parent = this.node;
            node.setPosition(pos);
            this._points.push({ id: this._points.length, position: pos, node: node });
        }
    }
}
