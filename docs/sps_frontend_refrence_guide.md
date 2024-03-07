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