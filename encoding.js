var lang = require('lang-mini');
var each = lang.each;
var get_a_sig = lang.get_a_sig;
var clone = lang.clone;
var tof = lang.tof;
const is_defined = lang.is_defined;


const Binary_Encoding = require('binary-encoding');

// This code will generally cover binary <=> js obj conversion, specifically for the structures used by NextLevelDB.


// xas2, bin enc



var buffer_to_buffer_pairs = (buf_encoded) => {
    // read xas2, see the length of the row

    var pos = 0,
        length, l = buf_encoded.length;
    var old_pos;
    var done = false;
    var res = [];
    var arr_row;

    //console.log('buf_encoded', buf_encoded);
    while (!done) {
        [length, pos] = xas2.read(buf_encoded, pos);
        var buf_key = Buffer.alloc(length);
        buf_encoded.copy(buf_key, 0, pos, pos + length);
        pos = pos + length;

        [length, pos] = xas2.read(buf_encoded, pos);
        var buf_value = Buffer.alloc(length);
        buf_encoded.copy(buf_value, 0, pos, pos + length);
        pos = pos + length;
        arr_row = [buf_key, buf_value];
        //console.log('arr_row', arr_row);
        //cb_row(arr_row);
        res.push(arr_row);
        if (pos >= l) {
            done = true;
        }
    }
    //var res = [buf_key, buf_value];
    return res;
}



// Decode


// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~\\

var decode_key = (buf_key) => {
    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    var decoded_key;
    //if (key_1st_value % 2 === 0) {
    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.
        decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
    } else {
        // odd, meaning indexes, so 2 prefixes. Includes the incrementors.
        decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
    }
    return decoded_key;
}

// encode key
//  encode index key
//   index_kp, index_id, arr_index_values

var encode_index_key = (index_kp, index_id, arr_index_values) => {
    var res = Binary_Encoding.encode_to_buffer(arr_index_values, index_kp, index_id);
    return res;
}
var encode_key = (kp, arr_values) => {
    var res = Binary_Encoding.encode_to_buffer(arr_values, kp);
    return res;
}

var decode_keys = lang.arrayify(decode_key);

var decode_model_row = (model_row, remove_kp) => {

    //console.log('model_row', model_row);

    var buf_key = model_row[0];
    var buf_value = model_row[1];
    var value = null;
    // Decode buffer could tell from odd or even.
    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    if (buf_value) {
        // Could have an empty buffer as a value.
        //  That seems wrong so far though.

        if (key_1st_value === 0) {

            //let decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            //console.log('decoded_key', decoded_key);


            if (buf_value.length > 0) {
                value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
            } else {
                value = null;
            }


        } else {

            if (key_1st_value % 2 === 0) {
                value = Binary_Encoding.decode_buffer(buf_value);
            } else {

                // I think index records have values???
                //value = Binary_Encoding.decode_buffer(buf_value);
            }

            // indexed lacking values?




        }
    }
    // not all of them are 2 deep for indexes though.
    //  That's where it's a bit tricky.
    //   Table records have got 1 xas2 prefix
    //   Table index records have got 2 xas prefixes.
    //    We need to know which is which.
    //  Could say one is odd, the other is even.
    //   That seems like the best way to differentiate between them for the moment.

    // Just can't read it with 2 prefixes as we don't know it has that many.

    //console.log('key_1st_value', key_1st_value);
    var decoded_key;
    //if (key_1st_value % 2 === 0) {
    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.
        //console.log('buf_key', buf_key);

        // Seems like data was encoded wrong in the table buffer.

        decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
    } else {
        try {

            //console.log('buf_key', buf_key);
            decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
        } catch (err) {

            throw 'stop';
            decoded_key = '[DECODING ERROR: ' + err + ']';
        }
    }
    if (remove_kp) {
        decoded_key.splice(0, remove_kp);
    }
    //console.log('[decoded_key, value]', [decoded_key, value]);
    return [decoded_key, value];
    //console.log('decoded_record', decoded_record);
}

/*

var from_buffer = (buf) => {
    console.log('from_buffer\n----------\n');

    Binary_Encoding.evented_get_row_buffers(buf, (arr_row) => {
        //console.log('arr_row', arr_row);

        var decoded_row = decode_model_row(arr_row);
        console.log('decoded_row', decoded_row);

        // However, may need to put together the system tables anyway.
        //  These rows could have values useful for setting some records, but there may be the most basic system model that we need first?
        //  It may be possible to recreate the core model out of the data we have been provided.

        // However, we may not really want to recreate the core from a buffer.
        //  The core would be used to properly process other data that comes in.
        // May want to ignore the core items...
        //  May be easiest to add the rest of the tables once the core is in place.
        // The tables table, beyond the first three rows so far, contains non-system information.
    })
}
*/

