const { ccclass, property } = cc._decorator;

@ccclass
export class ParticleSystem extends cc.Component {
    private static _instance: ParticleSystem = null;
    public static get instance() {
        return this._instance;
    }

    @property({ type: cc.Prefab, visible: true })
    private _correctParticlePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    private _correctDimPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    private _wrongParticlePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    private _wrongDimPrefab: cc.Prefab = null;

    protected onLoad(): void {
        ParticleSystem._instance = this;
    }

    public PlayCorrect(position: cc.Vec2);
    public PlayCorrect(target: cc.Node, offset?: cc.Vec2);
    public PlayCorrect(arg1: any, arg2: any = cc.Vec2.ZERO) {
        const particleNode = cc.instantiate(this._correctParticlePrefab);
        const dimNode = cc.instantiate(this._correctDimPrefab);

        if (arg1 instanceof cc.Vec2) {
            particleNode.setParent(cc.director.getScene());
            particleNode.setPosition(arg1);
        } else {
            particleNode.setParent(arg1);
            particleNode.setPosition(arg2);

            const worldPos = particleNode.parent.convertToWorldSpaceAR(particleNode.getPosition());
            particleNode.setParent(cc.director.getScene());
            particleNode.setPosition(worldPos);
        }

        dimNode.setParent(cc.director.getScene());
        dimNode.setPosition(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
    }

    public PlayWrong(position: cc.Vec2);
    public PlayWrong(target: cc.Node, offset?: cc.Vec2);
    public PlayWrong(arg1: any, arg2: any = cc.Vec2.ZERO) {
        const particleNode = cc.instantiate(this._wrongParticlePrefab);
        const dimNode = cc.instantiate(this._wrongDimPrefab);

        if (arg1 instanceof cc.Vec2) {
            particleNode.setParent(cc.director.getScene());
            particleNode.setPosition(arg1);
        } else {
            particleNode.setParent(arg1);
            particleNode.setPosition(arg2);

            const worldPos = particleNode.parent.convertToWorldSpaceAR(particleNode.getPosition());
            particleNode.setParent(cc.director.getScene());
            particleNode.setPosition(worldPos);
        }

        dimNode.setParent(cc.director.getScene());
        dimNode.setPosition(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
    }
}
