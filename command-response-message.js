// Will be worth changing these names / values to make them less confusing.

// message_type_id

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


const B_Record = require('./buffer-backed/record');
const B_Record_List = require('./buffer-backed/record-list');


// Will be used for storage, encoding and decoding.
//  Will only / mainly store the data as the buffer, will read from and write to it.


// This reads the data from the whole page (in some cases.)
//  May need to tell it what type of message it is after all.
//  

// This is going to handle unpaging as well.
//  (maybe)
//  Functionality to split up the internal buffer according to the message_type_id


// Easy encoding of a Record as a result through the constructor.

class Command_Response_Message {
    constructor(spec) {
        let a = arguments,
            l = a.length;



        if (l === 1) {
            let t_spec = tof(spec);
            if (t_spec === 'buffer') {
                this._buffer = spec;
            }
        } else {

            if (l === 2) {
                // a message id and a record.

                if (typeof a[0] === 'number' && a[1] instanceof B_Record) {
                    // not paged, record encoding
                    // RECORD_PAGING_NONE

                    //console.log('a[0]', a[0]);
                    //console.log('a[1]', a[1]);

                    let record_buf = a[1].buffer;
                    //console.log('record_buf', record_buf);

                    this._buffer = Buffer.concat([xas2(a[0]).buffer, xas2(RECORD_PAGING_NONE).buffer, record_buf]);

                } else {
                    // a1 instaceof array

                    if (typeof a[0] === 'number' && Array.isArray(a[1])) {

                        let all_are_records = true;
                        each(a[1], item => {
                            all_are_records = all_are_records && item instanceof B_Record
                        });

                        if (all_are_records) {
                            let rl = new B_Record_List(a[1]);

                            // 
                            this._buffer = Buffer.concat([xas2(a[0]).buffer, xas2(RECORD_PAGING_NONE).buffer, rl.buffer]);
                        }

                        // if they are all records...?

                        // are they all records?





                        
                    }

                    // use binary encoding on them





                    // Array of objects - will need to encode them.

                    // Array of b_records?

                    // Want a standard / built-in way of encoding B_Records with Binary_Encoding.

                    // array of B_Records
                    //  Encodie them into B_Records list.





                    //console.log('Command_Response_Message spec a', a);
                    //console.trace();
                    //throw 'NYI';
                }
            }


            // Assume no paging?
            // May want to include a binary record in this?
            //  Specific record encoding makes sense here.
            // (message_id, BINARY_PAGING_NONE, Binary_Encoding.encode_to_buffer(res));

            // 

            if (l === 3) {

                // and the page number?
                //  need to be able to include the page number in the response.

                let [message_id, message_type_id, buf_inner] = a;
                //console.log('Command_Response_Message buf_inner', buf_inner);
                if (message_type_id === BINARY_PAGING_NONE) {
                    this._buffer = Buffer.concat([xas2(message_id).buffer, xas2(message_type_id).buffer, buf_inner]);
                } else {
                    throw 'NYI';
                }
            }

            if (l === 4) {
                let [message_id, message_type_id, page_number, data] = a;
                if (Array.isArray(data) && data[0] instanceof B_Record) {
                    let rl = new B_Record_List(data);
                    //this._buffer = rl.bu
                    this._buffer = Buffer.concat([xas2(message_id).buffer, xas2(message_type_id).buffer, xas2(page_number).buffer, rl.buffer]);
                } else {
                    console.trace();
                    throw 'NYI';
                }
            }
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

    // get paged bool

    get paged() {
        return (this.message_type_id === BINARY_PAGING_FLOW || this.message_type_id === BINARY_PAGING_LAST ||
            this.message_type_id === RECORD_PAGING_FLOW || this.message_type_id === RECORD_PAGING_LAST ||
            this.message_type_id === KEY_PAGING_FLOW || this.message_type_id === KEY_PAGING_LAST
        )
    }


    get is_last() {
        //console.log('this.message_type_id', this.message_type_id);
        //console.log('this._buffer', this._buffer);

        // Maybe not when there is no paging.
        // Though technically it is the last.

        return (this.message_type_id === BINARY_PAGING_NONE || this.message_type_id === BINARY_PAGING_LAST || this.message_type_id === RECORD_PAGING_NONE || this.message_type_id === RECORD_PAGING_LAST || this.message_type_id === KEY_PAGING_NONE || this.message_type_id === KEY_PAGING_LAST);
    }

    //get buffer
    get buffer() {
        // The whole thing as a buffer.
        // The message id, the message encoding type (message_type_id) ...
        return this._buffer;
        //return this.value_buffer;
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
            //console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);
            return Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2, remove_kp);

        } else if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?

            [page_number, pos] = xas2.read(this._buffer, pos);
            //console.log('page_number', page_number);
            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);
            return Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2, remove_kp);

        } else {
            //console.log('message_type_id', message_type_id);

            //throw 'NYI';

            [page_number, pos] = xas2.read(this._buffer, pos);
            //console.log('page_number', page_number);
            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);
            return Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2, remove_kp);


        }
    }

    get page_number() {
        let [message_type_id, pos] = xas2.skip(this._buffer, 0);
        let page_number;
        //[id, pos] = xas2.skip(this._buffer, pos);
        [message_type_id, pos] = xas2.read(this._buffer, pos);
        if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?
            [page_number, pos] = xas2.read(this._buffer, pos);
        } else if (message_type_id === RECORD_PAGING_LAST) {
            [page_number, pos] = xas2.read(this._buffer, pos);
        } else {
            [page_number, pos] = xas2.read(this._buffer, pos);
        }
        return page_number;
    }

    get unpaged() {
        //let kvp_buffers = this.kvp_buffers;
        // How about creating new Record objects...
        return this.kvp_buffers.map(arr => new B_Record(arr));

    }

    // decoded?

    // getting the value seems most important.

    // value_buffers

    get value() {

        // message id
        let message_type_id;

        // response message does not yet contain the return message id?
        //console.log('this._buffer', this._buffer);
        let [message_id, pos] = xas2.read(this._buffer, 0);
        //console.log('pos', pos);
        //

        let page_number;
        const remove_kp = false;
        //[id, pos] = xas2.skip(this._buffer, pos);
        [message_type_id, pos] = xas2.read(this._buffer, pos);
        console.log('message_type_id', message_type_id);
        if (message_type_id === RECORD_PAGING_FLOW) {
            // break it into records.
            //  num records here?

            //console.log('RECORD_PAGING_FLOW');

            [page_number, pos] = xas2.read(this._buffer, pos);
            //console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);
            return new B_Record_List(buf2).arr;

            //return database_encoding.decode_model_rows(Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf2), remove_kp);

        } else if (message_type_id === RECORD_PAGING_LAST) {
            // break it into records.
            //  num records here?

            [page_number, pos] = xas2.read(this._buffer, pos);
            //console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);
            return new B_Record_List(buf2).arr;

        } else if (message_type_id === RECORD_PAGING_NONE) {
            // Just a single record?
            //console.log('RECORD_PAGING_NONE');

            // include buffer_xas2_prefix
            //console.log('**a pos', pos);
            let buf2 = Buffer.alloc(this._buffer.length - pos);

            this._buffer.copy(buf2, 0, pos);

            console.log('buf2', buf2);


            let arr_records = new B_Record_List(buf2).arr;
            //console.log('arr_records', arr_records);
            console.log('arr_records.length', arr_records.length);
            //console.log('arr_records[0].decoded', arr_records[0].decoded);
            //console.log('arr_records[1].decoded', arr_records[1].decoded);
            //console.log('arr_records[2].decoded', arr_records[2].decoded);

            //console.log('arr_records[0].buffer', arr_records[0].buffer);
            //console.log('arr_records[1].buffer', arr_records[1].buffer);
            //console.log('arr_records[2].buffer', arr_records[2].buffer);


            if (arr_records.length === 1) {
                return arr_records[0];
            } else {
                return arr_records;
            }
        } else if (message_type_id === BINARY_PAGING_LAST) {
            // BINARY_PAGING_LAST = 2
            // read the page number

            // decode it as binary.

            // A way of saying that it's just a single value in the array?

            [page_number, pos] = xas2.read(this._buffer, pos);
            //console.log('page_number', page_number);

            let buf2 = Buffer.alloc(this._buffer.length - pos);
            this._buffer.copy(buf2, 0, pos);

            // Decoding from position without buffer copy?
            let res = Binary_Encoding.decode(buf2);
            //console.log('res', res);

            //console.log('this.singular_result', this.singular_result);

            if (this.singular_result) {
                return res[0];
            } else {
                return res;
            }
            
        } else {



            throw 'NYI';
        }


    }


    // This will also have 

}


module.exports = Command_Response_Message;