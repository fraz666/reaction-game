export enum GamePhase {
    WAITING_MATCH, // waiting a player
    STAND_OFF, // waiting for the attack 
    ATTACK, // able to attack
    MATCH_COMPLETED // attack completed
};