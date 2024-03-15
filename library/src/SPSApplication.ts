import { Application, SettingUIFlag, UIOptions } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4';
import { AggregatedStats, SettingFlag, TextParameters, Logger } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { LoadingOverlay } from './LoadingOverlay';
import { SPSSignalling } from './SignallingExtension';
import { MessageStats } from './Messages';
import { v4 as uuidv4 } from 'uuid';

// For local testing. Declare a websocket URL that can be imported via a .env file that will override 
// the signalling server URL builder.
declare var WEBSOCKET_URL: string;
declare var ENABLE_METRICS: boolean;

const SupportedStats : Record<string, string> = {
	'video_width': 'width',
	'video_height': 'height',
	'video_bitrate': 'bitrate',
	'video_dropped': 'dropped',
	'video_packets_lost': 'packets lost',
	'video_fps': 'fps',
	'video_pli_count': 'count',
	'video_keyframes': 'keyframes',
	'video_nack_count': 'nacks',
	'video_freeze_count': 'freeze',
	'video_jitter': 'jitter',
	'video_frame_count': 'frame count',
	'audio_bitrate': 'audio bitrate'
}

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
	    if (!ENABLE_METRICS) {
	        return;
	    }

	    // generate a unique session id
	    const sessionId: string = uuidv4();

	    // register end of session event
	    window.addEventListener('beforeunload', () => this.endSession(sessionId));

	    // collect some session data
	    this.sessionData = {};
	    this.sessionData.id = sessionId;
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

	updateStatValue(name: string, value: number) {
	    if (!ENABLE_METRICS) {
	        return;
	    }

	    if (value == null) {
	        return;
	    }

	    const statDescription = SupportedStats[name];
	    if (!statDescription) {
	        console.log(`unknown stat ${name}`);
	        return;
	    }

	    if (!this.sessionData) {
	        console.log(`no sessiondata`);
	        return;
	    }

	    if (!this.sessionData.stats) {
	        this.sessionData.stats = {};
	    }

	    if (this.sessionData.stats[name]) {
	        this.sessionData.stats[name].value = value;
	    } else {
	        this.sessionData.stats[name] = {
	            description: statDescription,
	            value: value
	        };
	    }
	}

	onSessionStats(aggregatedStats: AggregatedStats) {
	    if (!ENABLE_METRICS) {
	        return;
	    }

	    if (!this.sessionData) {
	        return;
	    }

	    this.sessionData.lastSent = Date.now();

	    // if sessionData is defined we can assume the session is active
	    if (aggregatedStats.inboundVideoStats) {
	        const videoStats = aggregatedStats.inboundVideoStats;
	        this.updateStatValue("video_width", videoStats.frameWidth);
	        this.updateStatValue("video_height", videoStats.frameHeight);
	        this.updateStatValue("video_bitrate", videoStats.bitrate);
	        this.updateStatValue("video_dropped", videoStats.framesDropped);
	        this.updateStatValue("video_packets_lost", videoStats.packetsLost);
	        // rtt?
	        this.updateStatValue("video_fps", videoStats.framesPerSecond);
	        this.updateStatValue("video_pli_count", videoStats.pliCount);
	        this.updateStatValue("video_keyframes", videoStats.keyFramesDecoded);
	        this.updateStatValue("video_nack_count", videoStats.nackCount);
	        this.updateStatValue("video_freeze_count", videoStats.freezeCount);
	        this.updateStatValue("video_jitter", videoStats.jitter);
	        this.updateStatValue("video_frame_count", videoStats.framesReceived);
	    }
	    if (aggregatedStats.inboundAudioStats) {
	        const audioStats = aggregatedStats.inboundAudioStats;
	        this.updateStatValue("audio_bitrate", audioStats.bitrate);
	    }

	    // POST the stats
	    this.httpPost(this.sessionData.stats);
	}

	async httpPost(data: any) {
	    for (const prop in data) {
	        if (typeof data[prop] === 'number') {
	            data[prop] = data[prop].toString();
	        }
	    }
	    const post_data = {
	        id: this.sessionData.id,
	        metrics: data
	    };

	    const response = await fetch(`http://${window.location.hostname}:8000/stats`, {
	        method: 'POST',
	        mode: "no-cors",
	        body: JSON.stringify(post_data),
	        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
	    });

	    if (response.body !== null) {
	        //const as_string = new TextDecoder('utf-8').decode(response.body);
	        //console.log(as_string);
	    }
	}

	endSession(sessionId: string) {
	    if (!ENABLE_METRICS) {
	        return;
	    }

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
