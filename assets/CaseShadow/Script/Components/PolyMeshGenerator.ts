/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable line-comment-position */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-lines-per-function */
/* eslint-disable require-jsdoc */

import { PrimitiveUtils } from "../../../Script/Utils/PrimitiveUtils";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
@menu("Tool/PolyMeshGenerator")
export default class PolyMeshGenerator extends cc.Component {
    @property(cc.PolygonCollider) public poly: cc.PolygonCollider = null;
    @property(cc.Float) public roundness: number = 0.2;

	//================================================ cc.Component
	public start(): void {
        this.createMeshRenderer0();
	}

    private _time: number = 0;
    protected update(dt: number): void {
        if (CC_EDITOR) {
            this._time += dt;
            if (this._time > 0.1) {
                this._time = 0;
                this.createMeshRenderer0();
            }
        }
    }

    //================================================ private
    /** 三角形 */
	private createMeshRenderer0(): void {
        let polys: cc.Vec2[] = [];
        for(let point of this.poly.points) {
            polys.push(cc.v2(point.x / 100, point.y / 100));
        }
        let model = PrimitiveUtils.poly(polys, this.roundness);
        this.getComponent(cc.MeshRenderer).mesh = this.newMesh(model.indices, model.positions, model.uvs, model.normals);
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