var jsgui = require('jsgui3');
var tof = jsgui.tof;
var xas2 = require('xas2');
var each = jsgui.each;
var is_arr_of_strs = jsgui.is_arr_of_strs;
var is_arr_of_arrs = jsgui.is_arr_of_arrs;

var Incrementor = require('./incrementor');
var Record = require('./record');
var Field = require('./field');
var Index = require('./index');

var Binary_Encoding = require('binary-encoding');
var encode_to_buffer = Binary_Encoding.encode_to_buffer;
// Each table will have its lower level data in the DB, and means of interacting with it here.

const table_table_key_prefix = 2;

const special_characters = {
    '!': true,
    '+': true
}

class Table {
    constructor(spec) {

        // Table key prefix
        //  Table indexes key prefix = table key prefix + 1

        var a = arguments;
        this.indexes = [];
        this.records = [];
        this.__type_name = 'table';

        this.fields = [];
        

        var indexes = this.indexes;
        // This could have an indexes incrementor.

        // Making a new incrementor could be done from the database object.
        //  After all, the incrementor needs a globally unique id.



        //var 



        var that = this, t, field_name, new_field;

        // The table linking back to the db, so that it can get the global incrementor.

        var name, db, storage;



        if (a.length === 1) {
            var t_spec = tof(spec.name);

            if (t_spec === 'string') this.name = spec.name;

            
        }

        if (a.length === 2) {
            //var t_spec = tof(spec.name);

            //if (t_spec !== 'undefined') this.name = spec.name;
            name = a[0];
            db = a[1];

        }

        if (a.length === 3) {
            //var t_spec = tof(spec.name);

            //if (t_spec !== 'undefined') this.name = spec.name;
            name = a[0];
            db = a[1];
            storage = a[2];

        }

        if (name) this.name = name;
        if (db) {
            this.db = db;
            var inc_fields = this.inc_fields = db.new_incrementor('inc_field_' + this.name);
            var inc_indexes = this.inc_indexes = db.new_incrementor('inc_idx_' + this.name);

        }
        if (storage) this.storage = storage;

        // We get the table id from the tables incrementor.
        //console.log('db.map_incrementors', db.map_incrementors);
        var id;
        if (db) id = this.id = db.map_incrementors['table'].increment();
        //console.log('id', id);

        // and create a new incrementor for the table's indexes?
        //  got it already

        var map_fields = this.map_fields = {};



        this.key_prefix = 2 + id * 2;
        this.indexes_key_prefix = this.key_prefix + 1;
        //throw 'stop';
        var new_inc, is_key, first_char;


        if (storage) {
            

            // Some fields (particularly the id key field) will have an incrementor as its value/type.

            // an array of fields...

            var arr_fields = [];
            var arr_record_pair_fields = [[], []];
            //var map_fields_2 = this.map_fields = {};

            console.log('storage', storage);
            console.log('is_arr_of_arrs(storage)', is_arr_of_arrs(storage));
            if (is_arr_of_strs(storage)) {
                //console.log('storage', storage);
                console.log('is_arr_of_strs');

                // Need to go through each line, adding the appropriate field.
                //  Worth adding indexes too.
                //   OO indexes would help...
                //    But maybe not yet.

                // Makes a lot of sense with different ways that indexes can be specified.

                // will need to put the system's storage into key value pairs.

                // Use the table fields incrementor?

                each(storage, (item, i) => {
                    //first_char = item[0];
                    //console.log('first_char', first_char);

                    console.log('item', item);
                    //throw 'stop';
                    new_field = that.add_field(item);

                    /*

                    is_key = false;

                    // A new incrementor for each field? Just the autoincrementing one(s).
                    //  That's only being used for PK right now.




                    if (special_characters[first_char]) {
                        if (first_char === '+') {
                            field_name = item.substr(1);
                            // autoincrementor, (likely) primary key - work on heuristics as necessary
                            new_inc = new Incrementor('inc_' + that.name + '_' + field_name);
                            console.log('------------------ use_incrementor ----------------------    field_name', field_name);
                            that.pk_incrementor = new_inc;
                            //throw 'stop';

                        }
                        if (first_char === '!') {
                            // has an index, not incrementor
                            field_name = item.substr(1);
                            //new_inc = new Incrementor('inc_' + that.name + '_' + field_name);
                            //console.log('------------------ use_index ----------------------    field_name', field_name);
                            is_key = true;


                            // Unique index, by field name.
                            //  value of index is the primary key.
                            //   refer to the key of the record when writing the index

                            // Define an index with a field number?
                            //  Fields will be numbered in the model.
                            
                            var new_idx = new Index(['field_name', arr_fields[0][0]], that, inc_indexes.increment());
                            this.indexes.push(new_idx);


                            // Can have multiple unique indexes.
                            //  They point to the record's OK.

                            // index value is the primary key.
                            //  need the name of the fields for this index...?


                            // Need to go into more detail and effort to specify these indexes.
                            





                            // Need to make a unique index for this.

                            // Indexes could go in a table in the DB.
                            //  This would make it more complex... however would make the system more robust in the long term when it works.
                            
                            //throw 'stop';

                        }
                    } else {
                        field_name = item;
                        new_inc = new Incrementor('inc_' + that.name + '_' + field_name);
                        //console.log('------------------ use_incrementor ----------------------    field_name', field_name);
                        

                    }
                    new_field = new Field(field_name, new_inc);



                    //if (is_key) {
                    //    map_fields[field_name] = [0, i];
                    //    arr_record_pair_fields[0].push(new_field);
                    //} else {
                    //    map_fields[field_name] = [1, i];
                    //    arr_record_pair_fields[1].push(new_field);
                    //}

                    */

                    //arr_fields.push(new_field);
                    //map_fields[field_name] = new_field;
                    
                    
                });




                



                //throw 'stop';


            } else if (is_arr_of_arrs(storage)) {

                // Could be key and values defined, without any indexes defined.
                var kv_def;
                var indexes_defs = [];
                if (storage.length === 2) {
                    kv_def = storage;
                }
                if (storage.length === 3) {
                    kv_def = storage[0];
                    indexes_defs = storage[1];
                }



                

                this.kv_def = kv_def;

                console.log('kv_def', kv_def);

                // Need to create a Field object for each of them, like above.

                //if (kv_def[0] === null) {
                //    throw 'stop';
               // }


                // Possibly should have a properly OO index.
                //  Worth giving some thought.


                // Will use an OO index before long.





                each(indexes_defs, (index_def) => {

                    //var new_index = new Index(index_def);
                    console.log('index_def', index_def);

                    that.add_index(index_def);

                    //indexes.push(new_index);
                });
                //throw 'stop';


                


                

                each(kv_def[0], (key_field, i) => {
                    that.add_field(key_field);
                });
                each(kv_def[1], (value_field, i) => {
                    that.add_field(value_field);
                });
            }

            

            //console.log('fields_map', fields_map);
            //console.log('map_fields', map_fields);
            //throw 'stop';

            

            // Only have the name->Field map.

            this.map_fields = map_fields;
            //this.map_fields_2 = map_fields_2;
        }
    }

