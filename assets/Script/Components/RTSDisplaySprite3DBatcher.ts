/* eslint-disable eqeqeq */
/* eslint-disable max-lines-per-function */

import { PrimitiveUtils } from "../Utils/PrimitiveUtils";
import RTSSprite3DBatcher, { RTSSprite3DBatchType } from "./RTSSprite3DBatcher";

interface IModel {
	indices: Array<number>,
	positions: Array<number>,
	uvs: Array<number>,
}

/* eslint-disable require-jsdoc */
const { ccclass, property, executeInEditMode, menu } = cc._decorator;
@ccclass
@executeInEditMode
@menu('RTS/Display/Components/RTSDisplaySprite3DBatcher')
export default class RTSDisplaySprite3DBatcher extends cc.Component {
	@property({ type: cc.Enum(RTSSprite3DBatchType) }) public batchType: number = RTSSprite3DBatchType.Army;

	private _meshRenderer: cc.MeshRenderer = null;
	private _model: IModel = null;
	protected onLoad(): void {
		this._meshRenderer = this.getComponent(cc.MeshRenderer);

		this.resize();
		this._meshRenderer.mesh = PrimitiveUtils.newMeshPosUv(this._model.indices, this._model.positions, this._model.uvs);
	}

	protected lateUpdate(dt: number): void {
		let items = RTSSprite3DBatcher.getInstance<RTSSprite3DBatcher>().items(this.batchType);
		let count = 0;
		for (let key in items) {
			count++;
		}

		/** 增容 */
		if (count > this._capacity) {
			this._capacity *= 2;
			this.resize();
		}
		
		/** 更新 */
		let indices = this._model.indices;
		let positions = this._model.positions;
		let uvs = this._model.uvs;
		let itemIndex = 0;
		let itemIndex4 = 0;
		let itemIndex6 = 0;
		let itemIndex8 = 0;
		let itemIndex12 = 0;
		for (let key in items) {
			let item = items[key];

			itemIndex4 = itemIndex * 4;
			itemIndex6 = itemIndex * 6;
			item.indices.forEach((value, index) => {
				indices[itemIndex6 + index] = value + itemIndex4;
			});

			itemIndex12 = itemIndex * 12;
			item.positions.forEach((value, index) => {
				positions[itemIndex12 + index] = value;
			});

			itemIndex8 = itemIndex * 8;
			item.uvs.forEach((value, index) => {
				uvs[itemIndex8 + index] = value;
			});

			itemIndex++;
		}

		if (count > 0) {
			this._meshRenderer.enabled = true;
			this._meshRenderer.mesh.setIndices(this._model.indices, 0);
			this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_POSITION, this._model.positions);
			this._meshRenderer.mesh.setVertices(cc.gfx.ATTR_UV0, this._model.uvs);
			let subDatas = this._meshRenderer.mesh._subDatas;
			if (subDatas && subDatas[0] && subDatas[0].ib) {
				subDatas[0].ib._numIndices = count * 6;
			}
		} else {
			this._meshRenderer.enabled = false;
		}
	}

	//================================================ private
	private _capacity: number = 200;
	private resize(): void {
		this._model = {
			indices: new Array(this._capacity * 6),
			positions: new Array(this._capacity * 12),
			uvs: new Array(this._capacity * 8),
		};
		
		this._model.indices.fill(0, 0, this._model.indices.length);
		this._model.positions.fill(0, 0, this._model.positions.length);
		this._model.uvs.fill(0, 0, this._model.uvs.length);
	}
}