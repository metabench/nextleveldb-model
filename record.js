// Different ways of creating record objects
//  from raw input data
//  from data stored in db
//  from test data
//  from storage definition, ready to be populated with data

// Records generally need a storage definition.


var lang = require('lang-mini');
var tof = lang.tof;
var each = lang.each;
var is_array = lang.is_array;
var arrayify = lang.arrayify;
var Fns = lang.Fns;

var Incrementor = require('./incrementor');
var Table = require('./table');

// Record comprises of Key, Value.
//  Indexing is also relevant, though not strictly part of the record itself.
// When a standard record gets added or removed, its index records would also be added or removed.

var Binary_Encoding = require('binary-encoding');
var database_encoding = require('./encoding');

var xas2 = require('xas2');
var encode_pair_to_buffers = Binary_Encoding.encode_pair_to_buffers;


const B_Record = require('./buffer-backed/record');

// This Record has got a lot to do with data conversion

// Records will reduce the clutter of many procedures in the database access layers.

// Could define some subclasses of records, but want Record itself to be flexible enough so that much of that would be declarative.

// Likely to want some input transformation functions.

// Records have fields.
//  Fields within the key and value.


//.storage
//.key (array)
//.value (array)

// There will be some kind of field values abstraction.

// Could have object oriented fields. Like records, the fields would hold the data definition as well as the data itself.

// Could make use of Binary Encoding.


// A Table class would be useful for getting all of the records within that table.
//  Doing a query based on the indexes
//   Getting records within ranges.


// Table definition would likely include a record defintion too.

// A buffer-backed version of Record would be cool.
//  Would then be easier to transmit the data as it is in the record object.

// Would contain both a key and a value, and those key and value objects could themselves be buffer-backed storage.


// Right now, being able to compose a set / list of keys as binary is important / useful.

// Key_List.
//  Give it the keys, it can compose them to binary.


// Bascially a way of holding .key and .value arrays.
//  Storing the data as buffers, with lazy decoding, would work nicely.
//  

class Record {


    // All records have keys.
    //  Some keys are numeric IDs, in xas2 format.

    // storage definition (key value pair, indexes)

    // get key (encoded)

    // get index record keys

    constructor(spec) {
        var a = arguments;
        //this.__type_name = 'record';

        //console.log('Record constructor a', a);

        if (a.length === 1) {
            var t_spec = tof(spec);
            if (t_spec === 'object') {
                this.storage = spec.storage;
                // storage should hold the key, value, and indexing definitions.
                if (spec.table) this.table = spec.table;
                // i_table_id
                // i_table_key_prefix
            } else if (t_spec === 'buffer') {

                // Need to decode record from buffer.
                console.log('spec (Buffer)', spec);
                throw 'stop. need to decode record from buffer';

            } else {
                console.trace();
                console.log('t_spec', t_spec);
                throw 'stop';
            }


        } else {

            // array[key, value], table
            if (a.length === 2) {
                //console.log('Table', Table);
                //console.log('a[1]', a[1]);
                if (Array.isArray(a[0]) && a[1].__type_name === 'table') {
                    var data = this.arr_data = a[0];



                    var key = a[0][0];
                    var value = a[0][1];

                    // check the key, to see if it starts with a special character.
                    //  ???



                    this.table = a[1];


                    // could be better to store the key and value in an array together.

                    //console.log('key', key, tof(key));

                    // refer back to the table to find the key definition field.
                    //  When the key of a record is null, we maybe get the value from the relevant autoincrementor.

                    if (tof(key) === 'null') {
                        var field_0 = this.table.fields[0];
                        //console.log('field_0', field_0);
                        if (field_0.incrementor) {
                            key = [field_0.incrementor.increment()];
                        }
                        //throw 'stop';
                    }



                    this.key = key;
                    this.value = value;
                    this.arr_data = [this.key, this.value];

                    //console.log('this.arr_data', this.arr_data);



                    // are the keys and values arrays?

                    /*

                    if (Array.isArray(key)) {
                        console.log('key is an array');
                    } else {
                        console.log('key is not an array');
                    }
                    if (Array.isArray(value)) {
                        console.log('value is an array');
                    } else {
                        console.log('value is not an array');
                    }

                    */

                } else if (a[1].__type_name === 'table') {

                    var data = a[0];
                    this.arr_data = data;
                    var t_data = tof(data);

                    // May need to use an incrementing id?
                    //  Changing to more verbose (array) data input for the moment.


                    //console.log('t_data', t_data);

                    // For the moment, the more verbose format would help?
                    //  Or just enode the values as necessary.

                    // May need to set up indexes as well.
                    //console.log('data', data);


                    // special case data?

                    this.table = a[1];

                }
            }
        }

        //console.log('this.key', this.key);
        //console.log('this.value', this.value);
    }

