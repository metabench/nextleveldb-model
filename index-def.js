var lang = require('lang-mini');
var tof = lang.tof;
var each = lang.each;

const clone = lang.clone;

var xas2 = require('xas2');
var Binary_Encoding = require('binary-encoding');
var flexi_encode_item = Binary_Encoding.flexi_encode_item;
// Likely will be better when indexes themselves get their own database records.
//  Better for persistance of db record structure.

// Will have actual OO index records.
//  Ability to tell them from other objects
//  Will basically have an array 
const BB_Record = require('./buffer-backed/record');

// Say that this is an Unique index?
//  non-unique indexes can have multiple PKs that apply to that index value.

// The exclamation mark indicates 'unique'
//  All indexes so far have been unique
//  Could make other indexes without this unique constraint.
//   Eg indexing countries by GDP. They may be unique anyway, probably are, but we must not rely on it.

// Maybe the unique constraint should be in the field.





class Index_Def {
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
        //console.log('\nIndex constructor');
        var a = arguments;
        var l = arguments.length,
            t;

        var arr_def, table, id;

        // We could give it fields from the table def.

        // This seems like a nicer way to have the Index working with OOP.
        //  Would have references to the actual Field instances.


        // Further down, will get the field names, then refer to record_flat_data[field_name]
        //  18/08/2017 - Need to get this basic db system up and running.
        //  It needs to store data soon in production.

        this.__type_name = 'index';

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
        //console.log('index spec', spec);
        //console.log('t_spec', t_spec);
        if (t_spec === 'array') {
            arr_def = spec;
        }

