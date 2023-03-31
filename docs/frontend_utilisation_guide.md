# Utilising the Frontend
## Overview 
The Scalable Pixel Streaming Frontend is a library of HTML, CSS and TypeScript code that runs in client web browsers to help users connect to Scalable Pixel Streaming applications and interact with them. It is able to achieve this by consuming the Pixel Streaming Frontend and UI libraries and by extending their signalling server and websocket packages the Pixel Streaming Fronted can be configured to work with Scalable Pixel Streaming signalling severs.   

## Epic Games Pixel Streaming libraries
For the base functionality for Pixel Streaming and its UI capabilities the Scalable Pixel Streaming Frontend consumes the Epic Games Pixel Streaming Frontend and UI Frontend:
- [Pixel Streaming Frontend](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ue5.2)
- [Pixel Streaming Frontend UI](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.2)

### Pixel Streaming Frontend 
The Pixel Streaming Frontend contains all the base functionality: 
- Websocket handling
- Data channel handling
- UE message handling
- Mouse and keyboard interaction handling
- Video and audio stream handling
- Logic for: AFK, FreezeFrames, Mic, TURN, SDP 

### Pixel Streaming Frontend UI
The Pixel Streaming Frontend UI contains all the functionality for UI components:
- Text, Action and AFK Overlays
- CSS styling
- UI display settings; UE stream data

---

## Scalable Pixel Streaming Frontend Pieces
### The Library
The Library is the part of the Scalable Pixel Streaming Frontend that consumes the Epic Games Pixel Streaming Frontend and UI Frontend. It includes all of the custom signalling server logic that Scalable Pixel Streaming signalling servers require to work. The Library can be either obtained through [Github](https://github.com/ScalablePixelStreaming/Frontend) or [NPM](https://www.npmjs.com/package/@tensorworks/libspsfrontend). To make use of the Library it must be initialised via HTML and Javascript. The Example below is but one example of initialize the Library.  

### The Typescript Example
The Typescript Example is a simple HTML, CSS and TypeScript implementation of what a user could create to initialize the Scalable Pixel Streaming Frontend Library. Its role is to instantiate the library's components and help start the Scalable Pixel Streaming connection to the signalling server. Please note  how a user chooses to initialize Library is open to interpretation and the users requirements and is not limited to the Typescript Example.
## Getting Started; installation and consumption
### Building for Development vs Production
Within the Scalable Pixel Streaming Frontend there are several npm scripts that can be used to build the Library and Example for either development or production use cases. When building for development this will enable source maps for debugging. When building for production this will disable source maps, minimize console output and minimize the dist contents. Below are a list of npm scripts for both the Library and Example and what each command does:

#### Library scripts
Please ensure that all Library scripts are executed from the `library` directory and a user must first run `npm install` to install all the Libraries dependencies.  
- `npm run build-dev`: Build the Library in development mode
- `npm run build-prod`: Build the Library in production mode

#### Example scripts
Please ensure that all example scripts are executed from the `examples/typescript` directory. It is always recommended that a user installs the Library first as the example requires the Library. Contrary to this however, `build-all-dev` and `build-all-prod` do not require the Library to be installed and built first and will install and build both the Library and Example and all dependencies.
- `npm run build-dev`: Build the Library in development mode
- `npm run build-prod`: Build the Library in production mode
- `npm run serve-dev`: Serve the Example locally using the Library in development mode
- `npm run serve-prod`: Serve the Example locally using the Library in production mode
- `npm run symlink`: Links the Library to the Example for consumption
- `npm run build-all-dev`: Build the Library and the Example in development mode and link the Library to the Example for consumption
- `npm run build-all-prod`: Build the Library and the Example in production mode and link the Library to the Example for consumption

### Installing the Scalable Pixel Streaming Frontend Library From Github
Please note the following installation will be done with `dev` npm scripts however, it can also be done with `prod` build scripts.

1) Download the [Scalable Pixel Streaming Frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend)

2) To build the Library run the following commands in the `library` directory of the source tree:
```bash
# Install the Frontend Library's dependencies
npm install 

# Build the Frontend Library
npm run build-dev
```
These commands and scripts will install and build the Library.

3) Run the following commands in the `examples/typescript` directory of the source tree:
```bash
# Install the Examples's dependencies
npm npm install

# Symlink the Library to the Example
npm run symlink

# Build the Example
npm run build-dev
```
These commands and scripts will install the Example, link the Library to the Example and build the Example.

