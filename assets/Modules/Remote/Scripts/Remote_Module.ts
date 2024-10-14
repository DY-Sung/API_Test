import SoundController, { Effect, Volume } from '../../../Scripts/Common/SoundController';
import Remote_MainBtn_Touch from './Remote_MainBtn_Touch_Module';
import { Remote_FoldState } from './Remote_Types_Module';

const { ccclass, property } = cc._decorator;

const REMOTE_CHANGE_TIME: number = 0.15;

@ccclass
export default class Remote_Module extends cc.Component {
    // @property([Remote_MainBtn_Onoff])
    // Btns_Onoff: Remote_MainBtn_Onoff[] = [];
    @property([Remote_MainBtn_Touch])
    Btns_Touch: Remote_MainBtn_Touch[] = [];

    @property([cc.Node])
    stateNodes: cc.Node[] = [];

    @property(cc.Vec2)
    initPos: cc.Vec2 = cc.v2(1465, -572);
    @property([cc.Size])
    iconSize: cc.Size[] = [];
    @property(cc.BoxCollider)
    remoteCollider: cc.BoxCollider = null;

    @property({ tooltip: 'KOR / READ / ENG' })
    SubjectType: string = 'KOR';
    @property({ tooltip: '다음 활동의 폴더구조 \nex) KOR/1/1' })
    NextActivityType: string = 'KOR/1/1/';

    private _curState: Remote_FoldState = Remote_FoldState.Fold;
    public get curState(): Remote_FoldState {
        return this._curState;
    }
    public set curState(state: Remote_FoldState) {
        this._curState = state;

        this.node.setContentSize(this.iconSize[state]);
        this.remoteCollider.size = this.iconSize[state];
        // this.stateNodes.forEach((node, idx) => { node.active = idx === state; });
    }

    // ## Common
    public remote_OnoffState: number = 0;

    private isChanging: boolean = false;
    private isDrag: boolean = false;
    private isColliding: boolean = false;
    private startPos: cc.Vec2 = new cc.Vec2();
    private movePos: cc.Vec2 = new cc.Vec2();

    private touchPositions: cc.Vec2[] = [];
    private touchTimes: number[] = [];

    private isCheckVelocity: boolean = false;
    private velocity: cc.Vec2 = cc.Vec2.ZERO;
    private friction: number = 0.9;
    private sampleCount: number = 5; // 터치 종료 시점으로부터 몇개의 위치를 확인할 것인지

