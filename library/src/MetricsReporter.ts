import { AggregatedStats } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { v4 as uuidv4 } from 'uuid';

declare var BUCCANEER_URL: string;

enum StatOperation {
	Reset = 1,
	Add,
	Average
}

interface StatOptions {
	operation: StatOperation;
}

const SupportedStats : Record<string, StatOptions> = {
	'video_width': { operation: StatOperation.Reset },
	'video_height': { operation: StatOperation.Reset },
	'video_bitrate': { operation: StatOperation.Average },
	'video_dropped': { operation: StatOperation.Reset },
	'video_packets_lost': { operation: StatOperation.Reset },
	'video_fps': { operation: StatOperation.Average },
	'video_pli_count': { operation: StatOperation.Reset },
	'video_keyframes': { operation: StatOperation.Reset },
	'video_nack_count': { operation: StatOperation.Reset },
	'video_freeze_count': { operation: StatOperation.Reset },
	'video_jitter': { operation: StatOperation.Average },
	'video_frame_count': { operation: StatOperation.Reset },
	'audio_bitrate': { operation: StatOperation.Average },
	'loading_duration': { operation: StatOperation.Reset },
	'session_duration': { operation: StatOperation.Reset }
}

export class MetricsReporter {
	private statValues: any;
	private session_id: string | undefined;
	private user_agent: string | undefined;
	private loading_start: number | undefined;
	private start_time: number | undefined;
	private disconnect_reason: string | undefined;

	constructor() {
		this.statValues = {};
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

		const loading_duration = this.start_time - (this.loading_start || this.start_time);
		this.updateStatValue("loading_duration", loading_duration);
		this.loading_start = undefined;
	}

	endSession(reason: string) {
		if (!this.session_id) {
			return;
		}

		// record end time
		const session_duration = Date.now() - this.start_time;
		this.updateStatValue("session_duration", session_duration);

		// record end reason
		this.disconnect_reason = reason;

		this.postSessionData();

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
	}

	private updateStatValue(name: string, value: number) {
		if (value == null) {
			return;
		}

		const statOptions = SupportedStats[name];
		if (!statOptions) {
			console.log(`Unknown stat ${name}`);
			return;
		}

		if (statOptions.operation == StatOperation.Average) {
			// Calculate EMA
			if (this.statValues[name]) {
				const K = 2.0; // Smoothing factor. Might want to make this per stat or something
				const P = this.statValues[name];
				const C = value;
				this.statValues[name] = (K * (C - P)) + P;
			} else {
				this.statValues[name] = value;
			}
		} else if (statOptions.operation == StatOperation.Add) {
			this.statValues[name] += value;
		} else {
			this.statValues[name] = value;
		}
	}

	private postSessionData() {
		const session_data = {
			id: this.session_id,
			user_agent: this.user_agent,
			disconnect_reason: this.disconnect_reason,
			stat_values: this.statValues
		}

		const events_url = `http://${BUCCANEER_URL || window.location.hostname}:8000/event`;
		try {
			const blob = new Blob([JSON.stringify(session_data)], { type: 'application/json; charset=UTF-8' });
			navigator.sendBeacon(events_url, blob);
		} catch (error) {
			console.error(`Unable to POST session data to ${events_url}: ${error}`);
		}
	}
}

