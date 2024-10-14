
const { ccclass, property } = cc._decorator;

const SHOWONTIME: number = 0.1;

@ccclass
export default class Remote_MainBtn_Touch_Module extends cc.Component {

    @property(cc.Node)
    OnNode: cc.Node = null;
    @property(cc.Node)
    OffNode: cc.Node = null;

    @property(cc.Boolean)
    isMoveActivity: boolean = false;

    @property([cc.Component.EventHandler])
    clickHandler: cc.Component.EventHandler[] = [];

    private _interactable: boolean = true;
    set interactable(value: boolean) {
        this._interactable = value;

        this.Init();
    }
    get interactable(): boolean {
        return this._interactable
    }

    protected isTouchStart: boolean = false;

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onButtonTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onButtonTouchCancel, this);

        this.Init();
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onButtonTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onButtonTouchCancel, this);

        this.Init();
    }

    Init() {
        cc.Tween.stopAllByTarget(this.OnNode)
        cc.Tween.stopAllByTarget(this.OffNode)
        this.node.scale = 1;

        this.OffNode.active = true;
        this.OffNode.opacity = 255;
        this.OnNode.active = true;
        this.OnNode.opacity = 0;
    }

    protected onButtonTouchStart() {
        if (!this.interactable) { return; }

        this.isTouchStart = true;

        cc.Tween.stopAllByTarget(this.OnNode)
        cc.Tween.stopAllByTarget(this.OffNode)
        this.OffNode.opacity = 0;
        this.OnNode.opacity = 255;

        // cc.tween(this.OffNode)
        //     .to(SHOWONTIME / 2, { opacity: 0 }, { easing: "" })
        //     .start()
        // cc.tween(this.OnNode)
        //     .to(SHOWONTIME, { opacity: 255 }, { easing: "circOut" })
        //     .start()

    }

    protected onButtonTouchEnd() {
        if (!this.interactable) { return; }
        if (!this.isTouchStart) { return; }

        this.isTouchStart = false;

        this.clickHandler.forEach((handler) => { handler.emit([Number(handler.customEventData)]) });

        cc.Tween.stopAllByTarget(this.OnNode)
        cc.Tween.stopAllByTarget(this.OffNode)

        if (this.isMoveActivity) { return; }
        this.OffNode.opacity = 255;
        this.OnNode.opacity = 0;

        // cc.tween(this.OffNode)
        //     .to(SHOWONTIME, { opacity: 255 }, { easing: "circOut" })
        //     .start()
        // cc.tween(this.OnNode)
        //     .to(SHOWONTIME / 2, { opacity: 0 }, { easing: "circIn" })
        //     .start()
    }

    protected onButtonTouchCancel() {
        if (!this.isTouchStart) { return; }

        this.isTouchStart = false;

        cc.Tween.stopAllByTarget(this.OnNode)
        cc.Tween.stopAllByTarget(this.OffNode)

        this.OffNode.opacity = 255;
        this.OnNode.opacity = 0;
        // cc.tween(this.OffNode)
        //     .to(SHOWONTIME, { opacity: 255 }, { easing: "circOut" })
        //     .start()
        // cc.tween(this.OnNode)
        //     .to(SHOWONTIME / 2, { opacity: 0 }, { easing: "circIn" })
        //     .start()
    }
}
