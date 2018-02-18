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
        this.socket = new WebSocket(this.options.host, this.options.protocols);

        this.extendSocket();

        return this.socket;
    }

    /**
     * Attach event handlers to the socket.
     *
     * @return {void}
     */
    extendSocket(): void {
        // Extend the socket with a queue for events
        this.socket.queue = [];

        this.socket.id = this.generateId();

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

        if (packet.event && packet.channel && typeof packet.payload !== "undefined") {
            // Fire the callbacks for the right event on the appropriate channel
            this.channel(packet.channel).events[packet.event].forEach(function(callback){
                callback(packet.channel, packet.payload);
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
     * Generate an ID for the socket.
     *
     * @see https://jsperf.com/uuid4/8
     * @return {string}
     */
    generateId(): string {
        var c = '0123456789ABCDEF'.split(''),
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''),
            r;

        id[0] = c[(r = Math.random() * 0x100000000) & 0xf];
        id[1] = c[(r >>>= 4) & 0xf];
        id[2] = c[(r >>>= 4) & 0xf];
        id[3] = c[(r >>>= 4) & 0xf];
        id[4] = c[(r >>>= 4) & 0xf];
        id[5] = c[(r >>>= 4) & 0xf];
        id[6] = c[(r >>>= 4) & 0xf];
        id[7] = c[(r >>>= 4) & 0xf];

        id[9] = c[(r = Math.random() * 0x100000000) & 0xf];
        id[10] = c[(r >>>= 4) & 0xf];
        id[11] = c[(r >>>= 4) & 0xf];
        id[12] = c[(r >>>= 4) & 0xf];
        id[15] = c[(r >>>= 4) & 0xf];
        id[16] = c[(r >>>= 4) & 0xf];
        id[17] = c[(r >>>= 4) & 0xf];

        id[19] = c[(r = Math.random() * 0x100000000) & 0x3 | 0x8];
        id[20] = c[(r >>>= 4) & 0xf];
        id[21] = c[(r >>>= 4) & 0xf];
        id[22] = c[(r >>>= 4) & 0xf];
        id[24] = c[(r >>>= 4) & 0xf];
        id[25] = c[(r >>>= 4) & 0xf];
        id[26] = c[(r >>>= 4) & 0xf];
        id[27] = c[(r >>>= 4) & 0xf];

        id[28] = c[(r = Math.random() * 0x100000000) & 0xf];
        id[29] = c[(r >>>= 4) & 0xf];
        id[30] = c[(r >>>= 4) & 0xf];
        id[31] = c[(r >>>= 4) & 0xf];
        id[32] = c[(r >>>= 4) & 0xf];
        id[33] = c[(r >>>= 4) & 0xf];
        id[34] = c[(r >>>= 4) & 0xf];
        id[35] = c[(r >>>= 4) & 0xf];

        return id.join('');
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
