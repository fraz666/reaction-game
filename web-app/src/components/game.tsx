import { component$, useContext, useVisibleTask$, $, QRL, useSignal } from "@builder.io/qwik";
import anime from "animejs";
import { ApplicationContext } from "../core/context";
import { GamePhase } from "../../../shared/enums";
import { attack as attackUtils } from "../core/utils";

import './game.css';

export const Game = component$(() => {
    const ctx = useContext(ApplicationContext);

    const attack = $(() => {
        attackUtils(ctx);
    });

    return (
        <>
            {
                ctx.gamePhase == GamePhase.WAITING_MATCH &&
                <>
                    <h6>{ctx.userId}, wait for an opponent...</h6>
                    <Animation classId="waiting" color="deeppink" propertyName="rotate" propertyValue={360} duration={3} />
                </>
            }

            {
                ctx.gamePhase != GamePhase.WAITING_MATCH &&
                <div id="player-container">
                    <h6 id="player" class="name-tag">{ctx.userId}</h6>
                    <h4>VS</h4>
                    <h6 id="opponent" class="name-tag">{ctx.opponentId}</h6>
                </div>
            }

            {
                ctx.gamePhase == GamePhase.STAND_OFF &&
                <>
                    <h6>prepare to attack...</h6>
                    <Animation classId="prepare-to-figth" color="coral" propertyName="rotateX" propertyValue={180} duration={1.5} />
                </>
            }

            {
                ctx.gamePhase == GamePhase.ATTACK &&
                <Challenge challenge={ctx.gameSvc?.challenge} attackEmitter$={attack} />
            }

            {
                ctx.gamePhase == GamePhase.MATCH_COMPLETED &&
                <h1>{ctx.isWinner ? '🎉' : '🤢'}</h1>
            }
        </>
    );
});

export interface AnimationProps {
    color: string;
    classId: string;
    propertyName: string;
    propertyValue: string | number;
    duration: number;
}


export const Animation = component$((props: AnimationProps) => {

    useVisibleTask$(({ cleanup }) => {
        const params: any = {
            targets: `.${props.classId}`,
            duration: props.duration * 1000,
            delay: anime.stagger(100, { easing: 'easeOutQuad' }),
            loop: true
        };

        params[props.propertyName] = props.propertyValue;

        anime(params);
        cleanup(() => { });
    });

    const classes = `cube ${props.classId}`
    const backgroundColor = `background-color: ${props.color}`
    const cubes = Array.from({ length: 3 }, (_, i) => <div key={i} class={classes} style={backgroundColor}></div>)

    return (
        <>
            <div id="cube-container">
                {cubes}
            </div>
        </>
    );
});

export interface ChallengeProps {
    challenge: string | undefined;
    attackEmitter$: QRL<() => void>;
}

export const Challenge = component$((props: ChallengeProps) => {

    const challengeResult = props.challenge;
    const inputRef = useSignal<Element>();
    const userAttempt = useSignal<string>('');


    useVisibleTask$(() => {
        if (inputRef.value) {
            (inputRef.value as HTMLElement).focus()
        }
    });

    const handleUserInput = $((_: InputEvent, element: HTMLInputElement) => {
        userAttempt.value = element.value?.toLocaleLowerCase();
        if (userAttempt.value == challengeResult) {
            props.attackEmitter$();
        }
    });

    return (
        <>
            <h6>type this:</h6>
            <h1>{challengeResult}</h1>
            <input ref={inputRef} value={userAttempt.value} onInput$={handleUserInput} />
        </>
    );
});