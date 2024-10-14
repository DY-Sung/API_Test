import SoundController, { SoundType, Volume } from '../../../Scripts/Common/SoundController';

const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-2)
export default class Stamp extends cc.Component {
    @property(cc.Node)
    stampSprite: cc.Node = null;
    @property(cc.Node)
    lightNode: cc.Node = null;

    @property(cc.Animation)
    stampAnim: cc.Animation = null;

    @property(cc.AudioClip)
    stampEffectClip: cc.AudioClip = null;

    Init() {
        cc.Tween.stopAllByTarget(this.node);
        this.stampAnim.stop();

        this.stampSprite.setPosition(0, 0);
        this.lightNode.setPosition(0, 0);
        this.lightNode.angle = 0;
        this.node.active = false;
        this.node.scale = 1;
        this.node.opacity = 0;
    }

    Delay(duration: number) {
        return new Promise<void>((resolve) => {
            cc.tween(this.node)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    }

    async On() {
        this.Init();
        this.node.active = true;

        SoundController.Instance.PlayClip({
            clip: this.stampEffectClip,
            type: SoundType.EFFECT,
            volume: Volume.EFFECT,
            isLoop: false,
        });
        await this.appearAnim();
        this.idleAnim();
    }

    Off() {
        cc.Tween.stopAllByTarget(this.node);
        this.stampAnim.stop();
        this.node.active = false;
    }

    //#region Animation

    async appearAnim() {
        const appearTime: number = 0.15;
        cc.tween(this.node).to(appearTime, { opacity: 255 }).start();

        await this.Delay(appearTime);
    }

    async idleAnim() {
        this.stampAnim.play();
        // const scaleTime: number = 0.75;

        // cc.tween(this.node)
        //     .repeatForever(
        //         cc.tween(this.node)
        //             .to(scaleTime, { scale: 1.05 })
        //             .to(scaleTime, { scale: 1 })
        //     )
        //     .start()
    }

    //#endregion
}
