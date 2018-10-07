// Will be based around the buffer.
//  Lazy reading of the buffer values where possible.

// Maybe the Command_Message could itself have events.

const lang = require('lang-mini');
const def = lang.is_defined;
const each = lang.each;
const get_a_sig = lang.get_a_sig;
const clone = lang.clone;
const tof = lang.tof;
const Evented_Class = lang.Evented_Class;
const get_truth_map_from_arr = lang.get_truth_map_from_arr;

const Binary_Encoding = require('binary-encoding');
const xas2 = require('xas2');
const Paging = require('./paging');
// Not so sure that this should process events.
const buffer_backed = require('./buffer-backed/buffer-backed');
const LL_COUNT_RECORDS = 0;
const LL_PUT_RECORDS = 1;

// USING PAGING OPTION?
const LL_GET_ALL_KEYS = 2;
const LL_GET_ALL_RECORDS = 3;
const LL_GET_KEYS_IN_RANGE = 4;
const LL_GET_RECORDS_IN_RANGE = 5;
const LL_GET_RECORDS_IN_RANGES = 50;
const LL_COUNT_KEYS_IN_RANGE = 6;
const LL_GET_FIRST_LAST_KEYS_IN_RANGE = 7;
const LL_GET_RECORD = 8;
const LL_COUNT_KEYS_IN_RANGE_UP_TO = 9;
const LL_GET_RECORDS_IN_RANGE_UP_TO = 10;
const LL_FIND_COUNT_TABLE_RECORDS_INDEX_MATCH = 11;
const INSERT_TABLE_RECORD = 12;
const INSERT_RECORDS = 13;
const ENSURE_TABLE = 20;
const ENSURE_TABLES = 21;
const TABLE_EXISTS = 22;
const TABLE_ID_BY_NAME = 23;
const GET_TABLE_FIELDS_INFO = 24;
const GET_TABLE_KEY_SUBDIVISIONS = 25;
const SELECT_FROM_RECORDS_IN_RANGE = 40;
const SELECT_FROM_TABLE = 41;
const LL_SUBSCRIBE_ALL = 60;
const LL_SUBSCRIBE_KEY_PREFIX_PUTS = 61;
const LL_UNSUBSCRIBE_SUBSCRIPTION = 62;
const LL_WIPE = 100;
const LL_WIPE_REPLACE = 101;
const LL_SEND_MESSAGE_RECEIPT = 120;

// Not to be confused with Command_Response_Message
// May be best to treat all of these as optional. If no paging option is given, would use a server default.
let command_ids_with_paging_option = [LL_COUNT_RECORDS, LL_GET_ALL_KEYS, LL_GET_ALL_RECORDS, LL_GET_KEYS_IN_RANGE, LL_GET_RECORDS_IN_RANGE, LL_GET_RECORDS_IN_RANGES];
// Optional paging option will maybe be phased out or not used
//  Could assume that if the message ends before paging option, then none is to be used.
let command_ids_with_optional_paging_option = [];
let map_paging_commands = get_truth_map_from_arr(command_ids_with_paging_option);


const RECORD = 200;
const KEY = 201;
const VALUE = 202;
const NONE = 210;

class Command_Message {
    constructor(spec) {
        let a = arguments;
        let l = a.length;

        //console.log('Command_Message l', l);

        if (l === 1) {
            let t_spec = tof(spec);
            if (t_spec === 'buffer') {
                this._buffer = spec;
            }
        } else if (l === 2) {
            // number and number?
            // id and paging



            if (typeof a[0] === 'number' && Array.isArray(a[1])) {
                let [command_id, arr_args] = arguments;

                // 

                // put a prefix on each of them...
                //let buf_encoded_args = Binary_Encoding.encode_to_buffer(arr_args, NONE);

                // want a prefix at the beginning of each item?

                // encode to buffer, but have a prefix before each of them

                // put something saying no specific encoding type in here.

                let buf_encoded_args = Binary_Encoding.encode_to_buffer(arr_args);
                // But we have not given it a command id (yet)
                //  Best to do that just before sending.
                //this._id = undefined;

                // Hard to include undefined buffer.
                //  Special characters extension in xas2? Allowing undefined.

                // saying that it's missing the id?
                this.missing_id = true;
                // 

                let buf_paging = new Paging.No_Paging().buffer;
                this._buffer = Buffer.concat([xas2(command_id).buffer, buf_paging, buf_encoded_args]);

                //this._buffer = Buffer.concat([xas2(command_id).buffer, xas2(0).buffer,]);
                // Then depending on the command itself it can have different construction.



                // Simplest construction is command, then param

            } else if (typeof a[0] === 'number' && typeof a[1] === 'number') {
                //console.trace();
                //throw 'NYI';
                let [command_id, page_size] = arguments;
                this.missing_id = true;
                let buf_paging = new Paging.Record_Paging(page_size).buffer;
                this._buffer = Buffer.concat([xas2(command_id).buffer, buf_paging]);


            } else {
                console.trace();
                throw 'NYI';
            }
            // Have some assistance in building the command.


            // building the command message out of arrays / other things.
            //  has its paging and communication options, then its method call args.


        } else if (l === 3) {
            if (typeof a[0] === 'number' && Array.isArray(a[1]) && typeof a[2] === 'number') {
                let [command_id, arr_args] = arguments;

                //console.log('1) arr_args', arr_args);

                arr_args = arr_args.map(x => {
                    //console.log('arr_args x', x);
                    if (x instanceof Buffer) {
                        // saying its 0 for a buffer in the command message...
                        //  concat a different number here.
                        //  read it as a different number to see its a buffer.
                        return x;

                        //return Buffer.concat([xas2(NONE).buffer, x]);
                    } else {
                        return x;
                    }
                });
                //console.log('2) arr_args', arr_args);

                // Encoding buffer to buffer and decoding should be fine.
                let buf_encoded_args = Binary_Encoding.encode_to_buffer(arr_args);
                //console.log('* buf_encoded_args', buf_encoded_args);
                this.missing_id = true;
                let buf_paging = new Paging.Record_Paging(a[2]).buffer;
                //console.log('buf_paging', buf_paging);
                this._buffer = Buffer.concat([xas2(command_id).buffer, buf_paging, buf_encoded_args]);
            }
        }
    }


