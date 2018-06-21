var lang = require('lang-mini');
var each = lang.each;
var get_a_sig = lang.get_a_sig;
var clone = lang.clone;
var tof = lang.tof;
const is_defined = lang.is_defined;

const Evented_Class = lang.Evented_Class;

const Binary_Encoding = require('binary-encoding');
const xas2 = require('xas2');


// Not working here.
//let B_Record = require('./buffer-backed/record');

// Possibly need a version of Binary_Encoding that handles NextLevelDB types
//  but it makes it less general.

// Binary_Encoding plugin functions look like the right way to add encoding for the moment.
// Defining a custom range would help. There are not that many types in Binary_Encoding anyway.

// Then there can be NextLevelDB_Binary_Encoding, which will have the plugins loaded.




// May make a new module dor the database encoding, focusing on encode and decode.







// This code will generally cover binary <=> js obj conversion, specifically for the structures used by NextLevelDB.
// xas2, bin enc

/*

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

*/

// Decode


// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~\\

// Option to drop the kp

// Seems worth making more functionality to test live database tables and records.
//  Have had at least one record added wrong in bittrex markets.
//  Could test decoding of all records, if we find a problem, raise it in the observable.
//  Could also be careful when syncing all / core / structural records that they get added correctly.
//   I doubt there will be many more problems after this, but it seems as though checking and data reclamation is the next order of business.
//    Could take a little while as well.

// error_scan
//  fix errors

// Modelling the errors seems like it would be useful as well.
//  Could compose an OO list of errors, then display them, propose a remedy, and carry it out.

//  Checking for orpaned rows
//   Could model mistakes made (record added with wrong id, should be x), and then redo it?

// For the moment, best to do this upon db starting up.
//  Or could do the error scan (or some of it) from the client.
//   Could get low level rows and check them
//    



// Check table
// 



// check for whether keys can or can't be decoded.
//  have had problem when new coin has launched on bittrex.
//  If a record has been added wrong, may need to delete it, may be able to fix it.

// Be able to replace a record's key.

// client side safety check - get all keys, then check they have been formed properly.
//  Inconveniently, it seems like the new market for a new coin has been added wrong.

// scan_table_keys
//  will raise an event for any malformed keys.
//   To fix it - find any records that reference this key. Change them to reference something different.
//   Seems like this will be multi-part checking and changing data. A somewhat large undertaking here.
//    Changing many rows from one thing to another would take a while, for sure.







// May need to be about how to recover the good data from the DB.








var decode_key = (buf_key, remove_kp = false) => {

    //console.log('4) remove_kp', remove_kp);

    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    var decoded_key;
    //if (key_1st_value % 2 === 0) {
    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.

        //console.log('buf_key', buf_key);
        //console.log('key_1st_value', key_1st_value);

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
}

var key_length = (buf_key) => {
    let pos = 0,
        key_1st_value;
    [key_1st_value, pos] = xas2.read(buf_key, pos);

    // 0th value really here.

    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        return Binary_Encoding.count_encoded_items(buf_key, pos);

        // 

    } else {
        throw 'NYI';
    }

}

// Still encoded

let key_value_at = (buf_key, idx) => {
    let pos = 0,
        key_1st_value;
    [key_1st_value, pos] = xas2.read(buf_key, pos);


    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.

        //console.log('buf_key', buf_key);
        //console.log('pos', pos);

        // Then skip through, or better count the items.
        //  Including skipping KPs.

        // count_encoded_items

        let ith_value = Binary_Encoding.get_value_at(buf_key, idx, pos);


        //let count = Binary_Encoding.count_encoded_items(buf_key, pos);
        //console.log('count', count);

        //return count;
        return ith_value;



        // 

    } else {

        // Will need to work to get this to handle index keys.
        throw 'NYI';
    }

}

// encode key
//  encode index key
//   index_kp, index_id, arr_index_values

//var encode_index_key = (index_kp, index_id, arr_index_values) => {
var encode_index_key = function (index_kp, index_id, arr_index_values) {

    let a = arguments,
        l = a.length,
        res;

    //console.log('l', l);
    //console.log('arguments', arguments);

    if (l === 1) {
        arr_index_values = a[0];
        //console.log('arr_index_values', arr_index_values);

        //index_kp = arr_index_values.shift();
        //index_id = arr_index_values.shift();

        //console.log('index_kp, index_id', index_kp, index_id);
        //res = Binary_Encoding.encode_to_buffer(arr_index_values, index_kp, index_id);
        res = Binary_Encoding.encode_to_buffer_use_kps(arr_index_values, 2);

    } else {
        res = Binary_Encoding.encode_to_buffer(arr_index_values, index_kp, index_id);
    }


    return res;
}

//

