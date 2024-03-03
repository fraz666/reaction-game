import { component$, useSignal, $, useContext } from "@builder.io/qwik";
import { ApplicationContext } from "../core/context";
import { connect as connectUtils } from "../core/utils";

import "./connect.css";

export const Connect = component$(() => {

    const ctx = useContext(ApplicationContext);
    
    const username = useSignal<string>("player");
    const connect = $(() => {
        connectUtils(ctx, username.value);
    });
    
    return (
        <>
            <input value={username.value} onInput$={(_, el) => (username.value = el.value)} autofocus/>
            <button onClick$={connect}>Connect</button>
        </>
    )
})