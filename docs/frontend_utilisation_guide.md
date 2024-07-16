# Utilising the frontend

## Overview 

The Scalable Pixel Streaming (SPS) frontend is a library of HTML, CSS, and TypeScript code that runs in web browsers and allows users to connect and interact with Scalable Pixel Streaming applications. It consumes the Epic Games Pixel Streaming frontend and UI libraries and extends their signalling server and WebSocket packages. Note that the Epic Games Pixel Streaming frontend can be configured to work with Scalable Pixel Streaming signalling servers.

## Epic Games Pixel Streaming frontend and UI frontend NPM packages

### Pixel Streaming frontend

The NPM package for the Pixel Streaming frontend consumed by SPS is located [here](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ue5.4).

It contains the following functionality:

- WebSocket handling;
- Data channel handling;
- UE message handling;
- Mouse and keyboard interaction handling;
- Video and audio stream handling;
- Logic for: AFK, FreezeFrames, Mic, TURN, SDP.

### Pixel Streaming frontend UI

The NPM package for the Pixel Streaming UI frontend consumed by SPS is located [here](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4).

It contains the following functionality:

- Text, Action, and AFK Overlays;
- CSS styling;
- UI display settings;
- UE stream data.

---

## SPS frontend packages

### SPS frontend library

The library includes all of the custom signalling logic that Scalable Pixel Streaming signalling servers require to work. The library can be obtained either through [GitHub](https://github.com/ScalablePixelStreaming/Frontend) or [NPM](https://www.npmjs.com/package/@tensorworks/libspsfrontend). The library must be initialised via HTML and Javascript. It is written in TypeScript, but configured to export as a UMD module and can be consumed by plain JavaScript and most JavaScript frameworks.  

### SPS frontend TypeScript example

Our [TypeScript example](https://github.com/ScalablePixelStreaming/Frontend/tree/main/examples/typescript) is a simple HTML, CSS, and TypeScript implementation that initialises the SPS frontend library by instantiating the library components and starting a connection to the signalling server.

## Installing and consuming SPS packages

Download the [SPS frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend).

### Building for development and production

SPS frontend packages contain several NPM scripts that can build the library and example implementation for either development or production. When building for development, source maps for debugging will be enabled. When building for production, source maps will be disabled, reducing console output and minifying the distributed JavaScript files. Below is a list of NPM scripts for both the library and example implementation with their respective commands.

#### Building library

First, install all required dependencies by running this command from the `library` directory:

- `npm install`: Install the frontend library dependencies

The following build scripts must be executed from the same directory:

- `npm run build-dev`: Build the library in development mode
- `npm run build-prod`: Build the library in production mode

#### Building example and linking the library

The library must be installed before executing example scripts. All example scripts must be executed from the `examples/typescript` directory:

- `npm run build-dev`: Build the library in development mode
- `npm run build-prod`: Build the library in production mode
- `npm run serve-dev`: Serve the example locally using the library in development mode
- `npm run serve-prod`: Serve the example locally using the library in production mode
- `npm run symlink`: Link the library to the example for consumption

#### Building and linking library and example with a single command

Alternatively, you can run the build all scripts from the `examples/typescript` directory to install and link the library and the example at the same time:

- `npm run build-all-dev`: Build the library and the example in development mode and link the library to the example for consumption
- `npm run build-all-prod`: Build the library and the example in production mode and link the library to the example for consumption

### Installing the Scalable Pixel Streaming Frontend through NPM

1) If your project includes a `package.json` file, run the following command in the same directory:

- `npm i @tensorworks/libspsfrontend`

2) Import your desired components from the library package `"@tensorworks/libspsfrontend"` 

#### Initialising and consuming the library

The following example for initialising the library is based on the TypeScript example provided on GitHub. 

1) Import all the required objects, types, and packages from the SPS frontend library:

```typescript
import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";
```

2) Apply default styling from Epic Games Pixel Streaming frontend:

```typescript
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
``` 

3) Create a `webSocketAddress` variable, so that the WebSocket URL could be modified if a user wishes to inject their own WebSocket address at load time:

```typescript
let webSocketAddress = "";
```

4) Create a `document.body.onload` function to automate the activation and creation of the remaining steps:

```typescript
document.body.onload = function () {
	// steps 5-8 go in here
}
```

