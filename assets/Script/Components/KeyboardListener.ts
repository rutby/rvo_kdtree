
const { ccclass } = cc._decorator;
@ccclass
/** 键盘按键监听, 用于调试时快速执行指定行为 */
export default class KeyboardListener extends cc.Component {
	private _cmdMap: any = null;
    
	//================================================ cc.Component
	protected start(): void {
	}

	protected onEnable(): void {
		if (CC_BUILD) return;

		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);

		this._cmdMap = {
			//================================================ 游戏进程
			['R'.charCodeAt(0)]: {
				desc: '重新开始',
				func: () => {
                    cc.director.loadScene('rvo');
				},
			},

            ['F'.charCodeAt(0)]: {
				desc: '加速游戏进程',
				func: () => {
                    cc.director.getScheduler().setTimeScale(cc.director.getScheduler().getTimeScale() * 2);
				},
			},

            ['B'.charCodeAt(0)]: {
				desc: '放缓游戏进程',
				func: () => {
                    cc.director.getScheduler().setTimeScale(cc.director.getScheduler().getTimeScale() / 2);
				},
			},
		};
	}
	
	protected onDisable(): void {
		if (CC_BUILD) return;

		cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
	}

    //================================================ Events
	/** 按键事件监听 */
	private onEventKeyDown(event): void {
        var keyCode = event.keyCode;
        
        if (this._cmdMap[keyCode]) {
			this._cmdMap[keyCode].func.apply(this);
			console.log("按键监听已触发: ", this._cmdMap[keyCode].desc);
        }
    }
}
