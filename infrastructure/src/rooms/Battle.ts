import { Room, Client } from "@colyseus/core";
import { BattleState, Player } from "./schema/BattleState";
import { Delayed } from "colyseus";

export class Battle extends Room<BattleState> {
  maxClients = 2;

  countDown: Delayed;

  onCreate(options: any) {
    this.setState(new BattleState());

    this.onMessage("attack", (client, message) => {
      console.log("ATTACK", client.sessionId);
      if (!this.state.isOver) {
        this.state.isOver = true;
        this.state.winner = this.initializePlayer(client.sessionId);
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    if (!this.state.playerA) {
      this.state.playerA = this.initializePlayer(client.sessionId);
    }
    else {
      this.state.playerB = this.initializePlayer(client.sessionId);
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

  private initializePlayer = (id: string): Player => {
    const p = new Player();
    p.id = id;
    return p;
  }

  private beginDuel = () => {
    const ttw = this.getTimeToWaitInMs();
    console.log("TTW: ", ttw);
    
    this.state.isReady = true;

    this.clock.start();

    this.countDown = this.clock.setTimeout(() => {
      this.state.isStarted = true;
      this.countDown.clear();
    }, ttw);
  }

  private getTimeToWaitInMs = (): number => {
    const multiplier = Math.floor(Math.random() * 9) + 1;
    return multiplier * 1000;
  }

}
