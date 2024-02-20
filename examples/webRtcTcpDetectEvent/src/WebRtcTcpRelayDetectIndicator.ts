export class WebRtcTcpRelayDetectIndicator {

    _uiFeaturesElement: HTMLElement
    _connectionElement: HTMLElement

    _warningElement: HTMLElement
    _webRtcTcpRelayDetectIndicatorElement: HTMLElement;
    _warningTextElement: HTMLElement;
    _closeButton: HTMLElement;

    constructor() {
        // Get the uiFeatures Element
        this._uiFeaturesElement = document.getElementById("uiFeatures")

        // Get the connection element
        this._connectionElement = document.getElementById("connection")
    }


    public get WarningElement(): HTMLElement {
        if (!this._warningElement) {
            this._warningElement = document.createElement('div');
            this._warningElement.id = "warning"
        }
        return this._warningElement
    }

    public get WebRtcTcpRelayDetectIndicatorElement(): HTMLElement {
        if (!this._webRtcTcpRelayDetectIndicatorElement) {
            this._webRtcTcpRelayDetectIndicatorElement = document.createElement('div');
            this._webRtcTcpRelayDetectIndicatorElement.id = 'webRtcTcpRelayDetectIndicator';
            this._webRtcTcpRelayDetectIndicatorElement.appendChild(this.closeButtonElement)
            this._webRtcTcpRelayDetectIndicatorElement.appendChild(this.warningTextElement)
        }

        return this._webRtcTcpRelayDetectIndicatorElement;
    }

    public get closeButtonElement(): HTMLElement {
        if (!this._closeButton) {
            this._closeButton = document.createElement('div')
            this._closeButton.id = "warningCloseButton"
            this._closeButton.onclick = () => this.RemoveWarning();
        }
        return this._closeButton
    }

    public get warningTextElement(): HTMLElement {
        if (!this._warningTextElement) {
            this._warningTextElement = document.createElement('div');
            this._warningTextElement.id = 'warningTCPStream';
            this._warningTextElement.innerHTML = `<p>Your network is blocking UDP.</br >Expect degraded streaming (<a href="https://www.google.com/" target="_blank">details</a>).</p>`
        }
        return this._warningTextElement;
    }


    public ShowWarning() {

        // Override the connection position
        this._connectionElement.style.cssText = "position: unset !important";
        this._connectionElement.style.float = "left";

        // Remove the connection element from the uiFeatures element
        this._uiFeaturesElement.removeChild(this._connectionElement)

        // Add the connection element into the warning element
        this.WarningElement.appendChild(this._connectionElement)

        // Add the web rtc tcp detect indicator element to the warning
        this.WarningElement.appendChild(this.WebRtcTcpRelayDetectIndicatorElement)

        // Add the warning element into the ui features element
        this._uiFeaturesElement.appendChild(this.WarningElement)
    }



    public RemoveWarning() {

        // Remove the connection element from the uiFeatures element
        this._uiFeaturesElement.removeChild(this.WarningElement)
        
        // Clear the connection element position back to what it was
        this._connectionElement.style.position = null;
        this._connectionElement.style.float = null;

        // Add the warning element into the ui features element
        this._uiFeaturesElement.appendChild(this._connectionElement)
    }
}


