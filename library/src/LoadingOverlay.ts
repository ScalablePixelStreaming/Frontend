import { TextOverlay } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.4';

export class LoadingOverlay extends TextOverlay {

	private static _rootElement: HTMLElement;
	private static _textElement: HTMLElement;
	private static _spinnerElement: HTMLElement;

	/**
	* @returns The created root element of this overlay.
	*/
	public static rootElement(): HTMLElement {

		// Check if the loading overlay element doesn't exists
		if (!LoadingOverlay._rootElement) {

			// Create a loading overlay div element
			LoadingOverlay._rootElement = document.createElement('div');
			LoadingOverlay._rootElement.id = "loadingOverlay";
			LoadingOverlay._rootElement.className = "textDisplayState";
		}

		// Return the loading overlay root element
		return LoadingOverlay._rootElement;
	}

	/**
	 * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
	 */
	public static textElement(): HTMLElement {

		// Check if the text element doesn't exists
		if (!LoadingOverlay._textElement) {

			// Create a text div element
			LoadingOverlay._textElement = document.createElement('div');
			LoadingOverlay._textElement.id = 'loadingOverlayText';
		}

		// Return the text element
		return LoadingOverlay._textElement;
	}

	/**
	 * 
	 * @returns The created a loading spinner element
	 */
	public static spinner(): HTMLElement {
		if (!LoadingOverlay._spinnerElement) {
			// Get the size of loading spinners root element
			const size = LoadingOverlay._rootElement.clientWidth * 0.03;

			// Create the loading spinner element
			LoadingOverlay._spinnerElement = document.createElement('div');
			LoadingOverlay._spinnerElement.id = "loading-spinner"
			LoadingOverlay._spinnerElement.className = "loading-spinner";
			LoadingOverlay._spinnerElement.setAttribute("style", "width: " + size + "px; height: " + size + "px;");

			// Create an spinner section element
			const SpinnerSectionOne = document.createElement("div");
			SpinnerSectionOne.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");

			// Add the spinner section to spinner element
			LoadingOverlay._spinnerElement.appendChild(SpinnerSectionOne);

			// Create an spinner section element
			const SpinnerSectionTwo = document.createElement("div");
			SpinnerSectionTwo.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");

			// Add the spinner section to spinner element
			LoadingOverlay._spinnerElement.appendChild(SpinnerSectionTwo);

			// Create an spinner section element
			const SpinnerSectionThree = document.createElement("div");
			SpinnerSectionThree.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");

			// Add the spinner section to spinner element
			LoadingOverlay._spinnerElement.appendChild(SpinnerSectionThree);
		}

		// Return the spinner element
		return LoadingOverlay._spinnerElement;
	}

	/**
	 * Construct a connect overlay with a connection button.
	 * @param parentElem the parent element this overlay will be inserted into. 
	 */
	public constructor(parentElem: HTMLElement) {

		// Call the parent constructor
		super(parentElem, LoadingOverlay.rootElement(), LoadingOverlay.textElement());
	}

	/**
	 * Update the text overlays inner text 
	 * @param text the update text to be inserted into the overlay 
	 */
	public update(text: string): void {

		// Check if the text parameter is valid
		if (text != null || text != undefined) {

			// Set the text element to an empty string
			this.textElement.innerHTML = "";

			// Create a text container element
			let textContainer = document.createElement("div");

			// Set the element inner html to the text parmater
			textContainer.innerHTML = text;

			// Append the text container to the text element
			this.textElement.append(textContainer);

			// Append the loading spinner to the text element
			this.textElement.append(LoadingOverlay.spinner());
		}
	}
}
