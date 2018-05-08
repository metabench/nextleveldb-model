let Binary_Encoding = require('binary-encoding');
let xas2 = require('xas2');
let Key = require('./key');
let Value = require('./value');

const XAS2 = 0;
const STRING = 4;
const BUFFER = 9;
const ARRAY = 10;

class Record {
    constructor() {
        let a = arguments,
            l = a.length;


        //console.log('Record l', l);
        //console.log('a', a);
        // can construct record out of array of two values.

        // Not using sig right now to save speed.

        //let kvp_bufs;

        if (l === 1) {
            if (a[0] instanceof Buffer) {

                // one buffer
                // odd kp, it has no 'value'
                //  has a key
                //  key is the buffer given
                this.kvp_bufs = [a[0], Buffer.alloc(0)];



                //throw 'NYI'
            } else {
                if (Array.isArray(a[0])) {
                    if (a[0].length === 2) {
                        // Check they are both buffers.

                        if (a[0][0] instanceof Buffer && a[0][1] instanceof Buffer) {
                            this.kvp_bufs = a[0];
                        } else {
                            throw 'NYI';
                        }


                    } else {
                        throw 'NYI';
                    }

                } else {
                    if (a.length === 2) {
                        if (a[0] instanceof Buffer && a[1] instanceof Buffer) {
                            this.kvp_bufs = Array.from(a);
                            // copy it to an array?
                            // Maybe no need, arraylike will be fine?

                        } else {
                            throw 'NYI';
                        }
                    }
                }
            }
        } else {
            throw 'NYI';
        }

        // Then the key will be using the key buffer.
        // Could do with an OO value class.

        // So, just 'key' and 'value' types are needed for good OO representation of these records.

        // Can get the key or the value from each of those buffers.



    }

    get key() {
        if (this._key) {
            return this._key;
        } else {
            return this._key = new Key(this.kvp_bufs[0]);
        }
    }

    get value() {
        if (this._value) {
            return this._value;
        } else {
            return this._value = new Value(this.kvp_bufs[1]);
        }
    }

    // validate encoding...
    validate_encoding() {
        let res = true;
        try {

            // don't want tracing done, not sure why it sometimes happens. Trae that!
            let decoded = this.decoded;
        } catch (err) {
            //console.trace();
            res = false;
        }
        return res;
    }

    get decoded() {
        return [this.key.decoded, this.value.decoded];
    }

    get bpair() {
        return this.kvp_bufs;
    }

    get kp() {
        // read first xas2 from the key
        //let res = xas2.read(this.kvp_bufs[0]);
        return xas2.read(this.kvp_bufs[0]);
    }

    get table_id() {
        let kp = this.kp;


        if (kp === 0) {
            throw 'NYI';
        } else {
            if (kp % 2 === 0) {
                // even#

                return (kp - 2) / 2;

                // if its an incrementor, maybe we can know the table from it.



            } else {
                return (kp - 3) / 2;
            }
        }


    }

    // get it to read the keys to find the number of items there.
    //  need to be able to identify the specific fields within the record.

    get key_length() {



        return this.key.length;

    }




    get_field_value(idx) {

        let kl = this.key_length;

        //console.log('this.key_length', kl);
        //console.log('idx', idx);

        if (idx < kl) {
            return this.key.get_value_at(idx);
        } else {
            return this.value.get_value_at(idx - kl);
        }


    }


}

module.exports = Record;