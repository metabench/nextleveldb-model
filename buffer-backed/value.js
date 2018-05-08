const Binary_Encoding = require('binary-encoding');

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

    get decoded() {
        return Binary_Encoding.decode_buffer(this._buffer);
    }

    get_value_at(idx) {
        return Binary_Encoding.get_value_at(this._buffer, idx);
    }

    // then need to be able to get decoded value
}


module.exports = Value;