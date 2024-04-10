const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseAnimation extends cc.Component {
    @property(cc.Node) nodeModel: cc.Node = null;

    private _isPlaying: boolean = false;
    private _evtListenerBinded: boolean = false;

    protected start(): void {
        /** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);
    }

    protected onDestroy(): void {
        if (this._evtListenerBinded) {
            this._evtListenerBinded = false;

            let animation = this.nodeModel.getComponent(cc.Animation);
            animation.off(cc.Animation.EventType.FINISHED, this.onAnimationFinished, this);
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

        if (!this._isPlaying) {
            this._isPlaying = true;

            let animation = this.nodeModel.getComponent(cc.Animation);
            animation.play();
            if (!this._evtListenerBinded) {
                this._evtListenerBinded = true;
                animation.on(cc.Animation.EventType.FINISHED, this.onAnimationFinished, this);
            }
        }
    }

    //================================================ private
    private onAnimationFinished(): void {
        this._isPlaying = false;
    }
}
