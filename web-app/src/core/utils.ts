import { Application } from "./context";
import { ApplicationStatus } from "./enums";
import { GamePhase } from "../../../shared/enums";
import { GAME_EVENT_TYPE } from "./game-client";
import { adjectives, surnames } from "./const";

export const generateName = (): string => {
    const adjective = randomElement(adjectives);
    const surname = randomElement(surnames);
    return `${adjective}-${surname}`;
}

export const connect = async (ctx: Application, userId: string) => {
    try {
        ctx.userId = userId;
        const game = ctx.gameSvc;
        await game?.joinNewGame(userId);
        ctx.status = ApplicationStatus.IN_GAME;
    }
    catch (e: any) {
        handleError(ctx, e);
    }
}

export const registerGameEvents = async (ctx: Application) => {
    ctx.gameSvc?.events?.addEventListener(
        GAME_EVENT_TYPE,
        (e: any) => {
            const phase = e.detail.phase
            ctx.gamePhase = phase;

            if (phase === GamePhase.STAND_OFF) {
                ctx.opponentId = e.detail.opponent;
            }
            
            if (phase === GamePhase.MATCH_COMPLETED) {
                ctx.isWinner = e.detail.isWinner;
                setTimeout(async () => {
                    await ctx.gameSvc?.joinNewGame(ctx.userId!);
                }, 5000);
            }
        }
    );
}

export const attack = async (ctx: Application) => {
    try {
        const game = ctx.gameSvc;
        await game?.attack();
    }
    catch (e: any) {
        handleError(ctx, e);
    }
}

const randomElement = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)];

const handleError = (ctx: Application, e: any) => {
    console.error(e);
    ctx.error = `[${e?.name}] ${e?.message}`;
}