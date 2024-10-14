const { ccclass, property } = cc._decorator;

@ccclass
export class Webcam extends cc.Component {
    @property({ type: cc.VideoPlayer, visible: true })
    private _videoPlayer: cc.VideoPlayer = null;
    public get videoPlayer() {
        return this._videoPlayer;
    }

    private _webcamObject: HTMLVideoElement = null;
    public get webcamObject() {
        return this._webcamObject;
    }

    private readonly POSTER_URL: string =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    protected start(): void {
        this.Setup();
    }

    private async Setup() {
        if (CC_DEV) {
            this.videoPlayer.play();
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }

        let video: HTMLVideoElement = null;
        if (this.videoPlayer instanceof cc.VideoPlayer) {
            video = this.videoPlayer['_impl']['_video'];
        }

        video.poster = this.POSTER_URL;

        const options = {
            audio: false,
            video: {
                facingMode: 'user',
                width: {
                    ideal: this.node.width,
                },
                height: {
                    ideal: this.node.height,
                },
            },
        };

        let stream = await navigator.mediaDevices.getUserMedia(options);
        video.srcObject = stream;

        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('playsinline', 'playsinline');
        video.setAttribute('muted', '');

        video.onloadedmetadata = () => {
            this._webcamObject = video;
            this.webcamObject.play();

            console.log(this.webcamObject);
        };
    }

    Resize(video: any) {
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let sourceWidth = video.videoWidth;
        let sourceHeight = video.videoHeight;
        let sourceAspect = sourceWidth / sourceHeight;
        let screenAspect = screenWidth / screenHeight;

        if (screenAspect < sourceAspect) {
            let newWidth = sourceAspect * screenHeight;
            video.style.width = newWidth + 'px';
            video.style.marginLeft = -(newWidth - screenWidth) / 2 + 'px';

            video.style.height = screenHeight + 'px';
            video.style.marginTop = '0px';
        } else {
            let newHeight = 1 / (sourceAspect / screenWidth);
            video.style.height = newHeight + 'px';
            video.style.marginTop = -(newHeight - screenHeight) / 2 + 'px';

            video.style.width = screenWidth + 'px';
            video.style.marginLeft = '0px';
        }
    }
}
