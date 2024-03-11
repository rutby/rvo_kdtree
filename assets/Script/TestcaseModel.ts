import { RTSGame } from "./TestcaseModel/RTSGame";
import { RTSRuleMC } from "./TestcaseModel/RTSRuleMC";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseModel extends cc.Component {
    @property(cc.Node) nodeUnit: cc.Node = null;
    @property(cc.Float) num: number = 100;
    @property(cc.Label) lbDelta: cc.Label = null;

    protected start(): void {
        cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, this.onEventBeforeUpdate, this);

        let rule = new RTSRuleMC();
        RTSGame.instance.start(rule.buildWorld());

        cc.game.setFrameRate(60);

        this.setup();
    }

    protected onDestroy(): void {
        cc.director.off(cc.Director.EVENT_BEFORE_UPDATE, this.onEventBeforeUpdate, this);
    }

    //================================================ cc.director
    private onEventBeforeUpdate() {
        let dt = cc.director.getDeltaTime();
        this.lbDelta.string = `${dt.toFixed(3)}`;
        RTSGame.instance.update(dt);
    }

    //================================================ private
    private setup(): void {
        let minx = -3;
        let maxx = 3;
        let miny = -5;
        let maxy = 5;
        for(let i = 0; i < this.num; i++) {
            let x = Math.random() * (maxx - minx) + minx;
            let y = Math.random() * (maxy - miny) + miny;
            let pos = cc.v2(x, y);
            let node = cc.instantiate(this.nodeUnit);
            node.active = true;
            node.parent = this.node;
            node.setPosition(pos);
        }
    }
}
