import { Client, Room } from "colyseus.js";
import { GamePhase } from "../../../shared/enums";

const DEFAULT_ENDPOINT = 'ws://localhost:2567';

const ROOM_NAME = 'duel';
const ATTACK_COMMAND = 'attack';

const createClient = (): Client => {
    const client = new Client(import.meta.env.VITE_INFRASTRUCTURE_URI || DEFAULT_ENDPOINT);
    return client;
}

export const GAME_EVENT_TYPE = 'game_event';

export class GameState {
    public opponent: string = '';
    public challenge: string = '';
    public phase: GamePhase = GamePhase.WAITING_MATCH;
    public isWinner: boolean = false;
}

class GameInstance extends EventTarget {
    private userSessionId: string;
    private room: Room;
    private gameState: GameState;

    public events: EventTarget;

    constructor(room: Room, eventTarget: EventTarget) {
        super();
        this.room = room;
        this.events = eventTarget;
        this.userSessionId = room.sessionId;
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

    public get challenge(): string {
        return this.gameState?.challenge;
    }

    private configureRoom() {

        // TODO define state change types so that STAND_OFF is not executed twice
        this.room.onStateChange((state: any) => {
            if (state.phase == GamePhase.STAND_OFF && this.gameState.opponent == '') {
                this.gameState.phase = GamePhase.STAND_OFF;
                this.gameState.opponent = state.playerA.id == this.userSessionId? 
                    state.playerB.name :
                    state.playerA.name;
            }
    
            if (state.phase == GamePhase.ATTACK) {
                this.gameState.phase = GamePhase.ATTACK;
                this.gameState.challenge = state.challenge;
            }
    
            if (state.phase == GamePhase.MATCH_COMPLETED) {
                this.gameState.phase = GamePhase.MATCH_COMPLETED;
                const winnerId = state.winner.id;
                this.gameState.isWinner = this.userSessionId == winnerId;
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

    public joinNewGame = async (userId: string) => {
        const room = await this.client.joinOrCreate(ROOM_NAME, { playerName: userId });
        this.gameInstance = new GameInstance(room, this.events);
    }

    public attack = () => {
        this.gameInstance?.attack();
    }

    public get challenge(): string {
        return this.gameInstance?.challenge ?? '';
    }
}