    add_field(field) {
        var item_field, field_name, first_char, is_pk = false, field_incrementor;
        // make use of own field incrementor.

        if (field instanceof Field) {
            item_field = field;
        } else {
            var t_field = tof(field);
            if (t_field === 'string') {
                first_char = field[0];

                if (special_characters[first_char]) {
                    if (first_char === '+') {
                        // Assume primary key because it's autoincrementing.
                        // create the incrementor.

                        field_incrementor = this.db.new_incrementor('inc_' + this.name + '_' + field_name);
                        // just support a single pk_incrementor for the moment.
                        //that.pk_incrementor = new_inc;
                        this.pk_incrementor = field_incrementor;

                        is_pk = true;
                    }

                    field_name = field.substr(1);
                } else {
                    field_name = field;
                }

                var field_id = this.inc_fields.increment();

                if (field_incrementor) {
                    item_field = new Field(field_name, field_id, field_incrementor, is_pk);
                } else {
                    item_field = new Field(field_name, field_id, is_pk);
                }

                





                
            }

            
            //console.log('first_char', first_char);

            //console.log('t_field', t_field);
            //console.log('field', field);
            // need to define the field object.

            




            // maybe change the name of the field, the name strictly won't incude + or other symbols.

            //var field_name;
            

        }

        if (item_field) {
            this.fields.push(item_field);
            this.map_fields[field_name] = item_field;
        }

        
        

        

        //throw 'stop';
        return item_field;
    }