    // Could have more to do with getting self in various js formats, then encoding that with Binary_Encoding.
    //  Binary_encoding would handle the details of array lengths and noting that something is stored in an array.

    // That would make for a simpler system to encode and decode records, on the server and on the client.
    //  Binary_Encoding should be good enough for this.
    //  However at times, just need the buffers in order to put them into the database.

    // Getting arrays of buffers back makes sense when we are going to execute a batch DB put.





    to_arr_buf() {
        // needs to know the table.

    }

    to_buffer() {
        // We will know its a record anyway.
        //  No need to encode a data type.


        // Seems like an OK way of doing it, but just using Binary_Encoding could make for cleaner code.

        // Length of key, key, length of value, value

        var arr_own_record = this.get_own_record_bin();
        var res = Buffer.concat([xas2(arr_own_record[0].length).buffer, arr_own_record[0], xas2(arr_own_record[1].length).buffer, arr_own_record[1]]);
        return res;

    }


    to_b_record() {
        return new B_Record(this.get_own_record_bin());
    }

    // and the index records too


    to_b_records() {
        // could go in a Record_List

        let res = [this.to_b_record()];
        res.push.apply(res, this.index_db_records_to_arr_buffers().map(record => new B_Record([record, null])));

        /*
        each(this.index_db_records_to_arr_buffers(), item => {
            //console.log('item', item);

        })
        */



        return res;

    }




    // to buffer, with indexes
    //  Would need a somewhat more complex format...?
    //  key value pair, then number of index records, then each index record preceeded by its length.

    //  Would probably be functional / event driven processing on the server.

    // It seems this could be done in a more standard way.

    // Could use Binary_Encoding as standard.
    //  Don't just want them joined together in a buffer, it's harder to read that way.


    // Maybe could do more to standardise the formats that the data goes to the DB in.
    //  Just using Binary_Encoding.

    // Maybe this is better done by the table.

    to_buffer_with_indexes() {

        // The record itself.
        //  Need to know how long it is - though could count how many fields get decoded.
        //   Maybe not necessary to encode that?
        //    We could also know how many indexes there are.
        //  Better to encode the number of fields in the key, num in the value

        // Could use a more standard type of encoding for multiple fields.


        var arr_res = [this.to_buffer(), this.index_db_records_to_buffer()];
        return Buffer.concat(arr_res);


        // Then need to 



    }

    to_arr_buffer_with_indexes() {
        var res = [this.get_own_record_bin()];
        res = res.concat(this.index_db_records_to_arr_buffers());
        return res;
    }



    // A way of creating the index records quicker / more efficiently out of buffer copies?
    //  It works out which ranges of which buffers to select, and then copies them.

    // b_record functionality to create b_rows when given the model_table (which is the indexing system)
    //  b_record.get_index_b_rows(model_table)



    // this is just the index keys.

    index_db_records_to_arr_buffers() {
        var indexes = this.table.indexes;
        var record = this;
        var res = [];
        //console.log('*indexes.length', indexes.length);
        each(indexes, (index) => {
            //console.log('index.id', index.id);
            //console.log('index.record_to_index_buffer(record)', index.record_to_index_buffer(record));
            // Could put it in place so the index records have got [k,v] format, even if v is empty.
            res.push(index.record_to_index_buffer(record));;
        });
        //console.log('res', res);
        return (res);
    }

    index_db_records_to_buffer() {
        // Could do this much more simply.
        // Have all records as key value pairs.
        //  Have some kind of array specification in Binary_Encoding.

        // Anyway, let's decode this format for the moment.

        // Includes the number of indexes

        var indexes = this.table.indexes;
        var arr_res = [xas2(indexes.length).buffer];
        var record = this;
        each(indexes, (index) => {
            // res.push(rec_idx);
            // then output the index record.
            var buf_idx = index.record_to_index_buffer(record);
            //console.log('indexed_record', indexed_record);
            arr_res.push(Buffer.concat([xas2(buf_idx.length).buffer, buf_idx]));
            //throw 'stop';

            //res.push(
        });

        console.log('arr_res', arr_res);
        throw 'stop';

        return Buffer.concat(arr_res);
    }

