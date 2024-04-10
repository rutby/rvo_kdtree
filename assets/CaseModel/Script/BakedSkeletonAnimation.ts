const {ccclass, property} = cc._decorator;

@ccclass
export default class BakedSkeletonAnimation extends cc.Component {
    @property([cc.SkeletonAnimationClip]) clips: cc.SkeletonAnimationClip[] = [];
    @property(cc.Model) model: cc.Model = null;
    @property(cc.Boolean) baked: boolean = false;

    private _ratios: number[] = [];
    private _pairs: {target: cc.Node, values: any[]}[] = [];
    private _material: cc.Material = null;



    protected start(): void {
        for(let clip of this.clips) {
            clip._model = this.model;
            let data = clip.createCurves(null, this.node);

            this._ratios = data[0].ratios;
            this._pairs = data[0].pairs;

            // this.extendCurve();
            this._duration = clip.duration;
            break;
        }

        this._material = this.getComponent(cc.MeshRenderer).getMaterials()[0];

        //================================================ 创建纹理
        let width = this._ratios.length;
        let height = this._pairs.length;
        
        let texture = new cc.Texture2D();
        let NEAREST = cc.Texture2D.Filter.NEAREST;
        texture.setFilters(NEAREST, NEAREST);

        let pixelFormat = cc.Texture2D.PixelFormat.RGBA8888;
        let jointsData = new Uint8Array(width * height * 4);
        texture.initWithData(jointsData, pixelFormat, width, height);

        let jointsTexture = texture;
        this._material.setProperty('jointsTexture', jointsTexture);

        //================================================ 写入纹理
        // let buffer = new Uint8Array(16);
        // for(let frame = 0; frame < width; frame++) {
        //     for(let jointIdx = 0; jointIdx < this._pairs.length; jointIdx++) {
        //         let pair = this._pairs[jointIdx];
        //         let matrixOrArray = pair.values[frame];
        //         let data = matrixOrArray.m? matrixOrArray.m: matrixOrArray;
        //         for(let i = 0; i < 16; i++) {
        //             data[i]
        //             buffer
        //         }
        //     }
        //     // this._jointsFloat32Data.set(matrix.m, 16 * iMatrix);
        // }
    }

    private float2byte(value: number) {
        for(let i = 0; i < 256; i++) {
            
        }
    }

    private _time: number = 0;
    private _duration: number = 0;
    protected update(dt: number): void {
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

    //================================================ 
    private sample(ratio) {
        let ratios = this._ratios;
        let index = this.quickFindIndex(ratios, ratio);
        if (index < -1) {
            index = ~index - 1;
        }

        let pairs = this._pairs;
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            pair.target._jointMatrix = pair.values[index];
        }
    }

    private quickFindIndex(ratios, ratio) {
        var length = ratios.length - 1;
    
        if (length === 0) return 0;
    
        var start = ratios[0];
        if (ratio < start) return 0;
    
        var end = ratios[length];
        if (ratio > end) return ~ratios.length;
    
        ratio = (ratio - start) / (end - start);
    
        var eachLength = 1 / length;
        var index = ratio / eachLength;
        var floorIndex = index | 0;
        var EPSILON = 1e-6;
    
        if ((index - floorIndex) < EPSILON) {
            return floorIndex;
        }
        else if ((floorIndex + 1 - index) < EPSILON) {
            return floorIndex + 1;
        }
    
        return ~(floorIndex + 1);
    }

    private extendCurve(): void {
        let ratios = this._ratios;
        let pairs = this._pairs;

        for(let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            let matrixs = pair.values;
            let newRatios = [];
            let newValues = [];
            let prevMatrix = null;
            let prevRatio = null;

            for(let j = 0; j < ratios.length; j++) {
                let ratio = ratios[j];
                let matrix = matrixs[j];

                if (prevMatrix) {
                    let insertMatrix = null;
                    if (matrix.clone) {
                        insertMatrix = matrix.clone();
                        for(let j = 0; j < 16; j++) {
                            if (prevMatrix.clone) {
                                insertMatrix.m[j] = (prevMatrix.m[j] + matrix.m[j]) / 2;
                            } else {
                                insertMatrix.m[j] = (prevMatrix[j] + matrix.m[j]) / 2;
                            }
                        }
                    } else {
                        insertMatrix = new Float32Array(16);
                        for(let j = 0; j < 16; j++) {
                            if (prevMatrix.clone) {
                                insertMatrix[j] = (prevMatrix.m[j] + matrix[j]) / 2;
                            } else {
                                insertMatrix[j] = (prevMatrix[j] + matrix[j]) / 2;
                            }
                        }
                    }
    
                    let insertRatio = (prevRatio + ratio) / 2;
                    newRatios.push(insertRatio);
                    newValues.push(insertMatrix);
                }
                prevMatrix = matrix;
                prevRatio = ratio;

                newRatios.push(ratio);
                newValues.push(matrix);
            }

            this._ratios = newRatios;
            pair.values = newValues;
        }
    }
}
