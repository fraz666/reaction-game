import { component$, noSerialize, useStore } from '@builder.io/qwik'

// import qwikLogo from './assets/qwik.svg'
// import viteLogo from '/vite.svg'
import './app.css'

import { Client, Room } from 'colyseus.js';



export const App = component$(() => {
  const userState = useStore({ id: null, name: 'Enter your name', client: null, room: null,  canFight: false });

  return (
    <>
      <h1>Reaction game</h1>
      <div>
        <input
          value={userState.name}
          onInput$={(_, el) => (userState.name = el.value)}
        />
        <button onClick$={() => connect(userState)}>Connect</button>
      </div>

      {
        userState.client != null?
        <div class="card">
          <p>{userState.id}</p>
          {userState.canFight ? <button onClick$={() => attack(userState)}>ATTACK!</button> : <h5>wait to fight...</h5>}
        </div>
        :
        <h5>waiting for players</h5>
      }
    </>
  )
})

const connect = async (userState: any) => {
  // TODO use vite envs
  const client = new Client('ws://localhost:2567');

  userState.client = noSerialize(client);
  console.log(userState.client);

  const room = await client.joinOrCreate("duel");
  userState.id = room.sessionId
  console.log(room.sessionId, "joined", room.name);
  room.onMessage("result", (message) => {
    console.log("winner is", message);
  });
  room.onStateChange((state: any) => {
    console.log(room.name, "has new state:", state);
    if (state.isReady) {
      userState.canFight = true;
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
