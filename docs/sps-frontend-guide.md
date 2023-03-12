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

## Getting Started
### Installing the Scalable Pixel Streaming Frontend   
1) Download the [Scalable Pixel Streaming Frontend source code from GitHub](https://github.com/ScalablePixelStreaming/Frontend)

2) Run the following command in the base directory of the source tree:
```bash
# Install the frontend library's dependencies
npm install .
```
This will install both the Pixel Streaming Frontend and Frontend UI along with other dependencies which the Scalable Pixel Streaming Frontend consumes. 

### Running the Scalable Pixel Streaming Frontend locally
1) To run the Frontend locally after installing simply run the following command from the base directory of the source tree:
```bash
# Build the frontend library
npm run build
```

### Building the Scalable Pixel Streaming Frontend
1) Run the following command in the base directory of the source tree:
```bash
# Install the frontend library's dependencies
npm install .
```
This will transpile the TypeScript source files to JavaScript and generate the UMD module in the dist subdirectory. 

### Implementing the Scalable Pixel Streaming Frontend in a custom webpage
The Scalable Pixel Streaming Frontend comes with a base index.ts file which is the entry point. In a custom webpage this file can be left out and a custom entry point can be implemented: 

1) Import all the required packages from the Epic Games Pixel Streaming Frontend and Frontend UI libraries
```typescript
import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
import { PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.2';
```
2) Import SPSApplication from the Scalable Pixel Streaming Frontend Library 
```typescript
import { SPSApplication } from "./SPSApplication";
```
3) Create `PixelStreamingApplicationStyles` variable so we have access to the Epic Games Pixel Streaming CSS: 
```typescript
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
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
6) Create the `stream` object and pass in the new `config` object
```typescript
const stream = new PixelStreaming(config);
```
7) Create the `spsApplication` object and pass in the `stream` object enclosed in curly braces
```typescript
const spsApplication = new SPSApplication({ stream });
```
8) Place `spsApplication.rootElement` inside a DOM Element of your choice or inject directly into the body of the web page
```typescript
document.body.appendChild(spsApplication.rootElement);
//OR
document.getElementById("myElementId").appendChild(spsApplication.rootElement);
```

### Default Index Implementation
```typescript
import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
import { PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.2';
import { SPSApplication } from "./SPSApplication";
export const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();

document.body.onload = function () {
	const config = new Config({ useUrlParams: true, initialSettings: { OfferToReceive: true, TimeoutIfIdle: true } });
	const stream = new PixelStreaming(config);
	const spsApplication = new SPSApplication({ stream });
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

---
# Migrating from `libspsfrontend` <=0.1.4

All SPS versions after `0.1.4` are now using the [Epic Games' Pixel Streaming frontend](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend). This shift to the Epic frontend has caused us to change both our API and our NPM packages.

---

# API Usage

Below are common usage of SPS Frontend API that have now changed (this list is not exhaustive, if there are more you would like documented please open an issue).

## Listening for UE messages

**Before:** 
```js
iWebRtcController.dataChannelController.onResponse = (messageBuffer) => { 
	/* whatever */ 
}
```

**Now:**
```js
pixelstreaming.addResponseEventListener(name, funct)

// or

pixelstreaming.removeResponseEventListener(name)
```

(More details [here](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/132))

---

## Sending messages to UE

**Before:** 
```js
iWebRtcController.sendUeUiDescriptor(JSON.stringify({ /* whatever */ } )) 
```

**Now:**
```js
pixelstreaming.emitUIInteraction(data: object | string)
```

(More details [here](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/132))

---

## Listen for WebRTC stream start?

**Before:** 
```js
override onVideoInitialised()
```

**Now:**
```js
pixelStreaming.addEventListener("videoInitialized", ()=> { /* Do something */ });
```

(More details [here](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/110))

------

### NPM Packages
The old [`libspsfrontend`](https://www.npmjs.com/package/@tensorworks/libspsfrontend) package is now deprecated in favour of [`spsfrontend`](https://www.npmjs.com/package/@tensorworks/spsfrontend).

Add `spsfrontend` to your project like so:

```
npm i @tensorworks/spsfrontend
```
---
# About the Scalable Pixel Streaming Frontend
## SPS lifecycle
### Authentication Phase
1) The signalling server transmits a message to the frontend indicating that authentication is required.

2) The player controller responds with an authentication request containing either an empty authentication token (if we have not yet received a token from an identity provider) or with an authentication token that had been obtained by means of a redirect during a previous run of the event lifecycle.

3) The signalling server communicates with the authentication plugin to determine what to do next.

- If the no-op authentication plugin is being used then the signalling server transmits a response indicating that authentication was successful.

- If any other authentication plugin is being used and we do not have an authentication token then the signalling server transmits a response indicating that the user should be redirected to the login page for the identity provider.

- If any other authentication plugin is being used and we do have an authentication token then the signalling server transmits a response indicating whether the token was accepted as valid by the authentication plugin.

Note that the path taken in Step 3 is largely transparent to the logic in the Frontend.

4) If a redirect is required then the Scalable Pixel Streaming Frontend will trigger it immediately after it has finished notifying the Epic Games Pixel Streaming Frontend of the authentication status. After a redirect occurs and the identity provider's login page subsequently redirects back to the Scalable Pixel Streaming Frontend, the page is reset and the event lifecycle restarts from the beginning, except that there is now an authentication token specified in the page's URL parameters and we will follow a different path in Step 3.

5) Once the user has been successfully authenticated, the signalling server will initiate the creation of an instance of the Pixel Streaming application, which represents the beginning of the Instance Startup Phase.

### Instance Startup Phase
As the Pixel Streaming application instance is created and starts, the signalling server transmits status update messages to the Epic Games Pixel Streaming Frontend.

The Epic Games Pixel Streaming Frontend notifies the Scalable Pixel Streaming Frontend of the application instance status so it can inform the user through the page's UI.

Once the Pixel Streaming application instance has started, it will connect to the signalling server and initiate the WebRTC Connection Phase.

### Determining the WebSocket endpoint URL
Prior to deploying the Scalable Pixel Streaming Frontend, you will need to determine the endpoint URL that will be used to establish WebSocket connections to the signalling server(s) for your Pixel Streaming application:

If you are deploying your Pixel Streaming application in a single geographic region on a single cloud platform, then this will be the signalling server endpoint URL reported by the Scalable Pixel Streaming REST API.

If you are deploying your Pixel Streaming application in multiple geographic regions or across multiple cloud platforms then this will be the URL of a load balancer that you have configured to distribute requests to the signalling servers in the various regions or platforms.