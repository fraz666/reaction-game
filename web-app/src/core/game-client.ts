import { Client, Room } from "colyseus.js";
import { GamePhase } from "./enums";

const DEFAULT_ENDPOINT = 'ws://localhost:2567';

const ROOM_NAME = 'duel';
const ATTACK_COMMAND = 'attack';

const createClient = (): Client => {
    const client = new Client(import.meta.env.VITE_INFRASTRUCTURE_URI || DEFAULT_ENDPOINT);
    return client;
}

export const GAME_EVENT_TYPE = 'game_event';

export class GameState {
    public phase: GamePhase = GamePhase.WAITING_MATCH;
    public isWinner: boolean = false;
}

class GameInstance extends EventTarget {
    private userId: string;
    private room: Room;
    private gameState: GameState;

    public events: EventTarget;

    constructor(room: Room, eventTarget: EventTarget) {
        super();
        this.room = room;
        this.events = eventTarget;
        this.userId = room.sessionId;
        this.gameState = new GameState();

        const event = new CustomEvent<GameState>(
            GAME_EVENT_TYPE, 
            { detail: this.gameState }
        );
        this.events.dispatchEvent(event);

        this.configureRoom();
    }

    public attack = () => {
        this.room.send(ATTACK_COMMAND);
    }

    private configureRoom() {

        // TODO define state type and share it with Colyseus
        this.room.onStateChange((state: any) => {
            if (state.isReady) {
                this.gameState.phase = GamePhase.STAND_OFF;
            }
    
            if (state.isStarted) {
                this.gameState.phase = GamePhase.ATTACK;
            }
    
            if (state.isOver) {
                this.gameState.phase = GamePhase.MATCH_COMPLETED;
                const winnerId = state.winner.id;
                this.gameState.isWinner = this.userId == winnerId;
                this.room.leave();
            }

            const event = new CustomEvent<GameState>(
                GAME_EVENT_TYPE, 
                { detail: this.gameState }
            );
            this.events.dispatchEvent(event);
        });
        this.room.onError((code, message) => {
            console.error(`Something broke the game: ${code} ${message}`);
        });
        this.room.onLeave((code) => {
            
        });
    }
}

export class GameService {
    private client: Client;
    private gameInstance: GameInstance | null = null;

    public events: EventTarget = new EventTarget();

    constructor() {
        this.client = createClient();
    }

    public joinNewGame = async () => {
        const room = await this.client.joinOrCreate(ROOM_NAME);
        this.gameInstance = new GameInstance(room, this.events);
    }

    public attack = () => {
        this.gameInstance?.attack();
    }
}
