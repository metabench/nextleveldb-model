const Binary_Encoding = require('binary-encoding');
const xas2 = require('xas2');

// Maybe phase this out.
class Index_Record_Key {
    constructor(spec) {

        // Will take a buffer, or the index record key in array form.

        //let a = arguments;

        if (spec instanceof Buffer) {
            this._buffer = spec;
        } else if (Array.isArray(spec)) {

            // encode idx key arr to buffer

            this._buffer = Binary_Encoding.encode_to_buffer_use_kps(spec, 2);
        }
    }
    get buffer() {
        return this._buffer;
    }

    validate() {
        try {
            let d = this.decoded;
        } catch (err) {
            return false;
        }
        return true;
    }

    get decoded() {
        return Binary_Encoding.decode_buffer(this._buffer, 2);
    }
    get kp() {
        //console.log('xas2.read(this._buffer)', xas2.read(this._buffer));
        return xas2.read(this._buffer);
    }
    get table_kp() {
        return this.kp - 1;
    }
    get table_id() {
        return (this.table_kp - 2) / 2;
    }
    get index_id() {
        return xas2.read_nth(this._buffer, 0, 2);
    }

    get fields() {
        // decoded
        let pos = xas2.skip_n(this._buffer, 0, 2);
        return Binary_Encoding.decode_buffer(this._buffer, 0, pos);
    }
}

module.exports = Index_Record_Key;