const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-2)
export class FinButton extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private _offNode: cc.Node = null;
    public get offNode() {
        return this._offNode;
    }

    @property({ type: cc.Node, visible: true })
    private _onNode: cc.Node = null;
    public get onNode() {
        return this._onNode;
    }

    @property({ type: cc.Button, visible: true })
    private _button: cc.Button = null;
    public get button() {
        return this._button;
    }

    protected onLoad(): void {
        this.Init();
    }

    public Init() {
        this.node.active = false;
        this.offNode.active = false;
        this.onNode.active = true;
    }

    public SetActive() {
        this.node.active = true;
        this.button.interactable = true;
        this.node.scale = 1;
    }

    public Idle() {
        cc.tween(this.node)
            .repeatForever(
                cc.tween(this.node)
                    .by(0.8, { scale: 0.1 })
                    .by(0.8, { scale: -0.1 }))
            .start()
    }

    Stop() {
        cc.Tween.stopAllByTarget(this.node);
    }
}
