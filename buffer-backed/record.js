/*
    17/05/2018 - Maybe this is a 'row' rather than a 'record'. A record encompasses index rows as well.
    // A record could be composed of its index rows too.
    // Removal of index rows when the record changes may be the best approach.


*/

const lang = require('lang-mini');
const def = lang.is_defined;

let Binary_Encoding = require('binary-encoding');
let xas2 = require('xas2');
let Key = require('./key');
let Value = require('./value');

const database_encoding = require('../encoding');

const XAS2 = 0;
const STRING = 4;
const BUFFER = 9;
const ARRAY = 10;


// Standard data 0. just normal decoding.

// ~-~-~-~-~-~-~-~-~-~-~-~-~-
// Supplementary encoding

const NONE = 0;
const RECORD = 1;
const KEY = 2;
const VALUE = 3;


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

                // a buffer that can be split?


                // one buffer
                // odd kp, it has no 'value'
                //  has a key
                //  key is the buffer given


                // Not so sure about this with the constructor.
                //  Need to split the values into key value pair buffers.

                // Need to split / decode the buffer.
                // We may have been given the value, not a key.

                //console.trace();

                //this.kvp_bufs = [a[0], Buffer.alloc(0)];
                //throw 'stop';

                // length encoded buffers.


                //console.log('pre split', a[0]);
                this.kvp_bufs = Binary_Encoding.split_length_item_encoded_buffer(a[0]);
                //console.log('this.kvp_bufs', this.kvp_bufs);

                // 

                //throw 'NYI'
            } else {
                //console.log('else condition');

                //console.log('a[0]', a[0]);
                //console.log('a[0].length', a[0].length);

                if (Array.isArray(a[0])) {
                    //console.log('its an array');

                    //console.log('a[0][1]', a[0][1]);

                    if (a[0].length === 2 && a[0][0] instanceof Buffer && a[0][1] instanceof Buffer) {
                        // Check they are both buffers.

                        this.kvp_bufs = a[0];


                    } else if (a[0].length === 2 && a[0][0] instanceof Buffer && a[0][1] === null) {
                        // Check they are both buffers.

                        //this.kvp_bufs = a[0];
                        this.kvp_bufs = [a[0][0], Buffer.alloc(0)];


                    } else {

                        //console.log('else 2');

                        if (Array.isArray(a[0][0]) && Array.isArray(a[0][1])) {
                            //console.log('both arrays');
                            this.kvp_bufs = database_encoding.encode_model_row(a[0]);

                        } else {

                            // undefined key, but has value.
                            if (def(a[0][0])) {



                                console.trace();
                                throw 'NYI';
                            } else {


                                if (Array.isArray(a[0][1])) {
                                    this.kvp_bufs = [undefined, Binary_Encoding.encode_to_buffer(a[0][1])];
                                } else {
                                    console.trace();
                                    throw 'NYI';
                                }
                            }

                        }

                        // an array of arrays.
                        //  in that case, we will need to use database_encoding.encode_record



                        //throw 'NYI';
                    }

                } else {

                    //console.log('a[0] is not an array');


                    if (a.length === 2) {
                        if (a[0] instanceof Buffer && a[1] instanceof Buffer) {
                            this.kvp_bufs = Array.from(a);
                            // copy it to an array?
                            // Maybe no need, arraylike will be fine?

                        } else {
                            console.trace();
                            throw 'NYI';
                        }
                    } else {
                        console.trace();
                        throw 'NYI';
                    }
                }
            }
        } else {
            console.trace();
            throw 'NYI';
        }

        // Then the key will be using the key buffer.
        // Could do with an OO value class.

        // So, just 'key' and 'value' types are needed for good OO representation of these records.

        // Can get the key or the value from each of those buffers.

    }

    get record() {
        return this;
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


    get decoded() {

        if (this.kp === 0) {
            // Incrementor records.
            //console.log('this.value.buffer', this.value.buffer);

            // should be able to return null.

            return [this.key.decoded, xas2.read(this.value.buffer)];
        } else {
            return [this.key.decoded, this.value.decoded];
        }


    }

    get decoded_no_kp() {
        let decoded = this.decoded;
        decoded[0].shift();
        return decoded;
    }

    get bpair() {
        return this.kvp_bufs;
    }

    get kp() {
        // read first xas2 from the key
        //let res = xas2.read(this.kvp_bufs[0]);
        //console.log('this.kvp_bufs', this.kvp_bufs);
        //console.log('this', this);
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

    // get as a single buffer
    //  encoding:
    //  key length, key, value length, value.

    get buffer() {
        if (!def(this.kvp_bufs[0])) {
            console.log('key not defined');
            // So, need to be able to read the record when there is not a key.
            // First buffer has length 0.



            return Buffer.concat([xas2(0).buffer, xas2(this.kvp_bufs[1].length).buffer, this.kvp_bufs[1]]);
        } else {
            return Buffer.concat([xas2(this.kvp_bufs[0].length).buffer, this.kvp_bufs[0], xas2(this.kvp_bufs[1].length).buffer, this.kvp_bufs[1]]);
        }

    }

    get buffer_xas2_prefix() {
        return new xas2(RECORD).buffer;
    }


    // get it to read the keys to find the number of items there.
    //  need to be able to identify the specific fields within the record.

    get key_length() {
        return this.key.length;

    }

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




    get_field_value(idx) {

        let kl = this.key_length;

        //console.log('this.key_length', kl);
        //console.log('idx', idx);

        //console.log('');
        //console.log('idx', idx);
        //console.log('kl', kl);
        //console.log('');



        if (idx < kl) {


            return this.key.get_value_at(idx);
        } else {

            //console.log('this.value', this.value);
            //let r_idx = idx - kl;
            //let res = this.value.get_value_at(r_idx);

            //console.log('r_idx', r_idx);
            //console.log('res', res);

            //return res;

            return this.value.get_value_at(idx - kl);
        }
    }


    // make iterable...
    //  just a key and value

    * iterator() {

        yield this.kvp_bufs[0];
        yield this.kvp_bufs[1];


    }

    [Symbol.iterator]() {
        return this.iterator();
    }


}

module.exports = Record;