# Scalable Pixel Streaming frontend

This repository contains the web frontend for [Scalable Pixel Streaming (SPS)](https://scalablestreaming.io), which is a lightweight wrapper implementation of Epic Games [Pixel Streaming frontend](https://github.com/EpicGamesExt/PixelStreamingInfrastructure/tree/master/Frontend). 

## Features of the SPS frontend

- [Extensions](./library/src/SignallingExtension.ts) to the default signalling messages to communicate with our custom signalling server.
- [Streaming statistics](./library/src/SPSApplication.ts#L38) are being sent to our signalling server.

## Documentation

### Utilising the Scalable Pixel Streaming Frontend

Refer to our [Scalable Pixel Streaming frontend utilisation guide](./docs/frontend_utilisation_guide.md) for accessing the Scalable Pixel Streaming frontend, downloading the library, consuming it, and customising it for usage in different projects.

### Migrating legacy Scalable Pixel Streaming frontend

All SPS versions since `v0.1.4` are using the current version of Epic Games Pixel Streaming frontend. Refer to [our migration guide](./docs/api_transition_guide.md) if your frontend predates this version.

### Scalable Pixel Streaming frontend reference

The Scalable Pixel Streaming frontend is a part of a complex system which abstracts a lot of its complexities behind the library. Refer to our [reference guide](./docs/sps_frontend_refrence_guide.md) to gain a deeper understanding of how the SPS frontend fits within Scalable Pixel Streaming as a whole.

## Issues

As the SPS frontend is an implementation of the Epic Games Pixel Streaming frontend, the majority of issues will pertain to the Epic Games frontend and should be reported on [their repository](https://github.com/EpicGamesExt/PixelStreamingInfrastructure/issues).

If you encounter an issues specific to the SPS implementation, please report your issue [here](https://github.com/ScalablePixelStreaming/Frontend/issues).


## Legal

Copyright &copy; 2021 - 2024, TensorWorks Pty Ltd. Licensed under the MIT License, see the [license file](./LICENSE) for details.
