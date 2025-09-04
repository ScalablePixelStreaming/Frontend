import {
	AggregatedStats,
	CandidatePairStats,
	CandidateStat,
	DataChannelStats,
	InboundAudioStats,
	InboundVideoStats,
	BaseMessage,
	OutboundRTPStats
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';

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
	outboundVideoStats: OutboundRTPStats;

	/**
	 * @param aggregatedStats - Aggregated Stats
	 */
	constructor(aggregatedStats: AggregatedStats) {
		this.type = "stats";
		this.inboundVideoStats = aggregatedStats.inboundVideoStats;
		this.inboundAudioStats = aggregatedStats.inboundAudioStats;
		this.candidatePair = aggregatedStats.getActiveCandidatePair();
		this.dataChannelStats = aggregatedStats.datachannelStats;
		this.localCandidates = aggregatedStats.localCandidates;
		this.remoteCandidates = aggregatedStats.remoteCandidates;
		this.outboundVideoStats = aggregatedStats.outboundVideoStats;
	}
}