var decode_model_rows = (model_rows, remove_kp) => {
    var res = [];
    //console.log('model_rows', model_rows);
    each(model_rows, (model_row) => {
        //console.log('model_row', model_row);
        // Incrementors look OK so far.
        //  Let's see how records (keys and values), as well as index records (keys and values) decode with the multi-decoder.
        //console.log('pre decode');
        let decoded = decode_model_row(model_row, remove_kp);
        //console.log('decoded', decoded);
        res.push(decoded);
        //throw 'stop';
        //console.log('post decode');
    });
    return res;
}




// Need to express more about key prefix handling.

// Convert array records to kp notation
// Add a given key prefix
// 


// Need the right language to talk about the different arrangements of row information.

//  DB Rows Encoding (records encoding)
//   Array of KV buffer pairs
//   Array of buffers (encoded records / rows)
//   Single buffer
//  DB Row Encoding (record encoding)
//   buffer pair
//   kv buffer
//   k buffer
//  Array Record
//   db row (full)
//    handle incrementors, table records, and indexes
//   table row (without the table kp, but there needs to be some way to identify the table)

// index rows as arrays



// When encoding, may need to set the number of kps to encode, or whether or not to encode them.

// Making longer and clearer function names with the above vocabulary would be helpful/

// Encode = JS => Binary, Decode = Binary => JS.

// More clearly named functionality will help here.


//  makes clear its a single buffer
// encode_rows_including_kps_to_buffer
// 

// Determines how many kps there are based on if the first kp is odd or event


// encode_kv_pair_to_kv_buffer_pair;

let encode_kv_pair_to_kv_buffer_pair = function (arr_pair, key_prefix) {

    //console.log('arr_pair, key_prefix', arr_pair, key_prefix);


    var a = arguments;
    //console.log('a.length', a.length);
    //console.log('a', a);
    //console.log('arguments.length', arguments.length);

    var arr_xas2_prefix_numbers = [];

    if (a.length >= 2) {
        for (var c = 1; c < a.length; c++) {
            //console.log('c', c);
            //console.log('a[c]', a[c])
            if (is_defined(a[c])) arr_xas2_prefix_numbers.push(a[c]);
        }
    }

    var prefix_buffers = [];

    each(arr_xas2_prefix_numbers, (prefix_number) => {
        prefix_buffers.push(xas2(prefix_number).buffer);
    });
    var res_key_0 = Binary_Encoding.encode_to_buffer(arr_pair[0]);
    prefix_buffers.push(res_key_0);

    //console.log('prefix_buffers', prefix_buffers);

    var res_key = Buffer.concat(prefix_buffers);
    var res_val = Binary_Encoding.encode_to_buffer(arr_pair[1]);
    var res = [res_key, res_val];
    return res;


}





// encode_arr_rows_to_buf


let encode_row_including_kps_to_buffer = row => {
    // row even or odd.

    let row_kp = row[0][0];
    let res;

    //console.log('row_kp', row_kp);

    if (row_kp % 2 === 0) {
        // even (including 0)

        // if it's 0, it's just got one kp field to start.

        // let row.unshift(row_kp);


        if (row_kp === 0) {
            //console.log('row[0]', row[0]);

            row_kp = row[0].shift();
            //console.log('row_kp', row_kp);
            let incrementor_id = row[0].shift();


            //console.log('row_kp', row_kp);
            //console.log('incrementor_id', incrementor_id);
            //throw 'stop';

            let kv_buffer_pair = encode_kv_pair_to_kv_buffer_pair(row, row_kp, incrementor_id);

            //console.log('row', row);
            //console.log('1) kv_buffer_pair', kv_buffer_pair);
            //throw 'stop';


            let row_enc = encode_kv_buffer_pair(kv_buffer_pair);
            //console.log('row_enc', row_enc);
            //throw 'stop';
            return row_enc;
        } else {
            row_kp = row[0].shift();

            let kv_buffer_pair = encode_kv_pair_to_kv_buffer_pair(row, row_kp);
            //console.log('2) kv_buffer_pair', kv_buffer_pair);
            let row_enc = encode_kv_buffer_pair(kv_buffer_pair);


            //console.log('row_enc', row_enc);

            return row_enc;
        }





    } else {
        // odd, so it's an index row with 2 kps
        //console.log('row', row);
        //console.trace();

        row_kp = row[0].shift();
        let idx_id = row[0].shift();
        let kv_buffer_pair = encode_kv_pair_to_kv_buffer_pair(row, row_kp, idx_id);
        let row_enc = encode_kv_buffer_pair(kv_buffer_pair);
        //console.log('row_enc', row_enc);
        //throw 'stop';
        return row_enc;



        // It's an index, has a value too, 


        // has 2 kps.




        //throw 'NYI';
    }


}


