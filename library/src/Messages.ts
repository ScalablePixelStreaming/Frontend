import {
	AggregatedStats,
	CandidatePairStats,
	CandidateStat,
	DataChannelStats,
	InboundAudioStats,
	InboundVideoStats,
	MessageSend,
	OutBoundVideoStats
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';

export enum MessageSendTypes {
	STATS = "stats",
}

/**
 * Aggregated Stats Message Wrapper to send stats to the signalling server
 */
export class MessageStats extends MessageSend {
	inboundVideoStats: InboundVideoStats;
	inboundAudioStats: InboundAudioStats;
	candidatePair: CandidatePairStats;
	dataChannelStats: DataChannelStats;
	localCandidates: Array<CandidateStat>;
	remoteCandidates: Array<CandidateStat>;
	outboundVideoStats: OutBoundVideoStats;

	/**
	 * @param aggregatedStats - Aggregated Stats 
	 */
	constructor(aggregatedStats: AggregatedStats) {
		super();
		
		// Set the message type as stats
		this.type = MessageSendTypes.STATS

		// Map the aggregated stats to the message stats properties
		this.inboundVideoStats = aggregatedStats.inboundVideoStats;
		this.inboundAudioStats = aggregatedStats.inboundAudioStats;
		this.candidatePair = aggregatedStats.getActiveCandidatePair();
		this.dataChannelStats = aggregatedStats.DataChannelStats
		this.localCandidates = aggregatedStats.localCandidates;
		this.remoteCandidates = aggregatedStats.remoteCandidates;
		this.outboundVideoStats = aggregatedStats.outBoundVideoStats;
	}
}