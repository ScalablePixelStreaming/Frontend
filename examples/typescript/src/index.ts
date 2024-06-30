import { Config, PixelStreaming, SPSApplication, PixelStreamingApplicationStyle, Flags, BaseMessage } from "@tensorworks/libspsfrontend";

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

	// Create a config object. We default to sending the WebRTC offer from the browser as true, TimeoutIfIdle to true, AutoConnect to false and MaxReconnectAttempts to 0
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true, AutoConnect: false, MaxReconnectAttempts: 0 } });

	// Create stream and spsApplication instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
	const stream = new ScalablePixelStreaming(config);

	// Override the onConfig so we can determine if we need to send the WebRTC offer based on what is sent from the signalling server
	stream.signallingProtocol.addListener("config", (config : MessageExtendedConfig) => {
		stream.config.setFlagEnabled(Flags.BrowserSendOffer, config.frontendToSendOffer);
		stream.handleOnConfig(config);
	});

	// Create and append our application
	const spsApplication = new SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});
	document.body.appendChild(spsApplication.rootElement);
}