    get_arr_index_records(records_have_kps = false) {
        var res = [];
        //console.log('this.table.name', this.table.name);
        //console.log('this.table.indexes.length', this.table.indexes.length);
        //console.trace();

        // Have brought up another problem... what about an unexpected / wrong number of indexes when diagnosing.


        // Possibly should have some diagnostic procedures to check the model is as it should be.

        // Does the model load all of the indexes properly?

        // These records should not have KPs to start with.
        //  At least coming in.


        each(this.table.indexes, (index) => {
            // Could put it in place so the index records have got [k,v] format, even if v is empty.

            res.push(index.record_to_index_arr(this));;
        });
        return (res);
    }

    get_own_record_bin() {
        // key: table prefix, key side of record
        //  value: value side of record

        //console.log('this.table', this.table);

        var prefix = this.table.key_prefix;

        //console.log('this.key', this.key);
        //console.log('prefix', prefix);

        //console.log('[this.key, this.value]', [this.key, this.value]);
        //console.log('prefix', prefix);

        var res = database_encoding.encode_pair_to_buffers([this.key, this.value], prefix);

        //console.log('this record', this);
        //throw 'stop';
        //console.log('record get_own_record_bin res', res);
        //throw 'stop';

        return res;
    }

    get_own_record() {
        let key = [this.table.key_prefix].concat(this.key);
        return [key, this.value];

        //var res = [this.table.key_prefix];
        //res = res.concat()
    }


    // to_obj
    //  with keys and values.
    //  Would need the record to know its own fields.
    to_obj() {
        // would go through each key and value.
        //  they are essentially fields within the record - though the record is already split into key and value.

        var table = this.table;
        var fields = table.fields;

        //console.log('fields', fields);
        var res = {};

        //console.log('this.key', this.key);


        var rec_fields = this.key.concat(this.value);
        each(rec_fields, (field_value, i) => {
            res[fields[i].name] = field_value;
        });



        return res;
        //throw 'stop';



    }

    // to a single array?
    //  Not sure when we want that.
    to_arr() {
        return [this.key, this.value];

        //return this.key.concat(this.value);
    }

    to_flat_arr() {
        return this.key.concat(this.value);
    }





    // The record will reference the table's indexes, and index itself according to them.


    // May retire this...?
    //  Use the index object, and give it the records
    //   Seems better OO now that we have index and field objects.



    // get record arr buffers
    get_key_value_buffers() {

    }

    get_index_buffers() {
        // Each index will only have a key. The values of the index records will be empty.


    }

    put(callback) {

        // put_record

        // put_indexes




    }

    // get the record by its key info.
    // we may have the key, and want to load the record data.

    // A more OO way of doing this, and fewer separate procedures will make it easier to program.

    // Could also define a Table in a OO way, but they are basically logical groupings of records, keep the power in records for the moment.






}


var p = Record.prototype;
p.to_array = p.to_arr;
// Record could be the basis for doing some queries on the database.
//  Definitely want some types of records to be defined as Record, and then instances made.

// A simple GUI for showing market providers could also show them as records, with a record/item viewer.



module.exports = Record;



if (require.main === module) {

    // Infer the types?

    // Then index it by name as well.

    // Can tell the record which table name it uses, which table key prefix etc.

    // May well be worth going more full OO with a Table object, maybe even a Database or VirtualDatabase object.





    var market_provider_record = new Record({
        'storage': [
            //['id'],
            //['name']
            // Key value pair specifying record
            [
                [
                    ['id', 'xas2']
                ],
                [
                    ['name', 'string']
                ]
            ],

            // Indexes


            /*

                var put_id_by_string_index_record_tkp = function (int_table_key_prefix, table_index_id, str_value, record_id, callback) {

                    console.log('');
                    console.log('put_id_by_string_index_record_tkp (int_table_key_prefix, table_index_id, str_value, record_id)');
                    console.log(int_table_key_prefix, table_index_id, str_value, record_id);

                    var index_key = _index_key(int_table_key_prefix, table_index_id, Buffer.from(str_value));
                    //console.log('index_key', index_key);
                    var b_val = xas2(record_id).buffer;
                    //console.log('b_val', b_val);
                    db.put(index_key, b_val, (err) => {
                        if (err) {
                            callback(err);
                        } else {
                            //console.log('pre cb');

                            //throw 'stop';

                            callback(null, true);
                        }
                    });
                };
            */

            [
                [
                    ['name'],
                    ['id']
                ]
            ]
        ]
    });

} else {

}