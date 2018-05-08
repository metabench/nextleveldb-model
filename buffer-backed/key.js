const Binary_Encoding = require('binary-encoding');
const database_encoding = require('../encoding');

class Key {
    constructor() {

        let a = arguments,
            l = a.length;

        if (l === 1) {
            if (a[0] instanceof Buffer) {
                this._buffer = a[0];
            }
        }
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

        console.log('KEY get_value_at', idx);

        return database_encoding.key_value_at(this._buffer, idx);




    }

    // then need to be able to get decoded value
}


module.exports = Key;