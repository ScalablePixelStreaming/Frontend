import { Application, SettingUIFlag, UIOptions } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5';
import { AggregatedStats, StatsReceivedEvent, SettingFlag, TextParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';
import { LoadingOverlay } from './LoadingOverlay';
import { SPSSignalling } from './SignallingExtension';
import { MessageStats } from './Messages';

// For local testing. Declare a websocket URL that can be imported via a .env file that will override 
// the signalling server URL builder.
declare var WEBSOCKET_URL: string;


export class SPSApplication extends Application {
	private loadingOverlay: LoadingOverlay;
	private signallingExtension: SPSSignalling;
	private sendStatsToServerSetting: SettingFlag<string>;

	static Flags = class {
		static sendToServer = "sendStatsToServer"
	}

	constructor(config: UIOptions) {
		super(config);
		this.signallingExtension = new SPSSignalling(this.stream.signallingProtocol);
		this.signallingExtension.onAuthenticationResponse = this.handleSignallingResponse.bind(this);
		this.signallingExtension.onInstanceStateChanged = this.handleSignallingResponse.bind(this);

		this.enforceSpecialSignallingServerUrl();

		// Add 'Send Stats to Server' checkbox
		const spsSettingsSection = this.configUI.buildSectionWithHeading(this.settingsPanel.settingsContentElement, "Scalable Pixel Streaming");
		this.sendStatsToServerSetting = new SettingFlag(
			SPSApplication.Flags.sendToServer,
			"Send stats to server",
			"Send session stats to the server",
			false,
			this.stream.config.useUrlParams
		);

		spsSettingsSection.appendChild(new SettingUIFlag(this.sendStatsToServerSetting).rootElement);
		this.loadingOverlay = new LoadingOverlay(this.stream.videoElementParent);

		this.stream.addEventListener('statsReceived', (statsReceived: StatsReceivedEvent) => { this.handleStatsReceived(statsReceived); });
	}

	handleStatsReceived(statsReceivedEvent: StatsReceivedEvent) {
		if(statsReceivedEvent && statsReceivedEvent.data && statsReceivedEvent.data.aggregatedStats) {
			if (this.sendStatsToServerSetting.flag) {
				this.sendStatsToSignallingServer(statsReceivedEvent.data.aggregatedStats);
			}
		}
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

			// If we have overriden the signalling server URL with a .env file use it here
			if (WEBSOCKET_URL !== undefined ) {
				return WEBSOCKET_URL as string;
			}

			// If there is signalling url specified, then use that.
			let customSignallingUrl = this.stream.config.getTextSettingValue(TextParameters.SignallingServerUrl);
			if(customSignallingUrl && customSignallingUrl !== "") {
				return customSignallingUrl;
			}

			// If neither environment used or customSignallingUrl specified, then build the URL using the domain we are on.

			// Construct the signalling url from the base url, prepend protocol, then append /signalling, then append /rest-of-path?myargs
			const urlProtocol: string =  window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			const urlBase: string = window.location.host;
			const urlPath: string = window.location.pathname;
			// Build the signalling URL based on the existing window location, the result should be 'domain.com/signalling/app-name'
			const signallingUrl = urlProtocol + urlBase + "/signalling" + urlPath;
			return signallingUrl;
		});
	}

	showLoadingOverlay(signallingResp: string) {
		this.hideCurrentOverlay();
		this.loadingOverlay.show();
		this.loadingOverlay.update(signallingResp);

		this.currentOverlay = this.loadingOverlay;
	}

	/**
	 * Send Aggregated Stats to the Signaling Server
	 * @param stats - Aggregated Stats
	 */
	sendStatsToSignallingServer(stats: AggregatedStats) {
		const data = new MessageStats(stats);
		this.stream.signallingProtocol.sendMessage(data);
	}
}
