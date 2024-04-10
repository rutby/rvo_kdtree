import { PrimitiveUtils } from "../Utils/PrimitiveUtils";

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class RTSDisplaySprite3D extends cc.Component {
	@property(cc.Sprite) public spSource: cc.Sprite = null;

	private _texturePrev: cc.Texture2D = null;
	protected update(dt: number): void {
		if (CC_EDITOR && this.spSource && this.spSource.spriteFrame.getTexture() !== this._texturePrev) {
			this._texturePrev = this.spSource.spriteFrame.getTexture();
			this.generate();
		}
	}

	protected onLoad(): void {
		this.generate();
	}

	//================================================ private
	private generate(): void {
		let sf = this.spSource.spriteFrame;
		let texture = sf.getTexture();

		let w = this.spSource.node.width / 100;
		let h = this.spSource.node.height / 100;
		let shape: cc.Vec2[] = [
			cc.v2(-w / 2, -h / 2),
			cc.v2(+w / 2, -h / 2),
			cc.v2(+w / 2, +h / 2),
			cc.v2(-w / 2, +h / 2),
		];
		let model = PrimitiveUtils.poly2(shape);
		model.uvs = [
			sf.uv[0], sf.uv[1],
			sf.uv[2], sf.uv[3],
			sf.uv[6], sf.uv[7],
			sf.uv[4], sf.uv[5],
		];
		let meshRenderer = this.getComponent(cc.MeshRenderer);
		meshRenderer.mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
		meshRenderer.getMaterials()[0].setProperty('diffuseTexture', texture);
	}
}