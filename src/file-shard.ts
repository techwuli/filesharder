import bigInt, { BigInteger } from 'big-integer';

export class FileShard {

    public static parse(s: string): FileShard {
        const v = s.split(',');
        const result = new FileShard(Number(v[1]), Number(v[2]));
        result.shares = v.slice(3).map((x) => bigInt(x));

        return result;
    }

    public version = 1;
    public fileLength: number;
    public x: number;
    public shares = new Array<BigInteger>();

    constructor(fileLength: number, x: number) {
        this.fileLength = fileLength;
        this.x = x;
    }

    public toString(): string {

        if (this.fileLength === undefined) {
            throw new Error('fileLength is undefined');
        }

        if (this.x === undefined) {
            throw new Error('x is undefined');
        }

        let arr = [];
        arr.push(this.version.toString());
        arr.push(this.fileLength.toString());
        arr.push(this.x.toString());
        arr = arr.concat(this.shares.map((x) => x.toString()));
        return arr.join(',');
    }

    public getShare(index: number): BigInteger {
        return this.shares[index];
    }

    public addShare(v: BigInteger) {
        this.shares.push(v);
    }
}
