import { Logger } from "../Logger/Logger";
import { IDataChannelController } from "./IDataChannelController";

/**
 * A class for sending data channel messages 
 */
export class DataChannelSender {

    dataChannelProvider: IDataChannelController;

    /**
     * @param dataChannelProvider - Data channel object type 
     */
    constructor(dataChannelProvider: IDataChannelController) {
        this.dataChannelProvider = dataChannelProvider;
    }

    canSend() : boolean {
        return this.dataChannelProvider.getDataChannelInstance().dataChannel !== undefined;
    }

    /**
     * Send Data over the Data channel to the UE Instance
     * @param data - Message Data Array Buffer
     */
    sendData(data: ArrayBuffer) {
        // reset the afk inactivity
        const dataChannelInstance = this.dataChannelProvider.getDataChannelInstance();

        if (dataChannelInstance.dataChannel.readyState == "open") {
            dataChannelInstance.dataChannel.send(data);
            Logger.Log(Logger.GetStackTrace(), `Message Sent: ${new Uint8Array(data)}`, 6);
            this.resetAfkWarningTimerOnDataSend();
        } else {
            Logger.Error(Logger.GetStackTrace(), `Message Failed: ${new Uint8Array(data)}`);
        }
    }

    /**
     * An override method for resetting the Afk warning timer when data is sent over the data channel 
     */
    resetAfkWarningTimerOnDataSend() { }
}