let Binary_Encoding = require('binary-encoding');
let database_encoding = require('../encoding');
let xas2 = require('xas2');

let Record = require('./record');

let lang = require('lang-mini');
let each = lang.each;
let get_a_sig = lang.get_a_sig;
// Could have option of encoding this as its own item type.
//  However, by default will encode itself as an array of keys.
//  It looks like a specific encoding item type for 'key' is necessary

//  Would be a new type for Binary_Encoding. Wondering about plugins. Hardcoding is likely faster.

// Would be a somewhat significant change on the server. The code would become simpler. The protocol slightly longer, but not by much (1 byte).
//  Would better enable to keys and values and records to better be constructed / deconstructed on the server.

// Its own encoding type may be useful, but would need an extended Binary_Encoding.


// Seems OK to say this is an array?
//  Though decoding it as a Key_List makes the most sense.


const XAS2 = 0;
const STRING = 4;
const BUFFER = 9;
const ARRAY = 10;


// Could make it so that this can support index records, which are just indexes by themselves.
//  Just stick a 0 on the end for the length of the value



// This will be able to accept Record objects, but get rid of them once they have been loaded into the Buffer.




var encode_kv_buffer_pair = (model_row) => {
    let arr_res;
    if (model_row instanceof Buffer) {
        arr_res = [xas2(model_row.length).buffer, model_row, xas2(0).buffer];
    } else {
        if (model_row[1]) {
            arr_res = [xas2(model_row[0].length).buffer, model_row[0], xas2(model_row[1].length).buffer, model_row[1]];
        } else {
            arr_res = [xas2(model_row[0].length).buffer, model_row[0], xas2(0).buffer];
        }
    }
    return Buffer.concat(arr_res);
}


var encode_kv_buffer_pairs = (model_rows) => {
    var res = [];
    each(model_rows, (model_row) => {
        res.push(encode_kv_buffer_pair(model_row));
    });
    return Buffer.concat(res);
}

// This will handle both encoding and decoding of records. Will be a useful and reliable way to store and pass around a bunch of records.

class Record_List {
    constructor() {
        let a = arguments,
            l = a.length,
            sig = get_a_sig(a);


        // if we were given an array
        //  its an array of records
        //  each of them could be encoded as a single buffer.


        // Need some flexibility in the data that can be supplied, then supplies the data in exactly the form needed.

        //console.log('Record_List sig', sig);

        // The whole thing encoded within a buffer?
        //  Can't be decoded as a normal array, so no.

        // Seems like the whole things needs to be wrapped in a Buffer.

        // Each record in the list to get encoded as a buffer.


        if (sig === '[B]') {
            this._buffer = a[0];
        } else if (sig === '[a]') {
            // Will be an array of buffers or arr records

            let arr_bufs = [];

            let arr_records = a[0],
                l = arr_records.length;

            //console.log('l', l);
            for (let c = 0; c < l; c++) {

                let item = arr_records[c];

                if (item instanceof Buffer) {

                    // May be best to ensure encoding, but just put it for the moment.
                    arr_bufs.push(item);


                } else {
                    if (item.buffer) {
                        arr_bufs.push(item.buffer);
                    } else {
                        //console.log('item', item);
                        //console.log('item.length', item.length);
                        // Is it an array?

                        // Is it length 2?

                        if (item.length === 2 && (item[0] instanceof Buffer) && (item[1] instanceof Buffer)) {
                            //console.log('buffer pair');
                            // Are they both buffers?
                            let enc = encode_kv_buffer_pair(item);
                            //console.log('1) enc', enc);

                            arr_bufs.push(enc);

                            //

                        } else {

                            if (item.length === 2 && (Array.isArray(item[0])) && (Array.isArray(item[1]))) {

                                // Are they both buffers?

                                //console.log('array pair');
                                //console.log('item', item);



                                let enc_key = Binary_Encoding.encode_to_buffer_use_kps(item[0], 1);

                                let enc_value = Binary_Encoding.encode_to_buffer(item[1]);


                                let enc = Buffer.concat([xas2(enc_key.length).buffer, enc_key, xas2(enc_value.length).buffer, enc_value]);
                                //console.log('enc', enc);



                                arr_bufs.push(enc);

                                // then the record is just the two of them joined together.
                                //  maybe not the ideal way. Means key needs to be read o skipped to read the value.
                                //   and we need to know how many of the values are the key?

                                // Or better to encode them both as buffers, key and value, within an array.
                                //  Encoding the key and the value, with the length, is a useful way of doing it.
                                //   No, we have the length of each of them first.

                                // Length key, key, length value, value




                                //arr_bufs.push(encode_kv_buffer_pair(item));

                                //

                            } else {
                                if (Array.isArray(item)) {
                                    //console.log('single array');
                                    // encode the key
                                    //let enc = database_encoding.encode_key(item);
                                    // Meaning its an index record.
                                    // The 0 on the end is the length of the value.

                                    // Have the length first though

                                    let enc_inner = Binary_Encoding.encode_to_buffer_use_kps(item, 2);
                                    //console.log('enc_inner', enc_inner);

                                    // An empty buffer... does that work

                                    // an empty buffer?

                                    // Just 0 at the end to signify 0 length...
                                    //  Should make this return an empty buffer?

                                    let enc = Buffer.concat([xas2(enc_inner.length).buffer, enc_inner, xas2(0).buffer]);
                                    //console.log('enc', enc);
                                    arr_bufs.push(enc);
                                } else {
                                    console.trace();
                                    throw 'NYI';

                                }
                            }
                        }
                        // If so, encode it as key and value.
                    }


                }
            }

            //console.log('arr_bufs', arr_bufs);

            // Looks like this means changing / simplifying the way that rows get encoded.
            //  Each row as its own encoded buffer.

            // Maybe that's not the right way.
            //  Not sure if we want a buffer around whe whole thing.

            // Maybe change encoding, but change decoding first.
            //  Better if this OO system encodes / decodes in the old way?
            //   However, that may mean that standard message decode is not possible.

            // Possibly, moving to widescale change of the protocol and calling it would make sense here.
            // Encode, decode.








            //let buf_inner = Binary_Encoding.encode_to_buffer(arr_bufs);

            let buf_inner = Buffer.concat(arr_bufs);

            //let buf_inner = Binary_Encoding.encode_to_buffer([Buffer.concat(arr_bufs)])

            this._buffer = buf_inner;
        }
    }