    add_index(idx) {

        // Index should maybe use OO index objects, if it would help to structure the code better.
        //  Really want to use some autoincrementing records.

        // As well as autoincrementing records, we need indexes that are specified to be unique.
        //  Making indexes OO would help them to have a 'unique' property specified.
        //  We can then use the Index class objects themselves to construct queries.


        // Indexes will be defined in an OO way.
        //  Index ids could come about through an incrementor. Each table would have an index incrementor.
        //  


        // Indexes need an id (within the table)


        var idx_2;

        //console.log('idx instanceof Index', idx instanceof Index);

        if (idx instanceof Index) {
            idx_2 = idx;
        } else {
            var id = this.inc_indexes.increment();
            //console.log('** add_index id', id);
            idx_2 = new Index(idx, this, id);
        }



       //ar index_key_def = idx[0];
        //var index_value_field = idx[1]; // foreign key?

        this.indexes.push(idx_2);
        // and maintain a map of indexes too?

        // this.indexes.push([index_key_def, index_value_field]);
        // idx
    }

    add_record(record) {

        // The record may need to make use of an incrementor.
        //  Could possibly make records correspond with fields.
        //  Then records could also have an ordering of fields within their keys and values.

        // Making the OO bulkier with fields makes sense.
        var res;


        //console.log('record instanceof Record', record instanceof Record);
        
        if (!(record instanceof Record)) {

            // is the record shorter by 1?
            console.log('record', record);
            

            if (record[0] === null) {
                // need to make a new key for the data.

                console.log('this.pk_incrementor', this.pk_incrementor);
                //throw 'stop';

                if (this.pk_incrementor) {
                    record[0] = [this.pk_incrementor.increment()];
                }

                // Need to use the right incrementor for the id.

                // Need to access the right field(s).

                //this.generate_new_key();
                //throw 'stop'
                //res = new Record(record, this);
            }

            if (is_arr_of_arrs(record) && record.length === 2) {
                console.log('record in arrays of keys and values form');
                res = new Record(record, this);
                //throw 'stop';

            } else {

                var data_length = this.fields.length;
                console.log('data_length', data_length);
                console.log('record.length', record.length);

                if (record.length === data_length - 1) {
                    var kv_record = [[this.pk_incrementor.increment()], record];
                    res = new Record(kv_record, this);
                }

                //throw 'stop';
            }
            
            
        } else {
            res = record;
        }

        this.records.push(res);

        // then add to the index of this table.

        //this.index_record(res);

        return res;

        
    }

    add_records(records) {
        var that = this;
        each(records, (record) => {
            that.add_record(record);
        });
    }

