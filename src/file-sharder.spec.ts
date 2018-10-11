import bigInt from 'big-integer';
import { expect } from 'chai';
import { FileSharder } from './file-sharder';
import { MathUtils } from './math-utils';

describe('FileSharder',
    () => {

        it('ByteArray to BigInteger should work',
            () => {
                const byteArray = [255, 216, 255, 255, 47, 254, 69, 120, 105, 102, 0, 0, 77, 77, 0];
                const num = MathUtils.byteArrayToBigInteger(byteArray);
                expect(num.toString()).to.equal('1567846108478403932631624604178687');
            });

        it('BigInteger to ByteArray should work',
            () => {
                const bi = bigInt('1567846108478403932631624604178687');
                const byteArray = MathUtils.bigIntegerToByteArray(bi);

                expect(byteArray).to.eql([255, 216, 255, 255, 47, 254, 69, 120, 105, 102, 0, 0, 77, 77, 0]);
            });

        it('Smaller BigInteger to ByteArray should work',
            () => {
                const bi = bigInt('123412312');
                const byteArray = MathUtils.bigIntegerToByteArray(bi);
                expect(byteArray).to.eql([88, 31, 91, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });

        it('FileSharder should work',
            () => {
                const original = new Uint8Array([
                    255, 216, 255, 255, 47, 254, 69, 120, 105, 102, 0, 0, 77, 77, 0, 255, 216, 255, 255, 47, 254,
                    69, 120, 105, 102, 0, 0, 77, 77, 0, 255, 216, 255, 255, 47, 254, 69, 120, 105, 102, 255, 216, 255,
                    255, 47,
                    254, 69, 120, 105, 102, 0, 0, 77, 77, 0]);
                const shards = FileSharder.shard(original, 3, 4);
                const restored = FileSharder.restore(shards);
                expect(restored).to.eql(original);
            });
    });
