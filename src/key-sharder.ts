import bigInt, { BigInteger } from 'big-integer';
import { KeyShard } from './key-shard';

export class KeySharder {

    public static makeShares(key: BigInteger, threshold: number, totalShares: number): KeyShard[] {

        const poly = this.getRandomPoly(key, threshold);
        const result: KeyShard[] = [];
        for (let i = 1; i <= totalShares; i++) {

            const keyShard = new KeyShard(i, this.evaluatePolynomial(poly, i));

            result.push(keyShard);
        }

        return result;
    }

    public static restore(shares: KeyShard[]): BigInteger {
        const xs = shares.map((s: KeyShard) => s.x);
        const values = shares.map((s: KeyShard) => s.y);
        if (xs === undefined) {
            throw new Error('xs undefined');
        }
        return this.lagrangeInterpolate(xs, values);
    }

    private static prime = bigInt(2).pow(127).subtract(1);

    private static getRandomPoly(key: BigInteger, threshold: number): BigInteger[] {
        const result: BigInteger[] = [key];

        for (let i = 0; i < threshold - 1; i++) {
            let existed = false;
            while (!existed) {
                const point = bigInt.randBetween(1, this.prime);
                if (result.indexOf(point) === -1) {
                    result.push(point);
                    existed = true;
                }
            }
        }

        return result;
    }

    private static evaluatePolynomial(poly: BigInteger[], x: number): BigInteger {
        let accum = bigInt(0);
        for (const coeff of poly.reverse()) {
            accum = accum.multiply(x);
            accum = accum.add(coeff);
            accum = this.modulus(accum, this.prime);
        }
        poly.reverse();
        return accum;
    }

    private static lagrangeInterpolate(xs: number[], values: BigInteger[]): BigInteger {
        const nums: number[] = [];
        const dens: number[] = [];
        if (xs === undefined) {
            throw new Error('xs undefined');
        }
        const k = xs.length;
        for (let i = 0; i < k; i++) {
            const others = xs.slice();
            const cur = others[i];
            others.splice(i, 1);
            nums.push(this.productOfInput(others.map((s) => 0 - s)));
            dens.push(this.productOfInput(others.map((s) => cur - s)));
        }

        const den = this.productOfInput(dens);
        let num = bigInt(0);
        for (let i = 0; i < k; i++) {
            num = num.add(this.divMod(this.modulus(values[i].multiply(nums[i]).multiply(den), this.prime),
                bigInt(dens[i])));
        }

        return this.modulus((this.divMod(num, bigInt(den)).add(this.prime)), this.prime);
    }

    private static productOfInput(inputs: number[]): number {
        let accum = 1;
        for (const i of inputs) {
            accum *= i;
        }

        return accum;
    }

    private static modulus(a: BigInteger, b: BigInteger): BigInteger {
        const r = a.mod(b);
        return r.lt(0) ? r.add(b) : r;
    }

    private static divMod(num: BigInteger, den: BigInteger): BigInteger {
        const inv = this.extendedGcd(den, this.prime);
        return num.multiply(inv);
    }

    private static extendedGcd(a: BigInteger, b: BigInteger): BigInteger {
        let x = bigInt(0);
        let lastX = bigInt(1);
        let y = bigInt(1);
        let lastY = bigInt(0);
        while (b.notEquals(0)) {
            const quot = a.divide(b);
            const dr = this.modulus(a, b);
            a = b;
            b = dr;
            const x1 = lastX.subtract(quot.multiply(x));
            lastX = x;
            x = x1;
            const y1 = lastY.subtract(quot.multiply(y));
            lastY = y;
            y = y1;
        }

        return lastX;
    }
}
