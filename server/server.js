import http from "http";
import ws from "WebScoketServer";
import express from "express";

const WebScoketServer = ws.server();

export class Server {
    constructor(port=18888, client_dir) {
        this.port = port;
        this.client_dir = client_dir;

        this.app = express();
        this.server = http.createServer(this.app);
        this.wsServer = new WebScoketServer({
            httpServer: this.server,
            autoAcceptConnections: false,
        });

        this.wsconn_pool = {};
        this._wsconn_id = 0;
    }

    setup(options) {
        this.app.use(express.static(this.client_dir));
        this.app.use(express.json());

        for(const method of ['get', 'post', 'put', 'delete']) {
            if(method in options) {
                const routes = options[method]
                Object.keys(routes).forEach((key) => {
                    this.app[method](key, routes[key]);
                })
            }
        }
        console.log('client source path: ' + this.client_dir);

        // Websocket request message
        this.wsServer.on('request', (request) => {
            let wsconn = request.accept(null, request.origin);
            wsconn.id = this._wsconn_id++;
            this.wsconn_pool[wsconn.id] = wsconn;
            if(options.on_ws_connected) {
                options.on_ws_connected(wsconn);
            }
            console.log(`Connected: from ${request.host} ConnID: ${wsconn.id}`);
        })

        // Websocket close message
        this.wsServer.on('close', (wsconn, closeReason, description) => {
            if(wsconn.id in this.wsconn_pool) {
                wsconn.close();
                delete this.wsconn_pool[wsconn.id];
                console.log(`Disconnected: ConnID: ${wsconn.id}`);
            }
        })

        this.server.listen(this.port, () => {
            console.log(`Server is litening on port ${this.port}`);
        })
    }

    sendTextToClients(data) {
        Object.keys(this.wsconn_pool).forEach(key => {
            const wsconn = this.wsconn_pool[key]
            if(wsconn && wsconn.connected) {
                wsconn.sendUTF(data);
            }
        })
    }
}

