import { common } from "./common-namespace";
import { EventManager } from "./EventManager";

const { ccclass, property, executionOrder } = cc._decorator;

//사운드 볼륨 수치
export enum Volume {
    INTRO = 0.5,
    OUTRO = 0.5,
    BGM = 0.2,
    GANJI = 0.3,
    NARRATION = 1,
    EFFECT = 0.6,
}

//사운드 타입
export enum SoundType {
    BGM = 0,
    NARRATION = 1,
    EFFECT = 2,
}

export enum BGM {
    GAME,
}

export enum Effect {
    TOUCH = 0,
    CORRECT = 1,
    WRONG = 2,
    DRAG = 3,
    DROP = 4,
}

//사운드 정보
@ccclass('SoundInfo')
export class SoundInfo {
    @property(cc.String)
    clipName: string = '';

    @property(cc.AudioClip)
    clip: cc.AudioClip = null;
}

export const Volume_Max: number = 100;
export const Volume_Min: number = 0;

@ccclass
@executionOrder(-1)
export default class SoundController extends cc.Component {
    private static instance: SoundController = null;
    static get Instance() {
        return SoundController.instance;
    }

    @property(cc.AudioSource)
    bgm: cc.AudioSource = null;

    @property(cc.AudioSource)
    narration: cc.AudioSource = null;

    @property(cc.Node)
    effectNode: cc.Node = null;

    effect: cc.AudioSource[] = [];
    effectCount: number;

    @property(cc.AudioSource)
    effectNotMute: cc.AudioSource = null;

    @property(SoundInfo)
    bgmClips: SoundInfo[] = [];

    @property(SoundInfo)
    narrationClips: SoundInfo[] = [];

    @property(SoundInfo)
    effectClips: SoundInfo[] = [];

    get useAndroidVolume(): boolean {
        return window['Android'];
    }

    isMute: boolean = false;
    isPause: boolean = false;

    public curVolume: number = 0;
    public prevVolume: number = 0;

