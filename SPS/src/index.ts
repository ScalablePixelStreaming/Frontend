import { SPSApplication } from "./SPSApplication";
import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
import { PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.2';
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();


document.body.onload = function () {

	// Example of how to set the logger level
	//libfrontend.Logger.SetLoggerVerbosity(10);

	// Create a config object							// Extremely important, SPS only support browser sending the offer.
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });

	// Create a Native DOM delegate instance that implements the Delegate interface class
	const stream = new PixelStreaming(config);
	const spsApplication = new SPSApplication({ stream });

	document.body.appendChild(spsApplication.rootElement);
}