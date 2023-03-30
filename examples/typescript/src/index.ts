import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";

// Apply default styling from Epic Games Pixel Streaming Frontend
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

// websocket url env
declare var WEBSOCKET_URL: string;

document.body.onload = function () {

	// Create a config object.
	// Note: This config is extremely important, SPS only supports the browser sending the offer.
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// make usage of WEBSOCKET_URL if it is not empty
	let webSocketAddress = WEBSOCKET_URL;
	if(webSocketAddress !== ""){
		config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
	}

	// Create stream and spsApplication instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
	const stream = new PixelStreaming(config);
	const spsApplication = new SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});

	document.body.appendChild(spsApplication.rootElement);
}