#### Installing and building with the build-all script
1) Download the [Scalable Pixel Streaming Frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend)

2) Run the following script in the `examples/typescript` directory of the source tree:
```bash
# Install, link and build the Example and Library
npm run build-all-dev
```
This will install, link and build the Scalable Pixel Streaming Frontend Example and Library all in one.

### Installing the Scalable Pixel Streaming Frontend through NPM
If your project includes a `package.json` file run the following command in the same directory
1) Run the following command: `npm i @tensorworks/libspsfrontend`

2) Import your desired components form the Library from the following package `"@tensorworks/libspsfrontend"` 

#### Basics to initialising and consuming the Library
The following example for initialising the Library is based on the Typescript Example Provided on Github. 

1) Import all the required packages from the Scalable Pixel Streaming Frontend Library
```typescript
import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";
```
2) Apply default styling from Epic Games Pixel Streaming Frontend 
```typescript
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
``` 
3) Declare the `WEBSOCKET_URL` environment variable so the websocket url can be injected via a `.env` file
```typescript
declare var WEBSOCKET_URL: string;
```
4) Create a `document.body.onload` function to automate the activation and creation of steps 5-8   
```typescript
document.body.onload = function () {
	// steps 5-8 go in here
}
```
5) Create the Pixel Streaming `config` object and ensure that `useUrlParams` is true and  `initialSettings` contains `{ OfferToReceive: true, TimeoutIfIdle: true }`. This is important as the Scalable Pixel Streaming signalling server can only receive the offer to connect. `TimeoutIfIdle` enables the AFK timeout by default so any unattended sessions close and do not consume extra cloud GPU resources. 
```typescript
const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
```
6) Create an if statement that will make use of the `WEBSOCKET_URL` environment variable if one is included 
```typescript
let webSocketAddress = WEBSOCKET_URL;
	if(webSocketAddress != ""){
		config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
	}
```
7) Create `stream` and `spsApplication` instances that implement the Epic Games Pixel Streaming Frontend PixelStreaming and Application types
```typescript
const stream = new PixelStreaming(config);
const spsApplication = new SPSApplication({
	stream,
	onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
});
```
8) Append the `spsApplication.rootElement` inside a DOM Element of your choice or inject directly into the body of the web page like in the TypeScript Example
```typescript
document.body.appendChild(spsApplication.rootElement);
//OR
document.getElementById("myElementId").appendChild(spsApplication.rootElement);
```

### Default Index Implementation
```typescript
import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
declare var WEBSOCKET_URL: string;

document.body.onload = function () {
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
	let webSocketAddress = WEBSOCKET_URL;
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

### Connecting to a WebSocket 
When serving the Scalable Pixel Streaming Frontend it will build a default WebSocket address to connect to based on the address of the current window of the webpage. If the WebSocket address happens to match what is created by default then no further steps are required however, this is not always the case. In the stage of creating the `config` object for our entry point it is possible to inject a WebSocket address that will override the default that is created:

1) After completing `Implementing the Scalable Pixel Streaming frontend in a custom webpage` steps 1-8 import the `TextParameters` package from the Pixel Streaming Frontend
```typescript
import { Config, PixelStreaming, TextParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
```
2) Beneath the line where the `config` object was created call the `setTextSetting` method and pass in `TextParameters.SignallingServerUrl` and your websocket address as a string
```typescript
const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
config.setTextSetting(TextParameters.SignallingServerUrl, "wss://your.websocket.url/ws")
```

---
## Scalable Pixel Streaming Frontend customisation
By default the Scalable Pixel Streaming Frontend contains all the requirements to connect to a Scalable Pixel Streaming signalling server making it an effective starting template for further customisation rather than starting from scratch. For further ways to utilise the the Pixel Streaming Frontend refer to the [Pixel Streaming Frontend documentation](https://github.com/EpicGames/PixelStreamingInfrastructure#readme).   

### Scalable Pixel Streaming Frontend UI element customisation
Further customisation of UI elements like Overlays or visual elements can be achieved by utilising the Pixel Streaming Frontend UI and extending its types. For further information on how to utilise the Epic Games Pixel Streaming Frontend UI refer to the [Pixel Streaming Frontend UI documentation](https://github.com/EpicGames/PixelStreamingInfrastructure#readme).