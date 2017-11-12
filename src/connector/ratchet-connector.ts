import { Connector } from './connector';
import { RatchetChannel, RatchetPrivateChannel, RatchetPresenceChannel } from './../channel';

/**
 * This class creates a connnector to a Ratchet server.
 */
export class RatchetConnector extends Connector {
    /**
     * The WebSocket connection instance.
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
     * @return WebSocket
     */
    connect(): WebSocket {
        this.socket = new WebSocket(this.options.host);

        // Extend the socket with a queue for events
        this.socket.queue = [];

        // Extend the socket with an emit function (mimic SocketIO API)
        this.socket.emit = (event: string, message: object) => {
            return this.emit(event, message);
        };

        // Add main event handlers
        this.socket.addEventListener('open', () => {
            this.open();
        });

        this.socket.addEventListener('message', (message) => {
            this.receive(message);
        });

        return this.socket;
    }

    /**
     * Send a packet over the connection.
     *
     * @param  {string} event
     * @param  {object} message
     * @return {void}
     */
    emit(event: string, message: object): void {
        // Stringify the event
        var packet = JSON.stringify({"event":event, "message":message});

        // Queue the packet if the connection isn't ready
        if (this.socket.readyState !== this.socket.OPEN) {
            this.socket.queue.push(packet);
            return;
        }

        // Otherwise send immediately
        this.socket.send(packet);
    }

    /**
     * Handle when the connection is set up successfully.
     *
     * @return {void}
     */
    open(): void {
        // Send any queued events
        var socket = this.socket;

        socket.queue.forEach(function(packet){
            socket.send(packet);
        });

        // Reset the queue
        this.socket.queue = [];
    }

    /**
     * Handle a message received from the server.
     *
     * @param  {MessageEvent} event
     * @return {void}
     */
    receive(message: MessageEvent): void {
        // Pick apart the message to determine where it should go
        var packet = JSON.parse(message.data);

        if (packet.event && packet.channel && typeof packet.data !== "undefined") {
            // Fire the callbacks for the right event on the appropriate channel
            this.channel(packet.channel).events[packet.event].forEach(function(callback){
                callback(packet.channel, packet.data);
            });
        } else {
            // Looks like a poorly formatted message
            throw 'Invalid message received via socket.';
        }
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
