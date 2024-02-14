import { component$, noSerialize, useStore } from '@builder.io/qwik'

// import qwikLogo from './assets/qwik.svg'
// import viteLogo from '/vite.svg'
import './app.css'

import { Client, Room } from 'colyseus.js';



export const App = component$(() => {
  const userState = useStore({ id: null, client: null, room: null, isReady: false, isStarted: false, isOver: false, isWinner: false });

  return (
    <>
      <h1>Reaction game</h1>

      {
        userState.client == null &&
        <div>
          <button onClick$={() => connect(userState)}>Connect</button>
        </div>
      }      

      {
        userState.client != null &&
        <>
          <div class="card">
            <p>{userState.id}</p>
            { !userState.isStarted && !userState.isReady && !userState.isOver && <h5>waiting for players</h5> }
            { !userState.isStarted && userState.isReady && <h5>wait to fight...</h5> }
            { userState.isStarted && <button onClick$={() => attack(userState)}>ATTACK!</button> }
            { userState.isOver && <h1>{ userState.isWinner? '🎉' : '🤢'}</h1> }
          </div>
        </>
      }
    </>
  )
})

const connect = async (userState: any) => {
  const client = new Client(import.meta.env.VITE_INFRASTRUCTURE_URI);

  userState.client = noSerialize(client);
  console.log(userState.client);

  configureRoom(userState);
}

const configureRoom = async (userState: any) => {
  const client = userState.client as Client;
  const room = await client.joinOrCreate("duel");
  userState.id = room.sessionId
  console.log(room.sessionId, "joined", room.name);
  
  room.onStateChange((state: any) => {
    console.log(room.name, "has new state:", state);
    if (state.isReady) {
      userState.isReady = true;
    }

    if (state.isStarted) {
      userState.isStarted = true;
    }

    if (state.isOver) {
      // TODO use states ('started', 'endend', 'in progress', etc to avoid this garbage)
      userState.isReady = false;
      userState.isStarted = false;
      const winnerId = state.winner.id;
      userState.isOver = true;
      userState.isWinner = userState.id == winnerId;
      room.leave();

      //start another game in X seconds
      setTimeout(async () => {
        userState.isReady = false;
        userState.isStarted = false;
        userState.isOver = false;
        configureRoom(userState); 
      },5000)
    }
  });
  room.onError((code, message) => {
    console.log("couldn't join", room.name);
  });
  room.onLeave((code) => {
    console.log("left", room.name);
  });

  userState.room = noSerialize(room);
}

const attack = (userState: any) => {
  // TODO attack only once
  const room = userState.room as Room<unknown>;
  room.send("attack");
}
