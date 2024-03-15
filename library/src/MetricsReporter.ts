import { AggregatedStats } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { v4 as uuidv4 } from 'uuid';

declare var ENABLE_METRICS: boolean;
declare var METRICS_URL: string;

const SupportedStats : Record<string, string> = {
	'video_width': 'Stream resolution width in pixels.',
	'video_height': 'Stream resolution height in pixels.',
	'video_bitrate': 'Stream video bitrate in bits per second.',
	'video_dropped': 'Video stream frames dropped.',
	'video_packets_lost': 'Video stream packets lost',
	'video_fps': 'Video stream frames per second.',
	'video_pli_count': 'Picture Loss Indication count.',
	'video_keyframes': 'Video stream keyframes.',
	'video_nack_count': 'Video stream negative acknowledgements.',
	'video_freeze_count': 'Video stream freeze count.',
	'video_jitter': 'Video stream jitter.',
	'video_frame_count': 'Video stream frame count.',
	'audio_bitrate': 'Audio stream bitrate in bits per second.',
    'loading_time': 'Stream loading time in milliseconds.'
}

export class MetricsReporter {
	private sessionData: any;
	private loadingStart: number | null;

	constructor() {
		this.sessionData = {};
		this.loadingStart = null;
	}

	startLoading() {
		if (!this.loadingStart) {
			this.loadingStart = Date.now();
		}
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
			this.loadingStart = null;
			this.updateStatValue("loading_time", this.sessionData.loadingDuration);
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

	private updateStatValue(name: string, value: number) {
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


	private async httpPost(data: any) {
		const post_data = {
			id: this.sessionData.id,
			metrics: data
		};

		const metrics_url = METRICS_URL || `http://${window.location.hostname}:8000/stats`;
		try {
			const response = await fetch(metrics_url, {
				method: 'POST',
				mode: "no-cors",
				body: JSON.stringify(post_data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		} catch (error) {
			console.error(`Unable to POST stats to ${metrics_url}: ${error}`);
		}
	}
}

