import { AggregatedStats } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { v4 as uuidv4 } from 'uuid';

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
	'loading_time': 'Stream loading time in milliseconds.',
	'session_duration': 'Stream duration in milliseconds.'
}

export class MetricsReporter {
	private metrics: any;
	private session_id: string | undefined;
	private user_agent: string | undefined;
	private loading_start: number | undefined;
	private start_time: number | undefined;

	constructor() {
		this.metrics = {};
	}

	startLoading() {
		if (!this.loading_start) {
			this.loading_start = Date.now();
		}
	}

	startSession() {
		// collect some session data
		this.session_id = uuidv4();
		this.user_agent = navigator.userAgent;
		this.start_time = Date.now();

		if (this.loading_start) {
			const loading_duration = this.start_time - this.loading_start;
			this.updateStatValue("loading_time", loading_duration);
			this.loading_start = undefined;
		}
	}

	endSession() {
		// record end time
		const session_duration = Date.now() - this.start_time;
		this.updateStatValue("session_duration", session_duration);

		// send session data
		this.httpPost(this.metrics);
		
		// clear session id which also indicates no session
		this.session_id = undefined;
	}

	onSessionStats(aggregatedStats: AggregatedStats) {
		if (!this.session_id) {
			return;
		}

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
		this.httpPost(this.metrics);
	}

	private updateStatValue(name: string, value: number) {
		if (value == null) {
			return;
		}

		const statDescription = SupportedStats[name];
		if (!statDescription) {
			console.log(`unknown stat ${name}`);
			return;
		}

		if (this.metrics[name]) {
			this.metrics[name].value = value;
		} else {
			this.metrics[name] = {
				description: statDescription,
				value: value
			};
		}
	}


	private async httpPost(data: any) {
		const post_data = {
			id: this.session_id,
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

