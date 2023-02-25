import {
	AggregatedStats,
	CandidatePairStats,
	CandidateStat,
	DataChannelStats,
	InboundAudioStats,
	InboundVideoStats,
	MessageSend,
	OutBoundVideoStats
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';

export enum MessageSendTypes {
	STATS = "stats",
}

/**
 * Aggregated Stats Message Wrapper
 */
export class MessageStats extends MessageSend {
	inboundVideoStats: InboundVideoStats;
	inboundAudioStats: InboundAudioStats;
	candidatePair: CandidatePairStats
	dataChannelStats: DataChannelStats;
	localCandidates: Array<CandidateStat>;
	remoteCandidates: Array<CandidateStat>;
	outboundVideoStats: OutBoundVideoStats;

	/**
	 * @param aggregatedStats - Aggregated Stats 
	 */
	constructor(aggregatedStats: AggregatedStats) {
		super();
		this.type = MessageSendTypes.STATS
		this.inboundVideoStats = aggregatedStats.inboundVideoStats;
		this.inboundAudioStats = aggregatedStats.inboundAudioStats;
		this.candidatePair = aggregatedStats.candidatePair;
		this.dataChannelStats = aggregatedStats.DataChannelStats
		this.localCandidates = aggregatedStats.localCandidates;
		this.remoteCandidates = aggregatedStats.remoteCandidates;
		this.outboundVideoStats = aggregatedStats.outBoundVideoStats;
	}
}