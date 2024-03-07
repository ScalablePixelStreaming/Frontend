import { Application, SettingUIFlag, UIOptions } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4';
import { AggregatedStats, SettingFlag, TextParameters, Logger } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { LoadingOverlay } from './LoadingOverlay';
import { SPSSignalling } from './SignallingExtension';
import { MessageStats } from './Messages';
import { v4 as uuidv4 } from 'uuid';

// For local testing. Declare a websocket URL that can be imported via a .env file that will override 
// the signalling server URL builder.
declare var WEBSOCKET_URL: string;

export class SPSApplication extends Application {
	private loadingOverlay: LoadingOverlay;
	private signallingExtension: SPSSignalling;
    private statsTimer: ReturnType<typeof setInterval> | undefined;
    private sessionData: any;
    private loadingStart: number | undefined;

	static Flags = class {
		static sendToServer = "sendStatsToServer"
	}

	constructor(config: UIOptions) {
		super(config);
		this.signallingExtension = new SPSSignalling(this.stream.webSocketController);
		this.signallingExtension.onAuthenticationResponse = this.handleSignallingResponse.bind(this);
		this.signallingExtension.onInstanceStateChanged = this.handleSignallingResponse.bind(this);

		this.enforceSpecialSignallingServerUrl();

		// Add 'Send Stats to Server' checkbox
		const spsSettingsSection = this.configUI.buildSectionWithHeading(this.settingsPanel.settingsContentElement, "Scalable Pixel Streaming");
		const sendStatsToServerSetting = new SettingFlag(
			SPSApplication.Flags.sendToServer,
			"Send stats to server",
			"Send session stats to the server",
			false,
			this.stream.config.useUrlParams
		);

		spsSettingsSection.appendChild(new SettingUIFlag(sendStatsToServerSetting).rootElement);
		this.loadingOverlay = new LoadingOverlay(this.stream.videoElementParent);

		this.stream.addEventListener(
			'statsReceived',
			({ data: { aggregatedStats } }) => {
                this.onSessionStats(aggregatedStats);
				if (sendStatsToServerSetting.flag) {
					this.sendStatsToSignallingServer(aggregatedStats);
				}
			}
		);

        this.stream.addEventListener('webRtcConnected', () => this.startSession() );
	}

    startSession() {
        // generate a unique session id
        const sessionId: string = uuidv4();

        // register end of session event
        window.addEventListener('beforeunload', () => this.endSession(sessionId));

        // collect some session data
        this.sessionData = {};
        this.sessionData.startTime = Date.now();
        this.sessionData.userAgent = navigator.userAgent;

        if (this.loadingStart) {
            this.sessionData.loadingDuration = this.sessionData.startTime - this.loadingStart;
            this.loadingStart = undefined;
        }

        // stop the stats polling if it exists for some reason
        if (this.statsTimer) {
            clearInterval(this.statsTimer);
        }
    }

    onSessionStats(aggregatedStats: AggregatedStats) {
        // if sessionData is defined we can assume the session is active
        if (this.sessionData) {
            let stats : any = {};
            stats.video = {};
            if (aggregatedStats.inboundVideoStats) {
                const videoStats = aggregatedStats.inboundVideoStats;
                stats.video.resolution = { width: videoStats.frameWidth, height: videoStats.frameHeight };
                stats.video.bitrate = videoStats.bitrate;
                stats.video.dropped = videoStats.framesDropped;
                stats.video.packets_lost = videoStats.packetsLost;
                // rtt?
                stats.video.fps = videoStats.framesPerSecond;
                stats.video.pli_count = videoStats.pliCount;
                stats.keyframes = videoStats.keyFramesDecoded;
                stats.nack_count = videoStats.nackCount;
                stats.freeze_count = videoStats.freezeCount;
                stats.jitter = videoStats.jitter;
                stats.video.frame_count = videoStats.framesReceived;
            }
            stats.audio = {};
            if (aggregatedStats.inboundAudioStats) {
                const audioStats = aggregatedStats.inboundAudioStats;
                stats.audio.bitrate = audioStats.bitrate;
            }
        }
    }

    endSession(sessionId: string) {
        // record end time
        this.sessionData.endTime = Date.now();
        this.sessionData.duration = this.sessionData.endTime - this.sessionData.startTime;

        // send session data
        
        // clear session stats which also indicates no session
        this.sessionData = undefined;
    }

	handleSignallingResponse(signallingResp: string, isError: boolean) {
		if (isError) {
			this.showErrorOverlay(signallingResp);
		} else {
			this.showLoadingOverlay(signallingResp);
		}
	}

	enforceSpecialSignallingServerUrl() {
		// SPS needs to build a specific signalling server url based on the application name so K8s can distinguish it
		this.stream.setSignallingUrlBuilder(() => {

			// if we have overriden the signalling server URL with a .env file use it here
			if (WEBSOCKET_URL !== undefined ) {
				return WEBSOCKET_URL as string;
			}

			// get the current signalling url
			let signallingUrl = this.stream.config.getTextSettingValue(TextParameters.SignallingServerUrl);

			// build the signalling URL based on the existing window location, the result should be 'domain.com/signalling/app-name'
			signallingUrl = signallingUrl.endsWith("/") ? signallingUrl + "signalling" + window.location.pathname : signallingUrl + "/signalling" + window.location.pathname;

			return signallingUrl
		});
	}

	showLoadingOverlay(signallingResp: string) {
		this.hideCurrentOverlay();
		this.loadingOverlay.show();
		this.loadingOverlay.update(signallingResp);

		// disable rain animation for now as perf is too poor on mobile devices
		// this.loadingOverlay.animate();

		this.currentOverlay = this.loadingOverlay;

        // only record the first call to loading.
        if (!this.loadingStart) {
            this.loadingStart = Date.now();
        }
	}

	/**
	 * Send Aggregated Stats to the Signaling Server
	 * @param stats - Aggregated Stats
	 */
	sendStatsToSignallingServer(stats: AggregatedStats) {
		const data = new MessageStats(stats);
		this.stream.webSocketController.webSocket.send(data.payload());
	}
}
