import { PrimitiveUtils } from "./TestcaseShadow/Utils/PrimitiveUtils";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class TestcaseShadow extends cc.Component {

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
        // if (!this.poly) {
        //     return;
        // }
        // this.node.destroyAllChildren();

        // /** 读取形状 */
        // let poly_shape: cc.Vec2[] = [];
        // for(let point of this.poly.points) {
        //     poly_shape.push(cc.v2(point.x / 100, point.y / 100));
        // }

        // // cc.log('========>');
        // /** 生成映射 */
        // let poly_shadow: cc.Vec2[] = [];
        // let lightDir = this.nodeLight.position.neg().normalize();
        // let vertDir = cc.v3(0, -1, 0);
        // let y = this.nodeModel.scaleZ;
        // let scale = y / lightDir.dot(vertDir);
        // let offset = lightDir.mul(scale);
        // for(let point of poly_shape) {
        //     let posCorner = cc.v3(point.x + this.nodeModel.x, y, point.y + this.nodeModel.z);
        //     let posShadow = posCorner.add(offset);

        //     // let node = cc.instantiate(this.nodePoint);
        //     // node.parent = this.node;
        //     // node.position = posShadow;
        //     poly_shadow.push(cc.v2(posShadow.x, posShadow.z));
        // }
        // // cc.log('---');

        // /** 扩充形状 */
        // let poly_shadow_ext: cc.Vec2[] = [];
        // let shadow_prev = null;
        // let shadow_dirty = false;
        // for(let i = 0; i < poly_shape.length; i++) {
        //     let shape = poly_shape[i];
        //     let shadow = poly_shadow[i];
        //     let inside = cc.Intersection.pointInPolygon(shape, poly_shadow);
        //     if (!inside) {
        //         if (shadow_dirty) {
        //             poly_shadow_ext.push(shadow);
        //             shadow_dirty = false;
        //         }
        //         poly_shadow_ext.push(shape);
        //         shadow_prev = shadow;
        //     } else {
        //         if (shadow_prev) {
        //             poly_shadow_ext.push(shadow_prev);
        //             shadow_prev = null;
        //         }
        //         poly_shadow_ext.push(shadow);
        //         shadow_dirty = true;
        //     }
        // }


        // // for(let point of poly_shadow_ext) {
        // //     cc.log(point.x, point.y);
        // // }

        // let model = PrimitiveUtils.poly(poly_shadow_ext, 0.1, 0.01);
        // this.nodeShape.getComponent(cc.MeshRenderer).mesh = this.newMesh(model.indices, model.positions, model.uvs, model.normals);
    }

    private newMesh(indices, verts, uv, normals): cc.Mesh {
        let gfx = cc.gfx;
        let mesh = new cc.Mesh();

        var vfmtMesh = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
        ]);
        vfmtMesh.name = 'vfmtPosUvNormal';

		mesh.init(vfmtMesh, verts.length);
        mesh.setIndices(indices, 0);
		mesh.setVertices(gfx.ATTR_POSITION, verts);
        mesh.setVertices(gfx.ATTR_UV0, uv);
        mesh.setVertices(gfx.ATTR_NORMAL, normals);
		mesh.setPrimitiveType(gfx.PT_TRIANGLES, 0);
        return mesh;
    }
}
