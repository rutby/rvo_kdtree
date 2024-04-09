import KeyboardListener from "../../Script/Components/KeyboardListener";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('Scene/TestcaseAnimation3D')
export default class TestcaseAnimation3D extends cc.Component {
    protected start(): void {
        !CC_BUILD && this.addComponent(KeyboardListener);
    }

}
