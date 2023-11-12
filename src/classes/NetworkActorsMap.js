import {NetworkPlayer} from "../actors/Players/NetworkPlayer.js";
import {
  EVENT_NETWORK_MONSTER_UPDATE,
  EVENT_NETWORK_PLAYER_LEAVE,
  EVENT_NETWORK_PLAYER_UPDATE,
} from "../constants.js";
import {NetworkMonster} from "../actors/Monster/NetworkMonster.js";

// Manages Actors that display state of other connected Players
export class NetworkActorsMap {
  constructor(engine) {
    this.engine = engine;
    this.playerMap = new Map();

    this.engine.on(EVENT_NETWORK_PLAYER_UPDATE, (otherPlayer) => {
      this.onUpdatedPlayer(otherPlayer.id, otherPlayer.data);
    });

    this.engine.on(EVENT_NETWORK_MONSTER_UPDATE, (content) => {
      this.onUpdatedMonster(content);
    });

    this.engine.on(EVENT_NETWORK_PLAYER_LEAVE, (otherPlayerIdWhoLeft) => {
      this.removePlayer(otherPlayerIdWhoLeft);
    });
  }

  onUpdatedPlayer(id, content) {
    // Decode what was sent here
    const [
      actionType,
      x,
      y,
      velX,
      velY,
      skinId,
      facing,
      isInPain,
      isPainFlashing,
    ] = content.split("|");

    const stateUpdate = {
      actionType,
      x: Number(x),
      y: Number(y),
      skinId,
      facing,
      isInPain: isInPain === "true",
      isPainFlashing: isPainFlashing === "true",
    };

    if (isInPain) {
      stateUpdate.velX = Number(velX);
      stateUpdate.velY = Number(velY);
    }

    let otherPlayerActor = this.playerMap.get(id);
    if (!otherPlayerActor) {
      otherPlayerActor = new NetworkPlayer(stateUpdate.x, stateUpdate.y);
      this.playerMap.set(id, otherPlayerActor);
      this.engine.add(otherPlayerActor);
    }

    otherPlayerActor.onStateUpdate(stateUpdate);
  }

  // Called when this id disconnects
  removePlayer(id) {
    const actorToRemove = this.playerMap.get(id);
    if (actorToRemove) {
      actorToRemove.kill();
    }
    this.playerMap.delete(id);
  }

  onUpdatedMonster(content) {
    const [_type, networkId, x, y, _velX, _velY, facing, hasPainState, hp] =
        content.split("|");

    let networkActor = this.playerMap.get(networkId);
    
    // Add new if it doesn't exist
    if (!networkActor) {
      networkActor = new NetworkMonster(x, y);
      this.playerMap.set(networkId, networkActor);
      this.engine.add(networkActor);
    }

    //Update the node ("Puppet style")
    networkActor.pos.x = Number(x);
    networkActor.pos.y = Number(y);
    networkActor.facing = facing;
    networkActor.hasPainState = hasPainState === "true";

    // Destroy if gone
    if (Number(hp) <= 0) {
      networkActor.tookFinalDamage();
      this.playerMap.delete(networkId);
    }
  }

}
