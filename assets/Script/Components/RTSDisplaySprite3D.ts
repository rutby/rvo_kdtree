import { PrimitiveUtils } from "../Utils/PrimitiveUtils";

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class RTSDisplaySprite3D extends cc.Component {
	@property(cc.Sprite) public spSource: cc.Sprite = null;

	private _texturePrev: cc.Texture2D = null;
	protected update(dt: number): void {
		if (CC_EDITOR) {
			this.generate();
		}
	}

	protected onLoad(): void {
		this.generate();

		this.node.scaleY = 1;
		cc.tween(this.node).to(1, {scaleY: 2}).start();
	}

	//================================================ private
	private generate(): void {
		let sf = this.spSource.spriteFrame;
		let texture = sf.getTexture();

		let w = this.spSource.node.width / 100;
		let h = this.spSource.node.height / 100;
		let shape: cc.Vec2[] = [];
		let uvs: number[] = [];

		if (this.spSource.type === cc.Sprite.Type.FILLED) {
			let degStart = this.spSource.fillStart * 360;
			let degEnded = this.spSource.fillRange * 360;
			let posOnBorder0 = this.getInsectPoint(degStart);
			let posOnBorder1 = this.getInsectPoint(degEnded);

			let uv0 = cc.v2(sf.uv[0], sf.uv[1]);
			let uv1 = cc.v2(sf.uv[6], sf.uv[7]);
			let uw = uv1.x - uv0.x;
			let uh = uv1.y - uv0.y;

			/** verts */
			shape = [
				cc.v2(0, 0),
				cc.v2(posOnBorder0.x, posOnBorder0.y),
			];
			let arr = [
				{ deg: 45 + 90 * 0, pos: cc.v2(0.5, 0.5)},
				{ deg: 45 + 90 * 1, pos: cc.v2(-0.5, 0.5)},
				{ deg: 45 + 90 * 2, pos: cc.v2(-0.5, -0.5)},
				{ deg: 45 + 90 * 3, pos: cc.v2(0.5, -0.5)},
			];
			for(let ele of arr) {
				if (degStart < ele.deg && degEnded > ele.deg) {
					shape.push(ele.pos);
				}
			}
			shape.push(posOnBorder1);

			/** uvs */
			for(let vert of shape) {
				uvs.push(vert.x * uw + uv0.x + uw/2);
				uvs.push(vert.y * uh + uv0.y + uh/2);
			}			
		} else {
			let minx = -w * (this.node.anchorX);
			let maxx = minx + w;
			let miny = -h * (this.node.anchorY);
			let maxy = miny + h;
			shape = [
				cc.v2(minx, miny),
				cc.v2(maxx, miny),
				cc.v2(maxx, maxy),
				cc.v2(minx, maxy),
			];

			uvs = [
				sf.uv[0], sf.uv[1],
				sf.uv[2], sf.uv[3],
				sf.uv[6], sf.uv[7],
				sf.uv[4], sf.uv[5],
			];
		}
		
		let model = PrimitiveUtils.poly2(shape);
		model.uvs = uvs;
		let meshRenderer = this.getComponent(cc.MeshRenderer);
		meshRenderer.mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
		meshRenderer.getMaterials()[0].setProperty('diffuseTexture', texture);
		meshRenderer.getMaterials()[0].setProperty('diffuseColor', this.node.color);
	}

	private getInsectPoint(deg: number): cc.Vec2 {
		let posOnBorder = cc.Vec2.ZERO;
		let arr = [
			{ deg: 45 + 90 * 0, x: 0.5 },
			{ deg: 45 + 90 * 1, y: 0.5, offset: 90 },
			{ deg: 45 + 90 * 2, x: -0.5 },
			{ deg: 45 + 90 * 3, y: -0.5, offset: 270 },
			{ deg: 45 + 90 * 4, x: 0.5 },
		];
		for (let ele of arr) {
			if (deg < ele.deg) {
				let degFixed = ele.offset? ele.offset - deg: deg;
				posOnBorder.x = ele.x || Math.tan(cc.misc.degreesToRadians(degFixed)) * 0.5;
				posOnBorder.y = ele.y || Math.tan(cc.misc.degreesToRadians(degFixed)) * 0.5;
				break;
			}
		}
		return posOnBorder
	}
}