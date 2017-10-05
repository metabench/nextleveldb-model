var jsgui = require('jsgui3');
var tof = jsgui.tof;
var each = jsgui.each;

var xas2 = require('xas2');
var Binary_Encoding = require('binary-encoding');
var flexi_encode_item = Binary_Encoding.flexi_encode_item;
// Likely will be better when indexes themselves get their own database records.
//  Better for persistance of db record structure.


class Index {
    // All of the index capability takes place within the key.

    // Possibly table fields needs its own table.
    //  Each field will have its id/index within the table, name and type.
    //   is the field a primary key?
    //   is the field unique?
    // Generating primary keys from more than one field at once...?

    // Table fields records would definitely be useful for getting data back from the db / checking that items are in place in the db correctly.


    // It may be worth having the index records persist themselves to the database.
    //  table-index records.
    //  will contain the names of the keys that go into the indexes. Maybe better to refer to table-fields

    // Index needs an id as well.

    // Records already have the capability of producing their index rows' binary.
    //  That could be changed so that all of the index row generation code is within the Index.

    // Could also refer to the Table. There could also be a DB table of indexes that holds data on the indexes.
    //  Worth giving that thought, but likely it's worth having indexes in the DB, in a table.
    //   Still do it in an OO way, data processing takes place in the model, then it can all be persisted to the DB.

    // The core database will be consistant with the Model, and then further data can be accessed in ways that have been specified within the core database, such as tables about the tables or types
    //  of data in the system.

    // Need to create index objects, rather than having the indexes specified as arrays and processing using them.
    //  With Index, will be able to produce an index row from a data item.

    // Could have a table-indexes table.
    //  Each record would contain a definition of the index.
    //  A sequence of numbers to represent the fields...?

    // However, for the moment, we still represent the record with [key,value].
    //  Bit on the left is the primary key.
    //  Could possibly hold data on which fields form the primary key while using the indexes of the fields.







    'constructor'(spec) {
        console.log('\nIndex constructor');
        var a = arguments;
        var l = arguments.length, t;

        var arr_def, table, id;

        // We could give it fields from the table def.

        // This seems like a nicer way to have the Index working with OOP.
        //  Would have references to the actual Field instances.


        // Further down, will get the field names, then refer to record_flat_data[field_name]
        //  18/08/2017 - Need to get this basic db system up and running.
        //  It needs to store data soon in production.







        var key_fields = this.key_fields = [];
        var value_fields = this.value_fields = [];

        this.kv_fields = [this.key_fields, this.value_fields];


        if (l === 1) {
            spec = a[0];
        }

        if (l === 2) {
            spec = a[0];
            table = this.table = a[1];

            // get the id from the table's index incrementor.

        }
        if (l === 3) {
            spec = a[0];
            table = this.table = a[1];
            id = this.id = a[2];
            // get the id from the table's index incrementor.
            //  already got it, id provided in constructor. Easier to follow this way.

        }
        // [index_key_def, index_value_field]

        var t_spec = tof(spec);
        console.log('t_spec', t_spec);
        if (t_spec === 'array') {

            // Want to make this refer to specific fields in the table.
            //  Currently we use the field names as reference





            arr_def = spec;
            //console.log('Index arr_def', arr_def);

            // Name => ID
            //  We have the string names, but we need to use a map of the record structure.
            //   The record itself gets divided into PK and value parts.
        }

        if (arr_def) {
            //console.log('arr_def', arr_def);

            //var arr_def_idx_key = arr_def[0];
            //var arr_def_pk = arr_def[1];
            // The value of an index needs to be a pk. Maybe don't call it a value?

            // worth having storage of the fields.

            //this.arr_def = arr_def;

            //console.log('this.table', this.table);

            var map_fields = this.table.record_def.map_fields, i_field;

            //console.log('map_fields', map_fields);
            console.log('arr_def', arr_def);

            each(arr_def[0], (key_field_item) => {
                t = tof(key_field_item);
                console.log('tof(key_field_item)', tof(key_field_item));
                if (t === 'string') {
                    i_field = map_fields[key_field_item];
                    //console.log('i_field', i_field);
                    //key_fields.push(
                    //console.trace();
                    //throw 'stop';
                    key_fields.push(i_field);

                } else if (t === 'field') {
                    //console.log('t', t);


                    key_fields.push(key_field_item);

                    //throw 'stop';
                } else if (t === 'number') {
                    //console.log('key_field_item', key_field_item);

                    var field = table.fields[key_field_item];
                    //console.log('field', field);
                    key_fields.push(field);
                    //throw 'stop';
                }
                //console.log('key_field_item', key_field_item);
            });
            each(arr_def[1], (value_field_item) => {
                t = tof(value_field_item);
                if (t === 'string') {
                    i_field = map_fields[value_field_item];
                    //console.log('i_field', i_field);
                    value_fields.push(i_field);
                } else if (t === 'field') {
                    value_fields.push(value_field_item);
                    //console.log('tof(arr_def[0])', tof(arr_def[0]));
                    //throw 'stop';
                } else if (t === 'number') {
                    //console.log('value_field_item', value_field_item);

                    var field = table.fields[value_field_item];
                    value_fields.push(field);
                    //throw 'stop';
                }
                //console.log('value_field_item', value_field_item);
            });
        }
        // Process the arr_def into fields?

        // Index may work better when not just using arr_def.
        //  If it has both key and value fields.
        // An index would be a bit like a normal record def, but it would be a different values in the keys, and the value would always be the primary key.

        //console.log('Index constructor complete, this', this);


    }

