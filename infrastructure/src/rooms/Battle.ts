import { Room, Client } from "@colyseus/core";
import { Delayed } from "colyseus";
import { BattleState, Player } from "./schema/BattleState";

import { GamePhase } from "../../../shared/enums";

export class Battle extends Room<BattleState> {
  maxClients = 2;

  countDown: Delayed;

  onCreate(options: any) {
    console.log(GamePhase.ATTACK)
    this.setState(new BattleState());

    this.onMessage("attack", (client, _) => {
      if (!this.state.isOver) {
        this.state.isOver = true;
        this.state.phase = GamePhase.MATCH_COMPLETED;

        const winner = this.state.playerA.id == client.sessionId? this.state.playerA : this.state.playerB;
        this.state.winner = winner;
        console.log("winner", winner.id, winner.name)
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, options, "joined!");

    if (!this.state.playerA) {
      this.state.playerA = this.initializePlayer(client.sessionId, options.playerName);
    }
    else {
      this.state.playerB = this.initializePlayer(client.sessionId, options.playerName);
      this.beginDuel();
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    this.clock.clear();
    console.log("room", this.roomId, "disposing...");
  }

  private initializePlayer = (id: string, name: string): Player => {
    const p = new Player();
    p.id = id;
    p.name = name;
    return p;
  }

  private beginDuel = () => {
    const ttw = this.getTimeToWaitInMs();
    console.log("TTW: ", ttw);
    
    this.state.phase = GamePhase.STAND_OFF;

    this.clock.start();

    this.countDown = this.clock.setTimeout(() => {
      this.state.phase = GamePhase.ATTACK;
      this.countDown.clear();
    }, ttw);
  }

  private getTimeToWaitInMs = (): number => {
    const multiplier = Math.floor(Math.random() * 9) + 1;
    return multiplier * 1000;
  }

}
