import { FileShard } from './file-shard';
import { KeyShard } from './key-shard';
import { KeySharder } from './key-sharder';
import { MathUtils } from './math-utils';

export class FileSharder {

    public static shard(fileBytes: Uint8Array, threshold: number, totalShare: number, segmentLength: number = 15)
        : string[] {

        const shards = new Array<FileShard>(totalShare);

        const fileLength = fileBytes.length;
        let remaining = fileBytes.length;
        let i = 0;

        for (let m = 0; m < totalShare; m++) {
            shards[m] = new FileShard(fileLength, m + 1);
        }

        while (remaining > 0) {
            const bytesToRead = Math.min(remaining, segmentLength);
            const segment = fileBytes.slice(i * segmentLength, i * segmentLength + bytesToRead);
            const key = MathUtils.byteArrayToBigInteger(Array.from(segment));
            const shares = KeySharder.makeShares(key, threshold, totalShare);
            shares.forEach((sharedKey, b) => {
                shards[b].addShare(sharedKey.y);
            });

            remaining -= bytesToRead;
            i++;
        }

        return shards.map((s) => s.toString());
    }

    public static restore(shardStrings: string[]): Uint8Array {
        const fileShards = shardStrings.map((s) => FileShard.parse(s));
        const versions = Array.from(new Set(fileShards.map((fs) => fs.version)));
        if (versions.length > 1) {
            throw new Error('Multiple versions');
        }

        const fileLengths = Array.from(new Set(fileShards.map((fs) => fs.fileLength)));
        if (fileLengths.length > 1) {
            throw new Error('Multiple file length');
        }

        if (fileLengths.length === 0) {
            throw new Error('No file length defined');
        }

        const fileLength = fileLengths[0];
        if (fileLength === undefined) {
            throw new Error('File length not defined');
        }

        const totalShares = Array.from(new Set(fileShards.map((fs) => fs.shares.length)));
        if (totalShares.length > 1) {
            throw new Error('Multiple number of shares in shards');
        }
        const totalShare = totalShares[0];

        let buffer: number[] = [];
        let remaining = fileLength;

        for (let i = 0; i < totalShare; i++) {
            const bytesToRestore = Math.min(remaining, 15);
            const shardGroup = fileShards.map((p) => {
                const k = new KeyShard(p.x, p.shares[i]);
                return k;
            });
            const key = KeySharder.restore(shardGroup);
            buffer = buffer.concat(MathUtils.bigIntegerToByteArray(key, bytesToRestore));
            remaining -= bytesToRestore;
        }
        const result = new Uint8Array(buffer);

        return result;
    }
}
