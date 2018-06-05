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

        // This should probably have a message_id assigned.
        //  It could be optional.

        // Or leave it out for the moment as it gets added on send.

        let a = arguments;
        let l = a.length;

        if (l === 1) {
            let t_spec = tof(spec);
            if (t_spec === 'buffer') {
                this._buffer = spec;
            }
        } else if (l === 2) {

            // Need another buffer part for 'no paging'
            // No paging so far.

            // Possibly there will be server default paging in various cases.


            // Message id is not included to start with

            // We may want paging to be standard here.
            //  It's paging and other communications options.

            // Send paging.count_paging if we give another number
            //  Server could have its own max and min page sizes too.
            //  Here it is the client choosing.

            // could say 'true' when there is paging too.



            if (typeof a[0] === 'number' && Array.isArray(a[1])) {
                //console.log('Command_Message constructor arguments', arguments);
                //let [command_id, [table_id, b_record]] = arguments;
                //console.log('[command_id, [table_id, b_record]]', [command_id, [table_id, b_record]]);

                let [command_id, arr_args] = arguments;

                //console.log('[command_id, arr_args]', [command_id, arr_args]);

                // have something as 0 for no paging or extended options.


                // 0 for NO_PAGING or other comm options
                // // need to encode the args includinf Record to Buffer OK.
                //  

                // When encoding the object with a .buffer.


                //console.log('arr_args', arr_args);
                let buf_encoded_args = Binary_Encoding.encode_to_buffer(arr_args);
                //console.log('buf_encoded_args', buf_encoded_args);

                /*
                try {
                    let buf_decoded_args = Binary_Encoding.decode_buffer(buf_encoded_args);
                    console.log('buf_decoded_args', buf_decoded_args);
                } catch (err) {
                    console.trace();
                    console.log('err', err);
                }
                */


                // But we have not given it a command id (yet)
                //  Best to do that just before sending.
                //this._id = undefined;

                // Hard to include undefined buffer.
                //  Special characters extension in xas2? Allowing undefined.

                // saying that it's missing the id?
                this.missing_id = true;
                // 

                let buf_paging = new Paging.No_Paging().buffer;



                //console.log('buf_paging', buf_paging);

                this._buffer = Buffer.concat([xas2(command_id).buffer, buf_paging, buf_encoded_args]);

                //this._buffer = Buffer.concat([xas2(command_id).buffer, xas2(0).buffer,]);



                // Then depending on the command itself it can have different construction.



                // Simplest construction is command, then param

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

                // However, this uses buffer sub-encoding when reading the results.

                // so for every array arg, if it's a buffer, then prepend it with 0
                //  xas2 for simple buffer.

                // as we use decode_args_buffer
                //  this decodes internal buffers.

                // encode to buffer, but each buffer has got a 0 prefix.

                // for the moment...

                // but these all get encoded to a single buffer.
                // no buffers inside them

                // Should not have such a problem decoding the Command_Buffer.


                arr_args = arr_args.map(x => {
                    //console.log('arr_args x', x);
                    if (x instanceof Buffer) {
                        return Buffer.concat([xas2(0).buffer, x]);
                    } else {
                        return x;
                    }
                });


                let buf_encoded_args = Binary_Encoding.encode_to_buffer(arr_args);
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

        //let [res, pos] = xas2.skip(this._buffer, 0);
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

        // paging option could come before this.
        //  Not every message has this.
        //  This paging option is more like message communication options / communication options / comm_opts / opt_comms / o_comm / comm
        //   Still call it 'Paging' for the moment, could rename it. Comm_Opts Comm_Options makes sense.
        //console.log('Command_Message inner_message_buffer');

        let command_id;

        let res, pos;
        //console.log('this.missing_id', this.missing_id);

        if (this.missing_id) {

        } else {
            [res, pos] = xas2.skip(this._buffer, 0);
        }

        // the buffer could be missing its initial xas2 message_id.

        //let [res, pos] = xas2.skip(this._buffer, 0);
        [command_id, pos] = xas2.read(this._buffer, pos);
        //console.log('command_id', command_id);
        let paging;

        // Always read the paging option.

        //if (map_paging_commands[command_id]) {
        // read the paging object

        // Paging skip would be cool too.

        // Did we read the paging here?
        //  Was it included in the Command_Message?
        //  Seems possibly not.

        // Future: replace with paging.skip
        //console.log('1) pos', pos);
        [paging, pos] = Paging.read(this._buffer, pos);
        //}
        //console.log('2) pos', pos);

        //console.log('paging', paging);

        // Need to read the paging option.
        //  Depending on its length, may skip it.
        //  May need to read it to get its length?
        //   Should be possible to read it in a way that skips through.

        // Not every command carries the paging option though.
        // 
        //


        let buf_res = Buffer.alloc(this._buffer.length - pos);
        this._buffer.copy(buf_res, 0, pos);

        //console.log('inner_message_buffer buf_res', buf_res);

        return buf_res;
    }

    decode_inner() {

        // Specific type encoding for different types
        //  Sometimes it's not a normal buffer.
        //  It's a bit of a hack.
        //   Should be OK.

        // There should always be such a prefix in the inner buffer???


        // Should handle decoding a record with a missing key.


        //console.log('this.inner_message_buffer', this.inner_message_buffer);

        // Says its a string for some reason.


        // There is an extra byte saying what type is encoded inside.
        //  Has extra encoding inside one of the buffers.
        //   An extra xas2 inside a buffer that is the args.
        //   However, want to decode it just as buffers to begin with.
        //    Command message argument buffers will all have another xas2 prefix

        // Maybe this can be solved with a Typed_Buffer type
        //  It decodes it as a buffer using Binary_Encoding, but provides extra type info as a number.

        // XAS2_TYPED_BUFFER
        //  That seems like it would be a good Binary_Encoding type to avoid confusion with normal buffers.
        //   Can then have a 2nd level of decoding outside of Binary_Encoding.

        // Has got more complicated now we want to run types such as BB_Record through Binary_Encoding.

        // Not sure this message has been built correctly so far.
        // One such buffer has got an additional starting character.


        // May be a problem decoding these buffers.
        //  Internally there may be different encodings depending on how the message is encoded.



        let arr_decoded_stage = Binary_Encoding.decode_buffer(this.inner_message_buffer);
        // decode buffers in array of params, 

        // This required items in the Command_Message to have a specific type of encoding.
        //  Could have a prefix for no encoding. Think that is 0. Need to check that it gets used.
        //   Optional extra buffer encoding type prefix.



        let arr_decoded = buffer_backed.decode_args_buffers(arr_decoded_stage);
        //console.log('arr_decoded', arr_decoded);


        // then there will be buffer-backed from_buffer
        //  just from


        return arr_decoded;

    }

    // Decodes it...
    get inner() {
        return this.decode_inner();
    }



    // .decoded





}


module.exports = Command_Message;