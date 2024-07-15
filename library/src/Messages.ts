import {
	AggregatedStats,
	CandidatePairStats,
	CandidateStat,
	DataChannelStats,
	InboundAudioStats,
	InboundVideoStats,
	BaseMessage,
	OutBoundVideoStats
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';

/**
 * Aggregated Stats Message Wrapper
 */
export class MessageStats implements BaseMessage {
	type: string;
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
		this.type = "stats";
		this.inboundVideoStats = aggregatedStats.inboundVideoStats;
		this.inboundAudioStats = aggregatedStats.inboundAudioStats;
		this.candidatePair = aggregatedStats.getActiveCandidatePair();
		this.dataChannelStats = aggregatedStats.DataChannelStats
		this.localCandidates = aggregatedStats.localCandidates;
		this.remoteCandidates = aggregatedStats.remoteCandidates;
		this.outboundVideoStats = aggregatedStats.outBoundVideoStats;
	}
}