    get_all_db_records_bin() {

        // This part probably will not be needed, as the table table will have this information.
        //  Each table instance could keep a reference to its record in the tables table.
        var res = [];
        /*

        var res = [this.get_own_record_bin()];
        each(this.get_own_index_bin(), (rec_idx) => {
            res.push(rec_idx);
        });
        */
        var that = this;
        var indexes = this.indexes;

        // then for each record, we get the record itself, along with its index records.
        console.log('this.records', this.records);
        //console.log('this.name', this.name);
        
        each(this.records, (record) => {

            // Why are there undefined records?

            if (record) {
                console.log('that.name', that.name);

                res.push(record.get_own_record_bin());


                /*
    
                each(record.get_own_record_bin(), (db_record) => {
    
                    console.log('db_record', db_record);
                    res.push(db_record);
                });
                */


                //each(record.get_own_index_bin(), (db_record) => {
                //    res.push(db_record);
                //});


                var push_record_indexes = () => {
                    each(indexes, (index) => {
                        // res.push(rec_idx);

                        // then output the index record.
                        var indexed_record = [index.record_to_index_buffer(record), null];
                        console.log('indexed_record', indexed_record);
                        res.push(indexed_record);
                        //throw 'stop';

                        //res.push(
                    });
                }
                push_record_indexes();

            }


            
            

        });

        //console.log('get_all_db_records_bin res', res);

        return res;
    }

    // The table itself...
    //  Will have a record in the table table
    //   Also applicable indexing rows
    //  Rows will have rows within the table key prefix

    get_own_record_bin() {
        // Should actually look at the tables table.



        // table id used to calculate the key prefix

        // encode the table key
        //  won't have all that much data in the records themselves for the moment.

        // this.key_prefix
        //  table_table_key_prefix

        // the table id
        var arr_key = [this.id];

        // the record itself will have the key prefix, a few other values. Possibly a record count.
        var arr_value = [this.key_prefix, this.name];

        //console.log('this', this);
        //console.log('this.id', this.id);
        var bufs_key = encode_to_buffer([this.id], 2);

        //console.log('bufs_key', bufs_key);
        //throw 'stop';

        var buf_val = encode_to_buffer(arr_value);
        var res = [bufs_key, buf_val];


        // then encode both as key-value.

        // But need to have an xas2 number prefixing the record.

        //var res = Binary_Encoding.encode_pair_to_buffers([arr_key, arr_value], 2);
        //console.log('res', res);
        //throw 'stop';


        return res;


    }

    _get_own_index_bin() {

        // Probably should not be used - as its a record from the table table.

        // Could make use of the table table's OO functionality.
        //  

        // Not sure about making it all that much more complex right now.
        //  May work out simpler, with less code.


        // only the key in the indexes for the moment
        var arr_key = [this.name, this.id];

        // Want the indexing output of tables to be done properly.





        // not using this.indexes_key_prefix - that is the index prefix for the table's records that get indexed.
        // 3 is the index position for tables.
        var idx_buf_1 = encode_to_buffer(arr_key, 3, 0);
        //  index 0 within the key prefix space.

        //console.log('idx_buf_1', idx_buf_1);
        //throw 'stop';
        var res = [[idx_buf_1, null]];


        //throw 'stop';
        return res;


    }
    // get own index as well

    //get_table_table_db_records_bin() {
        // (the record for the table table + single (so far) record for indexing)




    //}

    get_field_names() {
        var res = [];
        each(this.fields, (field) => {
            res.push(field.name);
        });
        return res;
    }


    get_inner_db_records() {
        // calculates them, not gets them from the DB.

        var res = [];
        each(this.records, (record) => {
            res.push(record.get_own_record_bin());
        });
        return res;

    }

    get_inner_index_records() {
        var res = [];

        // use map_fields (somehow).
        //  Go through all of the indexes, and index the record according to that index.

        var indexes = this.indexes;

        each(this.records, (record) => {
            //res.push(record.get_own_index_bin());

            each(indexes, (index) => {
                res.push(index.index_record(record));
            });

        });
        console.log('res', res);
        throw 'stop';
        return res;
    }

    get_inner_db_records_bin() {
        var res = [];
        //res.push(this.get_record_bin());
        //res.concat(this.get_index_bin());

        // get its entry in the table table

        return res;
    }







    // Interacting with the table table.
    //  Want this to be possible.

    // The table table will be defined using OOP.




    // Interacting with the incremetors.



    // record (definition)
    //  also provides access to records

    // count

    // get keys

    // key range

    // Bulk loading of data


}

module.exports = Table;

