import { component$, useContext, useVisibleTask$, $ } from "@builder.io/qwik";
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
                <h4>
                    <span id="player" class="name-tag">{ctx.userId}</span> VS <span id="opponent" class="name-tag">{ctx.opponentId}</span>
                </h4>
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
                <button id="attack" onClick$={attack}>ATTACK!</button>
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