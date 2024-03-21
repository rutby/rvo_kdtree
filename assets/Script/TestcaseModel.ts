import { RTSGame } from "./TestcaseModel/RTSGame";
import { RTSRuleMC } from "./TestcaseModel/RTSRuleMC";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseModel extends cc.Component {
    @property(cc.Node) nodeUnit: cc.Node = null;
    @property(cc.Float) num: number = 100;
    @property(cc.Boolean) useGPUInstancing: boolean = false;

    private _nodeUnits: cc.Node[] = [];
    private _posUnits: cc.Vec2[] = [];
    protected start(): void {
        cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, this.onEventBeforeUpdate, this);

        cc.debug.setDisplayStats(true);

        this.setup();
    }

    protected onDestroy(): void {
        cc.director.off(cc.Director.EVENT_BEFORE_UPDATE, this.onEventBeforeUpdate, this);
    }

    protected update(dt: number): void {
        for(let i = 0; i < this._nodeUnits.length; i++) {
            let nodeUnit = this._nodeUnits[i];
            let posUnit = this._posUnits[i];
            nodeUnit.position = cc.v3(posUnit.x + Math.random() * 0.3, posUnit.y, 0);
        }
    }

    //================================================ cc.director
    private onEventBeforeUpdate() {
    }

    //================================================ private
    private setup(): void {
        // let diffMap = [
        //     {pos: cc.v3(-3, -3, 0), scale: 1, eulerAngles: cc.v3(30, 0, 0),},
        //     {pos: cc.v3(-2, -2, 0), scale: 1.5, eulerAngles: cc.v3(30, 0, 0),},
        //     {pos: cc.v3(-1, -1, 0), scale: 1, eulerAngles: cc.v3(30, 0, 0),},
        //     {pos: cc.v3(0, 0, 0), scale: 1.5, eulerAngles: cc.v3(0, 30, 0),},
        //     {pos: cc.v3(1, 1, 0), scale: 1, eulerAngles: cc.v3(0, 30, 0),},
        //     {pos: cc.v3(2, 2, 0), scale: 1.5, eulerAngles: cc.v3(0, 30, 0),},
        //     {pos: cc.v3(3, 3, 0), scale: 1, eulerAngles: cc.v3(0, 0, 30),},
        // ];

        this._nodeUnits = [];
        /** 创建实例 */
        let minx = -3;
        let maxx = 3;
        let miny = -3;
        let maxy = 3;
        for(let i = 0; i < this.num; i++) {
            let x = Math.random() * (maxx - minx) + minx;
            let y = Math.random() * (maxy - miny) + miny;
            let pos = cc.v2(x, y);
            let node = cc.instantiate(this.nodeUnit);
            node.active = true;
            node.parent = this.node;
            node.name = 'gpu-instacing';

            node.setPosition(pos);
            // let diff = diffMap[i];
            // node.setPosition(diff.pos);
            // node.eulerAngles = diff.eulerAngles;
            // node.scale = diff.scale;

            
            // let nodeMaterial = node.children[0].children[0].children[0].children[0];
            if (this.useGPUInstancing) {
                let nodeMaterial = node;
                let material = nodeMaterial.getComponent(cc.MeshRenderer).getMaterial(0);
                material.useGPUInstancing = true;
            }

            this._nodeUnits.push(node);
            this._posUnits.push(pos);
        }
    }
}
