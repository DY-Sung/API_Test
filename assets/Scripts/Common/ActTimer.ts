export class ActTimer {
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(newTime: number) {
        this._time = newTime;
    }

    private _callback: Function = null;
    public get callback(): Function {
        return this._callback;
    }

    private _target: any = {};
    public get target() {
        return this._target;
    }

    private readonly _tag = 101;

    constructor(time: number, callback: Function) {
        this._time = time;
        this._callback = callback;
        this._target = {};
    }

    public Play() {
        cc.tween(this._target)
            .tag(this._tag)
            .delay(this.time)
            .call(() => this.callback())
            .start();
    }

    public PlayWithDelay(delay: number) {
        cc.tween(this._target)
            .tag(this._tag)
            .delay(delay)
            .call(() => this.Play())
            .start();
    }

    public Stop() {
        cc.Tween.stopAllByTag(this._tag);
    }
}
