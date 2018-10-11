import bigInt, { BigInteger } from 'big-integer';

export class MathUtils {

    public static byteArrayToBigInteger(byteArray: number[]): BigInteger {
        let numbers = byteArray.map((p) => bigInt(p));
        numbers = numbers.reverse();
        return bigInt.fromArray(numbers, 256, false);
    }

    public static bigIntegerToByteArray(n: BigInteger, minArrayLength: number = 15): number[] {
        let d = n.toArray(256).value;
        d = d.reverse();
        while (d.length < minArrayLength) {
            d.push(0);
        }

        return d;
    }

}
