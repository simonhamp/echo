import { PresenceChannel, RatchetPrivateChannel } from './';

/**
 * This class represents a Ratchet presence channel.
 */
export class RatchetPresenceChannel extends RatchetPrivateChannel implements PresenceChannel {
    /**
     * Register a callback to be called anytime the member list changes.
     *
     * @param  {Function} callback
     * @return {object} RatchetPresenceChannel
     */
    here(callback: Function): RatchetPresenceChannel {
        this.on('presence:subscribed', (members) => {
            callback(members.map(m => m.user_info));
        });

        return this;
    }

    /**
     * Listen for someone joining the channel.
     *
     * @param  {Function} callback
     * @return {RatchetPresenceChannel}
     */
    joining(callback: Function): RatchetPresenceChannel {
        this.on('presence:joining', (member) => callback(member.user_info));

        return this;
    }

    /**
     * Listen for someone leaving the channel.
     *
     * @param  {Function}  callback
     * @return {RatchetPresenceChannel}
     */
    leaving(callback: Function): RatchetPresenceChannel {
        this.on('presence:leaving', (member) => callback(member.user_info));

        return this;
    }
}
