const { ccclass, property } = cc._decorator;

@ccclass
export class ParticleCorrect extends cc.Component {
    @property({ visible: true })
    private _distanceVariant: number = 50;
    @property({ visible: true })
    private _baseDistance: number = 100;

    @property({ type: cc.Node, visible: true })
    private _root: cc.Node = null;
    private _fragments: cc.Node[] = [];
    public get fragments() {
        if (this._fragments.length === 0) {
            this._fragments = this._root.children;
        }
        return this._fragments;
    }

    protected onLoad(): void {
        this.node.opacity = 0;
    }

    protected async start() {
        await this.Run();
        this.node.destroy();
    }

    public async Run() {
        this.node.opacity = 255;
        const length = this.fragments.length;

        for (let i = 0; i < length; i++) {
            const fragment = this.fragments[i];
            fragment.opacity = 0;

            const angle = cc.misc.lerp(0, 360, i / length);
            const rad = cc.misc.degreesToRadians(angle);
            const dist = Math.random() * this._distanceVariant + this._baseDistance;

            cc.tween(fragment).to(0.5, { opacity: 255 }).start();
            cc.tween(fragment)
                .by(1, { x: dist * Math.cos(rad), y: dist * Math.sin(rad) }, { easing: 'cubicOut' })
                .delay(0.2)
                .set({ opacity: 0 })
                .start();
        }

        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1.2 * 1000));
    }
}