    onLoad() {
        if (!SoundController.instance) {
            SoundController.instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this.isMute = false;

        this.effect.length = this.effectNode.childrenCount;

        for (var i = 0; i < this.effect.length; i++) {
            this.effect[i] = this.effectNode.children[i].getComponent(cc.AudioSource);
        }

        this.effectCount = 0;

        if (!this.useAndroidVolume) {
            return;
        }
        // @ts-expect-error
        this.curVolume = Android.currentVolume();
        this.prevVolume = this.curVolume;
        // @ts-expect-error
        parent.m_volumeChange = this.onVolumeChange.bind(this);

    }

    //배경음 재생(번호)
    PlayBGMNum(clipNum: number, volume: number, loop: boolean) {
        if (this.bgm.clip == this.bgmClips[clipNum].clip && this.bgm.isPlaying) return;

        this.bgm.clip = this.bgmClips[clipNum].clip;
        this.bgm.volume = volume;
        this.bgm.loop = loop;
        this.bgm.play();
    }

    //배경음 재생(이름)
    PlayBGMName(clipName: string, volume: number, loop: boolean) {
        var sound = this.bgmClips.find((x) => x.clipName == clipName);

        if (this.bgm.clip == sound.clip && this.bgm.isPlaying) return;

        if (sound != null) {
            this.bgm.clip = sound.clip;
            this.bgm.volume = volume;
            this.bgm.loop = loop;
            this.bgm.play();
        } else {
            console.log('Not BGM : ' + clipName);
        }
    }

    //내레이션 재생(번호)
    PlayNarrationNum(clipNum: number, volume: number, isLoop = false) {
        this.narration.clip = this.narrationClips[clipNum].clip;
        this.narration.volume = volume;
        this.narration.loop = isLoop;
        this.narration.play();
    }

    //내레이션 재생(이름)
    PlayNarrationName(clipName: string, volume: number, isLoop = false) {
        var sound = this.narrationClips.find((x) => x.clipName == clipName);

        if (sound != null) {
            this.narration.clip = sound.clip;
            this.narration.volume = volume;
            this.narration.loop = isLoop;
            this.narration.play();
        } else {
            console.log('Not Narration : ' + clipName);
        }
    }

    //효과음 재생(번호)
    PlayEffectNum(clipNum: number, volume: number = Volume.EFFECT, isLoop = false) {
        this.effect[this.effectCount].clip = this.effectClips[clipNum].clip;
        this.effect[this.effectCount].volume = volume;
        this.effect[this.effectCount].loop = isLoop;
        this.effect[this.effectCount].play();

        if (this.effectCount < this.effect.length - 1) {
            this.effectCount++;
        } else {
            this.effectCount = 0;
        }
    }

    //효과음 재생(이름)
    PlayEffectName(clipName: string, volume: number, isLoop = false) {
        var sound = this.effectClips.find((x) => x.clipName == clipName);

        if (sound != null) {
            this.effect[this.effectCount].clip = sound.clip;
            this.effect[this.effectCount].volume = volume;
            this.effect[this.effectCount].loop = isLoop;
            this.effect[this.effectCount].play();

            if (this.effectCount < this.effect.length - 1) {
                this.effectCount++;
            } else {
                this.effectCount = 0;
            }
        } else {
            console.log('Not Effect : ' + clipName);
        }
    }

    // cc.AudioClip 재생
    PlayClip(props: { clip: cc.AudioClip; type: SoundType; volume: Volume; isLoop?: boolean }) {
        const { clip, type, volume, isLoop = false } = props;

        switch (type) {
            case SoundType.BGM:
                this.bgm.clip = clip;
                this.bgm.volume = volume;
                this.bgm.loop = isLoop;
                this.bgm.play();
                break;

            case SoundType.NARRATION:
                this.narration.clip = clip;
                this.narration.volume = volume;
                this.narration.loop = isLoop;
                this.narration.play();
                break;

            case SoundType.EFFECT:
                const currEff = this.effect[this.effectCount];

                currEff.clip = clip;
                currEff.volume = volume;
                currEff.loop = isLoop;
                currEff.play();

                if (this.effectCount < this.effect.length - 1) {
                    this.effectCount++;
                } else {
                    this.effectCount = 0;
                }
        }
    }

    //중지되지 않는 효과음 재생(번호)
    PlayEffectNotMuteNum(clipNum: number, volume: number, isLoop = false) {
        this.effectNotMute.clip = this.effectClips[clipNum].clip;
        this.effectNotMute.volume = volume;
        this.effectNotMute.loop = isLoop;
        this.effectNotMute.play();
    }

    //중지되지 않는 효과음 재생(이름)
    PlayEffectNotMuteName(clipName: string, volume: number, isLoop = false) {
        var sound = this.effectClips.find((x) => x.clipName == clipName);

        if (sound != null) {
            this.effectNotMute.clip = sound.clip;
            this.effectNotMute.volume = volume;
            this.effectNotMute.loop = isLoop;
            this.effectNotMute.play();
        } else {
            console.log('Not Effect : ' + clipName);
        }
    }

    //배경음 중지
    StopBGM() {
        this.bgm.stop();
    }

    //내레이션 중지
    StopNarration() {
        this.narration.stop();
    }

    //특정 효과음 중지(번호)
    StopEffectNum(clipNum: number) {
        this.effect.forEach((x) => {
            if (x.clip == this.effectClips[clipNum].clip && x.isPlaying) {
                x.stop();
                x.loop = false;
            }
        });
    }

    //특정 효과음 중지
    StopEffectName(clipName: string) {
        var sound = this.effectClips.find((x) => x.clipName == clipName);

        this.effect.forEach((x) => {
            if (x.clip == sound.clip && x.isPlaying) {
                x.stop();
                x.loop = false;
            }
        });
    }

    // 특정 효과음 중지(clip)
    StopEffectClip(clip: cc.AudioClip) {
        this.effect.forEach((eff) => {
            if (eff.clip === clip) {
                eff.stop();
                eff.loop = false;
            }
        });
    }

    //중지되지 않는 효과음 중지
    StopNotMute() {
        this.effectNotMute.stop();
        this.effectNotMute.loop = false;
    }

    //모든 효과음 중지
    StopAllEffect() {
        this.effect.forEach((x) => {
            x.stop();
            x.loop = false;
        });

        this.effectCount = 0;
    }

    //음소거
    Mute() {
        this.isMute = !this.isMute;

        this.bgm.mute = this.isMute;
        this.narration.mute = this.isMute;

        for (var i = 0; i < this.effect.length; i++) {
            this.effect[i].mute = this.isMute;
        }

        cc.log('BGM : ' + this.bgm.mute);
        cc.log('Narr : ' + this.bgm.mute);
        cc.log('Eff : ' + this.bgm.mute);
    }

    //사운드 길이 체크(번호)
    GetDurationNum(clipNum: number, type: SoundType) {
        switch (type) {
            case SoundType.BGM:
                return this.bgmClips[clipNum].clip.duration;

            case SoundType.NARRATION:
                return this.narrationClips[clipNum].clip.duration;

            case SoundType.EFFECT:
                return this.effectClips[clipNum].clip.duration;
        }
    }

    //사운드 길이 체크(이름)
    GetDurationName(clipName: string, type: SoundType) {
        switch (type) {
            case SoundType.BGM:
                this.bgmClips.forEach((x) => {
                    if (x.clipName == clipName) {
                        return x.clip.duration;
                    }
                });
                break;

            case SoundType.NARRATION:
                this.narrationClips.forEach((x) => {
                    if (x.clipName == clipName) {
                        return x.clip.duration;
                    }
                });
                break;

            case SoundType.EFFECT:
                this.effectClips.forEach((x) => {
                    if (x.clipName == clipName) {
                        return x.clip.duration;
                    }
                });
                break;
        }

        return 0;
    }

    //모든 사운드 일시정지
    PauseAll(): void {
        this.isPause = true;

        this.bgm.pause();
        this.narration.pause();
        this.effect.forEach((x) => x.pause());
    }

    //모든 사운드 재게(일시정지한 사운드만)
    ResumeAll(): void {
        this.isPause = false;

        this.bgm.resume();
        this.narration.resume();
        this.effect.forEach((x) => x.resume());
    }

    public IsPlaying(clip: cc.AudioClip) {
        let ret: boolean = this.effect.some((source) => source.clip === clip && source.isPlaying);
        return ret;
    }

    //#region 기기 볼륨 동기화 관련 코드

    /**
     * 볼륨 세팅 함수
     * @param targetProgress 0~1 사이의 값
     */
    setVolume(targetProgress: number): number {
        if (!this.useAndroidVolume) {
            return 0;
        }

        // 1과 0 사이로 보정
        const revisedProgress: number = targetProgress > 1 ? 1 : targetProgress < 0 ? 0 : targetProgress;

        // @ts-expect-error
        const curVolume: number = Android.currentVolume();

        const targetVolume: number = Math.ceil(revisedProgress * Volume_Max);
        this.curVolume = targetVolume;

        // 볼륨 증가라면
        if (targetVolume >= curVolume) {
            for (let i = 0; i < targetVolume - curVolume; i++) {
                // @ts-expect-error
                Android.volumeUp();
            }
        } else {
            for (let i = 0; i < curVolume - targetVolume; i++) {
                // @ts-expect-error
                Android.volumeDown();
            }
        }

        return targetVolume;
    }
    getVolume(): number {
        if (!this.useAndroidVolume) {
            return 0;
        }

        // @ts-expect-error
        const curVolume: number = Android.currentVolume();

        this.curVolume = curVolume;
        return curVolume;
    }
    getProgress(): number {
        if (!this.useAndroidVolume) {
            return 0;
        }

        // @ts-expect-error
        const curVolume: number = Android.currentVolume();

        this.curVolume = curVolume;

        return curVolume / Volume_Max;
    }

    checkIsVolumeChanged(): boolean {
        if (!this.useAndroidVolume) {
            return false;
        }

        // @ts-expect-error
        const checkVolume: number = Android.currentVolume();

        if (checkVolume !== this.curVolume) {
            return true;
        }
        return false;
    }

    setMute(isMute: boolean) {
        if (!this.useAndroidVolume) {
            return;
        }

        const tmpVolum: number = this.curVolume;

        if (isMute) {
            this.setVolume(0);
            this.prevVolume = tmpVolum;
        } else {
            this.setVolume(this.prevVolume);
            // console.log("setVolume: " + this.setVolume(this.prevVolume / Volume_Max));
        }
    }

    onVolumeChange() {
        if (!this.useAndroidVolume) {
            return;
        }

        EventManager.emit(common.EventType.VOLUME_CHANGED);
    }

    //#endregion
}
