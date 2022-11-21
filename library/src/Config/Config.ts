import { SettingFlag } from "./SettingFlag";

/**
 * A collection of toggable flags that are core to all Pixel Streaming experiences.
 * These are used in the `Config.Flags` map. Note, that map can take any string but
 * these flags are provided for convenience to avoid hardcoded strings across the library.
 */
export class Flags {
	static UseMic = "UseMic";
	static BrowserSendAnswer = "offerToReceive";
	static PreferSFU = "preferSFU";
	static IsQualityController = "ControlsQuality";
	static ForceMonoAudio = "ForceMonoAudio";
	static ForceTURN = "ForceTURN";
	static AFKDetection = "TimeoutIfIdle";
	static VideoFillWindow = "FillWindow";
}

export class Config {

	// PRESET OPTIONS
	// enable the auto connect of the websocket 
	enableSpsAutoConnect = false;

	// enable the autoplay of the video if enabled by browser
	enableSpsAutoplay = true;

	// start the video muted
	startVideoMuted = false;

	// set the amount of wait time in seconds while there is inactivity for afk to occur 
	afkTimeout = 120;

	// The control scheme controls the behaviour of the mouse when it interacts with the WebRTC player.
	controlScheme = ControlSchemeType.LockedMouse;

	// Browser keys are those which are typically used by the browser UI. We usually want to suppress these to allow, for example, UE4 to show shader complexity with the F5 key without the web page refreshing.
	suppressBrowserKeys = true;

	// UE has a fake touches option which fakes a single finger touch when the user drags with their mouse. 
	// We may perform the reverse; a single finger touch may be converted into a mouse drag UE side. This allows a non-touch application to be controlled partially via a touch device.
	fakeMouseWithTouches = false;

	//compulsory options and DOMs 
	signallingServerAddress: string;
	videoElementParent: HTMLDivElement;

	/* A map of toggable flags - options that can be set in the application - e.g. Use Mic? */
	flags = new Map<string, SettingFlag>();

	/**
	 * @param signallingServerAddress - the address of the signaling server 
	 * @param videoElementParent - the player element ID 
	 */
	constructor(signallingServerAddress: string, videoElementParent: HTMLDivElement) {
		this.signallingServerAddress = signallingServerAddress;
		this.videoElementParent = videoElementParent;
	}

	/**
	 * Make DOM elments for a settings section with a heading.
	 * @param settingsElem The parent container for our DOM elements.
	 * @param sectionHeading The heading element to go into the section.
	 * @returns The constructed DOM element for the section.
	 */
	buildSectionWithHeading(settingsElem: HTMLElement, sectionHeading: string){
		// make section element
		const sectionElem = document.createElement("section");
		sectionElem.classList.add("settingsContainer");

		// make section heading
		const psSettingsHeader = document.createElement("div");
		psSettingsHeader.classList.add("settingsHeader");
		psSettingsHeader.classList.add("settings-text");
		psSettingsHeader.textContent = sectionHeading;

		// add section and heading to parent settings element
		sectionElem.appendChild(psSettingsHeader);
		settingsElem.appendChild(sectionElem);
		return sectionElem;
	}

	/**
	 * Setup flags with their default values and add them to the `Config.flags` map.
	 * @param settingsElem - The element that contains all the individual settings sections, flags, and so on.
	 */
	setupFlags(settingsElem : HTMLElement) : void {

		/* Setup all Pixel Streaming specific settings */
		const psSettingsSection = this.buildSectionWithHeading(settingsElem, "Pixel Streaming");

		const sendSDPAnswerSetting = new SettingFlag(
			Flags.BrowserSendAnswer, 
			"Browser send answer", 
			"Browser will hint it would like to send the sdp answer.", 
			false);

		const useMicSetting = new SettingFlag(
			Flags.UseMic, 
			"Use microphone", 
			"Make browser request microphone access and open an input audio track.", 
			false);

		const preferSFUSetting = new SettingFlag(
			Flags.PreferSFU, 
			"Prefer SFU", 
			"Try to connect to the SFU instead of P2P.", 
			false);

		const qualityControlSetting = new SettingFlag(
			Flags.IsQualityController, 
			"Is quality controller?", 
			"True if this peer controls stream quality", 
			true
		);

		const forceMonoAudioSetting = new SettingFlag(
			Flags.ForceMonoAudio, 
			"Force mono audio",
			"Force browser to request mono audio in the SDP", 
			false
		);

		const forceTURNSetting = new SettingFlag(
			Flags.ForceTURN, 
			"Force TURN",
			"Only generate TURN/Relayed ICE candidates.", 
			false
		);

		const afkIfIdleSetting = new SettingFlag(
			Flags.AFKDetection, 
			"AFK if idle",
			"Timeout the experience if user is AFK for a period.", 
			false
		);
		
		// make settings show up in DOM
		this.addSettingFlag(psSettingsSection, sendSDPAnswerSetting);
		this.addSettingFlag(psSettingsSection, useMicSetting);
		this.addSettingFlag(psSettingsSection, preferSFUSetting);
		this.addSettingFlag(psSettingsSection, qualityControlSetting);
		this.addSettingFlag(psSettingsSection, forceMonoAudioSetting);
		this.addSettingFlag(psSettingsSection, forceTURNSetting);
		this.addSettingFlag(psSettingsSection, afkIfIdleSetting);

		/* Setup all view/ui related settings under this section */
		const viewSettingsSection = this.buildSectionWithHeading(settingsElem, "UI");

		const fillWindowSetting = new SettingFlag(
			Flags.VideoFillWindow, 
			"Video fill window", 
			"Video will try to fill the available space.", 
			true);

		this.addSettingFlag(viewSettingsSection, fillWindowSetting);

	}

	/**
	 * Add a callback to fire when the flag is toggled.
	 * @param id The id of the flag.
	 * @param onChangeListener The callback to fire when the value changes.
	 */
	addOnSettingChangedListener(id: string, onChangeListener: (newFlagValue: boolean) => void) : void {
		if(this.flags.has(id)){
			this.flags.get(id).onChange = onChangeListener;
		}
	}

	/**
	 * Add a SettingFlag element to a particular settings section in the DOM and registers that flag in the Config.flag map.
	 * @param settingsSection The settings section HTML element.
	 * @param settingFlag The settings flag object.
	 */
	addSettingFlag(settingsSection: HTMLElement, settingFlag: SettingFlag) : void {
		settingsSection.appendChild(settingFlag.rootElement);
		this.flags.set(settingFlag.id, settingFlag);
	}

	/**
	 * Get the value of the configruation flag which has the given id.
	 * @param id The unique id for the flag.
	 * @returns True if the flag is enabled.
	 */
	isFlagEnabled(id: string) : boolean {
		return this.flags.get(id).value as boolean;
	}

	/**
	 * Set flag to be enabled/disabled.
	 * @param id The id of the flag to toggle.
	 * @param flagEnabled True if the flag should be enabled.
	 */
	setFlagEnabled(id: string, flagEnabled: boolean) {
		if(!this.flags.has(id)) {
			console.warn(`Cannot toggle flag called ${id} - it does not exist in the Config.flags map.`);
		} else {
			this.flags.get(id).value = flagEnabled;
		}
	}

}

/**
 * The enum associated with the mouse being locked or hovering 
 */
export enum ControlSchemeType {
	LockedMouse = 0,
	HoveringMouse = 1,
}
