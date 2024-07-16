# Scalable Pixel Streaming frontend reference

There are several phases involved in the SPS lifecycle, described in detail below.

### Authentication Phase

1) The signalling server transmits a message to the frontend indicating that authentication is required.

2) The player controller responds with an authentication request containing either an empty authentication token (if we have not yet received a token from an identity provider), or with an authentication token that had been obtained by means of a redirect during a previous run of the event lifecycle.

3) The signalling server communicates with the authentication plugin to determine what to do next:

- If the no-op authentication method is used, then the signalling server transmits a response indicating that authentication was successful.

- If any other authentication plugin is used and we _do not_ have an authentication token, then the signalling server transmits a response indicating that the user should be redirected to the login page for the identity provider.

- If any other authentication plugin is used and we _do_ have an authentication token, then the signalling server transmits a response indicating whether the token was accepted as valid by the authentication plugin.

Note that the path taken in step three is largely transparent to the logic in the frontend.

4) If a redirect is required, then the Scalable Pixel Streaming frontend will trigger it immediately after it has finished notifying the Epic Games Pixel Streaming frontend of the authentication status. After a redirect occurs and the identity provider's login page subsequently redirects back to the Scalable Pixel Streaming frontend, the page is reset and the event lifecycle restarts from the beginning, except that there is now an authentication token specified in the page's URL parameters, which will lead down a different path in the previous step.

5) Once the user has been successfully authenticated, the signalling server will initiate the creation of an instance of the Pixel Streaming application, beginning the instance startup phase.

### Instance startup phase

1) As the Pixel Streaming application instance is created, the signalling server transmits status update messages to the Epic Games Pixel Streaming frontend.

2) The Epic Games Pixel Streaming frontend notifies the SPS frontend of the application instance status, so it can inform the user through the page's UI.

3) Once the Pixel Streaming application instance has started, it will connect to the signalling server and initiate the WebRTC connection phase.

### Determining the WebSocket endpoint URL

Prior to deploying the Scalable Pixel Streaming frontend, you will need to determine the endpoint URL that will be used to establish WebSocket connections to the signalling server/servers for your Pixel Streaming application:

- If you are deploying your Pixel Streaming application in a single geographic region on a single cloud platform, this will be the signalling server endpoint URL reported by the Scalable Pixel Streaming REST API.

- If you are deploying your Pixel Streaming application in multiple geographic regions or across multiple cloud platforms, this will be the URL of a load balancer that you have configured to distribute requests to the signalling servers in the various regions and/or platforms.
