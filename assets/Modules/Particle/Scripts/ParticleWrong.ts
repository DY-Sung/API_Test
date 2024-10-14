const { ccclass, property } = cc._decorator;

@ccclass
export class ParticleWrong extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private _root: cc.Node = null;

    protected onLoad(): void {
        this.node.opacity = 0;
    }

    protected async start() {
        await this.Run();
        this.node.destroy();
    }

    public async Run() {
        this.node.opacity = 255;

        this._root.opacity = 0;
        cc.tween(this._root).to(0.3, { opacity: 255 });
        cc.tween(this._root).by(0.2, { y: 10 }).by(0.2, { y: -10 }).union().repeat(2).start();

        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1.2 * 1000));
    }
}
