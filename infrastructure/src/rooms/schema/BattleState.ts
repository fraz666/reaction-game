import { Schema, type } from "@colyseus/schema";
import { GamePhase } from "../../../../shared/enums";

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
}

export class BattleState extends Schema {

  @type(Player) playerA: Player;
  @type(Player) playerB: Player;

  @type(Player) winner: Player = null;

  @type("boolean") isOver: boolean = false;
  @type("number") phase: GamePhase = GamePhase.WAITING_MATCH;
  @type("string") challenge = "";

}
