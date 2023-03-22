import * as spsFrontend from "@tensorworks/libspsfrontend";

// Apply default styling from Epic's frontend
export const PixelStreamingApplicationStyles = new spsFrontend.PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

document.body.onload = function () {

	// Create a config object.
	// Note: This config is extremely important, SPS only supports the browser sending the offer.
	const config = new spsFrontend.Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// Create a Native DOM delegate instance that implements the Delegate interface class
	const stream = new spsFrontend.PixelStreaming(config);
	const spsApplication = new spsFrontend.SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});

	document.body.appendChild(spsApplication.rootElement);
}