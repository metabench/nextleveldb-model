// Will be based around the buffer.
//  Lazy reading of the buffer values where possible.

// Maybe the Command_Message could itself have events.


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

// Not so sure that this should process events.


//class Command_Message extends Evented_Class {

// Read the message id etc






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


// Being able to batch messages into one would be useful.


class Command_Message {
    constructor(spec) {

        let a = arguments;
        let l = a.length;

        if (l === 1) {
            let t_spec = tof(spec);

            if (t_spec === 'buffer') {
                this._buffer = spec;

            }
        } else {
            // The command itself

            // Optional paging option

            // Maybe some kind of info about what return type it will get

            // The parameters.

            // Then will be transmitted as binary and decoded on the server.





        }



        // Have some assistance in building the command.


        // building the command message out of arrays / other things.
        //  has its paging and communication options, then its method call args.


    }



    // message id, message type code(or command id), then the rest of the buffer is the message encoded according to the expected type, depending on the type code.
    //  in some cases it will be best to decode that message as a binary buffer.
    //   in other cases we save a few bytes over transmission because we know the types of the items (such as XAS2) and read them directly.
    //  Quite a lot of message type codes at present, correspond with the command names. Could have individual parser functions. Moving to standards would help make cleaner code.
    //   Also want an efficient protocol, but at this stage deem it best not to add further complexity, especially lower level encoding types.

    // Right now, want to use Command_Message for server-side parsing.

    get id() {
        let [res, pos] = xas2.read(this._buffer, 0);
        return res;
    }
    get command_id() {
        let [res, pos] = xas2.skip(this._buffer, 0);
        [res, pos] = xas2.read(this._buffer, pos);
        return res;
    }


    get paging() {
        let command_id;

        let [res, pos] = xas2.skip(this._buffer, 0);
        [command_id, pos] = xas2.read(this._buffer, pos);

        let paging;

        // There is always a byte for paging / comm options.

        //if (map_paging_commands[command_id]) {
        [paging, pos] = Paging.read(this._buffer, pos);
        //}
        //  Otherwise, we use paging.no_paging


        return paging;
    }

    // The inner message, but as separare arr rows
    //  Need to handle index rows, db rows, incrementor rows


    // inner message buffer
    //  then it gets parsed according to that particlar command id.

    get inner_message_buffer() {

        // paging option could come before this.
        //  Not every message has this.
        //  This paging option is more like message communication options / communication options / comm_opts / opt_comms / o_comm / comm
        //   Still call it 'Paging' for the moment, could rename it. Comm_Opts Comm_Options makes sense.


        let command_id;




        let [res, pos] = xas2.skip(this._buffer, 0);
        [command_id, pos] = xas2.read(this._buffer, pos);


        let paging;

        // Always read the paging option.

        //if (map_paging_commands[command_id]) {
        // read the paging object

        // Paging skip would be cool too.



        // Future: replace with paging.skip
        [paging, pos] = Paging.read(this._buffer, pos);
        //}

        // Need to read the paging option.
        //  Depending on its length, may skip it.
        //  May need to read it to get its length?
        //   Should be possible to read it in a way that skips through.

        // Not every command carries the paging option though.






        let buf_res = Buffer.alloc(this._buffer.length - pos);
        this._buffer.copy(buf_res, 0, pos);


        return buf_res;
    }

    decode_inner() {
        console.log('this.inner_message_buffer', this.inner_message_buffer);
        return Binary_Encoding.decode_buffer(this.inner_message_buffer);
    }

    get inner() {
        return this.decode_inner();
    }



}


module.exports = Command_Message;