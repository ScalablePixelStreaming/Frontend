# Utilising the Frontend
## Overview 
The Scalable Pixel Streaming Frontend is a library of HTML, CSS and TypeScript code that runs in client web browsers to help users connect to Scalable Pixel Streaming applications and interact with them. It is able to achieve this by consuming the Pixel Streaming Frontend and UI libraries and by extending their signalling server and WebSocket packages the Pixel Streaming Frontend can be configured to work with Scalable Pixel Streaming signalling severs.   

## Epic Games Pixel Streaming Frontend and UI Frontend
For the base functionality for Pixel Streaming and its UI capabilities the Scalable Pixel Streaming Frontend consumes the Epic Games Pixel Streaming Frontend and UI Frontend:
- [Pixel Streaming Frontend](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ue5.4)
- [Pixel Streaming Frontend UI](https://www.npmjs.com/package/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4)

### Pixel Streaming Frontend 
The Pixel Streaming Frontend contains all the base functionality: 
- WebSocket handling
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

## Scalable Pixel Streaming Frontend packages
### The Scalable Pixel Streaming Frontend Library
The library is the part of the Scalable Pixel Streaming Frontend that consumes the Epic Games Pixel Streaming Frontend and UI Frontend. It includes all of the custom signalling server logic that Scalable Pixel Streaming signalling servers require to work. The library can be either obtained through [GitHub](https://github.com/ScalablePixelStreaming/Frontend) or [NPM](https://www.npmjs.com/package/@tensorworks/libspsfrontend). To make use of the library it must be initialised via HTML and Javascript. The library is written in TypeScript but configured to export as a UMD module and can be consumed by plain JavaScript and most JavaScript frameworks.  

### The Scalable Pixel Streaming Frontend TypeScript example
The [TypeScript example](https://github.com/ScalablePixelStreaming/Frontend/tree/main/examples/typescript) is a simple HTML, CSS and TypeScript implementation of what a user could create to initialize the Scalable Pixel Streaming Frontend Library. Its role is to instantiate the library's components and help start the Scalable Pixel Streaming connection to the signalling server.

## Getting Started; installation and consumption
### Building for Development vs Production
The Scalable Pixel Streaming Frontend packages contain several NPM scripts that can be used to build the library and example for either development or production. When building for development this will enable source maps for debugging. When building for production this will disable source maps, reduce console output and minify the distributed JavaScript files. Below are a list of npm scripts for both the library and example and what each command does:

#### library scripts
Please ensure that all library scripts are executed from the `library` directory and a user must first run `npm install` to install all the Libraries dependencies.  
- `npm run build-dev`: Build the library in development mode
- `npm run build-prod`: Build the library in production mode

#### example scripts
Please ensure that all example scripts are executed from the `examples/typescript` directory. In general, it is recommended that a user installs the library first as the example requires the library. On the contrary, `build-all-dev` and `build-all-prod` do not require the library to be installed and built first, as these scripts will install and build the library, example and all dependencies.
- `npm run build-dev`: Build the library in development mode
- `npm run build-prod`: Build the library in production mode
- `npm run serve-dev`: Serve the example locally using the library in development mode
- `npm run serve-prod`: Serve the example locally using the library in production mode
- `npm run symlink`: Links the library to the example for consumption
- `npm run build-all-dev`: Build the library and the example in development mode and link the library to the example for consumption
- `npm run build-all-prod`: Build the library and the example in production mode and link the library to the example for consumption

### Installing the Scalable Pixel Streaming Frontend Library from GitHub
Please note the following installation will be done with `dev` NPM scripts however, it can also be done with `prod` build scripts.

1) Download the [Scalable Pixel Streaming Frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend)

2) To build the library run the following commands in the `library` directory of the source tree:
```bash
# Install the Frontend library's dependencies
npm install 

# Build the Frontend library
npm run build-dev
```
These commands and scripts will install and build the library.

3) Run the following commands in the `examples/typescript` directory of the source tree:
```bash
# Install the examples' dependencies
npm npm install

# Symlink the library to the example
npm run symlink

# Build the example
npm run build-dev
```
These commands and scripts will install the example, link the library to the example and build the example.

#### Installing and building with the build-all script
1) Download the [Scalable Pixel Streaming Frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend)

2) Run the following script in the `examples/typescript` directory of the source tree:
```bash
# Install, link and build the example and library
npm run build-all-dev
```
This will install, link and build the Scalable Pixel Streaming Frontend example and library all-in-one.

### Installing the Scalable Pixel Streaming Frontend through NPM
If your project includes a `package.json` file run the following command in the same directory
1) Run the following command: `npm i @tensorworks/libspsfrontend`

