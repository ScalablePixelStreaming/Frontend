import {Config, PixelStreaming, SPSApplication, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";

// Apply default styling from Epic Games Pixel Streaming Frontend
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

document.body.onload = function () {

	// Create a config object.
	// Note: This config is extremely important, SPS only supports the browser sending the offer.
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// Create stream and spsApplication instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
	const stream = new PixelStreaming(config);
	const spsApplication = new SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});

	document.body.appendChild(spsApplication.rootElement);
}