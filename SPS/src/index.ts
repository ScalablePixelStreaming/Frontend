import { SPSApplication } from "./SPSApplication";
import * as libfrontend from '@epicgames-ps/lib-pixelstreamingfrontend-dev';

// Determine whether a signalling server WebSocket URL was specified at compile-time or if we need to compute it at runtime
declare var WEBSOCKET_URL: string;
let signallingServerAddress = WEBSOCKET_URL;
if (signallingServerAddress == '') {
    // define our signallingServerProtocol to be used based on whether
    // or not we're accessing our frontend via a tls
    let signallingServerProtocol = 'ws:';
    if (location.protocol === 'https:') {
        signallingServerProtocol = 'wss:';
    }

    // build the websocket endpoint based on the protocol used to load the frontend
    signallingServerAddress = signallingServerProtocol + '//' + window.location.hostname

    // if the frontend for an application is served from a base-level domain
    // it has a trailing slash, so we need to account for this when appending the 'ws' for the websocket ingress
    if (window.location.pathname == "/") {
        signallingServerAddress += '/ws'
    } else {
        signallingServerAddress += (window.location.pathname + '/ws')
    }
}

document.body.onload = function() {

	// Example of how to set the logger level
	//libfrontend.Logger.SetLoggerVerbosity(10);

	// Create a config object
	let config = new libfrontend.Config();

	// Extremely important, SPS only support browser sending the offer.
	config.setFlagEnabled(libfrontend.Flags.BrowserSendOffer, true);
	//config.setTextSetting(libfrontend.TextParameters.SignallingServerUrl, signallingServerAddress);

	// Create a Native DOM delegate instance that implements the Delegate interface class
	let spsApplication = new SPSApplication(config);
	document.body.appendChild(spsApplication.rootElement);
}