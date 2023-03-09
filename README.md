# Scalable Pixel Streaming Frontend

This is the web frontend for [Scalable Pixel Streaming (SPS)](https://scalablestreaming.io). 

The SPS frontend is a lightweight implementation of Epic Games' [Pixel Streaming frontend](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend). 

## Features of the SPS Frontend

- [Extensions](./src/SignallingExtension.ts) to the default signalling messages to communicate with our custom signalling server.
- The sending of [streaming statistics](./src/SPSApplication.ts#L38) to our signalling server.

## Documentation

In general, the official Epic Games Pixel Streaming [frontend docs](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend) should cover most common usage cases (as our library is simply a thin wrapper on that). However, some SPS frontend specific docs are listed below:

- [Migrating from SPS frontend <=0.1.4](./docs/api_transition_guide.md)

## Issues

As the SPS frontend is a lightweight implementation of the Epic Games frontend, the majority of issues should be reported to the Epic Games frontend [here](https://github.com/EpicGames/PixelStreamingInfrastructure/issues).

However, in cases where you are certain it is an SPS specific frontend issue, please report your issue [here](https://github.com/ScalablePixelStreaming/Frontend/issues).


## Legal

Copyright &copy; 2021 - 2023, TensorWorks Pty Ltd. Licensed under the MIT License, see the file [LICENSE](./LICENSE) for details.
