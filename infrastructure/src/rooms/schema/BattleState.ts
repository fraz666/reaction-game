import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string;
}

export class BattleState extends Schema {

  @type(Player) playerA: Player;
  @type(Player) playerB: Player;

  @type(Player) winner: Player = null;

  @type("boolean") isReady: boolean = false;
  @type("boolean") isStarted: boolean = false;
  @type("boolean") isOver: boolean = false;

}
