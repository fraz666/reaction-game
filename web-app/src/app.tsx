import { component$, noSerialize, useContextProvider, useStore, useTask$ } from '@builder.io/qwik'

// import qwikLogo from './assets/qwik.svg'
// import viteLogo from '/vite.svg'
import './app.css'

import { Connect } from './components/connect';
import { ApplicationContext, Application } from './core/context';
import { GameService } from './core/game-client';
import { Game } from './components/game';
import { ApplicationStatus } from './core/enums';
import { GamePhase } from "../../shared/enums";
import { registerGameEvents } from './core/utils';


export const App = component$(() => {

  const ctx =  useStore<Application>({
    userId: null,
    opponentId: null,
    status: ApplicationStatus.INIT,
    gamePhase: GamePhase.WAITING_MATCH,
    isWinner: false,
    gameSvc: null,
    error: null
  });

  useContextProvider(ApplicationContext, ctx);

  useTask$(() => {
    ctx.gameSvc = noSerialize(new GameService());
    registerGameEvents(ctx);
  });

  return (
    <>
      <h1>Reaction game</h1>

      {
        ctx?.status == ApplicationStatus.INIT &&
        <Connect />
      }

      {
        ctx?.status == ApplicationStatus.IN_GAME &&
        <Game />
      }

      {
        ctx?.error != null &&
        <h2 id="error-message">{ctx.error}</h2>
      }
    </>
  )
});
