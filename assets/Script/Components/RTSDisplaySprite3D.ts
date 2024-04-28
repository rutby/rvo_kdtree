import { PrimitiveUtils } from "../Utils/PrimitiveUtils";

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class RTSDisplaySprite3D extends cc.Component {
	@property(cc.SpriteFrame) public spriteFrame: cc.SpriteFrame = null;

	private _meshRenderer: cc.MeshRenderer = null;
	protected onLoad(): void {
		this._meshRenderer = this.getComponent(cc.MeshRenderer);
		this._material = null;
		this._spriteFrame = null;
	}

	private _material: cc.Material = null;
	private _spriteFrame: cc.SpriteFrame = null;
	protected update(dt: number): void {
		let dirty = false;
		if (this.spriteFrame && this._spriteFrame != this.spriteFrame) {
			dirty = true;
		}

		
		/** 编辑器模式额外检测材质 */
		if (CC_EDITOR) {
			if (this._meshRenderer.getMaterials()[0] && this._meshRenderer.getMaterials()[0] != this._material) {
				dirty = true;
			}
		}

		if (dirty) {
			this._spriteFrame = this._spriteFrame;
			this._material = this._meshRenderer.getMaterials()[0]
			this.generate();
		}
	}
	//================================================ private
	private _verts: number[] = [];
	private generate(): void {
		let sf = this.spriteFrame;
		let texture = sf.getTexture();
		this.updateVerts(this.spriteFrame);

		let minx = this._verts[0] / 100;
		let maxx = this._verts[2] / 100;
		let miny = this._verts[1] / 100;
		let maxy = this._verts[3] / 100;
		
		let shape: cc.Vec2[] = [
			cc.v2(minx, miny),
			cc.v2(maxx, miny),
			cc.v2(maxx, maxy),
			cc.v2(minx, maxy),
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
		meshRenderer.getMaterials()[0].setProperty('diffuseColor', this.node.color);
	}

	/** 移自sprite/2d/simple.js */
	// private updateVerts(sprite): void {
    //     let node = sprite.node,
    //         cw = node.width, ch = node.height,
    //         appx = node.anchorX * cw, appy = node.anchorY * ch,
    //         l, b, r, t;
        
	// 	let frame = sprite.spriteFrame,
	// 		ow = frame._originalSize.width, oh = frame._originalSize.height,
	// 		rw = frame._rect.width, rh = frame._rect.height,
	// 		offset = frame._offset,
	// 		scaleX = cw / ow, scaleY = ch / oh;
	// 	let trimLeft = offset.x + (ow - rw) / 2;
	// 	let trimRight = offset.x - (ow - rw) / 2;
	// 	let trimBottom = offset.y + (oh - rh) / 2;
	// 	let trimTop = offset.y - (oh - rh) / 2;
	// 	l = trimLeft * scaleX - appx;
	// 	b = trimBottom * scaleY - appy;
	// 	r = cw + trimRight * scaleX - appx;
	// 	t = ch + trimTop * scaleY - appy;

    //     let local = this._verts;
    //     local[0] = l;
    //     local[1] = b;
    //     local[2] = r;
    //     local[3] = t;
    // }

	private updateVerts(spriteFrame: cc.SpriteFrame): void {
		let size = spriteFrame.getOriginalSize();
		let rect = spriteFrame.getRect();
		let anchorX = 0.5;
		let anchorY = 0.5;

        let cw = size.width, ch = size.height,
            appx = anchorX * cw, appy = anchorY * ch,
            l, b, r, t;
        
		let frame = spriteFrame,
			ow = size.width, oh = size.height,
			rw = rect.width, rh = rect.height,
			offset = spriteFrame.getOffset(),
			scaleX = cw / ow, scaleY = ch / oh;
		let trimLeft = offset.x + (ow - rw) / 2;
		let trimRight = offset.x - (ow - rw) / 2;
		let trimBottom = offset.y + (oh - rh) / 2;
		let trimTop = offset.y - (oh - rh) / 2;
		l = trimLeft * scaleX - appx;
		b = trimBottom * scaleY - appy;
		r = cw + trimRight * scaleX - appx;
		t = ch + trimTop * scaleY - appy;

        let local = this._verts;
        local[0] = l;
        local[1] = b;
        local[2] = r;
        local[3] = t;
    }
}