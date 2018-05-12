const Binary_Encoding = require('binary-encoding');
const database_encoding = require('../encoding');

class Key {
    constructor() {

        let a = arguments,
            l = a.length;

        if (l === 1) {
            if (a[0] instanceof Buffer) {
                this._buffer = a[0];
            } else {
                // Would be nice to take an array, and treat it as an index key if it starts with an odd number


                // if it's an array, it's the values themselves

                if (Array.isArray(a[0])) {
                    // then construct the buffer out of the values we have.

                    // encode key

                    //let encoded = database_encoding.encode_key(a[0]);
                    //console.log('encoded', encoded);
                    this._buffer = database_encoding.encode_key(a[0]);
                } else {
                    throw 'NYI';
                }



            }
        }
    }

    get buffer() {
        return this._buffer;
    }

    get decoded() {
        return database_encoding.decode_key(this._buffer);
    }

    get length() {
        // 
        return database_encoding.key_length(this._buffer);

    }

    get_value_at(idx) {
        // Should maybe handle index keys too.

        // this._pos_value_beginning

        //console.log('KEY get_value_at', idx);

        // But it's maybe an index record key. Can it handle getting the value like this?

        return database_encoding.key_value_at(this._buffer, idx);




    }

    validate() {
        try {
            let d = this.decoded;
        } catch (err) {
            return false;
        }
        return true;
    }

    get kp() {
        //console.log('xas2.read(this._buffer)', xas2.read(this._buffer));
        return xas2.read(this._buffer);
    }
    get table_kp() {

        let kp = this.kp;
        if (kp % 2 === 0) {
            return kp;
        } else {
            return kp - 1;
        }


    }
    get table_id() {
        return (this.table_kp - 2) / 2;
    }

    // then need to be able to get decoded value
}


module.exports = Key;