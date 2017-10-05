var Query = require('../query');
var xas2 = require('xas2');
var Binary_Encoding = require('binary-encoding');
var encode_item = Binary_Encoding.flexi_encode_item;

const i_query_type = 11;

class Records_In_Range_Query extends Query {
	constructor(id, page_size = 0, l_key, u_key) {
		this.id = id;
        this.page_size = page_size;

        // The lkey is its own binary blob.
        //  Need to be able to encode a buffer into Binary_Encoding
        this.l_key = l_key;
        this.u_key = u_key;

        this.i_query_type = i_query_type;
    }

    to_buffer() {

        var res = Buffer.concat([xas2(this.id), xas2(this.i_query_type), xas2(this.page_size), encode_item(this.l_key), encode_item(this.u_key)]);

        return res;
    }
}

module.exports = Records_In_Range_Query;