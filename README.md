# Scalable Pixel Streaming Frontend

This is the web frontend for [Scalable Pixel Streaming (SPS)](https://scalablestreaming.io). 

The SPS frontend is a lightweight implementation of Epic Games' [Pixel Streaming frontend](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend). 

## Features of the SPS Frontend

- [Extensions](./src/SignallingExtension.ts) to the default signalling messages to communicate with our custom signalling server.
- The sending of [streaming statistics](./src/SPSApplication.ts#L38) to our signalling server.

## Documentation

### Utilising the Scalable Pixel Streaming Frontend
Below is a comprehensive guide to accessing the Scalable Pixel Streaming Frontend, including where to download the library and how to consume and customise it for your own projects.
- [Scalable Pixel Streaming Frontend utilisation guide](./docs/frontend_utilisation_guide.md)

### Migrating from Scalable Pixel Streaming Frontend
In general, the official Epic Games Pixel Streaming [Frontend docs](https://github.com/EpicGames/PixelStreamingInfrastructure/tree/master/Frontend) should cover most common usage cases (as our library is simply a thin wrapper on that). However, some Scalable Pixel Streaming Frontend specific docs are listed below:

- [Migrating from Scalable Pixel Streaming Frontend <=0.1.4](./docs/api_transition_guide.md)

### Scalable Pixel Streaming Frontend Reference section
The Scalable Pixel Streaming Frontend is a part of a complex system which abstracts a lot of its complexities behind the library. Below is a useful collection of references which explain how the Scalable Pixel Streaming Frontend fits within Scalable Pixel Streaming as a whole. 
- [Scalable Pixel Streaming Frontend Reference guide](./docs/sps_frontend_refrence_guide.md)

## Issues

As the SPS frontend is a lightweight implementation of the Epic Games frontend, the majority of issues should be reported to the Epic Games frontend [here](https://github.com/EpicGames/PixelStreamingInfrastructure/issues).

However, in cases where you are certain it is an SPS specific frontend issue, please report your issue [here](https://github.com/ScalablePixelStreaming/Frontend/issues).


## Legal

Copyright &copy; 2021 - 2023, TensorWorks Pty Ltd. Licensed under the MIT License, see the file [LICENSE](./LICENSE) for details.
