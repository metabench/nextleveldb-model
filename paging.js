// Note: This has gone way beyond just describing paging options, it's a useful part of the system that's being refactored to handle a variety of options.
//  Expanding this allows for protocol changes while retaining backwards compatabiliy.
//  New, and simpler to call ways can be made, and the old code removed later on and still used for the moment, for the most part.
//   Such as specifying a 'limit' option with the count function.


// Want to make paging system easy to use, reading from binary buffer that represents a query.
//  Using OO query parsing on the server may well be better.
//   Easier to test. Queries get created on the client, and can be parsed there to see if the parsing works correctly.


var xas2 = require('xas2');
let x = xas2;
let Binary_Encoding = require('binary-encoding');

const NO_PAGING = 0;
const PAGING_RECORD_COUNT = 1;
const PAGING_KEY_COUNT = 2;
// Followed by p number
const PAGING_BYTE_COUNT = 3;
const PAGING_TIMED = 4;

const PAGING_AND_EXTENDED_OPTIONS = 5;





// This is going to allow extended options, such as limit and reverse.
//  Want it so that it recognises that there are extended paging / results options, and then provides the data in that kind of way.




// Paging objects could raise events themselves. ???
//  Reverse and limit within paging options would be cool.



// This will be used to make it easier to get the last value range.
//  Allows more options to be encoded into the query, while maintaining backwards compatability.
//  Direction and limit are options that are worth having as parameters.

// Maybe better to change to OO paging reading right now.

// Seems less important with get_last_key_in_table but it would be a useful feature nevertheless.



// Server Return Processing.
//  Will cover more than just paging, such as removal of KPs from keys / records.
//  Set remove kp to be true, then it renders the buffer differently.
//   On the server-side, it will be parsed differently to include more paging / return options.
//   Will parse it as a Binary_Encoded array.
//  This is part of the system that will save on code complexity in the server's binary response handler.
//   Middleware using this will enable responses to be specified cleanly and in terms of the inner server function that gets called.



// A 'limit' arg for paging and options could be useful.



// page_size, remove_kp, decode, limit
// could all be booleans, with the values then given

// Easiest just to encode all of these into a buffer.
//  Some more work on Paging / Options writing and parsing will be useful.
//  Use this code on both the client and the server.







class Paging {
    'constructor' (spec) {




    }
    get buffer() {

        let using_extended_options = false;

        if (this.remove_kp !== undefined || this.remove_kps !== undefined || this.limit > 0) {
            using_extended_options = true;
        }



        // Probably will need to extend the extended options some more?
        // Right now, it is an array with a number of args.

        // Moving away from record or key or binary paging?
        //  That helps us know what type of data it it.
        //   It's not really the type of paging.


        if (using_extended_options) {

            let ptb = xas2(PAGING_AND_EXTENDED_OPTIONS).buffer;
            let ptb2 = xas2(this.paging_type).buffer;

            let arr_args = [];

            if (this.paging_type === NO_PAGING) {
                //return xas2(NO_PAGING).buffer;


            } else {
                arr_args.push(this.page_size || 0);

                // 
                //return Buffer.concat([xas2(this.paging_type).buffer, xas2(this.page_size).buffer]);
            }

            arr_args.push(this.remove_kp || false);

            // optional 3rd argument being the limit?
            //  could leave it null if it's not there.

            if (this.limit > 0) {
                arr_args.push(this.limit);
            }
            let buf_args = Binary_Encoding.encode_to_buffer(arr_args);

            //console.log('[ptb, ptb2, buf_args]', [ptb, ptb2, buf_args]);

            return Buffer.concat([ptb, ptb2, buf_args]);


        } else {
            if (this.paging_type === NO_PAGING) {
                return xas2(NO_PAGING).buffer;
            } else {

                // 

                // Can't include limit like this.


                return Buffer.concat([xas2(this.paging_type).buffer, xas2(this.page_size).buffer]);
            }

        }


    }

    decode_inner() {
        return Binary_Encoding.decode_buffer(this.buffer);
    }
}

