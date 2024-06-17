# Migrating from `libspsfrontend` predating `v0.1.4`

SPS frontend changed to use the [Epic Games Pixel Streaming frontend](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend) since version `0.1.4`, which involed mdofications both to our API and NPM packages.

Below aresome common usage of the SPS Frontend API that has changed. Note that this list is not exhaustive, if you encounter more differences, please open an issue on this repository to report them.

### Listening for UE messages

Refer to [this PR](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/132) for more details.

Before:
```js
iWebRtcController.dataChannelController.onResponse = (messageBuffer) => { 
	/* whatever */ 
}
```

Now:
```js
pixelstreaming.addResponseEventListener(name, funct)

// or

pixelstreaming.removeResponseEventListener(name)
```

### Sending messages to UE

Refer to [this PR](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/132) for more details.

Before:
```js
iWebRtcController.sendUeUiDescriptor(JSON.stringify({ /* whatever */ } )) 
```

Now:
```js
pixelstreaming.emitUIInteraction(data: object | string)
```

### Listening for WebRTC stream start

Refer to [this PR](https://github.com/EpicGames/PixelStreamingInfrastructure/pull/110) for more details.

Before: 
```js
override onVideoInitialised()
```

Now:
```js
pixelStreaming.addEventListener("videoInitialized", ()=> { /* Do something */ });
```
