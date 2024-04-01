import { PrimitiveUtils } from "../Utils/PrimitiveUtils";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
@menu("Tool/RTSPolyShadowGenerator")
export default class RTSPolyShadowGenerator extends cc.Component {
    @property(cc.Node) public nodeShape: cc.Node = null;
    @property(cc.Node) public nodePointContianer: cc.Node = null;
    @property(cc.Node) public nodePoint: cc.Node = null;

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
        this.nodePointContianer.destroyAllChildren();

        /** 读取形状 */
        let poly_shape: cc.Vec2[] = [];
		poly_shape = [
			cc.v2(-0.5, 5.5),
			cc.v2(-0.5, 4.5),
			cc.v2(0.5, 4.5),
			cc.v2(0.5, 5.5),
            // cc.v2(-0.69, 7.21),
			// cc.v2(0.31, 7.21),
			// cc.v2(0.31, 8.21),
		];
        poly_shape = [
            cc.v2(
                125.79/100,
                673.75/100
            ),
            cc.v2(
                212.96/100,
                723.97/100
            ),
            cc.v2(
                162.42/100,
                810.71/100
            ),
        ];
        poly_shape.push(poly_shape[0]);

        /** 向右上角偏移一定距离 */
		let posOffset = cc.v2(0.02, 0.02);
		for (let point of poly_shape) {
			point.addSelf(posOffset);
		}

        /** 生成映射 */
        let poly_shadow: cc.Vec2[] = [];
        let lightDir = cc.v3(-1, -1, 6).neg().normalize();
        let vertDir = cc.v3(0, 0, -1);
        let z = 0.5;
        let scale = z / lightDir.dot(vertDir);
        let offset = lightDir.mul(scale);
        for(let point of poly_shape) {
            let posCorner = cc.v3(point.x, point.y, z);
            let posShadow = posCorner.add(offset);

            poly_shadow.push(cc.v2(posShadow.x, posShadow.y));
        }
        let poly = poly_shadow.slice(0, -1);

        /** 扩充形状 */
        let poly_shadow_ext: cc.Vec2[] = [];
        let shadow_prev = null;
        let shadow_dirty = false;
        for(let i = 0; i < poly_shape.length; i++) {
            let shape = poly_shape[i];
            let shadow = poly_shadow[i];
            let inside = this.pointInPolygon(shape, poly);
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
        //     node.position = cc.v3(point.x, -point.y, 0);
        // }

        let model = PrimitiveUtils.poly2(poly_shadow_ext);
        this.nodeShape.getComponent(cc.MeshRenderer).mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
    }

    private pointInPolygon (point, polygon) {
        var inside = false;
        var x = point.x;
        var y = point.y;
    
        // use some raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        var length = polygon.length;
    
        for ( var i = 0, j = length-1; i < length; j = i++ ) {
            var xi = polygon[i].x, yi = polygon[i].y,
                xj = polygon[j].x, yj = polygon[j].y,
                intersect = ((yi > y) !== (yj > y)) && (x <= (xj - xi) * (y - yi) / (yj - yi) + xi);
    
            if ( intersect ) inside = !inside;
        }
    
        return inside;
    }
}
