import { Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle, MessageRecv, Flags } from "@tensorworks/libspsfrontend";

// Apply default styling from Epic Games Pixel Streaming Frontend
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

// websocket url env
declare var WEBSOCKET_URL: string;

// Extend the MessageRecv to allow the engine version to exist as part of our config message from the signalling server
class MessageExtendedConfig extends MessageRecv {
	peerConnectionOptions: RTCConfiguration;
	engineVersion: string
};

// Extend PixelStreaming to use our custom extended config that includes the engine version
class ScalablePixelStreaming extends PixelStreaming {
	// Create a new method that retains original functionality
	public handleOnConfig(messageExtendedConfig: MessageExtendedConfig) {
		this._webRtcController.handleOnConfigMessage(messageExtendedConfig)
	}
};

document.body.onload = function () {

	// Create a config object. We default to sending the WebRTC offer from the browser as true
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// make usage of WEBSOCKET_URL if it is not empty
	let webSocketAddress = WEBSOCKET_URL;
	if (webSocketAddress != "") {
		config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
	}

	// Create stream and spsApplication instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
	const stream = new ScalablePixelStreaming(config);

	// Override the onConfig so we can determine if we need to send the WebRTC offer based on the engine version
	// If the engine version is 4.27 or not defined, the browser should send the offer. This is what the Scalable Pixel Streaming signalling server will be expecting.
	stream.webSocketController.onConfig = (messageExtendedConfig: MessageExtendedConfig) => {
		stream.config.setFlagEnabled(Flags.BrowserSendOffer, (messageExtendedConfig.engineVersion == "4.27" || messageExtendedConfig.engineVersion == "5.0" || messageExtendedConfig.engineVersion == ""));
		stream.handleOnConfig(messageExtendedConfig);
	}

	// Create and append our application
	const spsApplication = new SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});
	document.body.appendChild(spsApplication.rootElement);
}