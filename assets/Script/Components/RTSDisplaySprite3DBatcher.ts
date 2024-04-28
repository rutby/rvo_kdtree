/* eslint-disable eqeqeq */
/* eslint-disable max-lines-per-function */

import { PrimitiveUtils } from "../Utils/PrimitiveUtils";
import RTSSprite3DBatcher, { RTSSprite3DBatchType } from "./RTSSprite3DBatcher";

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode, menu } = cc._decorator;
@ccclass
@executeInEditMode
@menu('RTS/Display/Components/RTSDisplaySprite3DBatcher')
export default class RTSDisplaySprite3DBatcher extends cc.Component {
	@property({ type: cc.Enum(RTSSprite3DBatchType) }) public batchType: number = RTSSprite3DBatchType.Army;
	@property(cc.Integer) public count: number = 200;

	private _meshRenderer: cc.MeshRenderer = null;
	protected onLoad(): void {
		this._meshRenderer = this.getComponent(cc.MeshRenderer);

		let indices = new Array<number>(this.count * 6);
		indices.fill(0, 0, indices.length);
		let positions = new Array<number>(this.count * 12);
		positions.fill(0, 0, indices.length);
		let uvs = new Array<number>(this.count * 8);
		uvs.fill(0, 0, indices.length);
		this._meshRenderer.mesh = PrimitiveUtils.newMeshPosUv(indices, positions, uvs);
	}

	protected lateUpdate(dt: number): void {
		let model = {
			indices: [],
			positions: [],
			uvs: [],
		};

		let items = RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().items(this.batchType);
		let offset = 0;
		for (let key in items) {
			let item = items[key];

			item.indices.forEach(index => {
				model.indices.push(index + offset);
			});
			offset += 4;
			model.positions = model.positions.concat(item.positions);
			model.uvs = model.uvs.concat(item.uvs);
		}

		if (model.indices.length > 0) {
			this._meshRenderer.enabled = true;
			this._meshRenderer.mesh.setIndices(model.indices, 0);
			this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_POSITION, model.positions);
			this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_UV0, model.uvs);
			let subDatas = this._meshRenderer.mesh._subDatas;
			if (subDatas && subDatas[0] && subDatas[0].ib) {
				subDatas[0].ib._numIndices = model.indices.length;
			}
		} else {
			this._meshRenderer.enabled = false;
		}
	}
}