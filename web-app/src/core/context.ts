import { NoSerialize, createContextId } from "@builder.io/qwik";
import { GameService } from "./game-client";
import { ApplicationStatus } from "./enums";
import { GamePhase } from "../../../shared/enums";

export interface Application {
    userId: string | null;
    opponentId: string | null;
    status: ApplicationStatus;
    gamePhase: GamePhase;
    isWinner: boolean,
    gameSvc: NoSerialize<GameService> | null;
    error?: any; // TODO use interface
}

export const ApplicationContext = createContextId<Application>(
    'app-ctx'
);
