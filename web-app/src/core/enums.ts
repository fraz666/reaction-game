export enum ApplicationStatus {
    INIT,
    IN_GAME,
    ERROR // TODO: use it
}

export enum GamePhase {
    WAITING_MATCH, // waiting a player
    STAND_OFF, // waiting for the attack 
    ATTACK, // able to attack
    MATCH_COMPLETED // attack completed
};