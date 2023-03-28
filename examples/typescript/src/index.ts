import * as libspsfrontend from "@tensorworks/libspsfrontend";

// Apply default styling from Epic's frontend
export const PixelStreamingApplicationStyles = new libspsfrontend.PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

document.body.onload = function () {

	// Create a config object.
	// Note: This config is extremely important, SPS only supports the browser sending the offer.
	const config = new libspsfrontend.Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// Create a Native DOM delegate instance that implements the Delegate interface class
	const stream = new libspsfrontend.PixelStreaming(config);
	const spsApplication = new libspsfrontend.SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});

	document.body.appendChild(spsApplication.rootElement);
}