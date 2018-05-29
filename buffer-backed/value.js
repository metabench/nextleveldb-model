const Binary_Encoding = require('binary-encoding');

const NONE = 0;
const RECORD = 1;
const KEY = 2;
const VALUE = 3;

class Value {
    constructor() {

        let a = arguments,
            l = a.length;

        if (l === 1) {
            if (a[0] instanceof Buffer) {
                this._buffer = a[0];
            }
        }

    }

    get buffer() {
        return this._buffer;
    }

    get buffer_xas2_prefix() {
        return new xas2(VALUE).buffer;
    }

    get decoded() {

        if (this._buffer.length > 0) {
            return Binary_Encoding.decode_buffer(this._buffer);
        } else {
            //return null;
            return [];
        }


    }

    get_value_at(idx) {
        return Binary_Encoding.get_value_at(this._buffer, idx);
    }

    // then need to be able to get decoded value
}


module.exports = Value;