    get key_field_ids() {
        var res = [this.table.id, this.id];
        // then index_type
        //  Only have unique index for the moment.
        //   Think about sorted sequential indexes in the db.
        //    Should be sorted according the the values, buy the index prefix.

        // I think unique indexes will be the first type for the moment.
        //  Then could have 'bucket' indexes, where the index can refer to more than one record?


        each(this.key_fields, (key_field) => {
            res.push(key_field.id);
        });
        return res;
    }
    get value_field_ids() {
        var res = [];
        each(this.value_fields, (value_field) => {
            res.push(value_field.id);
        });
        return res;
    }
    get kv_field_ids() {
        return [this.key_field_ids, this.value_field_ids];
    }

    get_kv_record() {
        return this.kv_field_ids;
    }


    'to_arr_record_def'() {
        // [table_id, index_id (within table)][arr_key_fields, arr_value_fields]
        //  [arr_key_fields, arr_value_fields] are encoded as numbers, each field is just the field id

        // [table_id, index_id (within table)][arr_key_field_ids, arr_value_field_ids];

        return [[this.table.id, this.id], this.kv_field_ids];


    }

    'index_record'(record) {
        console.log('index_record_data', record);
        throw 'stop';
    }

    // If all of a table's fields were recorded in the db, we could then have an index object that refers to them.
    //  'table fields' could be a useful table
    //   each refers to the table, and the field id
    //   

    'record_to_key_string'(record) {
        //console.log('record', record);
        var record_key = record.key;
        var data = record.arr_data;
        var table = record.table;
        var map_fields = table.record_def.map_fields;
        var record_flat_data = record.key.concat(record.value);
        var arr_res = [];
        //console.log('this.key_fields', this.key_fields);
        //throw 'stop';
        each(this.key_fields, (key_field) => {
            var item_value = record_flat_data[key_field.id];
            arr_res.push((item_value));
        });
        var res = JSON.stringify(arr_res);
        return res;

    }

    'record_to_index_buffer'(record) {
        // need to use a map of record fields to the values?
        //  keep the values within the field objects within records?
        //   maybe too OO and slow, unnecessary. Keeping data as arrays seems easier / more efficient.

        // That would help to ensure we have the indexes in the right format.
        //console.log('record_to_index_buffer');
        //console.log('record', record);
        //console.log('this', this);
        //console.log('this.key_fields', this.key_fields);
        //console.log('this.value_fields', this.value_fields);
        


        var record_key = record.key;
        var record_value = record.value;

        var data = record.arr_data;

        //console.log('record_key', record_key);
        //console.log('record_value', record_value);
        //console.log('data', data);
        //console.log('this.arr_def', this.arr_def);
        var table = record.table;
        var map_fields = table.record_def.map_fields;
        //console.log('map_fields', map_fields);

        var id = this.id;
        //console.log('id', id);
        //throw 'stop';
        var table_ikp = table.indexes_key_prefix;

        //var table = this.

        // table index space, index id, values from index key, pk value
        //  first two items just encoded as xas2, others with Binary_Encoding



        var arr_res = [xas2(table_ikp).buffer, xas2(id).buffer];

        // then need to encode the buffer, in the order of the index.




        // Then add the key-value items from the index definition

        //console.log('arr_def', arr_def);

        //var arr_rest_of_db_key = [];

        //map_fields no longer holds the field position.

        // Don't need to look at the arr_def.



        //var arr_index_key = this.arr_def[0];
        //var arr_index_value = this.arr_def[1];
        //console.log('record', record);

        var record_flat_data = record.key.concat(record.value);

        // Could be done using the fields themselves.
        //  Direct links with the field objects, not requiring the use of the field map here.

        //console.log('arr_index_key', arr_index_key);
        //console.log('arr_index_value', arr_index_value);

        //throw 'stop';

        each(this.key_fields, (key_field) => {
            //console.log('def_key_item', def_key_item);


            //var field = map_fields[def_key_item];


            //console.log('map_fields', map_fields);

            // Not using field pos.
            //  Could get it from the field itself though.

            //console.log('field', field);
            //console.log('table.name', table.name);

            // then get the value for it.
            //  have a flat array of values too?
            //   could use Data_Value to keep the values in the same object.

            // want a flat view of the record.


            //console.log('record_flat_data', record_flat_data);

            //console.log('key_field', key_field);

            var item_value = record_flat_data[key_field.id];
            //console.log('item_value', item_value);

            arr_res.push(flexi_encode_item(item_value));
            //arr_index_value.push(

            // do need to know the map position of the field.
            //  whether the value being referred to is in the key or the value.

            //throw 'stop';


            //var field_data = data[field_pos[0]][field_pos[1]];
            //console.log('field_data', field_data);

            //arr_res.push(Binary_Encoding.flexi_encode_item(field_data));
        });
        each(this.value_fields, (value_field) => {
            //console.log('def_key_item', def_key_item);


            //var field = map_fields[def_key_item];


            //console.log('map_fields', map_fields);

            // Not using field pos.
            //  Could get it from the field itself though.

            //console.log('field', field);
            //console.log('table.name', table.name);

            // then get the value for it.
            //  have a flat array of values too?
            //   could use Data_Value to keep the values in the same object.

            // want a flat view of the record.


            //console.log('record_flat_data', record_flat_data);

            var item_value = record_flat_data[value_field.id];
            //console.log('item_value', item_value);

            arr_res.push(flexi_encode_item(item_value));
            //arr_index_value.push(

            // do need to know the map position of the field.
            //  whether the value being referred to is in the key or the value.

            //throw 'stop';


            //var field_data = data[field_pos[0]][field_pos[1]];
            //console.log('field_data', field_data);

            //arr_res.push(Binary_Encoding.flexi_encode_item(field_data));
        });

        
        

        

        //throw 'stop';



        //return [Buffer.concat(arr_res), []];
        return Buffer.concat(arr_res);


    }



}

module.exports = Index;