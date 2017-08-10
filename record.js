// Different ways of creating record objects
//  from raw input data
//  from data stored in db
//  from test data
//  from storage definition, ready to be populated with data

// Records generally need a storage definition.


var jsgui = require('jsgui3');
var tof = jsgui.tof;
var each = jsgui.each;
var is_array = jsgui.is_array;
var arrayify = jsgui.arrayify;
var Fns = jsgui.Fns;

var Incrementor = require('./incrementor');
var Table = require('./table');

// Record comprises of Key, Value.
//  Indexing is also relevant, though not strictly part of the record itself.
// When a standard record gets added or removed, its index records would also be added or removed.

var Binary_Encoding = require('binary-encoding');
var encode_pair_to_buffers = Binary_Encoding.encode_pair_to_buffers;


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



            }
        } else {

            // array[key, value], table
            if (a.length === 2) {
                //console.log('Table', Table);
                //console.log('a[0]', a[0]);
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
        
    }

    
    _get_all_db_records_bin() {
        var res = [this.get_own_record_bin()];

        // its key and its value as a record (own / main record)
        //  then all indexes that apply.
        //   Maybe record needs a link back to the table (which it has in some cases)

        // Do or don't get the record's index record at this stage?
        //  May be better / more memory efficient doing it this way.

        each(this.indexes, (index) => {

        });

        /*
        each(this.get_own_index_bin(), (idx_rec) => {
            res.push(idx_rec);
        });
        */


        return res;
    }

    to_arr_buf() {
        // needs to know the table.
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

        var res = encode_pair_to_buffers([this.key, this.value], prefix);

        //console.log('this record', this);
        //throw 'stop';
        console.log('record get_own_record_bin res', res);
        //throw 'stop';

        return res;


    }

    // The record will reference the table's indexes, and index itself according to them.


    // May retire this...?
    //  Use the index object, and give it the records
    //   Seems better OO now that we have index and field objects.

    _get_own_index_bin() {
        var res = [];


        // This should maybe be done by the index objects.
        //  Indexes map keys to values.
        //   They always / generally map to the primary key.
        //    So we don't need to store specifically what they map to, usually.

        // This looks like a good bit of programming to remove from Record, and to put into Index.
        //  Index itself won't do very much, but it defines the keys for the indexes.
        //  Indexes are just a way to efficiently link to a value.

        // Before long, we will have plenty of data flowing into the db, ready to be displayed and analysed.




        




        var arr_kv = [this.key, this.value];
        // The index rows get generated from the data and what has been set up for indexing.

        // The indexes should be Index objects.

        var indexes = this.table.indexes;



        //console.log('indexes', indexes);

        //throw 'stop';

        var map_fields = this.table.map_fields;
        //console.log('map_fields', map_fields);

        // need to see where each field is within the keys or values.
        //  use these to write the indexes.

        var prefix = this.table.key_prefix + 1;
        var res_arr_key, res_arr_value;

        each(indexes, (index, index_index) => {

            console.log('record get_own_index_bin each index loop', index);

            res_arr_key = [];
            res_arr_value = [];

            //var arr_idx_keys = index[0];
            //var arr_idx_values = index[1];

            //console.log('arr_idx_keys', arr_idx_keys);
            //console.log('arr_idx_values', arr_idx_values);

            // get the encoded index value.
            //  needs to apply to the data that is stored in the record.
            //  doing that with index maps at the moment.
            //  maybe best to have a map of name to value.
            //   however, have given the record in two arrays.
            //    That makes it easy / possible to store items because we always know what pk to refer to.



            

            var buf_idx_db_key = index.record_to_index_buffer(this);
            console.log('buf_idx_db_key', buf_idx_db_key);

            //res.push([buf_idx_db_key, []]);
            res.push([buf_idx_db_key, null]);

            // The whole index gets put into db keys.
            //res_arr_key.push(buf_idx_db_key);


            //throw 'stop';

            /*

            each(arr_idx_keys, (idx_key, idx_idx) => {
                var key_field_position = map_fields[idx_key];
                //console.log('key_field_position', key_field_position);
                // not sure we need to know this.

                // really just need to get the right values for the index.
                //  however, the data is within the key and value arrays.
                // get the right value

                // Need to fix that we could have given a record a null value.

                //console.log('arr_kv', arr_kv);
                //console.log('key_field_position', key_field_position);

                
                var value = arr_kv[key_field_position[0]][key_field_position[1]];
                //console.log('value', value);

                res_arr_key.push(value);
                


            });

            each(arr_idx_values, (idx_value) => {
                var key_field_position = map_fields[idx_value];
                //console.log('key_field_position', key_field_position);
                // not sure we need to know this.

                // really just need to get the right values for the index.
                //  however, the data is within the key and value arrays.
                // get the right value



                var value = arr_kv[key_field_position[0]][key_field_position[1]];
                //console.log('2) value', value);

                res_arr_value.push(value);



            });
            

            //console.log('res_arr_key', res_arr_key);
            //console.log('res_arr_value', res_arr_value);

            // Maybe encode the index id just as an xas2.
            //  So the prefix denoting the index, as well as the index number within the table, would just be xas2.
            //   Then the rest of it gets read.

            // Need to allow for 2, or multiple xas2 numbered prefixes while encoding.

            // index space prefix, index index (number) within table.


            // Need to have 2 prefixes this time




            ////
            var pair_to_encode = [res_arr_key, res_arr_value];
            //console.log('pair_to_encode', pair_to_encode);
            var encoded_pair = encode_pair_to_buffers(pair_to_encode, prefix, index_index);
            res.push(encoded_pair);

            */

            //
            //console.log('encoded_pair', encoded_pair);



            //console.log('index', index);
            //console.log('res', res);
            //throw 'stop';

            //console.log('');


        });

        

        //var 

        





        //throw 'stop';





        return res;
    }

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
                [['id', 'xas2']],
                [['name', 'string']]
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
                [['name'], ['id']]
            ]
        ]
    });

} else {

}