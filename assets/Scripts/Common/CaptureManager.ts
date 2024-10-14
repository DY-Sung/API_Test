import SoundController, { SoundType, Volume } from "./SoundController";

const { ccclass, property } = cc._decorator;

cc.macro.ENABLE_TRANSPARENT_CANVAS = true;

@ccclass
export class CaptureManager extends cc.Component {
    private static _instance: CaptureManager = null;
    public static get instance() {
        return this._instance;
    }

    @property({ type: cc.Camera, visible: true })
    private _captureCamera: cc.Camera = null;
    public get captureCamera() {
        return this._captureCamera;
    }

    @property({ visible: true })
    private _exclusiveGroupIndex: number = -1;
    public get exclusiveGroupIndex() {
        return this._exclusiveGroupIndex;
    }

    @property({ type: cc.AudioClip, visible: true })
    private _captureClip: cc.AudioClip = null;
    public get captureClip() {
        return this._captureClip;
    }

    protected onLoad(): void {
        CaptureManager._instance = this;
    }

    private GetVideoDimensions(video) {
        // Ratio of the video's intrisic dimensions
        var videoRatio = video.videoWidth / video.videoHeight;
        // The width and height of the video element
        var width = video.offsetWidth,
            height = video.offsetHeight;
        // The ratio of the element's width to its height
        var elementRatio = width / height;
        // If the video element is short and wide
        if (elementRatio > videoRatio) width = height * videoRatio;
        // It must be tall and thin, or exactly equal to the original ratio
        else height = width / videoRatio;
        return {
            width: width,
            height: height,
        };
    }

    public async Capture() {
        return new Promise<void>((resolve) => {
            const callback = async () => {
                const video = document.querySelector('video');
                const gameCanvas = cc.game.canvas;

                const newCanvas = document.createElement('canvas');
                const { width, height } = cc.winSize;
                newCanvas.width = width;
                newCanvas.height = height;

                console.log(width);
                console.log(height);

                const context = newCanvas.getContext('2d');

                context.save();
                context.translate(width, 0);
                context.scale(-1, 1);

                const videoDimension = this.GetVideoDimensions(video);
                console.log(videoDimension);

                context.drawImage(
                    video,
                    width / 2 - videoDimension.width / 2,
                    height / 2 - videoDimension.height / 2,
                    videoDimension.width,
                    videoDimension.height
                );

                context.restore();

                context.drawImage(gameCanvas, 0, 0, width, height);

                const imageBitmap = await createImageBitmap(newCanvas);

                resolve();

                try {
                    const worker = new Worker('encoding-worker.js');
                    worker.postMessage({ imageBitmap, width, height }, [imageBitmap]);

                    worker.onmessage = function (e) {
                        const { replacedBase64 } = e.data;

                        console.log(`data:image/png;base64,${replacedBase64}`);

                        // @ts-expect-error
                        Android.saveImage(replacedBase64);

                        // @ts-expect-error
                        Android.showToast('갤러리에 이미지가 저장되었습니다.');

                        console.log('done');
                    };
                } catch (e) {
                    console.warn(e);
                }
            };

            cc.director.once(cc.Director.EVENT_AFTER_DRAW, callback, this);
        });
    }

    public Btn_Capture() {
        if (this.exclusiveGroupIndex !== -1) {
            this.captureCamera.cullingMask &= ~(1 << this.exclusiveGroupIndex);
        }

        SoundController.Instance.PlayClip({ clip: this.captureClip, type: SoundType.NARRATION, volume: Volume.EFFECT });

        cc.director.once(cc.Director.EVENT_AFTER_DRAW, async () => {
            await this.Capture();
            if (this.exclusiveGroupIndex !== -1) {
                this.captureCamera.cullingMask |= 1 << this.exclusiveGroupIndex;
            }
        });
    }
}
