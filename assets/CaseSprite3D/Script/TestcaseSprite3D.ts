const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class TestcaseTouch extends cc.Component {
    @property(cc.Node) nodeUnit: cc.Node = null;
	@property(cc.Float) direct: number = 90;

    protected start(): void {
		// this.nodeUnit.eulerAngles = cc.v3(0, this.direct, this.direct > 0? 45: -45);
    }

	private _quat0 = new cc.Quat();
	private _quat1 = new cc.Quat();
	private _time: number = 0;
	protected update(dt: number): void {
		/** 沿指定向量旋转 */
		// cc.Quat.rotateY(this._quat1, this._quat0, cc.misc.degreesToRadians(this.direct));
		// cc.Quat.rotateAround(this._quat1, this._quat1, cc.v3(1, 0, 0), cc.misc.degreesToRadians(45));
		// this.nodeUnit.setRotation(this._quat1);

		// let radians = cc.misc.degreesToRadians(this.direct);
		// let dx = Math.cos(radians) * dt * 1;
		// let dz = Math.sin(radians) * dt * 1;
		// this.nodeUnit.position = cc.v3(this.nodeUnit.position.x + dx, this.nodeUnit.position.y, this.nodeUnit.position.z - dz);

		// this._time += dt;
		// if (this._time > 3) {
		// 	this._time = 0;
		// 	this.nodeUnit.position = cc.v3(0, 1, -5);
		// }
	}
}