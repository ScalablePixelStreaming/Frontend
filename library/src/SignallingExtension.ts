import {
	Logger,
	MessageRecv,
	MessageSend,
	WebSocketController,
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.4';

/**
 * Authentication request message wrapper
 */
export class MessageAuthRequest extends MessageSend {
	token: string;
	provider: string;

	/**
	 * @param token - Token provided by the authentication provider
	 * @param provider - Name of the provider that is registered in the auth plugin
	 */
	constructor(token: string, provider: string) {
		super();
		this.type = "authenticationRequest";
		this.token = token;
		this.provider = provider;
	}
}

/**
 * States of the UE instance request
 */
export enum InstanceState {

	/**
	 * The instance is currently unallocated
	 */
	UNALLOCATED = "UNALLOCATED",

	/**
	 * The instance is currently pending
	 */
	PENDING = "PENDING",

	/**
	 * The instance failed to start
	 */
	FAILED = "FAILED",

	/**
	 * The instance is ready
	 */
	READY = "READY"
}

/**
 * Instance state message wrapper
 */
export class MessageInstanceState extends MessageRecv {
	state: InstanceState;
	details: string;
	progress: number;
}

/**
 * Types of Authentication reposes 
 */
export enum MessageAuthResponseOutcomeType {

	/**
	 *  The authentication redirected used with Oauth 2.0
	 */
	REDIRECT = "REDIRECT",

	/**
	 * The token provided is invalid 
	*/
	INVALID_TOKEN = "INVALID_TOKEN",

	/**
	 *  The authentication was successfully authenticated
	 */
	AUTHENTICATED = "AUTHENTICATED",

	/**
	 * There was an error with authentication
	 */
	ERROR = "ERROR"
}

/**
 * Authentication Response Message wrapper
 */
export class MessageAuthResponse extends MessageRecv {
	outcome: MessageAuthResponseOutcomeType;
	redirect: string;
	error: string;
}

/**
 * Instance Request Message Wrapper
 */
export class MessageRequestInstance extends MessageSend {

	// An opaque string representing optional configuration data to pass to the signalling server for instance customisation
	data: string

	constructor() {
		super();
		this.type = "requestInstance";
	}
}

/**
 * Specific signalling extensions required by SPS.
 * For example: authenticationRequired, instanceState, authenticationResponse
 */
export class SPSSignalling {

	// Define the instance state changed event
	onInstanceStateChanged: (stateChangedMsg: string, isError: boolean) => void;

	// Define the authentication response event
	onAuthenticationResponse: (authRespMsg: string, isError: boolean) => void;

	constructor(websocketController: WebSocketController) {

		// Initialise the signalling protocol extensions
		this.extendSignallingProtocol(websocketController);
	}

	/**
	 * Extend the signalling protocol with SPS specific messages.
	 */
	extendSignallingProtocol(webSocketController: WebSocketController) {

		// Add the authentication required signalling message to the signalling protocol
		webSocketController.signallingProtocol.addMessageHandler("authenticationRequired", (authReqPayload: string) => {
			Logger.Log(Logger.GetStackTrace(), "AUTHENTICATION_REQUIRED", 6);
			const url_string = window.location.href;
			const url = new URL(url_string);

			// Create a authentication request message with the token and provider if supplied from the url parameters
			const authRequest = new MessageAuthRequest(url.searchParams.get("code"), url.searchParams.get("provider"));

			// Send the authentication request message to the signalling server
			webSocketController.webSocket.send(authRequest.payload());
		});

		// Add the instance state signalling message to the signalling protocol
		webSocketController.signallingProtocol.addMessageHandler("instanceState", (instanceStatePayload: string) => {
			Logger.Log(Logger.GetStackTrace(), "INSTANCE_STATE", 6);

			// Create a instance state message from the instance state message payload
			const instanceState: MessageInstanceState = JSON.parse(instanceStatePayload);

			// Call how to handle the instance state changed
			this.handleInstanceStateChanged(instanceState);
		});

		// Add the authentication response signalling message to the signalling protocol
		webSocketController.signallingProtocol.addMessageHandler("authenticationResponse", (authRespPayload: string) => {
			Logger.Log(Logger.GetStackTrace(), "AUTHENTICATION_RESPONSE", 6);

			// Create the authentication response from the authentication response payload
			const authenticationResponse: MessageAuthResponse = JSON.parse(authRespPayload);

			// Call how to handle the authentication response
			this.handleAuthenticationResponse(authenticationResponse);

			// Handle the type of the authentication response
			switch (authenticationResponse.outcome) {
				case MessageAuthResponseOutcomeType.REDIRECT: {

					// Redirect the location to the redirect value
					window.location.href = authenticationResponse.redirect;
					break;
				}
				case MessageAuthResponseOutcomeType.AUTHENTICATED: {
					Logger.Log(Logger.GetStackTrace(), "User is authenticated and now requesting an instance", 6);

					// Send a instance request massage to the signalling server
					webSocketController.webSocket.send(new MessageRequestInstance().payload());
					break;
				}
				case MessageAuthResponseOutcomeType.INVALID_TOKEN: {
					Logger.Info(Logger.GetStackTrace(), "Authentication error : Invalid Token");
					break;
				}
				case MessageAuthResponseOutcomeType.ERROR: {
					Logger.Info(Logger.GetStackTrace(), "Authentication Error from server Check what you are sending");
					break;
				}
				default: {
					Logger.Error(Logger.GetStackTrace(), "The Outcome Message has not been handled : this is really bad");
					break;
				}
			}

		});
	}

	/**
	* Set up functionality to happen when an instance state change occurs and updates the info overlay with the response
	* @param instanceState - the message instance state 
	*/
	handleInstanceStateChanged(instanceState: MessageInstanceState) {
		let instanceStateMessage = "";
		let isInstancePending = false;
		let isError = false;

		// Create an informative message based on the state of the instance
		switch (instanceState.state) {
			case InstanceState.UNALLOCATED:
				instanceStateMessage = "Instance Unallocated: " + instanceState.details;
				break;
			case InstanceState.FAILED:
				instanceStateMessage = "UE Instance Failed: " + instanceState.details;
				isError = true;
				break;
			case InstanceState.PENDING:
				isInstancePending = true;
				if (instanceState.details == undefined || instanceState.details == null) {
					instanceStateMessage = "Pending";
				} else {
					instanceStateMessage = instanceState.details;
				}
				instanceStateMessage = "Step 2/3: " + instanceStateMessage;
				break;
			case InstanceState.READY:
				if (instanceState.details == undefined || instanceState.details == null) {
					instanceStateMessage = "Ready";
				} else {
					instanceStateMessage = "Ready: " + instanceState.details;
				}
				instanceStateMessage = "Step 3/3: " + instanceStateMessage;
				break;
			default:
				instanceStateMessage = "Unhandled Instance State" + instanceState.state + " " + instanceState.details;
				break;
		}

		// Emit an instance state changed with error
		this.onInstanceStateChanged(instanceStateMessage, isError);
	}

	/**
	 * Set up functionality to happen when receiving an auth response and updates an info overlay with the response
	 * @param authResponse - the auth response message type
	 */
	handleAuthenticationResponse(authResponse: MessageAuthResponse) {
		let instanceStateMessage = "";
		let isError = false;

		// get the response type
		switch (authResponse.outcome) {
			case MessageAuthResponseOutcomeType.AUTHENTICATED:
				instanceStateMessage = "Step 1/3: Requesting Instance";
				break;
			case MessageAuthResponseOutcomeType.INVALID_TOKEN:
				instanceStateMessage = "Invalid Token: " + authResponse.error;
				isError = true;
				break;
			case MessageAuthResponseOutcomeType.REDIRECT:
				instanceStateMessage = "Redirecting to: " + authResponse.redirect;
				break;
			case MessageAuthResponseOutcomeType.ERROR:
				instanceStateMessage = "Error: " + authResponse.error;
				isError = true;
				break;
			default:
				instanceStateMessage = "Unhandled Auth Response: " + authResponse.outcome;
				break;
		}

		this.onAuthenticationResponse(instanceStateMessage, isError);
	}
}