import * as ex from "excalibur";
import {
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  SCALE,
  EVENT_SEND_PLAYER_UPDATE,
  TAG_ANY_PLAYER,
  EVENT_SEND_MONSTER_UPDATE
} from "./src/constants.js";
import {Player} from "./src/actors/Players/Player.js";
import {loader} from "./src/resources.js";
import {Map_Indoor} from "./src/maps/Map_Indoor.js";
import {Player_CameraStrategy} from "./src/classes/Player_CameraStrategy.js";
import {NetworkClient} from "./src/classes/NetworkClient.js";
import {NetworkActorsMap} from "./src/classes/NetworkActorsMap.js";
import {Monster} from "./src/actors/Monster/Monster.js";

const game = new ex.Engine({
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  fixedUpdateFps: 60,
  antialiasing: false, // Pixel art graphics
});

const map = new Map_Indoor();
game.add(map);


const player = new Player(200,200, "RED");
game.add(player);

game.on("initialize", () => {
  // Add custom Camera behavior, following player and being limited to the map bounds
  const cameraStrategy = new Player_CameraStrategy(player, map);
  game.currentScene.camera.addStrategy(cameraStrategy);

  // Set up ability to query for certain actors on the fly
  game.currentScene.world.queryManager.createQuery([TAG_ANY_PLAYER]);

  // Create player state list and network listener
  new NetworkActorsMap(game);
  const peer = new NetworkClient(game);

  // When one of my nodes updates, send it to all peers
  game.on(EVENT_SEND_PLAYER_UPDATE, (update) => {
    peer.sendUpdate(update);
  });
  game.on(EVENT_SEND_MONSTER_UPDATE, (update) => {
    peer.sendUpdate(update);
  });
});
game.start(loader);

// Create Monster button
const createAddMonsterButton = () => {
  const button = document.createElement("button");
  button.onclick = () => {
    const monster = new Monster(100, 100);
    game.add(monster);
  };
  button.style.display = "block";
  button.innerText = "ADD MONSTER";
  document.body.append(button);
}
createAddMonsterButton();