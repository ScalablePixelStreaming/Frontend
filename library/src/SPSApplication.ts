import { LoadingOverlay } from './LoadingOverlay';
import { SPSSignalling } from './SignallingExtension';
import { MessageStats } from './Messages';
import {
	AggregatedStats,
	SettingFlag,
	TextParameters
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';
import {
	Application,
	SettingUIFlag,
	UIOptions
} from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4';

// For local testing. Declare a websocket URL that can be imported via a .env file that will override 
// the signalling server URL builder.
declare var WEBSOCKET_URL: string;

export class SPSApplication extends Application {
	private loadingOverlay: LoadingOverlay;
	private signallingExtension: SPSSignalling;

	// Create a flags class for the send stats to server
	static Flags = class {
		static sendToServer = "sendStatsToServer"
	}

	constructor(config: UIOptions) {
		super(config);

		// Initialise the signaling server extensions to support sps signalling messages
		this.signallingExtension = new SPSSignalling(this.stream.webSocketController);
		this.signallingExtension.onAuthenticationResponse = this.handleSignallingResponse.bind(this);
		this.signallingExtension.onInstanceStateChanged = this.handleSignallingResponse.bind(this);

		// Enforce the munging of the websocket address to support SPS
		this.enforceSpecialSignallingServerUrl();

		// Add a SPS settings section to the settings panel
		const spsSettingsSection = this.configUI.buildSectionWithHeading(this.settingsPanel.settingsContentElement, "Scalable Pixel Streaming");

		// Add the 'Send Stats to server' check box to the list of settings
		const sendStatsToServerSetting = new SettingFlag(
			SPSApplication.Flags.sendToServer,
			"Send stats to server",
			"Send session stats to the server",
			false,
			this.stream.config.useUrlParams
		);

		// Add the 'Send Stats to server' check box to the sps settings section
		spsSettingsSection.appendChild(new SettingUIFlag(sendStatsToServerSetting).rootElement);

		// Initialise the loading overlay
		this.loadingOverlay = new LoadingOverlay(this.stream.videoElementParent);

		// Add an event handler for when the statReceive event is emitted
		this.stream.addEventListener(
			'statsReceived',
			({ data: { aggregatedStats } }) => {
				if (sendStatsToServerSetting.flag) {
					this.sendStatsToSignallingServer(aggregatedStats);
				}
			}
		);
	}

	/**
	 * Handled the response when the sps messages are emitted
	 * @param signallingResp the informative response message
	 * @param isError if the message is an error
	 */
	handleSignallingResponse(signallingResp: string, isError: boolean) {

		// Check if the message is an error
		if (isError) {

			// Show the error overlay
			this.showErrorOverlay(signallingResp);
		} else {

			// Show the loading overlay
			this.showLoadingOverlay(signallingResp);
		}
	}

	/**
	 * Enforces changes the websocket path to conform to the SPS specification
	 * Can be overridden if the WEBSOCKET_URL var defined in the .env file has been defined
	 */
	enforceSpecialSignallingServerUrl() {

		// SPS needs to build a specific signalling server url based on the application name so K8s can distinguish it
		this.stream.setSignallingUrlBuilder(() => {

			// Check if the WEBSOCKET_URL var in the .env file has been defined
			if (WEBSOCKET_URL !== undefined) {

				// Return the value of the WEBSOCKET_URL var defined in the .env file
				return WEBSOCKET_URL as string;
			}

			// Get the current signalling server URL from the settings
			let signallingUrl = this.stream.config.getTextSettingValue(TextParameters.SignallingServerUrl);

			// Build the signalling URL based on the existing window location, the result should be 'domain.com/signalling/app-name'
			signallingUrl = signallingUrl.endsWith("/") ? signallingUrl + "signalling" + window.location.pathname : signallingUrl + "/signalling" + window.location.pathname;

			// Return the modified signalling server URL
			return signallingUrl
		});
	}

	/**
	 * Shows the loading overlay
	 * @param message The message to display
	 */
	showLoadingOverlay(message: string) {

		// Hide the current overlay
		this.hideCurrentOverlay();

		// Show the loading overlay
		this.loadingOverlay.show();

		// Update the loading overlay with the signalling response
		this.loadingOverlay.update(message);

		// Set the current overlay to the loading overlay
		this.currentOverlay = this.loadingOverlay;
	}

	/**
	 * Send Aggregated Stats to the Signaling Server
	 * @param stats - Aggregated Stats
	 */
	sendStatsToSignallingServer(stats: AggregatedStats) {

		// Create a new stats signalling message
		const data = new MessageStats(stats);

		// Send the stats message to the signalling server
		this.stream.webSocketController.webSocket.send(data.payload());
	}
}
