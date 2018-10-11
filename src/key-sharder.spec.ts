import bigInt from 'big-integer';
import { expect } from 'chai';
import { KeySharder } from './key-sharder';

describe('KeySharder', () => {
    it('generate shares works', () => {
        const key = bigInt.randBetween(bigInt(1), bigInt(2).pow(127).subtract(1));

        const shares = KeySharder.makeShares(key, 3, 5);
        expect(shares.length).to.equal(5);
        const restoredKey = KeySharder.restore(shares);
        expect(restoredKey.toString()).to.equal(key.toString());
    });

});
