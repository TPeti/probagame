import { Peer } from "peerjs";
import {
  EVENT_INITIAL_DATA_REQUESTED, EVENT_NETWORK_MONSTER_UPDATE,
  EVENT_NETWORK_PLAYER_LEAVE,
  EVENT_NETWORK_PLAYER_UPDATE,
} from "../constants.js";
import { guidGenerator } from "../helpers.js";

const PORT = 9002;
const LOCALHOST_CONFIG = {
  host: "localhost",
  key: "demodemo",
  port: PORT,
  path: "/myapp",
};
const LOCALHOST_URL = `http://localhost:${PORT}`;


const URL = "mock-peerjs-server.onrender.com";
const PRODUCTION_CONFIG = {
  host: URL,
  key: "demodemo",
  port: "",
  path: "/myapp",
  secure: true,
};



export class NetworkClient {
  constructor(engine) {
    this.peerId = "Player_" + guidGenerator();
    this.engine = engine;
    this.connectionMap = new Map();
    void this.init();
  }

  async init() {
    this.peer = new Peer(this.peerId, PRODUCTION_CONFIG);

    this.peer.on("error", (err) => {
      console.log(err.message);
    });

    // Be ready to hear from incoming connections
    this.peer.on("connection", async (conn) => {

      // A new player has joined and connected to me
      conn.on("open", () => {
        this.connectionMap.set(conn.peer, conn);
        this.engine.emit(EVENT_INITIAL_DATA_REQUESTED);
      });

      // Know when it's closed
      conn.on("close", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });
      conn.on("disconnected", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });


      conn.on("data", (data) => {
        this.handleIncomingData(conn, data);
      });

      // Close the connection if I leave
      window.addEventListener("unload", () => {
        conn.close();
      });
    });

    // Make all outgoing connections
    const otherPeerIds = await this.getAllPeerIds();

    await timeout(1000);

    for (let i = 0; i < otherPeerIds.length; i++) {
      const id = otherPeerIds[i];

      // I joined and reached out to all the other players.
      const conn = this.peer.connect(id);

      // Register to each player I know about
      conn.on("open", () => {
        this.connectionMap.set(id, conn);
      });

      // Know when it's closed
      conn.on("close", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });
      conn.on("disconnected", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });

      // Subscribe to their updates
      conn.on("data", (data) => {
        this.handleIncomingData(conn, data);
      });

      // Close the connection if I leave
      window.addEventListener("unload", () => {
        conn.close();
      });

      await timeout(200);
    }
  }


  handleIncomingData(conn, data) {

    // Handle MONSTER updates (detect by prefix)
    if (data.startsWith("MONSTER")) {
      this.engine.emit(EVENT_NETWORK_MONSTER_UPDATE, data);
      return;
    }

    // Handle PLAYER prefix
    this.engine.emit(EVENT_NETWORK_PLAYER_UPDATE, {
      id: conn.peer,
      data,
    });
  }

  async getAllPeerIds() {
    //const response = await fetch(`${LOCALHOST_URL}/myapp/demodemo/peers`);
    const response = await fetch(`https://${URL}/myapp/demodemo/peers`);
    const peersArray = await response.json();
    const list = peersArray ?? [];
    return list.filter((id) => id !== this.peerId);
  }

  sendUpdate(update) {
    this.connectionMap.forEach((conn, key) => {
      conn.send(update);
    });
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
