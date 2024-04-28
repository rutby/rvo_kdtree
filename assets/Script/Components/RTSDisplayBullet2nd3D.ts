import { PrimitiveUtils } from "../Utils/PrimitiveUtils";

let gfx = cc.gfx;
var vfmtMesh = new gfx.VertexFormat([
	{ name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
	{ name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
	{ name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
]);
vfmtMesh.name = 'vfmtPosUvNormal';

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class RTSDisplaySprite3D extends cc.Component {
	@property(cc.Sprite) public spSource: cc.Sprite = null;
	@property(cc.Boolean) public flipX: boolean = false;

	private _meshRenderer: cc.MeshRenderer = null;
	private _generated: boolean = false;
	private _model: any = null;

	private _percentDis: number = 0;
	private _duration: number = 2;
	private _time: number = 0;

	private _uv0: cc.Vec2 = null;
	private _uv1: cc.Vec2 = null;
	private _w: number = 0;
	private _h: number = 0;

	protected update(dt: number): void {
		this._time = (this._time + dt) % this._duration;
		this._percentDis = 	this._time / this._duration;
		// this._percentDis = 0.5;

		this.updateMesh();
	}

	protected onLoad(): void {
		this._meshRenderer = this.getComponent(cc.MeshRenderer);
		this.generate();
	}

	//================================================ private
	private updateMesh(): void {
		// if (!this._generated) {
		// 	this.generate();
		// }

		let uw = this._uv1.x - this._uv0.x;
		let uh = this._uv1.y - this._uv0.y;

		let minx = -this._w * this._percentDis;
		let maxx = 0;
		let miny = -this._h * (this.node.anchorY);
		let maxy = miny + this._h;

		let verts = [
			minx, miny, 0,
			maxx, miny, 0,
			maxx, maxy, 0,
			minx, maxy, 0,
		];

		let uvs = [
			this._uv1.x - uw * this._percentDis, this._uv0.y,
			this._uv1.x, this._uv0.y,
			this._uv1.x, this._uv1.y,
			this._uv1.x - uw * this._percentDis, this._uv1.y,
		];

		// this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_UV0, uvs);
		// this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_POSITION, verts);

		this._model.positions = verts;
		this._model.uvs = uvs;
		// this._meshRenderer.mesh = PrimitiveUtils.newMesh(this._model.indices, this._model.positions, this._model.uvs, this._model.normals);


        let mesh = new cc.Mesh();
		// let mesh = this._meshRenderer.mesh;
		mesh.init(vfmtMesh, this._model.positions.length);
        mesh.setIndices(this._model.indices, 0);
		mesh.setVertices(gfx.ATTR_POSITION, this._model.positions);
        mesh.setVertices(gfx.ATTR_UV0, this._model.uvs);
        mesh.setVertices(gfx.ATTR_NORMAL, this._model.normals);
		mesh.setPrimitiveType(gfx.PT_TRIANGLES, 0);
		this._meshRenderer.mesh = mesh;
	}

	private generate(): void {
		let sf = this.spSource.spriteFrame;
		let texture = sf.getTexture();

		let w = this.spSource.node.width / 100;
		let h = this.spSource.node.height / 100;
		let shape: cc.Vec2[] = [];
		let uvs: number[] = [];
		let uv0 = cc.v2(sf.uv[0], sf.uv[1]);
		let uv1 = cc.v2(sf.uv[6], sf.uv[7]);
		if (this.flipX) {
			uv0.x = sf.uv[6];
			uv1.x = sf.uv[0];
		}
		let uw = uv1.x - uv0.x;
		let uh = uv1.y - uv0.y;

		let minx = 0;
		let maxx = 1;
		let miny = -h * (this.node.anchorY);
		let maxy = miny + h;

		shape = [
			cc.v2(minx, miny),
			cc.v2(maxx, miny),
			cc.v2(maxx, maxy),
			cc.v2(minx, maxy),
		];

		uvs = [
			uv1.x, uv0.y,
			uv1.x, uv0.y,
			uv1.x, uv1.y,
			uv1.x, uv1.y,
		];
		
		let model = PrimitiveUtils.poly2(shape);
		model.uvs = uvs;
		this._meshRenderer.mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
		this._meshRenderer.getMaterials()[0].setProperty('diffuseTexture', texture);
		this._meshRenderer.getMaterials()[0].setProperty('diffuseColor', this.node.color);

		this._uv0 = uv0;
		this._uv1 = uv1;
		this._w = w;
		this._h = h;
		this._generated = true;
		this._model = model;
	}
}