    private canvasWidth: number = 3840;
    private canvasHeight: number = 2160;
    private curCollideTags: number[] = [];

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel, this);

        this.curCollideTags = [];
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel, this);
    }

    Delay(duration: number) {
        return new Promise<void>((resolve) => {
            cc.tween(this.node)
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    }

    OnTouchStart() {
        console.log('Remote Touch');
        this.isDrag = true;

        const startPos = this.node.getPosition();

        this.touchPositions = [];
        this.touchTimes = [];
        this.isCheckVelocity = true;

        // this.touchPositions.push(startPos);
        // this.touchTimes.push(performance.now());
        this.velocity = cc.Vec2.ZERO;

        this.startPos.set(startPos);
        this.movePos.set(startPos);
    }

    OnTouchMove(event: cc.Event.EventTouch) {
        if (!this.isDrag) return;

        console.log('TouchMove');

        let delta = event.getDelta();

        for (let i = 0; i < this.curCollideTags.length; i++) {
            switch (this.curCollideTags[i]) {
                case 0:
                    (delta.y < 0) && (delta.y = 0);
                    break;
                case 1:
                    (delta.x > 0) && (delta.x = 0);
                    break;
                case 2:
                    (delta.y > 0) && (delta.y = 0);
                    break;
                case 3:
                    (delta.x < 0) && (delta.x = 0);
                    break;
                default:
                    break;
            }
        }

        const newPos = this.node.getPosition().add(delta);

        this.movePos.set(newPos);
        this.node.setPosition(newPos);

        // if (this.touchPositions.length >= this.sampleCount) {
        //     this.touchPositions.shift();
        //     this.touchTimes.shift();
        // }
        // this.touchPositions.push(newPos);
        // this.touchTimes.push(performance.now());

        // console.log("Move");
    }

    OnTouchEnd() {
        if (!this.isDrag) return;

        console.log('TouchEnd');

        this.isDrag = false;
        this.isCheckVelocity = false;

        const distance = Math.abs(cc.Vec2.distance(this.startPos, this.movePos));

        // console.log("distance : " + distance);

        if (distance < 10) {
            this.ChangeState();
        } else {
            if (this.isColliding) {
                this.velocity = cc.Vec2.ZERO;
                return;
            }

            if (this.touchPositions.length > 1) {
                const lastIndex = this.touchPositions.length - 1;
                const firstIndex = lastIndex - this.sampleCount >= 0 ? lastIndex - this.sampleCount : 0;
                const deltaX = this.touchPositions[lastIndex].x - this.touchPositions[firstIndex].x;
                const deltaY = this.touchPositions[lastIndex].y - this.touchPositions[firstIndex].y;
                const deltaTime = (this.touchTimes[lastIndex] - this.touchTimes[firstIndex]) / 1000; // 밀리초를 초로 변환

                if (deltaTime > 0) {
                    const velocityX = deltaX / deltaTime;
                    const velocityY = deltaY / deltaTime;
                    this.velocity = cc.v2(velocityX, velocityY);
                } else {
                    this.velocity = cc.Vec2.ZERO;
                }
            } else {
                this.velocity = cc.Vec2.ZERO;
            }
        }
    }

    OnTouchCancel() {
        if (!this.isDrag) return;

        console.log('TouchCancel');

        this.isDrag = false;
        this.isCheckVelocity = false;

        const distance = Math.abs(cc.Vec2.distance(this.startPos, this.movePos));

        // console.log("distance : " + distance);

        if (distance < 10) {
            this.ChangeState();
        }
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        this.isColliding = true;
        if (this.velocity == cc.Vec2.ZERO) {
            return;
        }

        const tag: number = other.tag;

        this.curCollideTags.push(tag);

        let normal: cc.Vec2 = cc.Vec2.ZERO;
        switch (tag) {
            case 0:
                normal = cc.v2(0, 1);
                break;
            case 1:
                normal = cc.v2(-1, 0);
                break;
            case 2:
                normal = cc.v2(0, -1);
                break;
            case 3:
                normal = cc.v2(1, 0);
                break;
            default:
                normal = cc.Vec2.ZERO;
                break;
        }

        const velocity = this.velocity;
        const dot: number = normal.dot(velocity);
        const bounce: cc.Vec2 = cc.v2(velocity.x - 2 * dot * normal.x, velocity.y - 2 * dot * normal.y);

        this.velocity = bounce;
    }
    onCollisionExit(other: cc.Collider, self: cc.Collider) {
        this.isColliding = false;

        
        this.curCollideTags = this.curCollideTags.filter((element) => {
            return element !== other.tag;
        });
    }

    protected start(): void {
        cc.director.getCollisionManager().enabled = true;

        this.canvasWidth = cc.Canvas.instance.node.getContentSize().width;
        this.canvasHeight = cc.Canvas.instance.node.getContentSize().height;

        this.Init();
    }

    Init() {
        this.isChanging = false;
        this.isDrag = false;
        this.isColliding = false;

        this.curCollideTags = [];

        this.stateNodes[Remote_FoldState.Fold].scale = 1;
        this.stateNodes[Remote_FoldState.Unfold].scale = 0;

        this.curState = Remote_FoldState.Fold;

        this.node.setPosition(this.initPos);
    }

    changeStateImmediately(targetState: Remote_FoldState) {
        this.isChanging = false;

        if (targetState === Remote_FoldState.Fold) {
            this.stateNodes[Remote_FoldState.Unfold].scale = 0;
            this.stateNodes[Remote_FoldState.Fold].scale = 1;
            this.curState = targetState;
        }
        else {
            this.stateNodes[Remote_FoldState.Unfold].scale = 1;
            this.stateNodes[Remote_FoldState.Fold].scale = 0;
            this.curState = targetState;
        }

    }

    ChangeState() {
        if (this.isChanging) return;
        SoundController.Instance.PlayEffectNum(Effect.TOUCH, Volume.EFFECT, false);

        this.isChanging = true;

        let targetState: Remote_FoldState = null;

        const easingString: string = 'circ';

        if (this.curState === Remote_FoldState.Fold) {
            targetState = Remote_FoldState.Unfold;

             // 접혀져 있을 때 펼쳐진 리모콘이 화면 밖으로 나가면 화면 안쪽으로 이동
             const limitWidth: number = this.canvasWidth / 2 - this.iconSize[1].width / 2;
             const limitHeight: number = this.canvasHeight / 2 - this.iconSize[1].height / 2;
 
             if (this.node.x < -limitWidth) {
                 this.node.x = -limitWidth;
             }
             else if (this.node.x > limitWidth) {
                 this.node.x = limitWidth;
             }
 
             if (this.node.y < -limitHeight) {
                 this.node.y = -limitHeight;
             }
             else if (this.node.y > limitHeight) {
                 this.node.y = limitHeight;
             }

            cc.tween(this.stateNodes[Remote_FoldState.Unfold])
                .to(REMOTE_CHANGE_TIME, { scale: 1 }, { easing: easingString + 'Out' })
                .start();

            cc.tween(this.stateNodes[Remote_FoldState.Fold])
                .to(REMOTE_CHANGE_TIME, { scale: 0 }, { easing: easingString + 'In' })
                .call(() => {
                    this.isChanging = false;
                    this.curState = Remote_FoldState.Unfold;
                })
                .start();
        } else {
            targetState = Remote_FoldState.Fold;

            cc.tween(this.stateNodes[Remote_FoldState.Fold])
                .to(REMOTE_CHANGE_TIME, { scale: 1 }, { easing: easingString + 'Out' })
                .start();

            cc.tween(this.stateNodes[Remote_FoldState.Unfold])
                .to(REMOTE_CHANGE_TIME, { scale: 0 }, { easing: easingString + 'In' })
                .call(() => {
                    this.isChanging = false;
                    this.curState = Remote_FoldState.Fold;
                })
                .start();
        }

        // const remoteFoldEvent: cc.Event.EventCustom = new cc.Event.EventCustom(UI_Common_EventType.Remote_Fold, true);
        // remoteFoldEvent.detail = { state: targetState };
        // this.node.dispatchEvent(remoteFoldEvent);
    }

    checkIsOutSide(): boolean {
        const remotePos: cc.Vec2 = this.node.getPosition();
        const canvasSize: cc.Size = cc.view.getVisibleSize();
        if (
            remotePos.x <= -canvasSize.width / 2 ||
            remotePos.x >= canvasSize.width / 2 ||
            remotePos.y <= -canvasSize.height / 2 ||
            remotePos.y >= canvasSize.height / 2
        ) {
            return true;
        }

        return false;
    }

    protected update(dt: number): void {
        if (this.isCheckVelocity) {
            this.touchPositions.push(this.node.getPosition());
            this.touchTimes.push(performance.now());
        }

        if (this.velocity.mag() > 0.1) {
            this.node.x += this.velocity.x * dt;
            this.node.y += this.velocity.y * dt;
            this.velocity.multiplyScalar(this.friction);

            // 감속 계수 적용 후 속도가 충분히 작아지면 멈춤
            if (this.velocity.mag() < 0.1) {
                this.velocity = cc.Vec2.ZERO;
            }
        }
    }

    // 리모톤 On Off (투명도 조절)
    async remoteOnOff() {
        cc.Tween.stopAllByTarget(this.node);

        if (this.remote_OnoffState === 0) {
            this.remote_OnoffState = 1;

            cc.tween(this.node).to(0.1, { opacity: 0 }).start();

            await this.Delay(0.1);
            this.node.active = false;
        } else {
            this.remote_OnoffState = 0;

            this.node.active = true;

            cc.tween(this.node).to(0.1, { opacity: 255 }).start();

            await this.Delay(0.1);
        }

        // const remoteFoldEvent: cc.Event.EventCustom = new cc.Event.EventCustom(UI_Common_EventType.Remote_Fold, true);
        // remoteFoldEvent.detail = { state: this.remote_OnoffState === 0 ? 1 : 0 };
        // this.node.dispatchEvent(remoteFoldEvent);
    }

    // ## 리모콘 onoff 버튼
    Btn_remoteOnOff() {
        SoundController.Instance.PlayEffectNum(Effect.TOUCH, Volume.EFFECT);

        this.remoteOnOff();
    }

    Btn_PlayTouchEffect() {
        SoundController.Instance.PlayEffectNum(Effect.TOUCH, Volume.EFFECT);
    }

    Btn_Back() {
        location.href = '../../../MAIN?name=Main&subject=' + this.SubjectType;
    }

    Btn_Next() {
        window.location.href = 'https://test.swink.co.kr/JellyKids/' + this.NextActivityType;
        // https://test.swink.co.kr/JellyKids/
    }
}
