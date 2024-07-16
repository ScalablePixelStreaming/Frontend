import {
	Logger,
	BaseMessage,
	SignallingProtocol,
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';

/**
 * Auth Request Message Wrapper
 */
export class MessageAuthRequest implements BaseMessage {
	type: string;
	token: string;
	provider: string;

	/**
	 * @param token - Token Provided by the Auth Provider
	 * @param provider - Name of the provider that is registered in the auth plugin
	 */
	constructor(token: string, provider: string) {
		this.type = "authenticationRequest";
		this.token = token;
		this.provider = provider;
	}
}

/**
 * States of the UE Instance
 */
export enum InstanceState {
	UNALLOCATED = "UNALLOCATED",
	PENDING = "PENDING",
	FAILED = "FAILED",
	READY = "READY"
}

/**
 * Instance State Message wrapper
 */
export class MessageInstanceState {
	state: InstanceState;
	details: string;
	progress: number;
}

/**
 * Types of Authentication responses
 */
export enum MessageAuthResponseOutcomeType {
	REDIRECT = "REDIRECT",
	INVALID_TOKEN = "INVALID_TOKEN",
	AUTHENTICATED = "AUTHENTICATED",
	ERROR = "ERROR"
}

/**
 * Structure for auth responses
 */
export class MessageAuthResponse {
	outcome: MessageAuthResponseOutcomeType;
	redirect: string;
	error: string;
}

/**
 * Instance Request Message Wrapper
 */
export class MessageRequestInstance implements BaseMessage {

	type: string;

	// An opaque string representing optional configuration data to pass to the signalling server for instance customisation
	data: string;

	constructor() {
		this.type = "requestInstance";
	}
}

/**
 * Specific signalling extensions required by SPS.
 * For example: authenticationRequired, instanceState, authenticationResponse
 */
export class SPSSignalling {

	onInstanceStateChanged: (stateChangedMsg: string, isError: boolean) => void;
	onAuthenticationResponse: (authRespMsg: string, isError: boolean) => void;

	constructor(signallingProtocol: SignallingProtocol) {
		this.extendSignallingProtocol(signallingProtocol);
	}

	/**
	 * Extend the signalling protocol with SPS specific messages.
	 */
	extendSignallingProtocol(signallingProtocol: SignallingProtocol) {

		// authenticationRequired
		signallingProtocol.addListener("authenticationRequired", (authReqPayload: BaseMessage) => {
			Logger.Log(Logger.GetStackTrace(), "AUTHENTICATION_REQUIRED", 6);
			const url_string = window.location.href;
			const url = new URL(url_string);
			const authRequest = new MessageAuthRequest(url.searchParams.get("code"), url.searchParams.get("provider"));
			signallingProtocol.sendMessage(authRequest);
		});

		// instanceState
		signallingProtocol.addListener("instanceState", (instanceState: MessageInstanceState) => {
			Logger.Log(Logger.GetStackTrace(), "INSTANCE_STATE", 6);
			this.handleInstanceStateChanged(instanceState);
		});

		// authenticationResponse
		signallingProtocol.addListener("authenticationResponse", (authenticationResponse: MessageAuthResponse) => {
			Logger.Log(Logger.GetStackTrace(), "AUTHENTICATION_RESPONSE", 6);

			this.handleAuthenticationResponse(authenticationResponse);

			switch (authenticationResponse.outcome) {
				case MessageAuthResponseOutcomeType.REDIRECT: {
					window.location.href = authenticationResponse.redirect;
					break;
				}
				case MessageAuthResponseOutcomeType.AUTHENTICATED: {
					Logger.Log(Logger.GetStackTrace(), "User is authenticated and now requesting an instance", 6);
					signallingProtocol.sendMessage(new MessageRequestInstance());
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

		// get the response type
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

		if (isError) {
			this.onInstanceStateChanged(instanceStateMessage, true);
		} else {
			this.onInstanceStateChanged(instanceStateMessage, false);
		}
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