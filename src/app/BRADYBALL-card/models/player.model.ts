import { PlayerStat } from "./player-stat.model";

export class Player {
    player?: string;

    league?: string;

    team?: string;

    position?: string;

    age?: number;

    born?: string;

    playerStats?: PlayerStat[];
}