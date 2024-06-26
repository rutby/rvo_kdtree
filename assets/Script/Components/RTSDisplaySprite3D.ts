/* eslint-disable eqeqeq */
/* eslint-disable max-lines-per-function */

import { PrimitiveUtils } from "../Utils/PrimitiveUtils";
import RTSSprite3DBatcher, { RTSSprite3DBatchType } from "./RTSSprite3DBatcher";

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode, menu } = cc._decorator;
@ccclass
@executeInEditMode
@menu('RTS/Display/Components/RTSDisplaySprite3D')
export default class RTSDisplaySprite3D extends cc.Component {
	@property(cc.SpriteFrame) public spriteFrame: cc.SpriteFrame = null;
	@property(cc.Boolean) public enableAutoBatch: boolean = false;
	@property({ type: cc.Enum(RTSSprite3DBatchType), visible: function (): boolean { return this.enableAutoBatch; } }) public batchType: number = RTSSprite3DBatchType.Army;

	private _idx: number = -1;
	private _meshRenderer: cc.MeshRenderer = null;
	protected onLoad(): void {
		this._meshRenderer = this.getComponent(cc.MeshRenderer);
		this._spriteFrame = null;

		this._idx = RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().getIdx();
	}

	private _spriteFrame: cc.SpriteFrame = null;
	protected lateUpdate(dt: number): void {
		if (!this.spriteFrame) {
			return;
		}

		if (this._spriteFrame != this.spriteFrame || CC_EDITOR || this.enableAutoBatch) {
			this._spriteFrame = this.spriteFrame;
			this.generate();
		}
	}

	protected onDisable(): void {
		RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().rmItem(this.batchType, this._idx);
	}

	//================================================ private
	private _verts: number[] = [];
	private _texture: cc.Texture2D = null;
	private _model: any = null;
	private generate(): void {
		let sf = this.spriteFrame;
		let texture = sf.getTexture();
		this.updateVerts(this.spriteFrame);

		let minx = this._verts[0] / 100;
		let maxx = this._verts[2] / 100;
		let miny = this._verts[1] / 100;
		let maxy = this._verts[3] / 100;

		if (!this._model) {
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
			this._model = model;
		}
		let verts = this._model.positions;
		verts[0] = minx;
		verts[1] = miny;
		verts[2] = 0;
		verts[3] = maxx;
		verts[4] = miny;
		verts[5] = 0;
		verts[6] = maxx;
		verts[7] = maxy;
		verts[8] = 0;
		verts[9] = minx;
		verts[10] = maxy;
		verts[11] = 0;
		let uvs = this._model.uvs;
		uvs[0] = sf.uv[0];
		uvs[1] = sf.uv[1];
		uvs[2] = sf.uv[2];
		uvs[3] = sf.uv[3];
		uvs[4] = sf.uv[6];
		uvs[5] = sf.uv[7];
		uvs[6] = sf.uv[4];
		uvs[7] = sf.uv[5];

		if (!this.enableAutoBatch) {
			if (!this._meshRenderer.mesh) {
				this._meshRenderer.mesh = PrimitiveUtils.newMeshPosUv(this._model.indices, this._model.positions, this._model.uvs);
			} else {
				this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_POSITION, this._model.positions);
				this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_UV0, this._model.uvs);
			}

			if (!this._texture || this._texture != texture) {
				this._texture = texture;
				this._meshRenderer.getMaterials()[0].setProperty('diffuseTexture', texture);
			}

			RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().rmItem(this.batchType, this._idx);
		} else {
			if (this._meshRenderer.mesh) {
				this._meshRenderer.mesh = null;
			}

			/** 无矩阵变换 */
			this._model._positions = this._model.positions;
			let positions = [];
			let posWorld = this.node.position;
			let local = this._model._positions;
			switch(this.batchType) {
				case RTSSprite3DBatchType.Army: {
					/** 小兵垂直于地面 */
					for (let i = 0; i < this._model._positions.length; i+=3) {
						positions.push((local[i] * this.node.scaleX + posWorld.x));
						positions.push((-posWorld.z));
						positions.push(local[i+1] * this.node.scaleY + posWorld.y);
					}
					break;
				}
				case RTSSprite3DBatchType.Projectile: {
					/** 子弹平行于地面 & 有旋转 */
					let radians = this.node.eulerAngles.y * Math.PI / 180;
					let sin = Math.sin(radians);
					let cos = Math.cos(radians);

					for (let i = 0; i < this._model._positions.length; i+=3) {
						let x = local[i];
						let y = local[i+1];
						let fx = cos * x - sin * y;
						let fy = sin * x + cos * y;
						positions.push((fx * this.node.scaleX + posWorld.x));
						positions.push(-posWorld.y);
						positions.push((fy * this.node.scaleY - posWorld.z));
					}
					break;
				}
			}
			
			this._model.positions = positions;
			
			RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().addItem(this.batchType, this._idx, this._model);
		}
	}

	/** 改造自sprite/2d/simple.js */
	private updateVerts(spriteFrame: cc.SpriteFrame): void {
		let size = spriteFrame.getOriginalSize();
		let rect = spriteFrame.getRect();
		let anchorX = this.node.anchorX;
		let anchorY = this.node.anchorY;

        let cw = size.width, ch = size.height,
            appx = anchorX * cw, appy = anchorY * ch,
            l, b, r, t;
        
		let ow = size.width, oh = size.height,
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