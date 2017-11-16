<p align="center"><img src="https://laravel.com/assets/img/components/logo-echo.svg"></p>

## Introduction

In many modern web applications, WebSockets are used to implement realtime, live-updating user interfaces. When some data is updated on the server, a message is typically sent over a WebSocket connection to be handled by the client. This provides a more robust, efficient alternative to continually polling your application for changes.

To assist you in building these types of applications, Laravel makes it easy to "broadcast" your events over a WebSocket connection. Broadcasting your Laravel events allows you to share the same event names between your server-side code and your client-side JavaScript application.

Laravel Echo is a JavaScript library that makes it painless to subscribe to channels and listen for events broadcast by Laravel. You may install Echo via the NPM package manager.

## Documentation

Official documentation [is located here](http://laravel.com/docs/broadcasting).

## Now with Ratchet support

This fork of Laravel Echo aims to add [Ratchet](http://socketo.me/) support to your application in a way that stays true to the goals of Laravel Echo.

Best used with a purpose-built Ratchet solution for Laravel, e.g. [laravel-ratchet](https://github.com/askedio/laravel-ratchet).

## Installation

```bash
$ npm i laravel-echo-ratchet --save
```

This fork of Echo requires a slightly different setup to the original. Other than this, it works identically to the original, so dropping it in will not harm your application if you're using Pusher or Socket.IO.

If you've previously installed Echo, simply update your `package.json` dependency to the following:

```json
dependencies: {
    "laravel-echo-ratchet": "^1.4.0"
}
```

Then in your `bootstrap.js` (instead of `import Echo from 'laravel-echo'`:

```js
import Echo from 'laravel-echo-ratchet'
```

## Using with Ratchet

To use with your Ratchet server, use the following as your Echo instantiator in your `bootstrap.js` file, replacing the parts in `{}` as appropriate:

```js
window.Echo = new Echo({
    broadcaster: 'ratchet',
    host: 'ws://{ratchet-server-ip}:{port}',
});
```
