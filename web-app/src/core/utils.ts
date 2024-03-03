import { Application } from "./context";
import { ApplicationStatus, GamePhase } from "./enums";
import { GAME_EVENT_TYPE } from "./game-client";

export const connect = async (ctx: Application, userId: string) => {
    try {
        ctx.userId = userId;
        const game = ctx.gameSvc;
        await game?.joinNewGame();
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
            ctx.isWinner = e.detail.isWinner;
            if (phase === GamePhase.MATCH_COMPLETED) {
                setTimeout(async () => {
                    await ctx.gameSvc?.joinNewGame();
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

const handleError = (ctx: Application, e: any) => {
    console.error(e);
    ctx.error = `[${e?.name}] ${e?.message}`;
}