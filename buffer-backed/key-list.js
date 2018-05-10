//"use strict";
let Binary_Encoding = require('binary-encoding');
let xas2 = require('xas2');


let Record = require('./record');
let Key = require('./key');
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

class Key_List {
    constructor() {
        let a = arguments,
            l = a.length;

        // given an array
        //  array of key items, but then what type of key items are they

        let arr_key_items;

        // And key-list could take a record-list.
        //  Would extract or reference the keys.

        if (l > 1) {
            // have been given an array of key items
            arr_key_items = a;
        } else {
            if (Array.isArray(a[0])) {
                arr_key_items = a[0];
            } else {
                if (a[0] instanceof Buffer) {
                    this._buffer = a[0];
                }
            }
        }

        let process_key_item_to_buffer = (key_item) => {

            //console.log('process_key_item_to_buffer', key_item);
            // Will say each key is encoded as its own buffer.
            //  These key items should all decode to buffers, and then decode to individual rows.
            // Iterate / read through the buffers. Could use generator. Then could decode each of them.
            // then depending on the type of the key item.
            // if it's an array
            let res;




            if (Array.isArray(key_item)) {
                // depending on if it's an INCREMENTOR_KEY, RECORD_KEY, INDEX_KEY
                //  Inc key: var bufs_key = Buffer.concat([xas2(0).buffer, xas2(this.id).buffer, xas2(STRING).buffer, xas2(buf_name.length).buffer, buf_name]);
                //  2 xas2s, then a string name

                let kp0 = key_item[0];

                // Specific type encoding for DB_KEY would be useful.
                //  Being able to get it back through Binary_Encoding or DB_Binary_Encoding, or DB_Encoding.
                //  Don't have this type within the db encoding system right now.

                if (kp0 === 0) {
                    // incrementor

                    // Announce the type as an INCREMENTOR_KEY

                    // Individual buffers here.
                    //  

                    // Don't say it's a string.

                    // The whole thing as a buffer.
                    //  Each item should be encoded as a buffer first.
                    //   Not making specific key encoding for the moment. Have what is available.

                    let buf_key = Buffer.concat([xas2(0).buffer, xas2(key_item[1]).buffer, xas2(STRING).buffer, xas2(key_item[2].length).buffer, Buffer.from(key_item[2])]);
                    let buf_item = Buffer.concat([xas2(BUFFER).buffer, xas2(buf_key.length).buffer, buf_key]);

                    res = buf_item;
                } else {
                    if (kp0 % 2 === 0) {
                        // it's even, so a record key
                        // has one kp.
                        // want to be able to call encode_to_buffer, giving it the number of KPs to use.
                        //return Binary_Encoding.encode_to_buffer_use_kps(key_item, 1);

                        let buf_key = Binary_Encoding.encode_to_buffer_use_kps(key_item, 1);
                        let buf_item = Buffer.concat([xas2(BUFFER).buffer, xas2(buf_key.length).buffer, buf_key]);

                        res = buf_item;

                        //this._buffer = Binary_Encoding.encode_to_buffer()

                    } else {
                        // odd, so an index key
                        //return Binary_Encoding.encode_to_buffer_use_kps(key_item, 2);

                        let buf_key = Binary_Encoding.encode_to_buffer_use_kps(key_item, 2);
                        //console.log('[xas2(BUFFER).length, xas2(buf_key).length, buf_key]', [xas2(BUFFER), xas2(buf_key.length), buf_key]);
                        let buf_item = Buffer.concat([xas2(BUFFER).buffer, xas2(buf_key.length).buffer, buf_key]);

                        res = buf_item;
                    }
                }
            } else if (key_item instanceof Buffer) {
                // Encode it as a buffer with length?

                // Could check that it starts with BUFFER, then its length, and that it matches that length?
                //  If not, wrap that way.


                //  ensure that it is encoded with BUFFER TYPE, LENGTH, CONTENT
                // Yes, encoding its length makes sense... but BE.ensure_length_encoded(key_item)

                //let buf_item = Buffer.concat([xas2(BUFFER).buffer, xas2(buf_key.length).buffer, key_item]);

                //res = buf_item;
                throw 'NYI';

            } else if (key_item instanceof Record) {
                let buf_key = key_item.kvp_bufs[0];
                res = Buffer.concat([xas2(BUFFER).buffer, xas2(buf_key.length).buffer, buf_key]);
            } else {
                throw 'NYI';
            }
            //console.log('key res', res);
            return res;
        }

        let process_arr_key_items_to_buffer = (arr_key_items) => {
            let item;

            // then say its an array

            let bufs_res = new Array(arr_key_items.length);
            for (let c = 0, l = arr_key_items.length; c < l; c++) {
                //item = arr_key_items[c];
                bufs_res[c] = process_key_item_to_buffer(arr_key_items[c]);
            }
            return Buffer.concat(bufs_res);
        }

        if (arr_key_items) {

            // but are they all buffers?

            //console.log('arr_key_items', arr_key_items);

            // what if they are of type 'Record'?



            this._buffer = process_arr_key_items_to_buffer(arr_key_items);
        }

    }

    get length() {
        return Binary_Encoding.count_encoded_items(this._buffer);
    }

    get buffer() {
        return this._buffer;
    }

    /*
    [Symbol.iterator]() {

        yield 1;
        yield 2;
        yield 3;

    }
    */



    * iterator() {
        //for (let key in this.elements) {
        //    var value = this.elements[key];
        //    yield value;
        //}
        //yield 1;
        //yield 2;
        //yield 3;

        // need to read through the items.

        let pos = 0;
        let complete = false;
        let l = this._buffer.length;

        let type_id, buf_l;
        let b = this._buffer;
        //console.log('l', l);

        while (pos < l) {
            //[type_]
            //console.log('2) pos', pos);
            [type_id, pos] = xas2.read(b, pos);
            [buf_l, pos] = xas2.read(b, pos);
            // then can copy alloc and copy to the new buf
            let item_buf = Buffer.alloc(buf_l);
            b.copy(item_buf, 0, pos, pos + buf_l);
            //console.log('* item_buf', item_buf);

            // Could yield a proper key instead.

            let item = new Key(item_buf);


            yield item;
            pos = pos + buf_l;

            //console.log('buf_l', buf_l);
            //console.log('3) pos', pos);


        }
        //console.log('while complete');


    }

    [Symbol.iterator]() {
        return this.iterator();
    }



    // 

    // Need to be able to iterate through these keys.

    // buffer type code, buffer length, buffer itself

    // Could get the buffer-backed keys as an array
    // Iterate through them as an array


    // Not getting the buffer-backed keys, getting the array items
    get decoded() {



        // Need to process through the items encoded within this, one by one.






        /*
        var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
        var decoded_key;
        //if (key_1st_value % 2 === 0) {
        if (key_1st_value % 2 === 0 && key_1st_value > 0) {
            // even, so it's a table, so 1 prefix
            // Have incrementor work differently - just xas2s in keys and values.

            console.log('buf_key', buf_key);

            // Seems like a key has been put into the DB incorrectly in some cases.
            //  Checking for and correction various data errors / corruption makes sense.

            if (remove_kp) {
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 1).slice(1);
            } else {
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            }

        } else {
            // odd, meaning indexes, so 2 prefixes. Includes the incrementors.
            decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
        }
        return decoded_key;

        */

    }
}

module.exports = Key_List;