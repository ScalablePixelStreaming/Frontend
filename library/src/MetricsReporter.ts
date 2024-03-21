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
	private ema_samples: any;
	private session_id: string | undefined;
	private user_agent: string | undefined;
	private loading_start: number | undefined;
	private start_time: number | undefined;
	private disconnect_reason: string | undefined;

	constructor() {
		this.statValues = {};
        this.ema_samples = {};
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

    private calcMA(prev_value: number, num_samples: number, new_value: number): number {
        const result = num_samples * prev_value + new_value;
        return result / (num_samples + 1.0);
    }

    private calcEMA(prev_value: number, num_samples: number, new_value: number): number {
        const K = 2 / (num_samples + 1);
        return (new_value - prev_value) * K + prev_value;
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
                const prev_value = this.statValues[name];
                const num_samples = this.ema_samples[name];
                if (num_samples < 10) {
                    this.statValues[name] = this.calcMA(prev_value, num_samples, value);
                } else {
                    this.statValues[name] = this.calcEMA(prev_value, num_samples, value);
                }
                this.ema_samples[name] += 1;
			} else {
				this.statValues[name] = value;
                this.ema_samples[name] = 1;
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

