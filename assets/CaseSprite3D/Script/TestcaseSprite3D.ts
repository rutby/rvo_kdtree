import RTSSprite3DBatcher from "../../Script/Components/RTSSprite3DBatcher";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class TestcaseSprite3D extends cc.Component {
	@property(cc.Node) public nodeArmy: cc.Node = null;
	@property(cc.Node) public nodeArmyContainer: cc.Node = null;

	private _enablePosUpdate: boolean = false;
    protected start(): void {
		/** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);

		/** 创建200个单位 */
		this.nodeArmyContainer.destroyAllChildren();
		let col = 25;
		let row = 25;
		for (let i = 0; i < col; i++) {
			let x = -250 + 500 / col * i;
			for (let j = row - 1; j >= 0 ; j--) {
			// for (let j = 0; j < row; j++) {
				let y = 0 - 1000 / row * j;
				let node = cc.instantiate(this.nodeArmy);
				node.parent = this.nodeArmyContainer;
				node.x = x / 100;
				node.z = y / 100;
				node.active = true;
			}
		}

		cc.debug.setDisplayStats(true);
    }

	private _dir: number = 0.1;
	protected update(dt: number): void {
		this.nodeArmyContainer.children.forEach(ele => {
			ele.x += this._dir;
		});
		this._dir *= -1;
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

		this._enablePosUpdate = !this._enablePosUpdate;
    }
}