    set id(value) {
        //this._id = value;
        //console.log('this.missing_id', this.missing_id);
        //console.log('set id value', value);

        if (this.missing_id) {
            this.missing_id = false;
            this._buffer = Buffer.concat([xas2(value).buffer, this._buffer]);
        } else {
            throw 'Command_Message ID has already been set';
        }
        //  
    }
    // message id, message type code(or command id), then the rest of the buffer is the message encoded according to the expected type, depending on the type code.
    //  in some cases it will be best to decode that message as a binary buffer.
    //   in other cases we save a few bytes over transmission because we know the types of the items (such as XAS2) and read them directly.
    //  Quite a lot of message type codes at present, correspond with the command names. Could have individual parser functions. Moving to standards would help make cleaner code.
    //   Also want an efficient protocol, but at this stage deem it best not to add further complexity, especially lower level encoding types.

    // Right now, want to use Command_Message for server-side parsing.

    get id() {
        if (this.missing_id) {
            return undefined;
        } else {
            let [res, pos] = xas2.read(this._buffer, 0);
            return res;
        }
    }
    get command_id() {
        let res, pos;
        if (this.missing_id) {
        } else {
            [res, pos] = xas2.skip(this._buffer, 0);

        }
        [res, pos] = xas2.read(this._buffer, pos);
        return res;
    }


    get paging() {
        let command_id;
        let res, pos;

        if (this.missing_id) {

        } else {
            [res, pos] = xas2.skip(this._buffer, 0);
        }
        [command_id, pos] = xas2.read(this._buffer, pos);
        let paging;
        // There is always a byte for paging / comm options.
        //if (map_paging_commands[command_id]) {
        [paging, pos] = Paging.read(this._buffer, pos);
        //}
        //  Otherwise, we use paging.no_paging
        return paging;
    }

    get buffer() {

        /*
        if (this.missing_id) {
            return Buffer.concat([this._buffer]);
        } else {
            return this._buffer;
        }
        */

        return this._buffer;
    }

    // The inner message, but as separare arr rows
    //  Need to handle index rows, db rows, incrementor rows


    // inner message buffer
    //  then it gets parsed according to that particlar command id.

    get inner_message_buffer() {
        let command_id;
        let res, pos;
        if (this.missing_id) {

        } else {
            [res, pos] = xas2.skip(this._buffer, 0);
        }
        [command_id, pos] = xas2.read(this._buffer, pos);
        let paging;
        [paging, pos] = Paging.read(this._buffer, pos);
        let buf_res = Buffer.alloc(this._buffer.length - pos);
        this._buffer.copy(buf_res, 0, pos);
        return buf_res;
    }

    decode_inner() {
        let imb = this.inner_message_buffer;
        //console.log('imb', imb);

        let arr_decoded_stage = Binary_Encoding.decode_buffer(this.inner_message_buffer);

        // not sure it needs to be multi-stage

        //console.log('arr_decoded_stage', arr_decoded_stage);
        //console.trace();

        // Can't have further decoding of these buffers.
        //  A prefix saying they are rows or records would need to be part of Binary_Encoding.

        // Could incorporate extended types into Binary_Encoding.

        // Binary_Encoding.extend(class, i_prefix);
        //  So it gets extended to handle B_Key etc

        // just use Binary_Encoding here.

        let arr_decoded = buffer_backed.decode_args_buffers(arr_decoded_stage);
        //console.log('arr_decoded', arr_decoded);
        return arr_decoded;
    }

    // Decodes it...
    get inner() {
        return this.decode_inner();
    }
}


module.exports = Command_Message;