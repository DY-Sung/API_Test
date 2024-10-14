const { ccclass, property } = cc._decorator;

@ccclass
export class ParticleCorrectDim extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private _dim: cc.Node = null;

    protected onLoad(): void {
        this._dim.opacity = 0;
    }

    protected async start() {
        await this.Run();
        this.node.destroy();
    }

    private async Run() {
        cc.tween(this._dim).to(0.3, { opacity: 255 }).delay(0.6).to(0.3, { opacity: 0 }).start();
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1.2 * 1000));
    }
}
