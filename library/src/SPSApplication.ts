import { Application, SettingUIFlag, UIOptions } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.2';
import { AggregatedStats, SettingFlag, TextParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
import { LoadingOverlay } from './LoadingOverlay';
import { SPSSignalling } from './SignallingExtension';
import { MessageStats } from './Messages';


export class SPSApplication extends Application {
	private loadingOverlay: LoadingOverlay;
	private signallingExtension: SPSSignalling;

	static Flags = class {
		static sendToServer = "sendStatsToServer"
	}

	constructor(config: UIOptions) {
		super(config);
		this.signallingExtension = new SPSSignalling(this.stream.webSocketController);
		this.signallingExtension.onAuthenticationResponse = this.handleSignallingResponse.bind(this);
		this.signallingExtension.onInstanceStateChanged = this.handleSignallingResponse.bind(this);

		this.enforceSpecialSignallingServerUrl();

		// Add 'Send Stats to Server' checkbox
		const spsSettingsSection = this.configUI.buildSectionWithHeading(this.settingsPanel.settingsContentElement, "Scalable Pixel Streaming");
		const sendStatsToServerSetting = new SettingFlag(
			SPSApplication.Flags.sendToServer,
			"Send stats to server",
			"Send session stats to the server",
			false,
			this.stream.config.useUrlParams
		);

		spsSettingsSection.appendChild(new SettingUIFlag(sendStatsToServerSetting).rootElement);
		this.loadingOverlay = new LoadingOverlay(this.stream.videoElementParent);

		this.stream.addEventListener(
			'statsReceived',
			({ data: { aggregatedStats } }) => {
				if (sendStatsToServerSetting.flag) {
					this.sendStatsToSignallingServer(aggregatedStats);
				}
			}
		);
	}

	handleSignallingResponse(signallingResp: string, isError: boolean) {
		if (isError) {
			this.showErrorOverlay(signallingResp);
		} else {
			this.showLoadingOverlay(signallingResp);
		}
	}

	enforceSpecialSignallingServerUrl() {
		// SPS needs a special /ws added to the signalling server url so K8s can distinguish it
		this.stream.setSignallingUrlBuilder(() => {

			// get the current signalling url
			let signallingUrl = this.stream.config.getTextSettingValue(TextParameters.SignallingServerUrl);

			// add our 'ws' token to the end dependant on whether the URL ends with a '/' or not
			signallingUrl = signallingUrl.endsWith("/") ? signallingUrl + "signalling" + window.location.pathname : signallingUrl + "/signalling" + window.location.pathname;

			return signallingUrl
		});
	}

	showLoadingOverlay(signallingResp: string) {
		this.hideCurrentOverlay();
		this.loadingOverlay.show();
		this.loadingOverlay.update(signallingResp);

		// disable rain animation for now as perf is too poor on mobile devices
		// this.loadingOverlay.animate();

		this.currentOverlay = this.loadingOverlay;
	}

	/**
	 * Send Aggregated Stats to the Signaling Server
	 * @param stats - Aggregated Stats
	 */
	sendStatsToSignallingServer(stats: AggregatedStats) {
		const data = new MessageStats(stats);
		this.stream.webSocketController.webSocket.send(data.payload());
	}
}