        if (arr_def) {

            var map_fields = this.table.record_def.map_fields,
                i_field;

            //console.log('map_fields', map_fields);
            //console.log('arr_def', arr_def);

            each(arr_def[0], (key_field_item) => {
                t = tof(key_field_item);
                //console.log('key_field_item', key_field_item);
                //console.log('* tof(key_field_item)', t);
                if (t === 'string') {
                    i_field = map_fields[key_field_item];
                    //console.log('i_field', i_field);
                    //key_fields.push(
                    //console.trace();
                    //throw 'stop';
                    key_fields.push(i_field);

                } else if (t === 'field' || key_field_item.__type_name === 'field') {
                    // unfortunate hack with tof not working right.
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
                //console.log('value_field_item', value_field_item);
                if (t === 'string') {
                    i_field = map_fields[value_field_item];
                    //console.log('i_field', i_field);
                    value_fields.push(i_field);
                } else if (t === 'field' || value_field_item.__type_name === 'field') {
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

        // Have the 

    }


    // Confused about how this works now.

    get key_field_ids() {
        // Includes own table ID.
        //  Not very sure why.

        // Will have more capability within Model Index_Record_Key (which represents all the useful part of the index record)
        //  Will store the data as a Buffer, and have encoding and decoding capababilities.

        // 01/05/2018 - Not sure if this change broke anything. Result makes more sense now at least.
        var res = [this.table.id, this.id];
        each(this.key_fields, (key_field) => {
            res.push(key_field.id);
        });
        return res;
    }

    // Maybe table field ids had been put back together wrong.

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
    // 


    'to_arr_record_def'() {
        // [table_id, index_id (within table)][arr_key_fields, arr_value_fields]
        //  [arr_key_fields, arr_value_fields] are encoded as numbers, each field is just the field id
        // [table_id, index_id (within table)][arr_key_field_ids, arr_value_field_ids];
        return [
            [this.table.id, this.id], this.kv_field_ids
        ];
    }

    'index_record'(record) {
        // This should be called when adding data to a model.

        console.log('index_record_data', record);
        throw 'stop';
    }

    // If all of a table's fields were recorded in the db, we could then have an index object that refers to them.
    //  'table fields' could be a useful table
    //   each refers to the table, and the field id
    //   



    // record to index bb records
    //  the buffer backed record style is more efficient in many cases as it only decodes upon demand.

    'record_to_key_string'(record) {
        var record_key = record.key;
        var data = record.arr_data;
        var table = record.table;
        var map_fields = table.record_def.map_fields;
        var record_flat_data = record.key.concat(record.value);
        var arr_res = [];
        each(this.key_fields, (key_field) => {
            var item_value = record_flat_data[key_field.id];
            arr_res.push((item_value));
        });
        var res = JSON.stringify(arr_res);
        return res;

    }

    // bb record to bb index records
    //  should be easy to use like the array format, but with the efficiency of buffers. Likely easier to use than the arrays as it has OO convenience functions.
    //  With the bb versions set to have wider use, it will increase efficiency as well as ease of coding


    // Are the index records in the Model or the DB wrong?

    // That could account for some problems which are being faced currently.



    'bb_record_to_bb_index_record'(bb_record) {
        //console.log('this.table.name', this.table.name);
        // 

        // Think this fn will take a little while + more focus to get right.
        //  It fits in generally with keeping data encoded as binary until it's needed.
        //  Faster internal processing because it will involve copying and comparing buffer values.

        // only to one index record here.


        // This will be useful server-side too.
        //  We have wanted this for standard put.


        // Should use selection from the buffers in an efficient way.
        //  should have an array of field positions.
        //   then we can lookup and read the fields quickly.

        // when referring to fields, its basically keys and values put together, excluding the KPs from the keys (there are no KPs in the values)

        // Could use an Index_Key class?
        //  Or just make it so that Key covers index key logic automatically.
        // 

        // no need for Field_Value bb object (yet);

        // We could do the full lookup at once.
        //  That would be more efficient.
        //  Harder to verify though.

        // Position tables would help.
        //  The position table can be found with a scan.

        // what about extracting all field values at once?


        // table kp + 1, index id


        // need to include the KPs in the index record.
        //  may be worth specifically making an index_record class?

        let res = new Array(this.key_fields.length + this.value_fields.length);
        let i_f = 0;
        let l = this.key_fields.length;

        //console.log('bb_record', bb_record);

        each(this.key_fields, (key_field) => {
            //console.log('key_field', key_field);
            //console.log('* key_field.id', key_field.id);


            let fv = bb_record.get_field_value(key_field.id);
            //console.log('1) fv', fv);

            res[i_f++] = fv;
            // fish out the field value from the bb_record

            //var item_value = record_flat_data[key_field.id];
            //arr_res.push((item_value));
        });
        //console.log('this.value_fields', this.value_fields);
        each(this.value_fields, (value_field) => {
            //console.log('value_field', value_field);
            //console.log('value_field.id', value_field.id);
            //ar item_value = record_flat_data[value_field.id];
            let fv = bb_record.get_field_value(value_field.id);
            //arr_res.push((item_value));
            //console.log('2) fv', fv);
            res[i_f++] = fv;
        });
        // need the kp first

        //console.log('this.table.indexes_key_prefix', this.table.indexes_key_prefix);
        //console.log('this.id', this.id);

        let buf_kps = Buffer.concat([xas2(this.table.indexes_key_prefix).buffer, xas2(this.id).buffer]);
        let buf_full = Buffer.concat([buf_kps, Buffer.concat(res)]);
        let res_record = new BB_Record(buf_full);
        return res_record;
        //throw 'stop';
        //return res;

    }


    'arr_record_to_index_arr_data'(arr_record, num_pk_fields = 1) {
        var table = this.table;
        var table_ikp = table.indexes_key_prefix;
        var arr_res = [];
        each(this.key_fields, (key_field) => {
            var item_value = arr_record[key_field.id - num_pk_fields];
            arr_res.push((item_value));
        });
        // And the value fields?

        throw 'NYI';
        return arr_res;
    }

    'record_to_index_arr_data'(record) {
        var table = this.table;
        var table_ikp = table.indexes_key_prefix;
        var arr_res = [(table_ikp), this.id];
        var record_flat_data = record.key.concat(record.value);

        each(this.key_fields, (key_field) => {
            var item_value = record_flat_data[key_field.id];
            arr_res.push((item_value));
        });
        //console.log('this.value_fields', this.value_fields);
        each(this.value_fields, (value_field) => {
            //console.log('value_field.id', value_field.id);
            var item_value = record_flat_data[value_field.id];
            arr_res.push((item_value));
        });
        return arr_res;
    }

    'record_to_index_buffer'(record) {
        var record_key = record.key;
        var record_value = record.value;
        var data = record.arr_data;
        var table = record.table;
        var map_fields = table.record_def.map_fields;
        var id = this.id;
        var table_ikp = table.indexes_key_prefix;

        var arr_res = [xas2(table_ikp).buffer, xas2(id).buffer];

        // No, think we need to join them differently in a way that encodes the length of the keys and values,
        //  

        // But the index is only composed of the key part of the LevelDB record.
        var record_flat_data = record.key.concat(record.value);
        // 
        each(this.key_fields, (key_field) => {
            var item_value = record_flat_data[key_field.id];
            arr_res.push(flexi_encode_item(item_value));
        });
        each(this.value_fields, (value_field) => {
            var item_value = record_flat_data[value_field.id];
            arr_res.push(flexi_encode_item(item_value));
        });
        return Buffer.concat(arr_res);
    }


    // Seems we have / need a dual system involving using KPs or not.

    record_to_index_arr(record, records_have_kps = false) {

        // Need to remove the kps from the keys
        // but if the record includes the kp...?
        //var record_key = record.key.shift();

        //console.log('record, records_have_kps', record, records_have_kps);

        var record_value = record.value;
        var data = record.arr_data;
        var table = record.table;
        var map_fields = table.record_def.map_fields;
        var id = this.id;
        var table_ikp = table.indexes_key_prefix;

        var arr_res = [table_ikp, id];

        //console.log('record.key', record.key);

        //let shifted_key = clone(record.key);
        //shifted_key.shift();

        var record_flat_data = record.key.concat(record.value);
        //console.log('record_flat_data', record_flat_data);

        // key fields with no kp...?

        //let i_mod = 0;
        //if (!records_have_kps) {
        //    i_mod = 1;
        //}

        // the record has kps (by default),
        // 

        each(this.key_fields, (key_field) => {
            //console.log('key_field.id', key_field.id);
            var item_value = record_flat_data[key_field.id];
            arr_res.push((item_value));
        });
        each(this.value_fields, (value_field) => {
            //console.log('value_field.id', value_field.id);



            var item_value = record_flat_data[value_field.id];
            //console.log('item_value', item_value);
            arr_res.push((item_value));
        });
        return (arr_res);
    }



}

module.exports = Index_Def;