import { AggregatedStats } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import { v4 as uuidv4 } from 'uuid';

declare var BUCCANEER_URL: string;

enum StatOperation {
	Reset = 1,
	Add,
	Average,
    Min,
    Max
}

interface StatOptions {
    description: string;
	operation: StatOperation;
}

const SupportedStats : Record<string, StatOptions> = {
	'video_width': { description: 'Video width', operation: StatOperation.Reset },
	'video_height': { description: 'Video height', operation: StatOperation.Reset },
	'video_bitrate': { description: 'Video bitrate', operation: StatOperation.Average },
	'video_bitrate_min': { description: 'Min video bitrate', operation: StatOperation.Min },
	'video_bitrate_max': { description: 'Max video bitrate', operation: StatOperation.Max },
	'video_dropped': { description: 'Video frames dropped', operation: StatOperation.Reset },
	'video_packets_lost': { description: 'Video packets lost', operation: StatOperation.Reset },
	'video_fps': { description: 'Video frames per second', operation: StatOperation.Average },
	'video_fps_min': { description: 'Min video frames per second', operation: StatOperation.Min },
	'video_fps_max': { description: 'Max video frames per second', operation: StatOperation.Max },
	'video_pli_count': { description: 'Video PLI count', operation: StatOperation.Reset },
	'video_keyframes': { description: 'Video keyframes', operation: StatOperation.Reset },
	'video_nack_count': { description: 'Video NACK count', operation: StatOperation.Reset },
	'video_freeze_count': { description: 'Video freeze count', operation: StatOperation.Reset },
	'video_jitter': { description: 'Video jitter', operation: StatOperation.Average },
	'video_frame_count': { description: 'Video frame count', operation: StatOperation.Reset },
	'audio_bitrate': { description: 'Audio bitrate', operation: StatOperation.Average },
	'audio_bitrate_min': { description: 'Min audio bitrate', operation: StatOperation.Min },
	'audio_bitrate_max': { description: 'Max audio bitrate', operation: StatOperation.Max },
	'loading_duration': { description: 'Loading time', operation: StatOperation.Reset },
	'session_duration': { description: 'Session time', operation: StatOperation.Reset }
}

export class MetricsReporter {
	private stat_values: any;
	private ema_samples: any;
	private session_id: string | undefined;
	private user_agent: string | undefined;
	private loading_start: number | undefined;
	private start_time: number | undefined;
    private disconnect_code: string | undefined;
	private disconnect_reason: string | undefined;

	constructor() {
		this.stat_values = {};
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

    // note: code is currently left as undefined since the webrtcdisconnect event does not include
    // the code but only the reason.
    // a possible solution for it might be to use webSocketControllers close event which contains
    // the code and reason from the signalling server but reason is sometimes set by the frontend.
    // the real solution for this would be to update the pixel streaming library code to include
    // the code also.
	endSession(reason: string, code: string) {
		if (!this.session_id) {
			return;
		}

		// record end time
		const session_duration = Date.now() - this.start_time;
		this.updateStatValue("session_duration", session_duration);

		// record end reason
        this.disconnect_code = code;
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
			const video_stats = aggregatedStats.inboundVideoStats;
			this.updateStatValue("video_width", video_stats.frameWidth);
			this.updateStatValue("video_height", video_stats.frameHeight);
			this.updateStatValue("video_bitrate", video_stats.bitrate);
			this.updateStatValue("video_bitrate_min", video_stats.bitrate);
			this.updateStatValue("video_bitrate_max", video_stats.bitrate);
			this.updateStatValue("video_dropped", video_stats.framesDropped);
			this.updateStatValue("video_packets_lost", video_stats.packetsLost);
			// rtt?
			this.updateStatValue("video_fps", video_stats.framesPerSecond);
			this.updateStatValue("video_fps_min", video_stats.framesPerSecond);
			this.updateStatValue("video_fps_max", video_stats.framesPerSecond);
			this.updateStatValue("video_pli_count", video_stats.pliCount);
			this.updateStatValue("video_keyframes", video_stats.keyFramesDecoded);
			this.updateStatValue("video_nack_count", video_stats.nackCount);
			this.updateStatValue("video_freeze_count", video_stats.freezeCount);
			this.updateStatValue("video_jitter", video_stats.jitter);
			this.updateStatValue("video_frame_count", video_stats.framesReceived);
		}
		if (aggregatedStats.inboundAudioStats) {
			const audioStats = aggregatedStats.inboundAudioStats;
			this.updateStatValue("audio_bitrate", audioStats.bitrate);
			this.updateStatValue("audio_bitrate_min", audioStats.bitrate);
			this.updateStatValue("audio_bitrate_max", audioStats.bitrate);
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

		const stat_options = SupportedStats[name];
		if (!stat_options) {
			console.log(`Unknown stat ${name}`);
			return;
		}

		if (stat_options.operation == StatOperation.Average) {
			// Calculate EMA
			if (this.stat_values[name]) {
                const prev_value = this.stat_values[name];
                const num_samples = this.ema_samples[name];
                if (num_samples < 10) {
                    this.stat_values[name] = this.calcMA(prev_value, num_samples, value);
                } else {
                    this.stat_values[name] = this.calcEMA(prev_value, num_samples, value);
                }
                this.ema_samples[name] += 1;
			} else {
				this.stat_values[name] = value;
                this.ema_samples[name] = 1;
			}
		} else if (stat_options.operation == StatOperation.Add) {
			this.stat_values[name] += value;
        } else if (stat_options.operation == StatOperation.Min) {
            if (!this.stat_values[name]) {
                this.stat_values[name] = value;
            } else {
                this.stat_values[name] = Math.min(this.stat_values[name], value);
            }
        } else if (stat_options.operation == StatOperation.Max) {
            if (!this.stat_values[name]) {
                this.stat_values[name] = value;
            } else {
                this.stat_values[name] = Math.max(this.stat_values[name], value);
            }
		} else {
			this.stat_values[name] = value;
		}
	}

	private postSessionData() {
		const session_data = {
			id: this.session_id,
			user_agent: this.user_agent,
            disconnect_code: this.disconnect_code,
			disconnect_reason: this.disconnect_reason,
			stat_values: this.stat_values
		}

        // log session for loki

		const events_url = `http://${BUCCANEER_URL || window.location.hostname}:8000/event`;
		try {
			const blob = new Blob([JSON.stringify(session_data)], { type: 'application/json; charset=UTF-8' });
			navigator.sendBeacon(events_url, blob);
		} catch (error) {
			console.error(`Unable to POST session data to ${events_url}: ${error}`);
		}

        // i thought posting to prom would make grafana queries nicer but it was
        // acting even weirder. if we need to post to prom we can reuse this code.

        // // post session stats for prometheus

        // const stats_package: any = {};
        // for (const stat_name in this.stat_values) {
        //     stats_package[stat_name] = {
        //         description: SupportedStats[stat_name].description,
        //         value: this.stat_values[stat_name]
        //     };
        // }

        // const post_data = {
        //     id: this.session_id,
        //     metrics: stats_package
        // };

        // const stats_url = `http://${BUCCANEER_URL || window.location.hostname}:8000/stats`;
        // try {
        //     const blob = new Blob([JSON.stringify(post_data)], { type: 'application/json; charset=UTF-8' });
        //     navigator.sendBeacon(stats_url, blob);
        // } catch (error) {
        //     console.error(`Unable to POST stats data to ${stats_url}: ${error}`);
        // }
	}
}

