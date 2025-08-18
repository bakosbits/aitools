export function createSSEStream(res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (type, payload) => {
        res.write(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
        res.flush();
    };

    const sendStatus = (message) => send("status", { message });
    const sendError = (message) => {
        send("error", { message });
        res.end();
    };

    const keepAlive = setInterval(() => {
        res.write(": keep-alive\n\n");
        res.flush();
    }, 15000);

    const close = () => {
        clearInterval(keepAlive);
        res.end();
    };

    return { sendStatus, sendError, close };
}
