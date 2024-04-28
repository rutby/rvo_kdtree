const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class TestcaseTouch extends cc.Component {
	@property(cc.MeshRenderer) public meshRenderer: cc.MeshRenderer = null;

    protected start(): void {
		/** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);
    }

	 //================================================ touch
	 private _touchValid: boolean = false;
	 private onTouchStart(event: cc.Event.EventTouch): void {
		 this._touchValid = true;
	 }
 
	 private onTouchMoved(event: cc.Event.EventTouch): void {
		 
	 }
 
	 private onTouchEnd(event: cc.Event.EventTouch): void {
		if (this._touchValid) {
			this._touchValid = false;
		}
		this.loadRes();
	 }

	 //================================================ 
	 private loadRes(): void {
		cc.loader.loadRes('Texture/bg', cc.Texture2D, (err, tex: cc.Texture2D) => {
			tex.addRef();
			console.log('[develop] ========', err, tex);

			// tex.
			this.meshRenderer.getMaterials()[0].setProperty('diffuseTexture', tex);
			console.log('[develop] ========', 'hah');
		});
	 }
}