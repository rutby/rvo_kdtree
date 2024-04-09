import { PrimitiveUtils } from "../../../Script/TestcaseShadow/Utils/PrimitiveUtils";

const { ccclass, property, requireComponent } = cc._decorator;
@ccclass
@requireComponent(cc.Animation)
export default class RTSDisplayAnimation3D extends cc.Component {
	@property(cc.Material) public material: cc.Material = null;

	private _curves: any = {};
	private _sprite: any = {};
	private _enableUpdate: boolean = false;

	protected onLoad(): void {
		let animation = this.getComponent(cc.Animation);
		let clip = animation.defaultClip;
		animation.enabled = false;
		this._curves = clip.createCurves(null, this.node)[0];
		this._duration = clip.duration;
		this.node.is3DNode = true;

		/** 获取精灵节点 */
		let sprites = [];
		if (clip.curveData.paths) {
			for(let path in clip.curveData.paths) {
				let node = cc.find(path, this.node);
				let row = clip.curveData.paths[path];
				if (row.comps && row.comps['cc.Sprite']) {
					sprites.push({
						node: node,
						frames: row.comps['cc.Sprite'].spriteFrame,
					});

					node.getComponent(cc.Sprite).destroy();
				}
			}
		}
		this._sprite = sprites;

		/** 生成mesh */
		this.scheduleOnce(() => {
			this._enableUpdate = true;

			for(let ele of sprites) {
				let node = ele.node as cc.Node;
				node.is3DNode = true;
				node.setPosition(cc.Vec3.ZERO);

				let parent = node.parent
				while(!parent.is3DNode && parent != this.node) {
					parent.is3DNode = true;
					parent = parent.parent;
				}

				let meshRenderer = node.addComponent(cc.MeshRenderer);
				meshRenderer.setMaterial(0, this.material);
				ele.meshRenderer = meshRenderer;

				this.generateMesh(meshRenderer, node);
				this.updateMesh(meshRenderer, ele.frames[0].value);
			}
		}, 0)
	}

	private _time: number = 0;
    private _duration: number = 0;
    protected update(dt: number): void {
		if (!this._enableUpdate) {
			return;
		}

        let time = this._time;
        let duration = this._duration;

        if (time > duration) {
            time = time % duration;
            if (time === 0) time = duration;
        }

        let ratio = this._time / this._duration;
        this.sample(ratio);

        time += dt;
        this._time = time;
    }

	//================================================ private
	private generateMesh(meshRenderer: cc.MeshRenderer, node: cc.Node): void {
		let w = node.width / 100;
		let h = node.height / 100;
		let shape: cc.Vec2[] = [
			cc.v2(-w / 2, -h / 2),
			cc.v2(+w / 2, -h / 2),
			cc.v2(+w / 2, +h / 2),
			cc.v2(-w / 2, +h / 2),
		];
		let model = PrimitiveUtils.poly2(shape);
		meshRenderer.mesh = PrimitiveUtils.newMesh(model.indices, model.positions, model.uvs, model.normals);
	}

	private updateMesh(meshRenderer: cc.MeshRenderer, sf: cc.SpriteFrame): void {
		if (!sf) {
			return;
		}
		let texture = sf.getTexture();

		let uvs = [
			sf.uv[0], sf.uv[1],
			sf.uv[2], sf.uv[3],
			sf.uv[6], sf.uv[7],
			sf.uv[4], sf.uv[5],
		];

		meshRenderer.mesh.setVertices(cc.gfx.ATTR_UV0, uvs);
		meshRenderer.getMaterials()[0].setProperty('diffuseTexture', texture);
	}

	private sample(ratio) {
        let ratios = this._curves.ratios;
        let index = this._curves._findFrameIndex(ratios, ratio);
        if (index < -1) {
            index = ~index - 1;
        }

		for(let ele of this._sprite) {
			this.updateMesh(ele.meshRenderer, ele.frames[index].value);
		}
    }
}