5) Create the Pixel Streaming `config` object and ensure that `useUrlParams` is true, and  `initialSettings` contains `{ OfferToReceive: true, TimeoutIfIdle: true }`. This is important as the SPS signalling server can only receive the offer to connect. `TimeoutIfIdle` enables the AFK timeout by default, so that any unattended sessions close and stop consuming unnecessary cloud GPU resources:

```typescript
const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
```

6) Create an if statement that will make use of the `webSocketAddress` variable if one is included:

```typescript
if(webSocketAddress != ""){
	config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
}
```

7) Create an instance of the `PixelStreaming` object called `stream` and an instance of the  `SPSApplication` object called `spsApplication`:

```typescript
const stream = new PixelStreaming(config);
const spsApplication = new SPSApplication({
	stream,
	onColorModeChanged: (isLightMode) => 
	PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
});
```

8) Append the `spsApplication.rootElement` inside a DOM element of your choice or inject directly into the body of the web page, like in the TypeScript example:

```typescript
document.body.appendChild(spsApplication.rootElement);
//OR
document.getElementById("myElementId").appendChild(spsApplication.rootElement);
```

### Default index implementation

A default index implementation would look like this:

```typescript
import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
let webSocketAddress = "";

document.body.onload = function () {
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
	if(webSocketAddress != ""){
		config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
	}
	const stream = new PixelStreaming(config);
	const spsApplication = new SPSApplication({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
	});
	document.body.appendChild(spsApplication.rootElement);
}
```

### Customising the WebSocket connection

#### Using setTextSetting within Config to inject a custom WebSocket

When serving the SPS frontend, it will build a default WebSocket address to connect to, based on the address of the current window of the webpage. If the WebSocket address matches what is created by default, then no further steps are required. Users can override the default by using the `setTextSetting` method on the `config` instance. Refer to [Basics to initialising and consuming the library](frontend_utilisation_guide.md#basics-to-initialising-and-consuming-the-library), steps 3 and 6.

#### The .env file for the TypeScript example

In the TypeScript example, there is a `.env.example` file containing a filler URL in the `WEBSOCKET_URL` line. This file can be used to hard code a WebSocket address that can be consumed by the example as shown above. This example is able to work with the help of the [dotenv NPM package](https://www.npmjs.com/package/dotenv) in the `webpack.common.js` file in the TypeScript example. To implement this example, follow these steps:

1) Rename the `.env.example` to `.env`.
2) Replace the placeholder URL with the WebSocket URL you wish to consume.
3) Rebuild the example with the `npm run build-dev` or `npm run build-prod` for the changes to take effect.

If you wish to include this functionality in your project, you will need to include the following steps, which are also demonstrated in the TypeScript example:

1) Install `dotenv` via NPM `npm i dotenv --save-dev`.
2) Include `dotenv` in your webpack file and set your `.env` file path using `path:`:

```javascript
require('dotenv').config({ path: './.env' }); 
```  

3) Include a plugin in your webpack file with the environment variable's name. For this example, the name will be set to `WEBSOCKET_URL`:

```javascript
new webpack.DefinePlugin({
	WEBSOCKET_URL: JSON.stringify((process.env.WEBSOCKET_URL !== undefined) ? process.env.WEBSOCKET_URL : '')
}),
```

4) Create the `.env` file in the path you set in the previous step with the variable of your choice:

```bash
WEBSOCKET_URL=ws://example.com/your/ws
```

5) Declare your environment variable where you instantiate your SPS frontend library:

```typescript
declare var WEBSOCKET_URL: string;
```

6) Make use of the `setTextSetting` method within the `config` instance to set the `TextParameters.SignallingServerUrl` to a variable that makes use of `WEBSOCKET_URL`:

```typescript
let webSocketAddress = WEBSOCKET_URL;
if(webSocketAddress != ""){
	config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
}
```

## SPS frontend and frontend UI customisation

Refer to [the official Pixel Streaming repository documentation](https://github.com/EpicGamesExt/PixelStreamingInfrastructure#readme) to learn more about further utilising the Epic Games Pixel Streaming frontend and frontend UI. Utilise the supplied SPS frontend library as a template for further customisation, and leverage Pixel Streaming frontend UI types to further customise UI elements, such as overlays and visual elements.
