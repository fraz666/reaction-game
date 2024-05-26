import { component$, useContext, useVisibleTask$, $, QRL, useSignal, useOnDocument } from "@builder.io/qwik";
import anime, { AnimeParams } from "animejs";
import { ApplicationContext } from "../core/context";
import { GamePhase } from "../../../shared/enums";
import { attack as attackUtils, randomElement } from "../core/utils";

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
                    <Animation classId="prepare-to-fight" color="coral" propertyName="rotateX" propertyValue={180} duration={1.5} />
                </>
            }

            {
                ctx.gamePhase == GamePhase.ATTACK &&
                <Challenge challenge={ctx.gameSvc?.challenge} attackEmitter$={attack} isMobile={ctx.isMobile} />
            }

            {
                ctx.gamePhase == GamePhase.MATCH_COMPLETED &&
                <RoundOver isWinner={ctx.isWinner} />
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
    isMobile: boolean | null;
    challenge: string | undefined;
    attackEmitter$: QRL<() => void>;
}

export const Challenge = component$((props: ChallengeProps) => {

    const challengeResult = props.challenge;
    const challengeSignal = useSignal<string>(props.challenge!);
    const isMobile = props.isMobile ?? false;

    const mobileInputRef = useSignal<Element>();
    const mobileValue = useSignal<string>('');
    useVisibleTask$(() => {
        const elem = mobileInputRef?.value as HTMLElement;

        if (elem) {
            elem.focus();
        }
    });
    const handleMobileInput = $((_: InputEvent, element: HTMLInputElement) => {
        mobileValue.value = element.value.toLowerCase();
        if (mobileValue.value == challengeResult) {
            props.attackEmitter$();
        }
    });

    useOnDocument(
        'keydown',
        $((event) => {
            const c = event.key;
            const i = challengeResult!.length - challengeSignal.value.length;
            if (challengeSignal.value.startsWith(c)) {
                challengeSignal.value = challengeSignal.value.substring(1);

                const target = `#value-${i}${c}`;
                const dir = Math.random() > .5? '' : '-'

                const params: AnimeParams = {
                    targets: target,
                    duration: 300,
                    rotate: `${dir}1.5turn`,
                    scale: {
                        value: 0,
                        easing: 'easeInOutQuart'
                    },
                    complete: (_) => {
                        const el = document?.querySelector(target) as HTMLElement;
                        if (el != null) {
                            el.style.display = 'none';
                        }
                    },
                    loop: false
                };

                anime(params);
            }

            if (challengeSignal.value == '') {
                props.attackEmitter$();
            }

        })
    );

    const characters = Array.from(challengeResult!)
        .map((x, i) => <h1 key={i} id={'value-' + i + x} class="challenge-char">{x}</h1>);

    return (
        <>
            <h6>type this:</h6>
            {characters}
            {
                isMobile &&
                <input ref={mobileInputRef} value={mobileValue.value} onInput$={handleMobileInput}/>
            }
            
        </>
    );
});


export const RoundOver = component$((props: any) => {
    const winEmojis = ['🎉', '🍾', '🍺', '🍻', '🍸', '🥂', '😎', '😍', '🤩', '🤠', '💪', '🤘', '✌', '🤙', '👌', '✨', '🎊', '👑', '💎', '🏆', '🥇'];
    const loseEmojis = ['🤢', '😥', '😣', '😫', '😴', '😯', '😒', '😲', '😖', '😞', '😟', '😤', '😢', '😭', '😨', '🤯', '😠', '🤬', '😡', '🤕', '🤮', '💀', '👺', '☠', '💩', '🐵', '🐗'];

    const emoji = props?.isWinner? randomElement(winEmojis) : randomElement(loseEmojis);
    const phrase = props?.isWinner? 'winner' : 'looser';
    useVisibleTask$(() => {
        const params: AnimeParams = {
            targets: `#result`,
            duration: 1000,
            rotateY: 360,
            easing: 'linear',
            loop: true
        };

        anime(params);
    });

    return (
        <>
            <h6>round over... {phrase}</h6>
            <h1 id="result">{emoji}</h1>
        </>
    );
})