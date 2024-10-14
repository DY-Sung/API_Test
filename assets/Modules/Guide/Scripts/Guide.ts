const { ccclass, property, executeInEditMode } = cc._decorator;

type GuideType = 'touch' | 'drag' | 'drag-to-node';

@ccclass
@executeInEditMode
export class Guide extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private _hand: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    private _arrowMask: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    private _arrow: cc.Node = null;

    private _arrowWidth: number = 0;

    @property({ type: cc.Node, visible: true })
    private _dragBegin: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private _dragEnd: cc.Node = null;

    @property({ visible: true })
    private _fadeTime: number = 0.3;

    @property({ visible: true })
    private _touchTime: number = 1;

    @property({ visible: true })
    private _touchCount: number = 3;

    @property({ visible: true })
    private _dragTime: number = 1;

    @property({ visible: true })
    private _dragCount: number = 2;

    private _guideMap: Map<GuideType, Function> = new Map();

    protected onLoad(): void {
        if (CC_EDITOR) return;

        this._guideMap.set('touch', this._touchGuide.bind(this));
        this._guideMap.set('drag', this._dragGuide.bind(this));
        this._guideMap.set('drag-to-node', this._dragGuideToNode.bind(this));

        this.Stop();
    }

    protected update(dt: number): void {
        if (CC_EDITOR) {
            this._setArrowTransform();
        }
    }

    public SetArrowActive(isActive: boolean) {
        this._arrow.active = isActive;
    }

    private _setArrowTransform() {
        if (!this._dragBegin || !this._dragEnd) return;

        this._setArrowPos();
        this._setArrowAngle();
        this._setArrowWidth();
    }

    private _setArrowPos() {
        const begin = this._dragBegin.getPosition();
        this._arrowMask.setPosition(begin);
    }

    private _setArrowAngle() {
        const begin = this._dragBegin.getPosition();
        const end = this._dragEnd.getPosition();

        const width = end.x - begin.x;
        const height = end.y - begin.y;
        const rad = Math.atan2(height, width);
        const angle = cc.misc.radiansToDegrees(rad);

        this._arrowMask.angle = 180 + angle;
    }

    private _setArrowWidth() {
        const begin = this._dragBegin.getPosition();
        const end = this._dragEnd.getPosition();

        const distance = cc.Vec2.distance(begin, end);
        this._arrowMask.width = distance;
        this._arrow.width = distance;
        this._arrowWidth = distance;
    }

    public Play(type: GuideType);
    public Play(type: GuideType, begin: cc.Node, end: cc.Node);
    public Play(type: GuideType, begin?: cc.Node, end?: cc.Node) {
        this.node.active = true;

        const callback = this._guideMap.get(type);
        callback && callback(begin, end);
    }

    private _touchGuide() {
        this._arrow.width = 0;

        const originScale = this._hand.scale;

        const touchTween = cc
            .tween<cc.Node>()
            .to(1 / 6, { scale: originScale * 0.9 })
            .to(1 / 6, { scale: originScale });

        const fadeInTween = cc
            .tween<cc.Node>()
            .to(this._fadeTime / 2, { opacity: 255 })
            .delay(this._fadeTime / 2);

        const fadeOutTween = cc
            .tween<cc.Node>()
            .to(this._fadeTime / 2, { opacity: 0 })
            .delay(this._fadeTime / 2);

        cc.tween(this._hand)
            .then(fadeInTween)
            .repeat(
                this._touchCount,
                cc
                    .tween()
                    .then(touchTween)
                    .delay(this._touchTime - 1 / 3)
            )
            .then(fadeOutTween)
            .start();
    }

    private _dragGuide() {
        this._setArrowWidth();
        this._arrowMask.width = 0;
        this._hand.opacity = 0;

        const arrowWidthTween = cc
            .tween(this._arrowMask)
            .set({ opacity: 255 })
            .to(this._dragTime, { width: this._arrowWidth });

        const arrowFadeOutTween = cc.tween(this._arrowMask).to(this._fadeTime / 2, { opacity: 0 });

        const dragTween = cc
            .tween<cc.Node>()
            .set({ position: cc.v3(this._dragBegin.getPosition()) })
            .call(() => (this._arrowMask.width = 0))
            .to(this._fadeTime / 2, { opacity: 255 })
            .delay(this._fadeTime / 2)
            .call(() => arrowWidthTween.start())
            .to(this._dragTime, { position: cc.v3(this._dragEnd.getPosition()) })
            .delay(this._fadeTime / 2)
            .call(() => arrowFadeOutTween.start())
            .to(this._fadeTime / 2, { opacity: 0 });

        cc.tween(this._hand).then(dragTween).repeat(this._dragCount).start();
    }

    private _setDragNode(begin: cc.Node, end: cc.Node) {
        const beginWorldPos = begin.parent.convertToWorldSpaceAR(begin.getPosition());
        const beginLocalPos = this._dragBegin.parent.convertToNodeSpaceAR(beginWorldPos);

        const endWorldPos = end.parent.convertToWorldSpaceAR(end.getPosition());
        const endLocalPos = this._dragEnd.parent.convertToNodeSpaceAR(endWorldPos);

        this._dragBegin.setPosition(beginLocalPos);
        this._dragEnd.setPosition(endLocalPos);
    }

    private _dragGuideToNode(begin: cc.Node, end: cc.Node) {
        this._setDragNode(begin, end);
        this._setArrowTransform();
        this._arrowMask.width = 0;

        this._dragGuide();
    }

    public Stop() {
        cc.Tween.stopAllByTarget(this._hand);
        cc.Tween.stopAllByTarget(this._arrowMask);

        this.node.active = false;
    }
}