var encode_key = function (kp, arr_values) {

    // May have just given it an array...

    let a = arguments,
        res;
    //let sig = get_a_sig(a);

    if (a.length === 1) {
        let kp = a[0].shift();

        // then if it's an index...

        //console.log('kp', kp);

        if (kp % 2 !== 0) {
            // its odd, so an index
            let idx_id = a[0].shift();
            res = Binary_Encoding.encode_to_buffer(a[0], kp, idx_id);
        } else {
            res = Binary_Encoding.encode_to_buffer(a[0], kp);
        }




    } else {

        // Needs to be able to handle encoding an index key.



        res = Binary_Encoding.encode_to_buffer(arr_values, kp);
    }

    return res;
}

var decode_keys = lang.arrayify(decode_key);

// Maybe test this with the newest version of the DB server running.s

// 




// select_indexes_buffer_from_kv_pair_buffer

//  would do the index selection on both the key and the value, but not decoding the indexed values, only retrieving them.
//  Will have some more ways to process encoded data with minimal decoding.
//   That will be faster.


let select_indexes_buffer_from_kv_pair_buffer = (buf_kvp, remove_kp, arr_indexes) => {

    // Want to build up a single buffer of the indexed data. Don't decode the data along the way. Just select the data from it.






    // prob best to split it?
    //console.log('buf_kvp', buf_kvp);
    let arr_kvp = Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf_kvp)[0];
    //console.log('arr_kvp', arr_kvp);

    // Then do the selection on each

    var buf_key = arr_kvp[0];
    var buf_value = arr_kvp[1];


    //console.log('buf_key', buf_key);

    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    let buf_selected_key_fields, total_key_fields_count, buf_selected_value_fields, total_value_fields_count;

    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.
        //console.log('buf_key', buf_key);

        // Seems like data was encoded wrong in the table buffer.


        [buf_selected_key_fields, total_key_fields_count] = Binary_Encoding.buffer_select_from_buffer(buf_key, arr_indexes, 1, 1);
        //console.log('buf_selected_key_fields, total_key_fields_count', buf_selected_key_fields, total_key_fields_count);
        // We need to have the encoding method of xas2 encoded alongside this data.
        // The selected fields should be encoded alongside their types. Then before that is the length
        //  Need the right language for it too to avoid confusion.

        //throw 'stop';
        // then read the value part.
        //throw 'stop';
    } else {
        throw 'select_indexes_buffer_from_kv_pair_buffer NYI';
    }

    if (buf_value) {
        // Could have an empty buffer as a value.
        //  That seems wrong so far though.

        if (key_1st_value === 0) {

            //let decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            //console.log('decoded_key', decoded_key);


            throw 'NYI';

            /*

            if (buf_value.length > 0) {

                // Has difficulty doing this here.

                value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
            } else {
                //value = null;
                console.trace();
                throw 'stop';
            }
            */


        } else {

            if (key_1st_value % 2 === 0) {

                //console.log('buf_value', buf_value);

                [buf_selected_value_fields, total_value_fields_count] = Binary_Encoding.buffer_select_from_buffer(buf_value, arr_indexes, 0, 0, total_key_fields_count);
                //console.log('buf_selected_value_fields, total_value_fields_count', buf_selected_value_fields, total_value_fields_count);

                //console.log('selected_value_fields', selected_value_fields);
                //console.trace();
                //throw 'stop';

                //res = selected_key_fields.concat(selected_value_fields);

                res = Buffer.concat([buf_selected_key_fields, buf_selected_value_fields]);


            } else {

                throw 'NYI';

                // I think index records have values???
                //value = Binary_Encoding.decode_buffer(buf_value);
            }

            // indexed lacking values?




        }
    }


    //console.log('5) res', res);
    //throw 'stop';

    // use buffer_select_from_buffer

    return res;





}

let select_indexes_from_kvp_buffer = (buf_kvp, remove_kp, arr_indexes) => {

    // Want to build up a single buffer of the indexed data. Don't decode the data along the way. Just select the data from it.


    // prob best to split it?

    let bufs_kv = buffer_to_row_buffer_pairs(buf_kvp);
    console.log('bufs_kv', bufs_kv);



}



// And a means to do this without decoding?
//  Get that data back as binary encoded, ready to transmit?




// This looks like decode_select
//  could have buffer_select

