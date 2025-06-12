# Twitch Chat Viewer

This project streams messages from a Twitch channel and displays them in a web interface.

## Configuration

Default configuration values reside in `config.js`:

- `port` – the HTTP server port (defaults to `3000`)
- `channel` – the Twitch channel to connect to (defaults to `illojuan`)

At runtime you can override these by setting the environment variables `PORT` and
`TWITCH_CHANNEL`.

Example:

```bash
PORT=4000 TWITCH_CHANNEL=mychannel npm start
```

If no environment variables are provided the values from `config.js` will be used.
Adjust `config.js` if you want to change the defaults in version control.

## Metrics

The server exposes basic runtime metrics at `http://localhost:<port>/metrics`.
These metrics include the number of connections, disconnections and detected
misuse events.