let encode_rows_including_kps_to_buffer = rows => {
    let res = [];
    each(rows, row => res.push(encode_row_including_kps_to_buffer(row)));

    // flatten the array....


    return Buffer.concat(res);
}




// Get this working, then sync the database
//  Will have a database that stays up-to-date locally with the data gathered.
//  Then will do analysis and verification of the db.






// encode_kv_buffer_pair
// encode_kv_buffer_pairs

// This function should probably be renamed to something very specific.
var encode_kv_buffer_pair = (model_row) => {
    //console.log('encode_kv_buffer_pair model_row', model_row);


    // Option about encoding as key prefixes, using the db style of doing it.
    //  Key prefix style just puts in XAS2 values, 


    // Need to expand this so that it handles model rows in array format?


    if (model_row instanceof Buffer) {
        var arr_res = [xas2(model_row.length).buffer, model_row, xas2(0).buffer];
    } else {


        // look at the types of each of them.
        //  different if it's a buffer or an array.
        //  The array itself will need to be encoded.


        // In this case, encode it to 


        //console.log('model_row[1]', model_row[1]); // The values

        if (model_row[1]) {
            var arr_res = [xas2(model_row[0].length).buffer, model_row[0], xas2(model_row[1].length).buffer, model_row[1]];
        } else {
            // Value is null / no value set, all index rows are like this.
            var arr_res = [xas2(model_row[0].length).buffer, model_row[0], xas2(0).buffer];
        }
    }
    //console.log('arr_res', arr_res);
    return Buffer.concat(arr_res);
}


var encode_kv_buffer_pairs = (model_rows) => {
    var res = [];

    each(model_rows, (model_row) => {
        res.push(encode_kv_buffer_pair(model_row));
    });

    return Buffer.concat(res);
}

var get_arr_rows_as_buffer = (arr_rows) => {
    // for every row, encode it using the Binary_Encoding.

    // They may not have the table key prefix?

}


// Encode rows, but with the key prefix already there as the first 1 or 2 items
// Indexes (odd kp) have got 2 key prefixes. The second is the index number.

var encode_arr_rows_to_buf = (arr_rows, key_prefix) => {
    var res = [];
    each(arr_rows, (row) => {
        // encode_model_row
        res.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(row, key_prefix)));
    });
    return Buffer.concat(res);
}


let Database_Encoding = {



    'encode_model_row': encode_kv_buffer_pair,
    'encode_model_rows': encode_kv_buffer_pairs,

    'encode_kv_buffer_pair': encode_kv_buffer_pair,
    'encode_kv_buffer_pairs': encode_kv_buffer_pairs,

    'encode_arr_rows_to_buf': encode_arr_rows_to_buf,
    'encode_kv_pair_to_kv_buffer_pair': encode_kv_pair_to_kv_buffer_pair,
    'encode_pair_to_buffers': encode_kv_pair_to_kv_buffer_pair,
    'encode_index_key': encode_index_key,
    'encode_row_including_kps_to_buffer': encode_row_including_kps_to_buffer,
    'encode_rows_including_kps_to_buffer': encode_rows_including_kps_to_buffer,

    'decode_model_rows': decode_model_rows,
    'decode_model_row': decode_model_row,

    'encode_key': encode_key,

    'decode_key': decode_key,
    'decode_keys': decode_keys,

    'buffer_to_buffer_pairs': buffer_to_buffer_pairs,

    'encode': {
        'key': encode_key,
        'encode_kv_buf_pair': encode_kv_buffer_pair,
        'encode_kv_buf_pairs': encode_kv_buffer_pairs,
        'arr_rows': encode_arr_rows_to_buf
    },
    'decode': {
        'key': decode_key,
        'keys': decode_keys,
        'model_row': decode_model_row,
        'model_rows': decode_model_rows
    }

}

module.exports = Database_Encoding;