    get_nth(n) {
        // needs to skip through length item encoded buffer.
        let pos = 0;
        let item_length;
        let c = 0;
        let b_found;

        while (c < n + 1) {
            [item_length, pos] = xas2.read(this._buffer, pos);

            //console.log('item_length, pos', item_length, pos);

            if (c === n) {
                b_found = Buffer.alloc(item_length);
                this._buffer.copy(b_found, 0, pos, pos + item_length);
            }

            pos = pos + item_length;
            c++;
        }

        //console.log('b_found', b_found);

        return b_found;
    }

    // Need to iterate through the items.
    //  Iterate through buffer backed records.

    * iterator() {

        let pos = 0;
        let complete = false;
        let l = this._buffer.length;



        let type_id, buf_l_key, buf_l_value;
        let b = this._buffer;
        //console.log('l', l);
        //console.log('this._buffer', this._buffer);
        //throw 'stop';

        while (pos < l) {
            //[type_]
            //console.log('2) pos', pos);
            //[type_id, pos] = xas2.read(b, pos); 

            [buf_l_key, pos] = xas2.read(b, pos);

            // then can copy alloc and copy to the new buf
            let key_buf = Buffer.alloc(buf_l_key);
            b.copy(key_buf, 0, pos, pos + buf_l_key);
            pos = pos + buf_l_key;

            [buf_l_value, pos] = xas2.read(b, pos);
            // then can copy alloc and copy to the new buf
            let key_value = Buffer.alloc(buf_l_value);
            b.copy(key_value, 0, pos, pos + buf_l_value);
            pos = pos + buf_l_value;

            //console.log('key_buf', key_buf);
            //console.log('key_value', key_value);

            //console.log('* item_buf', item_buf);

            // Could yield a proper key instead.

            let item = new Record([key_buf, key_value]);

            //console.log('item', item);
            //throw 'stop';
            yield item;


            //console.log('buf_l', buf_l);
            //console.log('3) pos', pos);


        }
        //console.log('while complete');


    }

    [Symbol.iterator]() {
        return this.iterator();
    }



    get buffer() {
        return this._buffer;
    }

    get decoded() {
        let res = [];

        //console.log('this._buffer', this._buffer);
        // Seems like there are different ways this gets encoded.
        //  Maybe there is a more old-school way.
        //  Now I am optimising more for programming conciseness and simplicity, and making use of OO classes too.

        // Not as keen on the older way that model rows have been encoded.
        //  Want to go for really simple encoding and decoding calls.

        let kvps = Binary_Encoding.split_length_item_encoded_buffer_to_kv(this._buffer);
        //console.log('kvps', kvps);

        //throw 'stop';
        //let buf_inner = Binary_Encoding.decode(this._buffer);

        // Where each model row has its length given, but is not coded as a Buffer itself.
        //  A bit more encoding data in the protocol makes interpretation easier.

        // However, it seems like being able to decode the old-style buffers could be useful.

        // Maybe we need a widespread change throughout the system in how records (and indexes) get put into the DB.

        // Or change the way that this does the encoding?
        //  Moving to a more standard encoding system makes sense however.




        //console.log('buf_inner', buf_inner);
        //console.log('buf_inner.length', buf_inner.length);

        // then each of them is an encoded record.
        //  could use a buffer backed record.
        //   That would handle both key only records, as well as full records.

        // then get the key value pairs out of it.
        //let arr_buf_items = Binary_Encoding.split_length_item_encoded_buffer(buf_inner);

        // Doesn't look right here.
        // Need to be careful and specific in how records get sent to or from the server.

        each(kvps, kvp => {
            // split it as a key value pair.

            //console.log('buf', buf);

            // split length en
            //let kv = database_encoding.decode_model_row(buf);

            //let kv = Binary_Encoding.decode()


            //let kv = Binary_Encoding.split_length_item_encoded_buffer(buf);
            //console.log('kv', kv);

            let mr = database_encoding.decode_model_row(kvp);
            //console.log('mr', mr);

            res.push(mr);

        });

        //console.log('arr_buf_items', arr_buf_items);


        //console.log('arr_buf_items.length', arr_buf_items.length);

        // then decode these...

        // Not encoded as model rows though.

        //let mrs = database_encoding.decode_model_rows(buf_inner);
        //console.log('mrs', mrs);

        // split them as key value pairs.


        //console.log('res', res);
        //throw 'stop';

        // then 

        // 

        return res;


    }


}

module.exports = Record_List;