let select_indexes_from_model_row = (model_row, remove_kp, arr_indexes) => {
    // Can consider the kp as the first index.

    let res;

    var buf_key = model_row[0];
    var buf_value = model_row[1];

    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);


    // Decode the key, and work out the number of key values
    let selected_key_fields, total_key_fields_count, selected_value_fields, total_value_fields_count;
    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.
        //console.log('buf_key', buf_key);

        // Seems like data was encoded wrong in the table buffer.

        console.log('buf_key', buf_key);

        // If we fail to decode the key?

        // Leave out decoding errors...
        //console.log('buf_key', buf_key);

        console.log('arr_indexes', arr_indexes);

        [selected_key_fields, total_key_fields_count] = Binary_Encoding.decode_buffer_select_by_index(buf_key, arr_indexes, 1, 1);
        console.log('selected_key_fields, total_key_fields_count', selected_key_fields, total_key_fields_count);


        // then read the value part.
        //throw 'stop';




    } else {
        throw 'select_indexes_from_model_row NYI';
    }




    if (buf_value) {
        // Could have an empty buffer as a value.
        //  That seems wrong so far though.

        if (key_1st_value === 0) {

            //let decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            //console.log('decoded_key', decoded_key);


            throw 'NYI';

            /*

            if (buf_value.length > 0) {

                // Has difficulty doing this here.

                value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
            } else {
                //value = null;
                console.trace();
                throw 'stop';
            }
            */


        } else {

            if (key_1st_value % 2 === 0) {

                // decode_buffer_select_by_index

                //value = Binary_Encoding.decode_buffer(buf_value);


                // Number of values to skip too...
                //  The key indexes are 0 based.
                //  The value indexes are based on the number of key fields.

                [selected_value_fields, total_value_fields_count] = Binary_Encoding.decode_buffer_select_by_index(buf_value, arr_indexes, 0, 0, total_key_fields_count);
                console.log('selected_value_fields, total_value_fields_count', selected_value_fields, total_value_fields_count);

                //console.log('selected_value_fields', selected_value_fields);
                //console.trace();
                //throw 'stop';

                res = selected_key_fields.concat(selected_value_fields);


            } else {

                throw 'NYI';

                // I think index records have values???
                //value = Binary_Encoding.decode_buffer(buf_value);
            }

            // indexed lacking values?




        }
    }

    return res;


}

