import { MouseController } from "../Inputs/MouseController"
import { UeDescriptorUi } from "../UeInstanceMessage/UeDescriptorUi";
import { Logger } from "../Logger/Logger";
import { IVideoPlayer } from "./IVideoPlayer";

/**
 * Video Player Controller handles the creation of the video HTML element and all handlers
 */
export class VideoPlayerController {
    videoElementProvider: IVideoPlayer;
    audioElement: HTMLAudioElement;
    mouseController: MouseController;
    ueDescriptorUi: UeDescriptorUi;
    onUpdatePosition: (mouseEvent: MouseEvent) => void;

    constructor(videoElementProvider: IVideoPlayer) {
        this.videoElementProvider = videoElementProvider;
        this.audioElement = document.createElement("Audio") as HTMLAudioElement;
    }

    /**
     * Create the video Element
     */
    setUpMouseHandlerEvents() {
        let videoElement = this.videoElementProvider.getVideoElement();
        videoElement.onmouseenter = (event: MouseEvent) => this.handleMouseEnter(event);
        videoElement.onmouseleave = (event: MouseEvent) => this.handleMouseLeave(event);
    }

    /**
     * Handle when the Element is mouse clicked
     * @param event - Mouse Event
     */
    handleClick(event: MouseEvent) {
        let videoElement = this.videoElementProvider.getVideoElement();
        if (videoElement.paused) {
            videoElement.play();
        }

        // minor hack to alleviate ios not supporting pointerlock
        if(videoElement.requestPointerLock){
            videoElement.requestPointerLock();
        }
    }

    /**
     * Handle when the Mouse has entered the element
     * @param event - Mouse Event
     */
    handleMouseEnter(event: MouseEvent) {
        Logger.verboseLog("Mouse Entered");
        this.mouseController.sendMouseEnter();
    }

    /**
     * Handles when the mouse has left the element 
     * @param event - Mouse event
     */
    handleMouseLeave(event: MouseEvent) {
        Logger.verboseLog("Mouse Left");
        this.mouseController.sendMouseLeave();
    }

    /**
     * Handles the Load Meta Data Event
     * @param event - Event Not used
     */
    handleLoadMetaData(event: Event) {
        Logger.verboseLog("showPlayOverlay \n resizePlayerStyle");
    }

    /**
     * Handles when the Peer connection has a track event
     * @param rtcTrackEvent - RTC Track Event 
     */
    handleOnTrack(rtcTrackEvent: RTCTrackEvent) {
        Logger.verboseLog("handleOnTrack " + JSON.stringify(rtcTrackEvent.streams));
        let videoElement = this.videoElementProvider.getVideoElement();

        if (rtcTrackEvent.track) {
            Logger.verboseLog('Got track - ' + rtcTrackEvent.track.kind + ' id=' + rtcTrackEvent.track.id + ' readyState=' + rtcTrackEvent.track.readyState);
        }

        if (rtcTrackEvent.track.kind == "audio") {
            this.CreateAudioTrack(rtcTrackEvent.streams[0]);
            return;
        } else if (rtcTrackEvent.track.kind == "video" && videoElement.srcObject !== rtcTrackEvent.streams[0]) {
            videoElement.srcObject = rtcTrackEvent.streams[0];
            console.log('Set video source from video track ontrack.');
            return;
        }
    }

    /**
    * Creates the audio device when receiving an RTCTrackEvent with the kind of "audio"
    * @param audioMediaStream - Audio Media stream track
    */
    CreateAudioTrack(audioMediaStream: MediaStream) {
        let videoElement = this.videoElementProvider.getVideoElement();

        // do nothing the video has the same media stream as the audio track we have here (they are linked)
        if (videoElement.srcObject == audioMediaStream) {
            return;
        }
        // video element has some other media stream that is not associated with this audio track
        else if (videoElement.srcObject && videoElement.srcObject !== audioMediaStream) {
            // create a new audio element
            this.audioElement.srcObject = audioMediaStream;
            console.log('Created new audio element to play separate audio stream.');
        }
    }

    /**
     * Plays the audio from the audio element or sets up an event listener to play it once an interaction has occurred 
     */
    PlayAudioTrack() {
        let videoElement = this.videoElementProvider.getVideoElement();

        // attempt to auto play the audio from the audio element if not then set up a listener 
        this.audioElement.muted = false;
        this.audioElement.play().catch((onRejectedReason: string) => {
            console.log(onRejectedReason);
            console.log("Browser does not support autoplaying audio without interaction - to resolve this we are going to run the audio until the video is clicked");

            let clickToPlayAudio = () => {
                this.audioElement.muted = false;
                this.audioElement.play();
                videoElement.removeEventListener("click", clickToPlayAudio);
            };

            videoElement.addEventListener("click", clickToPlayAudio);
        });
    }

    /**
     * Set the Video Elements src object tracks to enable
     * @param enabled - Enable Tracks on the Src Object
     */
    setVideoEnabled(enabled: boolean) {
        // this is a temporary hack until type scripts video element is updated to reflect the need for tracks on a html video element 
        let videoElement = this.videoElementProvider.getVideoElement() as any;
        videoElement.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.enabled = enabled);
    }

}

/* 5457524F4D4D */