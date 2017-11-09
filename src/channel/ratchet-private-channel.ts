import { RatchetChannel } from './';

/**
 * This class represents a Ratchet presence channel.
 */
export class RatchetPrivateChannel extends RatchetChannel {
    /**
     * Trigger client event on the channel.
     *
     * @param  {string}  eventName
     * @param  {object}  data
     * @return {RatchetPrivateChannel}
     */
    whisper(eventName, data) {
        this.socket.emit('client event', {
            channel: this.name,
            event: `client-${eventName}`,
            data: data
        });

        return this;
    }
}
