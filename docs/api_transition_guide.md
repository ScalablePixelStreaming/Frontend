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