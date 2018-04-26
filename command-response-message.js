// Will be worth changing these names / values to make them less confusing.

const BINARY_PAGING_NONE = 0;
const BINARY_PAGING_FLOW = 1;
const BINARY_PAGING_LAST = 2;

const RECORD_PAGING_NONE = 3;
const RECORD_PAGING_FLOW = 4;
const RECORD_PAGING_LAST = 5;
const RECORD_UNDEFINED = 6;

// A whole message type for undefined record?

const KEY_PAGING_NONE = 7;
const KEY_PAGING_FLOW = 8;
const KEY_PAGING_LAST = 9;

// Simplest error message.
//  Could have a number, then could have encoded text.
//  
const ERROR_MESSAGE = 10;

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~



const lang = require('lang-mini');
const each = lang.each;
const get_a_sig = lang.get_a_sig;
const clone = lang.clone;
const tof = lang.tof;
const Evented_Class = lang.Evented_Class;
const get_truth_map_from_arr = lang.get_truth_map_from_arr;

const Binary_Encoding = require('binary-encoding');
const xas2 = require('xas2');
const Paging = require('./paging');


const database_encoding = require('./database');


// Will be used for storage, encoding and decoding.
//  Will only / mainly store the data as the buffer, will read from and write to it.


// This reads the data from the whole page (in some cases.)
//  May need to tell it what type of message it is after all.
//  

// This is going to handle unpaging as well.
//  (maybe)
//  Functionality to split up the internal buffer according to the message_type_id



class Command_Response_Message {
    constructor(spec) {



        let t_spec = tof(spec);

        if (t_spec === 'buffer') {
            this._buffer = spec;
        }
        // Want this to hold the whole message to avoid problems.
        //  Make sure that this contains the message id.



    }

    get id() {

        // maybe don't know the message id.
        //  It seems worthwhile (maybe from now on) keeping the message id.

        let [id, pos] = xas2.read(this._buffer, 0);
        return id;
    }

    /*

    get command_id() {
        let [id, pos] = xas2.skip(this._buffer, 0);
        [id, pos] = xas2.read(this._buffer, pos);
        return id;
    }
    */

    // then (possibly) the paging/message type.

    // call it message_type
    //  it always starts with message_type_id

    get message_type_id() {
        let [id, pos] = xas2.skip(this._buffer, 0);
        //[id, pos] = xas2.skip(this._buffer, pos);
        [id, pos] = xas2.read(this._buffer, pos);
        return id;
    }



    get is_last() {
        console.log('this.message_type_id', this.message_type_id);

        console.log('this._buffer', this._buffer);

        return (this.message_type_id === BINARY_PAGING_NONE || this.message_type_id === BINARY_PAGING_LAST || this.message_type_id === RECORD_PAGING_NONE || this.message_type_id === RECORD_PAGING_LAST || this.message_type_id === KEY_PAGING_NONE || this.message_type_id === KEY_PAGING_LAST);



    }

    get value_buffer() {
        let [message_type_id, pos] = xas2.skip(this._buffer, 0);
        let page_number;
        //[id, pos] = xas2.skip(this._buffer, pos);
        [message_type_id, pos] = xas2.read(this._buffer, pos);


        if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?

            [page_number, pos] = xas2.read(this._buffer, 0);

            let buf2 = Buffer.alloc(buf_the_rest.length - pos);
            buf_the_rest.copy(buf2, 0, pos);
            return buf2;
        } else {
            throw 'NYI';
        }
    }


    // Don't really just store the kv records in a single buffer.
    //  Always have used array kv pairs. Not sure that's most performant.
    get kvp_buffers() {
        let [message_type_id, pos] = xas2.skip(this._buffer, 0);
        let page_number;
        const remove_kp = false;
        //[id, pos] = xas2.skip(this._buffer, pos);
        [message_type_id, pos] = xas2.read(this._buffer, pos);


        if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?

            [page_number, pos] = xas2.read(this._buffer, pos);
            console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);

            // It wasn't encoded this way.
            //  It was encoded as an array.
            //   That probably makes it easier to read.
            //    Maybe these sent records should not have been sent as an array, but as 'record encoding' which is more concise.



            //let arr_bufs_kv = Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2);

            //console.log('arr_bufs_kv', arr_bufs_kv);


            //let arr_decoded = database_encoding.decode_model_rows(arr_bufs_kv, remove_kp);

            return Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2, remove_kp);

        } else {
            throw 'NYI';
        }
    }

    // value_buffers

    get value() {
        let [message_type_id, pos] = xas2.skip(this._buffer, 0);
        let page_number;
        const remove_kp = false;
        //[id, pos] = xas2.skip(this._buffer, pos);
        [message_type_id, pos] = xas2.read(this._buffer, pos);


        if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?

            [page_number, pos] = xas2.read(this._buffer, pos);
            console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);

            // It wasn't encoded this way.
            //  It was encoded as an array.
            //   That probably makes it easier to read.
            //    Maybe these sent records should not have been sent as an array, but as 'record encoding' which is more concise.



            //let arr_bufs_kv = Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2);

            //console.log('arr_bufs_kv', arr_bufs_kv);


            //let arr_decoded = database_encoding.decode_model_rows(arr_bufs_kv, remove_kp);

            return database_encoding.decode_model_rows(Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2), remove_kp);

        } else {
            throw 'NYI';
        }


    }


    // This will also have 

}


module.exports = Command_Response_Message;