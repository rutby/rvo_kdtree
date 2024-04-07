import KeyboardListener from "../../Script/Components/KeyboardListener";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('Scene/TestcaseProjectile')
export default class TestcaseProjectile extends cc.Component {
    @property(cc.Prefab) prefabProjectile: cc.Prefab = null;
    @property(cc.Node) nodeProjectileContainer: cc.Node = null;

    protected start(): void {
        !CC_BUILD && this.addComponent(KeyboardListener);
        
        this.schedule(() => {
            let range = [30, 150];
            let slice = (range[1] - range[0]) / 12;
            for(let deg = range[0]; deg <= range[1]; deg+=slice) {
                let node = cc.instantiate(this.prefabProjectile);
                node.parent = this.nodeProjectileContainer;
                node.groupIndex = 2;
                node.position = cc.v3(0, 0, -3);
                node.eulerAngles = cc.v3(0, deg, 0);

                let posEnd = this.degMove(deg, cc.v2(0, 0), 15);
                cc.tween(node).to(2, {x: posEnd.x, z: -posEnd.y + node.position.z}).removeSelf().start(); 
            }
        }, 0.2);
    }
    //================================================ private
    private degMove(deg: number, posStart: cc.Vec2, dis: number): cc.Vec2 {
		let ret = cc.v2();
		let rad = (deg * Math.PI) / 180;
		ret.x = posStart.x + dis * Math.cos(rad);
		ret.y = posStart.y + dis * Math.sin(rad);
		return ret;
	}
}
