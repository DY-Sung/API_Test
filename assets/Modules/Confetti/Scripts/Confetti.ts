const { ccclass, property } = cc._decorator;

@ccclass
export default class Confetti extends cc.Component {
    private readonly _tag: number = 987;

    private _particles: cc.ParticleSystem[] = [];
    public get particles() {
        if (this._particles.length === 0) {
            for (let i = 0; i < this.node.childrenCount; i++) {
                const child = this.node.children[i];

                for (let j = 0; j < child.childrenCount; j++) {
                    this._particles.push(child.children[j].getComponent(cc.ParticleSystem));
                }
            }
        }
        return this._particles;
    }

    Play() {
        this.Stop();
        this.node.active = true;

        this.particles.forEach((particle) => {
            particle.gravity.y = -2000;
            particle.resetSystem();

            cc.tween(particle)
                .tag(this._tag)
                .delay(1.5)
                .call(() => {
                    particle.gravity.y = 0;

                    const elements = particle['_simulator']['particles'];

                    elements.forEach((element) => {
                        const randTime = Math.random() + 0.5;
                        const randX = Math.random() * 100;

                        cc.tween(element.pos)
                            .tag(this._tag)
                            .repeatForever(
                                cc
                                    .tween(element.pos)
                                    .to(randTime, { x: element.pos.x + randX }, { easing: 'sineInOut' })
                                    .to(randTime, { x: element.pos.x - randX }, { easing: 'sineInOut' })
                            )
                            .start();
                    });
                })
                .start();
        });
    }

    Stop() {
        cc.Tween.stopAllByTag(this._tag);
        this.node.active = false;
        
    }
}
