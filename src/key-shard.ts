import { BigInteger } from 'big-integer';

export class KeyShard {
    public x: number;
    public y: BigInteger;

    constructor(x: number, y: BigInteger) {
        this.x = x;
        this.y = y;
    }
}
