import { PrimitiveUtils } from "../../../Script/Utils/PrimitiveUtils";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu("Tool/PolyShadowGenerator")
export default class PolyShadowGenerator extends cc.Component {
    @property(cc.PolygonCollider) public poly: cc.PolygonCollider = null;
    @property(cc.Node) public nodeLight: cc.Node = null;
    @property(cc.Node) public nodeShape: cc.Node = null;
    @property(cc.Node) public nodePointContianer: cc.Node = null;
    @property(cc.Node) public nodePoint: cc.Node = null;
    @property(cc.Node) public nodeModel: cc.Node = null;

    public start(): void {
        this.updateShadow();
	}

    private _time: number = 0;
    protected update(dt: number): void {
        if (CC_EDITOR) {
            this._time += dt;
            if (this._time > 0.1) {
                this._time = 0;
                this.updateShadow();
            }
        }
    }

    //================================================ private
    private updateShadow() { 
        if (!this.poly) {
            return;
        }
        this.nodePointContianer.destroyAllChildren();

        /** 读取形状 */
        let poly_shape: cc.Vec2[] = [];
        for(let point of this.poly.points) {
            // this.
            poly_shape.push(cc.v2(point.x / 100, point.y / 100));
        }
        poly_shape.push(poly_shape[0]);

        /** 生成映射 */
        let poly_shadow: cc.Vec2[] = [];
        let lightDir = this.nodeLight.position.neg().normalize();
        let vertDir = cc.v3(0, 0, -1);
        let z = 0.5;
        let scale = z / lightDir.dot(vertDir);
        let offset = lightDir.mul(scale);
        for(let point of poly_shape) {
            let posCorner = cc.v3(point.x, point.y, z);
            let posShadow = posCorner.add(offset);

            poly_shadow.push(cc.v2(posShadow.x, posShadow.y));
        }

        /** 扩充形状 */
        let poly_shadow_ext: cc.Vec2[] = [];
        let shadow_prev = null;
        let shadow_dirty = false;
        for(let i = 0; i < poly_shape.length; i++) {
            let shape = poly_shape[i];
            let shadow = poly_shadow[i];
            let inside = cc.Intersection.pointInPolygon(shape, poly_shadow);
            if (!inside) {
                if (shadow_dirty) {
                    poly_shadow_ext.push(shadow);
                    shadow_dirty = false; 
                }
                poly_shadow_ext.push(shape);
                shadow_prev = shadow;
            } else {
                if (shadow_prev) {
                    poly_shadow_ext.push(shadow_prev);
                    shadow_prev = null;
                }
                poly_shadow_ext.push(shadow);
                shadow_dirty = true;
            }
        }
        poly_shadow_ext.pop();

        // for(let point of poly_shadow_ext) {
        //     let node = cc.instantiate(this.nodePoint);
        //     node.parent = this.nodePointContianer;
        //     node.position = cc.v3(point.x, point.y, 0);
        // }

        let model = PrimitiveUtils.poly2(poly_shadow_ext);
        this.nodeShape.getComponent(cc.MeshRenderer).mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
    }
}
