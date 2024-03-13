import { RTSGame } from "./TestcaseModel/RTSGame";
import { RTSRuleMC } from "./TestcaseModel/RTSRuleMC";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestcaseTouch extends cc.Component {
    @property(cc.Node) nodeUnit: cc.Node = null;
    @property(cc.Float) padding: number = 100;
    @property(cc.Float) scaler: number = 1.2;
    @property(cc.Float) border: number = 4;

    protected start(): void {
        /** touch */
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node._touchListener.setSwallowTouches(false);
		this.node.setContentSize(cc.winSize);

        window['$scene'] = this;
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

        /** 移动物体 */
        let pos0 = event.getPreviousLocation();
        let pos1 = event.getLocation();
        let posOnPlane0 = this.getScreenPosOnPlaneXY(pos0);
        let posOnPlane1 = this.getScreenPosOnPlaneXY(pos1);
        let posOffset = posOnPlane1.sub(posOnPlane0).multiplyScalar(this.scaler);
        let posNextUnit = this.nodeUnit.position.add(posOffset);
        

        /** 相机跟随 */
        let posL = cc.v2(this.padding, 0);
        let posR = cc.v2(cc.winSize.width - this.padding, 0);
        let posBorderL = cc.v2(0, 0);
        let posBorderR = cc.v2(cc.winSize.width, 0);
        let posOnPlaneL = this.getScreenPosOnPlaneXY(posL);
        let posOnPlaneR = this.getScreenPosOnPlaneXY(posR);
        let dx = 0;
        if (posNextUnit.x < posOnPlaneL.x) {
            dx = posNextUnit.x - posOnPlaneL.x;
        }
        if (posNextUnit.x > posOnPlaneR.x) {
            dx = posNextUnit.x - posOnPlaneR.x;
        }
        let nodeCamera = cc.Camera.main.node;
        let posPrevCamera = nodeCamera.position;
        let posNextCamera = posPrevCamera.add(cc.v3(dx, 0, 0));
        nodeCamera.setPosition(posNextCamera);

        let posOnPlaneBorderL = this.getScreenPosOnPlaneXY(posBorderL);
        let posOnPlaneBorderR = this.getScreenPosOnPlaneXY(posBorderR);
        if (posOnPlaneBorderL.x < -this.border) {
            nodeCamera.setPosition(posPrevCamera);
        } else if (posOnPlaneBorderR.x > this.border) {
            nodeCamera.setPosition(posPrevCamera);
        } else {
            this.nodeUnit.setPosition(posNextUnit);
        }
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        if (!this._touchValid) {
            return;
        }
        this._touchValid = false;

        let posOnPlane = this.getScreenPosOnPlaneXY(event.getLocation());
        console.log('[develop] ========', posOnPlane.x, posOnPlane.y, posOnPlane.z);
    }

    //================================================ private
    private _vec_temp0: cc.Vec3 = cc.Vec3.ZERO;
    private getScreenPosOnPlaneXY(posScreen: cc.Vec2, ignoreCamera: boolean = false, z: number = 0): cc.Vec3 {
        let camera = cc.Camera.main;
        let ray = camera.getRay(posScreen);
        let vecC = ray.d;
        cc.Vec3.set(this._vec_temp0, 0, 0, -1);
        let vecA = this._vec_temp0;
        let scaler = (camera.node.z - z) / vecC.dot(vecA);
        vecC.multiplyScalar(scaler);
        return vecC.add(camera.node.position);
    }
}