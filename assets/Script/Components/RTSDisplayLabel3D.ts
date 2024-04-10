/* eslint-disable max-lines-per-function */
/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class RTSDisplayLabel3D extends cc.Component  {
    @property(cc.BitmapFont) public bmFont: cc.BitmapFont = null;
    @property(cc.String) public text: string = '';

    private _prevStr: string = null;
    protected update(dt: number): void {
        if (this.text !== this._prevStr) {
            this._prevStr = this.text;
            this.createMeshRenderer();
		}
    }

    //================================================ private
    private createMeshRenderer(): void {
        /** 准备数据 */
        let text = this.text;
        let len = text.length;
        let dict = this.bmFont._fontDefDictionary;
        let texture = dict._texture;
        let fontSize = this.bmFont.fontSize;

        /** 预计算总长度 */
        let defs = [];
		let xTotal = 0;
        for(let i = 0; i < len; i++) {
            let letter = text.charAt(i);
            let key = letter.charCodeAt(0);
            let def = dict.getLetter(key);
            
			xTotal += def.xAdvance;
            defs.push(def);
        }

        /** 准备uv, verts */
        let indices = [];
        let verts = [];
        let uv = [];

        let ratio = fontSize;
        let xAdvance = 0;
        for(let i = 0; i < len; i++) {
            let def = defs[i];

            let u = def.u / texture.width;
            let v = def.v / texture.height;
            let w = def.w / texture.width;
            let h = def.h / texture.height;

            /**
             * uv2 uv3
             * uv0 uv1
             * tris: 012, 132
             */

            let uv0 = cc.v2(u, v + h);
            let uv1 = cc.v2(u + w, v + h);
            let uv2 = cc.v2(u, v);
            let uv3 = cc.v2(u + w, v);

            indices = indices.concat([ 
                i * 4, 
                i * 4 + 1, 
                i * 4 + 2, 
                i * 4 + 1, 
                i * 4 + 3, 
                i * 4 + 2,
            ]);

            
			let xBase = xTotal / ratio / 2;
			let yBase = 0.5;
			let xOffset = def.offsetX;
            let yOffset = def.offsetY;

			let minx = (xAdvance + xOffset) / ratio;
			let maxx = (xAdvance + xOffset + def.w) / ratio;
			let miny = yOffset/2 / ratio;
			let maxy = (def.h + yOffset/2) / ratio;
			
            verts = verts.concat([
				cc.v3(minx - xBase, miny - yBase, 0),
				cc.v3(maxx - xBase, miny - yBase, 0),
				cc.v3(minx - xBase, maxy - yBase, 0),
				cc.v3(maxx - xBase, maxy - yBase, 0),
            ]);

            uv = uv.concat([
                uv0.x, uv0.y, 
                uv1.x, uv1.y, 
                uv2.x, uv2.y, 
                uv3.x, uv3.y,
            ]);

            xAdvance += def.xAdvance;
        }

        /** 生成mesh */
        let mesh = this.newMesh(indices, verts, uv);
        let meshRenderer = this.getComponent(cc.MeshRenderer);
        meshRenderer.mesh = mesh;
    }

    private newMesh(indices, verts, uv): cc.Mesh {
        let gfx = cc.gfx;
        let mesh = new cc.Mesh();
		mesh.init(gfx.VertexFormat.XY_UV, verts.length);
		mesh.setVertices(gfx.ATTR_POSITION, verts);
        mesh.setIndices(indices, 0);
        mesh.setVertices(gfx.ATTR_UV0, uv);
		mesh.setPrimitiveType(gfx.PT_TRIANGLES, 0);
        return mesh;
    }
}