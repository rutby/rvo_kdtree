import RTSSprite3DBatcher from "../../Script/Components/RTSSprite3DBatcher";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class TestcaseSprite3D extends cc.Component {
	@property(cc.Node) public nodeBlink: cc.Node = null;

    protected start(): void {
		/** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);
    }

	protected update(dt: number): void {
		// RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().clear();
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

		console.log('[develop] ========', 'touch');
		this.nodeBlink.active = !this.nodeBlink.active;
    }
}