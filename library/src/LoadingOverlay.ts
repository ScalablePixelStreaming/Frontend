import { TextOverlay } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5';

export class LoadingOverlay extends TextOverlay {

	private static _rootElement: HTMLElement;
	private static _textElement: HTMLElement;
	private static _spinner: HTMLElement;

	/**
	* @returns The created root element of this overlay.
	*/
	public static rootElement(): HTMLElement {
		if (!LoadingOverlay._rootElement) {
			LoadingOverlay._rootElement = document.createElement('div');
			LoadingOverlay._rootElement.id = "loadingOverlay";
			LoadingOverlay._rootElement.className = "textDisplayState";
		}
		return LoadingOverlay._rootElement;
	}

	/**
	 * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
	 */
	public static textElement(): HTMLElement {
		if (!LoadingOverlay._textElement) {
			LoadingOverlay._textElement = document.createElement('div');
			LoadingOverlay._textElement.id = 'loadingOverlayText';
		}
		return LoadingOverlay._textElement;
	}


	public static spinner(): HTMLElement {
		if (!LoadingOverlay._spinner) {
			// build the spinner div
			const size = LoadingOverlay._rootElement.clientWidth * 0.03;
			LoadingOverlay._spinner = document.createElement('div');
			LoadingOverlay._spinner.id = "loading-spinner"
			LoadingOverlay._spinner.className = "loading-spinner";
			LoadingOverlay._spinner.setAttribute("style", "width: " + size + "px; height: " + size + "px;");

			const SpinnerSectionOne = document.createElement("div");
			SpinnerSectionOne.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");
			LoadingOverlay._spinner.appendChild(SpinnerSectionOne);

			const SpinnerSectionTwo = document.createElement("div");
			SpinnerSectionTwo.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");
			LoadingOverlay._spinner.appendChild(SpinnerSectionTwo);

			const SpinnerSectionThree = document.createElement("div");
			SpinnerSectionThree.setAttribute("style", "width: " + size * 0.8 + "px; height: " + size * 0.8 + "px; border-width: " + size * 0.125 + "px;");
			LoadingOverlay._spinner.appendChild(SpinnerSectionThree);
		}
		return LoadingOverlay._spinner;
	}
	/**
	 * Construct a connect overlay with a connection button.
	 * @param parentElem the parent element this overlay will be inserted into. 
	 */
	public constructor(parentElem: HTMLElement) {
		super(parentElem, LoadingOverlay.rootElement(), LoadingOverlay.textElement());
	}

	/**
	 * Update the text overlays inner text 
	 * @param text the update text to be inserted into the overlay 
	 */
	public update(text: string): void {
		if (text != null || text != undefined) {
			this.textElement.innerHTML = "";

			let textContainer = document.createElement("div");
			textContainer.innerHTML = text;
			this.textElement.append(textContainer);

			this.textElement.append(LoadingOverlay.spinner());
		}
	}
}
