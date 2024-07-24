import { Logger, Config, PixelStreaming, SPSApplication, PixelStreamingApplicationStyle, Flags, TextParameters, BaseMessage, WebRtcDisconnectedEvent, UIOptions } from "@tensorworks/libspsfrontend";

// Apply default styling from Epic Games Pixel Streaming Frontend
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

// Extend the default "Config" message supplied by PSInfra library to include the following:
// - Engine version
// - Platform
// - FrontendSendOffer
class MessageExtendedConfig implements BaseMessage {
	type: string;
	peerConnectionOptions: RTCConfiguration;
	engineVersion: string;
	platform: string;
	frontendToSendOffer: boolean;
};

// Extend PixelStreaming to use our custom extended config that includes the engine version
class ScalablePixelStreaming extends PixelStreaming {
	// Create a new method that retains original functionality
	public handleOnConfig(messageExtendedConfig: MessageExtendedConfig) {
		this._webRtcController.handleOnConfigMessage(messageExtendedConfig);
	}
};

document.body.onload = function () {

	// Uncomment and rebuild for detailed logging
	// Logger.SetLoggerVerbosity(10);

	// Create a config object. We default to sending the WebRTC offer from the browser as false, TimeoutIfIdle to true, AutoConnect to false and MaxReconnectAttempts to 0
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: false, TimeoutIfIdle: true, AutoConnect: false, MaxReconnectAttempts: 0 } });

	// Handle setting custom signalling url from code or by querying url parameters (e.g. ?ss=ws://my.signaling.server).
	{
		// Replace with your custom signalling url if you need to.
		// Otherwise SPS will use ws|wss://window.location.host/signalling/window.location.pathname
		let YOUR_CUSTOM_SIGNALLING_URL_HERE: string = ""; // <-- replace here

		// Check the ?ss= url parameter for a custom signalling url.
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has(TextParameters.SignallingServerUrl)) {
			YOUR_CUSTOM_SIGNALLING_URL_HERE = urlParams.get(TextParameters.SignallingServerUrl);
		}
		config.setTextSetting(TextParameters.SignallingServerUrl, YOUR_CUSTOM_SIGNALLING_URL_HERE);
	}

	// Create stream and spsApplication instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
	const stream = new ScalablePixelStreaming(config);

	// Override the onConfig so we can determine if we need to send the WebRTC offer based on what is sent from the signalling server
	stream.signallingProtocol.removeAllListeners("config");
	stream.signallingProtocol.addListener("config", (config: MessageExtendedConfig) => {
		if (config.frontendToSendOffer) {
			stream.config.setFlagEnabled(Flags.BrowserSendOffer, config.frontendToSendOffer);
		}
		stream.handleOnConfig(config);
	});

	// override the _onDisconnect function to intercept webrtc disconnect events
	// and modify how the event is fired by always showing a click to reconnect overlay.
	// we also add a full stop to the AFK message.
	stream._onDisconnect = function (eventString: string) {

		// check if the eventString coming in is the inactivity string and add a full stop
		if (eventString == "You have been disconnected due to inactivity") {
			eventString += "."
		}

		this._eventEmitter.dispatchEvent(
			new WebRtcDisconnectedEvent({
				eventString: eventString,
				allowClickToReconnect: true
			})
		);
	}

	// Create our SPS application and pass it some UI configuration options.
	// Note: There are more options than this if you need them (e.g. turning off certain UI elements).
	const uiOptions: UIOptions = {
		stream: stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	};
	const spsApplication: SPSApplication = new SPSApplication(uiOptions);
	document.body.appendChild(spsApplication.rootElement);
}