2) Import your desired components from the library package `"@tensorworks/libspsfrontend"` 

#### Basics to initialising and consuming the library
The following example for initialising the library is based on the TypeScript example Provided on GitHub. 

1) Import all the required objects, types and packages from the Scalable Pixel Streaming Frontend Library
```typescript
import {Config, PixelStreaming, SPSApplication, TextParameters, PixelStreamingApplicationStyle} from "@tensorworks/libspsfrontend";
```
2) Apply default styling from Epic Games Pixel Streaming Frontend 
```typescript
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();
``` 
3) Create a `webSocketAddress` variable so the WebSocket URL can be modified if a user wishes to inject their own WebSocket address at load time
```typescript
let webSocketAddress = "";
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
6) Create an if statement that will make use of the `webSocketAddress` variable if one is included 
```typescript
if(webSocketAddress != ""){
	config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
}
```
7) Create an instance of the `PixelStreaming` object called `stream` and an instance of the  `SPSApplication` object called `spsApplication`.
```typescript
const stream = new PixelStreaming(config);
const spsApplication = new SPSApplication({
	stream,
	onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode) /* Light/Dark mode support. */
});
```
8) Append the `spsApplication.rootElement` inside a DOM Element of your choice or inject directly into the body of the web page like in the TypeScript example
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
When serving the Scalable Pixel Streaming Frontend it will build a default WebSocket address to connect to based on the address of the current window of the webpage. If the WebSocket address matches what is created by default then no further steps are required. Users can override the default by using the `setTextSetting` method on our `config` instance. See the section: [Basics to initialising and consuming the library](frontend_utilisation_guide.md#basics-to-initialising-and-consuming-the-library) steps 3 and 6.
#### The .env file for the TypeScript example
In the TypeScript example there is a `.env.example` file. inside this file there is a line called `WEBSOCKET_URL` containing a filler URL. This file can be used to hard code a WebSocket address that can be consumed by the example as shown above. This example is able to work with the help of the [dotenv NPM package](https://www.npmjs.com/package/dotenv) in the `webpack.common.js` file in the TypeScript example. To implement this example follow these steps:
1) Rename the `.env.example` to `.env`
2) Replace the place holder URL with the WebSocket URL you wish to consume
3) Rebuild the example with the `npm run build-dev` or `npm run build-prod` for the changes to take effect

If you wish to include this functionality in your project you will need to include the following steps:
The TypeScript example makes use of these exact steps and is a good demonstration resource on this topic. 
1) Install `dotenv` via NPM `npm i dotenv --save-dev`
2) Include `dotenv` in your webpack file and set your `.env` file path using `path:`
```javascript
require('dotenv').config({ path: './.env' }); 
```  
3) Include a plugin in your webpack file with the environment variables' name. For this example the name will be set to `WEBSOCKET_URL`
```javascript
new webpack.DefinePlugin({
	WEBSOCKET_URL: JSON.stringify((process.env.WEBSOCKET_URL !== undefined) ? process.env.WEBSOCKET_URL : '')
}),
```
4) Create the `.env` file in the path you set in step 3 with the variable of your choice
```bash
WEBSOCKET_URL=ws://example.com/your/ws
```
5) Declare your environment variable where you instantiate your Scalable Pixel Streaming Frontend Library 
```typescript
declare var WEBSOCKET_URL: string;
```
6) Make use of the `setTextSetting` method within the `config` instance to set the `TextParameters.SignallingServerUrl` to a variable that makes use of `WEBSOCKET_URL`
```typescript
let webSocketAddress = WEBSOCKET_URL;
if(webSocketAddress != ""){
	config.setTextSetting(TextParameters.SignallingServerUrl, webSocketAddress)
}
```

---
## Scalable Pixel Streaming Frontend customisation
By default the Scalable Pixel Streaming Frontend Library contains all the requirements to connect to a Scalable Pixel Streaming signalling server making it an effective starting template for further customisation rather than starting from scratch. It is able to achieve this functionality through its consumption of the Epic Games Pixel Streaming Frontend. To learn more about further utilising the Epic Games Pixel Streaming Frontend documentation can be found [here](https://github.com/EpicGames/PixelStreamingInfrastructure#readme).   

### Scalable Pixel Streaming Frontend UI element customisation
Further customisation of UI elements like overlays or visual elements can also be achieved by utilising the Pixel Streaming Frontend UI and extending its types. For further information on how to utilise the Epic Games Pixel Streaming Frontend UI refer to the [Pixel Streaming Frontend UI documentation](https://github.com/EpicGames/PixelStreamingInfrastructure#readme).