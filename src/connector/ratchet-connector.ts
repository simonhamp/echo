import { Connector } from './connector';
import { RatchetChannel } from './../channel';

/**
 * This class creates a connnector to a Ratchet server.
 */
export class RatchetConnector extends Connector {
    /**
     * The Ratchet connection instance.
     *
     * @type {object}
     */
    socket: any;

    /**
     * All of the subscribed channel names.
     *
     * @type {any}
     */
    channels: any = {};

    /**
     * Create a fresh Ratchet connection.
     *
     * @return void
     */
    connect(): void {
        var socket = new WebSocket(this.options.host);

        socket.emit = function (event, message) {
            if (socket.readyState !== socket.OPEN) {
                socket.queue = [];
                socket.queue.push({ event: message });

                socket.onopen = function(){
                    socket.queue.forEach(function(event){
                        socket.send(event);
                    });
                };
            }
        };

        this.socket = socket;

        return this.socket;
    }

    /**
     * Listen for an event on a channel instance.
     *
     * @param  {string} name
     * @param  {string} event
     * @param  {Function} callback
     * @return {RatchetChannel}
     */
    listen(name: string, event: string, callback: Function): RatchetChannel {
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     *
     * @param  {string} name
     * @return {RatchetChannel}
     */
    channel(name: string): RatchetChannel {
        if (!this.channels[name]) {
            this.channels[name] = new RatchetChannel(
                this.socket,
                name,
                this.options
            );
        }

        return this.channels[name];
    }

    /**
     * Get a private channel instance by name.
     *
     * @param  {string} name
     * @return {RatchetChannel}
     */
    privateChannel(name: string): RatchetPrivateChannel {
        if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new RatchetPrivateChannel(
                this.socket,
                'private-' + name,
                this.options
            );
        }

        return this.channels['private-' + name];
    }

    /**
     * Get a presence channel instance by name.
     *
     * @param  {string} name
     * @return {RatchetPresenceChannel}
     */
    presenceChannel(name: string): RatchetPresenceChannel {
        if (!this.channels['presence-' + name]) {
            this.channels['presence-' + name] = new RatchetPresenceChannel(
                this.socket,
                'presence-' + name,
                this.options
            );
        }

        return this.channels['presence-' + name];
    }

    /**
     * Leave the given channel.
     *
     * @param  {string} name
     * @return {void}
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name];

        channels.forEach(name => {
            if (this.channels[name]) {
                this.channels[name].unsubscribe();

                delete this.channels[name];
            }
        });
    }

    /**
     * Get the socket ID for the connection.
     *
     * @return {string}
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect Ratchet connection.
     *
     * @return void
     */
    disconnect(): void {
        this.socket.disconnect();
    }
}
