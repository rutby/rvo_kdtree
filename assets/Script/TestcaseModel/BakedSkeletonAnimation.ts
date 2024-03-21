const {ccclass, property} = cc._decorator;

@ccclass
export default class BakedSkeletonAnimation extends cc.Component {
    @property([cc.SkeletonAnimationClip]) clips: cc.SkeletonAnimationClip[] = [];

    protected start(): void {
        for(let clip of this.clips) {
            clip.createCurves();
            let curveData = clip.curveData;
        }
    }
}
