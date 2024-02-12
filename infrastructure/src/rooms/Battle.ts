import { Room, Client } from "@colyseus/core";
import { BattleState, Player } from "./schema/BattleState";
import { Delayed } from "colyseus";

export class Battle extends Room<BattleState> {
  maxClients = 2;

  countDown: Delayed;

  onCreate(options: any) {
    this.setState(new BattleState());

    this.onMessage("attack", (client, message) => {
      //
      // handle "type" message
      //
      console.log("ATTACK", client.sessionId);
      if (!this.state.isEnded) {
        const winnerId = client.sessionId;
        this.state.isEnded = true;
        const winner = this.clients.find(x => x.sessionId == winnerId);
        const loser = this.clients.find(x => x.sessionId != winnerId);
        winner.send("result", "you win");
        loser.send("result", "you loose");
      }
      // this.state.mySynchronizedProperty = message.a
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    if (!this.state.playerA) {
      this.state.playerA = this.initializePlayer(client.sessionId);
    }
    else {
      this.state.playerB = this.initializePlayer(client.sessionId);
      this.startGame();
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    this.clock.clear();
    console.log("room", this.roomId, "disposing...");
  }

  private initializePlayer = (name: string): Player => {
    const p = new Player();
    p.name = name;
    return p;
  }

  private startGame = () => {
    this.broadcast("get_ready", "ready to go");

    this.clock.start();

    this.countDown = this.clock.setTimeout(() => {
      this.state.isReady = true;
      this.countDown.clear();
    }, 7000);
  }

}
