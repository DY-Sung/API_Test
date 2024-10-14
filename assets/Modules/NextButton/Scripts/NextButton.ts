
const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-2)
export default class NextButton extends cc.Component {

    protected onLoad(): void {
        this.Init();
    }

    Init() {
        cc.Tween.stopAllByTarget(this.node);

        this.node.scale = 1;
        this.node.active = false;
    }

    private Idle() {
        cc.tween(this.node)
            .repeatForever(
                cc.tween(this.node)
                    .by(0.8, { scale: 0.1 })
                    .by(0.8, { scale: -0.1 })
            )
            .start()
    }

    Show() {
        this.node.active = true;
        this.Idle();
    }

    Stop() {
        cc.Tween.stopAllByTarget(this.node);

        this.node.scale = 1;
    }
}
