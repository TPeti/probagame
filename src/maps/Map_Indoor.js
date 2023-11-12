import * as ex from "excalibur";
import {Images} from "../resources.js";
import {ANCHOR_TOP_LEFT, SCALE_2x} from "../constants.js";
import {Floor} from "../actors/Floor.js";

const mapSprite = Images.indoorImage.toSprite();

export class Map_Indoor extends ex.Actor {
  constructor() {
    super({
      x: 0,
      y: 0,
      scale: SCALE_2x,
      anchor: ANCHOR_TOP_LEFT,
    });
    this.graphics.use(mapSprite);

    this.tileWidth = 19;
    this.tileHeight = 22;
  }

  onInitialize(engine) {
    [
      // Top wall, top right area
      { x: 2, y: 2, w: 13, h: 1 },
      { x: 14, y: 3, w: 3, h: 1 },
      { x: 16, y: 4, w: 2, h: 1 },

      // Right wall
      { x: 17, y: 5, w: 1, h: 8 },
      { x: 15, y: 12, w: 2, h: 8 },

      { x: 2, y: 3, w: 1, h: 9 },
      { x: 3, y: 11, w: 2, h: 9 },

      // Bottom
      { x: 4, y: 20, w: 12, h: 1 },

      // Inner
      { x: 7, y: 12, w: 5, h: 5 },
    ].forEach(({ x, y, w, h }) => {
      const floor = new Floor(x, y, w, h);
      engine.add(floor);
    });
  }

  // getPlayerStartingPosition() {
  //   return randomFromArray([
  //     [200, 225],
  //     [450, 225],
  //     [300, 325],
  //     [450, 325],
  //   ]);
  // }

}