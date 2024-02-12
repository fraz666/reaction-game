import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string;
  @type("boolean") isReady: boolean = false;
}

export class BattleState extends Schema {

  @type(Player) playerA: Player;
  @type(Player) playerB: Player;

  @type("boolean") isReady: boolean = false;
  @type("boolean") isEnded: boolean = false;

}