// Changing to item count paging may work better.
//  Getting rid of key paging effectively.
//  We get n of them, records or keys, and then sort out the paging as appropriate.
//   

class No_Paging extends Paging {
    'constructor' (num_records) {
        super();
        this.paging_type = NO_PAGING;
    }
}

// Record_Paging will change to Count_Paging
class Record_Paging extends Paging {
    'constructor' (num_records) {
        super();
        this.num_records = num_records;
        this.page_size = num_records;
        this.paging_type = PAGING_RECORD_COUNT;
    }
}

class Key_Paging extends Paging {
    'constructor' (num_keys) {
        console.log('DEPRACATION WARNING: Key_Paging');
        super();
        this.num_keys = num_keys;
        this.page_size = num_keys;
        this.paging_type = PAGING_KEY_COUNT;
    }
}

// Byte paging will send complete records though.

class Byte_Paging extends Paging {
    'constructor' (num_bytes) {
        super();
        this.num_bytes = num_bytes;
        this.page_size = num_bytes;
        this.paging_type = PAGING_BYTE_COUNT;
    }
}

class Timed_Paging extends Paging {
    'constructor' (ms_delay) {
        super();
        this.ms_delay = ms_delay;
        this.page_size = ms_delay;
        this.paging_type = PAGING_TIMED;
    }
}



Paging.read_buffer = function (buf, pos = 0) {
    //console.log('read_buffer buf', buf);
    var paging_option, page_size = 0;
    [paging_option, pos] = x.read(buf, pos);
    //console.log('paging_option', paging_option);



    if (paging_option > 0) {

        if (paging_option === PAGING_AND_EXTENDED_OPTIONS) {
            let sub_paging_option;
            [sub_paging_option, pos] = x.read(buf, pos);
            let decoded_args = Binary_Encoding.decode_buffer(buf, 0, pos);
            //console.log('1) decoded_args', decoded_args);
            page_size = decoded_args.shift();
            let remove_kps = decoded_args.shift();

            //console.log('page_size', page_size);
            //console.log('remove_kps', remove_kps);
            //console.log('2) decoded_args', decoded_args);
            // These decoded args would provide non-paging args too.
            pos = buf.length;
            return [sub_paging_option, page_size, pos, remove_kps, decoded_args];
        } else {
            [page_size, pos] = x.read(buf, pos);

        }

    } else {

    }
    return [paging_option, page_size, pos, false];

}


let Paging_By_Option = {
    0: No_Paging,
    1: Record_Paging,
    2: Key_Paging, // Will be depracated
    3: Byte_Paging,
    4: Timed_Paging


}

Paging.read = function (buf, pos = 0) {
    //console.log('read buf', buf);



    let paging_option, page_size, remove_kps, decoded_args;
    [paging_option, page_size, pos, remove_kps, decoded_args] = Paging.read_buffer(buf, pos);
    //console.log('paging_option', paging_option);
    //console.log('page_size', page_size);
    //console.log('pos', pos);
    //console.log('Paging_By_Option', Paging_By_Option);
    //console.log('Paging_By_Option[paging_option]', Paging_By_Option[paging_option]);

    //if ()
    let paging = new Paging_By_Option[paging_option](page_size);
    if (remove_kps) {
        paging.remove_kps = true;
    }
    if (decoded_args) {
        paging.args = decoded_args;
    }
    return [paging, pos];
}



Paging.No_Paging = No_Paging;
Paging.No = No_Paging;
Paging.None = No_Paging;

// Going to remove Record Paging and Key Paging.
///  Rather, change Record_Paging to Count_Paging, remove Key_Paging.

Paging.Record_Paging = Record_Paging;
Paging.Record = Record_Paging;
Paging.Count_Paging = Record_Paging;
Paging.Count = Record_Paging;

Paging.Key_Paging = Key_Paging;
Paging.Key = Key_Paging;

Paging.Byte_Paging = Byte_Paging;
Paging.Byte = Byte_Paging;

Paging.Timed_Paging = Timed_Paging;
Paging.Timed = Timed_Paging;

module.exports = Paging;