var decode_model_row = (model_row, remove_kp) => {

    // The DB could have been started with broken xas2 values, possibly encoded wrong using an older version of the DB code.
    //  Not sure.

    //console.log('model_row', model_row);
    //console.log('B_Record', B_Record);

    //let r = new B_Record(model_row);

    /*
    if (remove_kp) {
        return r.decoded_no_kp;
    } else {
        return r.decoded;
    }
    */

    // if the model_row is a Record, then use the .decoded function




    //console.log('decode_model_row model_row', model_row);
    //console.log('B_Record', B_Record);


    if (model_row.kvp_bufs) {
        return model_row.decoded;
    } else {

        //console.log('remove_kp', remove_kp);

        var buf_key = model_row[0];
        var buf_value = model_row[1];
        var value = null;

        //console.log('buf_key', buf_key);
        //console.log('buf_value', buf_value);

        // Decode buffer could tell from odd or even.
        var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
        //console.log('key_1st_value', key_1st_value);
        if (buf_value) {
            // Could have an empty buffer as a value.
            //  That seems wrong so far though.

            if (key_1st_value === 0) {

                //let decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
                //console.log('decoded_key', decoded_key);


                if (buf_value.length > 0) {

                    // Has difficulty doing this here.

                    value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
                } else {
                    //value = null;

                    // It's an incrementor row.
                    //  Or an error making it appear that way

                    console.trace();
                    throw 'stop';
                }


            } else {

                if (key_1st_value % 2 === 0) {
                    value = Binary_Encoding.decode_buffer(buf_value);
                    //console.log('value', value);
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

            //console.log('buf_key', buf_key);

            // If we fail to decode the key?

            // Leave out decoding errors...
            //console.log('buf_key', buf_key);

            // Not sure why it's not able to decode the data in the buffer from the server.
            //  It's the key where there is the problem.
            //   Maybe it's missing a byte - not sure.

            // Not sure if any dodgy keys have got into the db.
            //  Could have a maintenance procedure that checks if all keys can be decoded.

            // Wonder if data has got corrupted again through bittrex adding a new coin.
            //  (another week's work???)

            // Verification that indexes can decode seems like a useful way of doing it.
            //  could have a can_decode function.


            // Client-side verification and fixing could prove to be useful.
            //  Tricky too maybe.

            // Client-side verification that the DB is in good running order makes sense.




            decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            /*
    
            try {
    
                // Maybe some records got written wrong in a db.
                //  Could do more of a safety check on startup, or something with a command, that removes any records that are mis-formed.
                //  Or just point them out.
    
                //console.log('buf_key', buf_key);
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
            } catch (err) {
                console.trace();
                throw 'stop';
                //decoded_key = '[DECODING ERROR: ' + err + ']';
                return null;
            }
            */




        } else {
            try {

                //console.log('buf_key', buf_key);
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
            } catch (err) {
                console.trace();
                throw 'stop';
                decoded_key = '[DECODING ERROR: ' + err + ']';
            }
        }
        if (remove_kp) {
            decoded_key.splice(0, remove_kp);
        }
        //console.log('[decoded_key, value]', [decoded_key, value]);


        return [decoded_key, value];
    }

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
    //console.log('model_rows.length', model_rows.length);

    // if there is only one model row....? Or one buffer.

    each(model_rows, (model_row) => {
        //console.log('model_row', model_row);
        // Incrementors look OK so far.
        //  Let's see how records (keys and values), as well as index records (keys and values) decode with the multi-decoder.
        //console.log('pre decode');


        let decoded = decode_model_row(model_row, remove_kp);
        //console.log('decoded', decoded);
        if (decoded) res.push(decoded);
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

    // If this is an incrementor though...
    //  May be best to throw an error because we don't use this type of encoding for incrementors

    // don't allow key prefix of 0?
    //  Seem to have a problem when we get the incrementors as records, and then encode them.



    //console.log('arr_pair, key_prefix', arr_pair, key_prefix);


    // can't have the first prefix as 0 and use this.
    let a = arguments;
    if (a[1] === 0) {
        throw 'Can not use encode_kv_pair_to_kv_buffer_pair to encode incrementor rows';
    }


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

    // but for incrementors, it just encodes the value as xas2.



    var res_val = Binary_Encoding.encode_to_buffer(arr_pair[1]);
    var res = [res_key, res_val];
    return res;


}



// Reading of incrementor records should always read them as XAS2.
//  This seems like an odd place for a bug, or inconsistncy with older codebase.
//  Need to get this fully working.

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


            // but for incrementors, it just encodes the value as xas2.

            //console.log('row[0]', row[0]);

            row_kp = row[0].shift();
            //console.log('row_kp', row_kp);
            let incrementor_id = row[0].shift();


            //console.log('row_kp', row_kp);
            //console.log('incrementor_id', incrementor_id);
            //throw 'stop';


            // Nope, it should encode the key, and just have an xas2 as the value.


            // encode incrementor key


            // Possibly the incrementor keys have been put into the DB wrong somehow.




            //let enc_key = encode_incrementor_key(row[0], row_kp, incrementor_id);
            //let enc_val = xas2(row[1][0]).buffer;

            //console.log('enc_key', enc_key);
            //console.log('enc_val', enc_val);


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





var buffer_to_row_buffer_pairs = (buf_encoded) => {
    // read xas2, see the length of the row

    let pos = 0,
        length, l = buf_encoded.length;
    let old_pos;
    let done = false;
    let res = [];
    let arr_row;
    let buf_key, buf_value;

    //console.log('buf_encoded', buf_encoded);
    while (!done) {
        [length, pos] = xas2.read(buf_encoded, pos);
        buf_key = Buffer.alloc(length);
        buf_encoded.copy(buf_key, 0, pos, pos + length);
        pos = pos + length;

        [length, pos] = xas2.read(buf_encoded, pos);
        buf_value = Buffer.alloc(length);
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

            if (model_row[0][0] === 0) {
                // It's an incrementor row


            } else {

            }


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
        res.push(encode_model_row(Binary_Encoding.encode_kv_pair_to_kv_buffer_pair(row, key_prefix)));
    });
    return Buffer.concat(res);
}





let obs_decode = (obs) => {
    //console.trace();
    //throw 'NYI';
    let res = new Evented_Class();
    obs.on('next', data => {
        //console.log('data', data);

        // decode_buffer - if we give it an array structure containing buffers, then decode each within the buffer?
        //  or there must have been some minimal decoding for it to come to the client.




        let decoded = Binary_Encoding.decode_buffer(data);
        //console.log('**3 decoded', decoded);
        res.raise('next', decoded);
    });
    obs.on('error', err => res.raise('error', err));
    obs.on('complete', () => res.raise('complete'));


    return res;

}

let kp_to_range = buf_kp => {
    let buf_0 = Buffer.alloc(1);
    buf_0.writeUInt8(0, 0);
    let buf_1 = Buffer.alloc(1);
    buf_1.writeUInt8(255, 0);
    // and another 0 byte...?

    return [Buffer.concat([buf_kp, buf_0]), Buffer.concat([buf_kp, buf_1])];
}

// Decoding observable data?

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
    'buffer_to_buffer_pairs': buffer_to_row_buffer_pairs,
    'buffer_to_row_buffer_pairs': buffer_to_row_buffer_pairs,

    'select_indexes_from_model_row': select_indexes_from_model_row,
    'select_indexes_buffer_from_kv_pair_buffer': select_indexes_buffer_from_kv_pair_buffer,

    'key_length': key_length,
    'key_value_at': key_value_at,
    'obs_decode': obs_decode,

    'kp_to_range': kp_to_range,

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