const lang = require('lang-mini');
const tof = lang.tof;
const xas2 = require('xas2');
const each = lang.each;
const is_array = lang.is_array;
const is_arr_of_strs = lang.is_arr_of_strs;
const is_arr_of_arrs = lang.is_arr_of_arrs;
const get_a_sig = lang.get_a_sig;

const Incrementor = require('./incrementor');
const Record = require('./record');
const Field = require('./field');
const Index = require('./index-def');
const Foreign_Key = require('./foreign-key');
const Primary_Key = require('./primary-key');


const Binary_Encoding = require('binary-encoding');
const encode_to_buffer = Binary_Encoding.encode_to_buffer;

const Record_Value_Def = require('./record-value-def');

const NT_XAS2_NUMBER = 1;
const NT_DATE = 2;
const NT_TIME = 3;
const NT_STRING = 4;
const NT_FLOAT32_LE = 5;


//var Table = require('./table');
class Record_Def {

    // Not sure I like this record def all that much?
    //  Hard to decide where to draw the line between Table and this.
    //  

    // This will takes some of the parsing out of the Table constructor.

    // I wonder if this is too big a change.
    //  Splitting core functionality out of Table?
    //   Not sure about the incrementor references.
    //   The incrementors are part of the table itself. They could be used here though.

    // Should not rely on incrementors provided by the database.
    //  Link back to table, and use the incrementors there.
    //  The incrementors should belong to the table, not the record definition.
    //   The record definition should use the incrementors to get id values, such as the incrementing ids for indexes and fields.

    constructor(obj_record_def, table) {
        // should be given a table...

        // Maybe we build the key and value out of objects?

        // Does the record definition contain info on indexing?
        //  Probably not, as that is a feature of how the table organises the records.
        //   Maybe it is easier to have the indexing here, as indexing info does get included in the definition of records.

        // Putting quite a lot in the Record_Def.
        //  Going with the idea that Table will manage both Record_Def and actual records. Table manages that intersection, so less code there managing the specifics of either is an improvement.
        this.table = table;
        this.indexes = [];
        this.fields = [];
        // All the fields in order here.
        //  Fields will also be in their orders within the key and value
        this.foreign_keys = [];
        this.map_fields = {};
        // this map will combine the inner map fields.
        var that = this;
        // There will be separate maps for the keys and values too.
        var new_field;
        var indexes = this.indexes;

        // Map of fields belongs here



        var pk = this.pk = new Primary_Key(table);
        var value = this.value = new Record_Value_Def();

        // add_field to the key or value.
        //var storage = spec;
        //var arr_fields = [];

        var inc_fields = table.inc_fields;
        var inc_indexes = table.inc_indexes;
        var inc_foreign_keys = table.inc_foreign_keys;
        //var inc_indexes = this.inc_indexes = db.new_incrementor('inc_idx_' + this.name);
        //var inc_foreign_keys = this.inc_foreign_keys = db.new_incrementor('inc_fk_' + this.name);

        //var inc_fields = this.inc_fields = db.new_incrementor('inc_field_' + this.name);
        //var inc_indexes = this.inc_indexes = db.new_incrementor('inc_idx_' + this.name);
        //var inc_foreign_keys = this.inc_foreign_keys = db.new_incrementor('inc_fk_' + this.name);


        //console.log('is_arr_of_arrs(storage)', is_arr_of_arrs(storage));
        if (obj_record_def) this.set_def(obj_record_def);

        //console.log('fields_map', fields_map);
        //console.log('map_fields', map_fields);
        //throw 'stop';



        // Only have the name->Field map.

        //this.map_fields = map_fields;

    }

    set_fk(field, table) {
        var o_field, o_table, t_field, t_table;
        var map_fields = this.map_fields;

        if (field instanceof Field) {
            o_field = field;
        } else {
            t_field = tof(field);
            if (t_field === 'string') {
                o_field = map_fields[field];
            }
        }

        var Table = this.table.constructor;

        if (table instanceof Table) {
            //throw 'stop';
            o_table = table;
        } else {
            t_table = tof(table);
            if (t_table === 'string') {
                o_table = this.table.db.map_tables[table];
            }
        }

        if (o_field && o_table) {
            o_field.fk_to_table = o_table;

            // If the field does not know its type, then it could lookup the type of the foreign key.
            //  May get on for foreign keys that have got two values encoded, ie a tuple.
            //  The binary encoding system should be able to store tuples, triples, arrays. 

            // Have not got tuple types defined yet.
            //  Could be a pair of xas2 numbers.
            //  Essentially, they need to match the primary key.

            //console.log('o_table.pk', o_table.pk);

            if (o_table.pk.fields.length === 1) {
                // get the data type of that field.
                var pk_field = o_table.pk.fields[0];


                //console.log('pk_field.type_id', pk_field.type_id);
                // type_id
                //throw 'stop';

                o_field.type_id = pk_field.type_id;



            } else {
                //console.log('this.table.name', this.table.name);
                //console.log('field.name', field.name);

                // the field for a foreign key would need to contain two values, if the pk contains two values.
                //  a field with two values seems fine.
                //   an array type of value.

                console.log('previous throw exception here: Need to handle ' + o_table.pk.fields.length + ' fields');

                //throw 'Need to handle ' + o_table.pk.fields.length + ' fields';

                // Some kind of tuple data type for a value?
                //  Or just refer to part of the primary key?

                // Need to look at the case.


            }

            //throw 'stop';

            // Then update the field record.
            o_field.update_db_record();

            //throw 'stop';

        } else {
            throw 'stop';
        }
    }

    set_pk(pk) {
        // could have an array of strings.
        //  in which case they are the field names of the pk.

        // Needs to create the fields if they don't exist already.

        if (pk instanceof Primary_Key) {
            throw 'Dont use instance of Primary_Key here';
        } else {
            this.pk.set_def(pk);
        }


        //throw 'stop';



    }

    set_def(obj_record_def) {

        // Not so sure that fields are being set in the model creation.

        // Would add a table according to definition, and also make sure it's fields' types are in there properly.





        // Possibly will result in creating a new pk incrementor for the table.



        //console.log('set_def', obj_record_def);
        var pk = this.pk
        var that = this,
            new_field;

        // is it an array, with 2 items?
        //  if each of those is an array, it's 

        // check if its an array, then deal with the items one by one
        //  

        //console.trace();
        //throw 'stop';

        // It's an array, process the items in the array one by one.
        //  Deal with items that are specified differently in different ways.
        //  Some of them will have given types, as in [name, Type]



        if (is_arr_of_strs(obj_record_def)) {

            // Need to go through each line, adding the appropriate field.
            //  Worth adding indexes too.
            //   OO indexes would help...
            //    But maybe not yet.

            // Makes a lot of sense with different ways that indexes can be specified.

            // will need to put the system's storage into key value pairs.

            // Use the table fields incrementor?
            var kv_def = this.kv_def = [
                [],
                []
            ];
            each(obj_record_def, (item, i) => {
                //first_char = item[0];
                //console.log('first_char', first_char);

                //console.log('item', item);
                //throw 'stop';
                new_field = that.add_field(item);
                // With autoincrement fields it should know the type.
                //  Should be one of the native types.

                // Native types could be set up at the beginning anyway.


                // Some fields have got built in indexes.
                //  Adding the field should also add the index where necessary.


                // Add fields to the primary key...

                //if (new_field.is_pk) {
                //pk.add_field(new_field);
                //}

                // Already added to pk?
                //  Seems so, maybe its a side-effect elsewhere.

                //that.add_field(new_field);
                /*
                if (new_field.is_pk) {
                    //kv_def[0].push(item);
                    pk.add_field(new_field);
                } else {
                    value.add_field(new_field);
                    //kv_def[1].push(item);
                }
                */
                // Create kv_def object?
            });
            //throw 'stop';
        } else if (is_arr_of_arrs(obj_record_def)) {
            //console.log('arr of arrs');
            //console.log('storage.length', storage.length);

            // Could be key and values defined, without any indexes defined.
            var kv_def;
            var indexes_defs = [];
            //console.log('obj_record_def.length', obj_record_def.length);
            if (obj_record_def.length === 2) {
                //kv_def = storage;
                // The whole thing is a key value pair?

                // Or it's key value pair, then an index definition.
                //  storage[0] is array of arrs
                //console.log('is_arr_of_arrs(obj_record_def[0])', is_arr_of_arrs(obj_record_def[0]));
                if (is_arr_of_arrs(obj_record_def[0])) {
                    kv_def = obj_record_def[0];
                    indexes_defs = obj_record_def[1];
                } else {
                    kv_def = obj_record_def;
                }
            }
            if (obj_record_def.length === 3) {
                kv_def = storage[0];
                indexes_defs = storage[1];
                throw 'stop';
            }

            this.kv_def = kv_def;
            //console.log('this.kv_def = kv_def', this.kv_def = kv_def);

            if (tof(kv_def[0]) !== 'array') {
                console.trace();
                throw 'stop';
            }

            var f;

            each(kv_def[0], (key_field, i) => {
                //console.log('key_field', key_field);
                // don't know the type
                f = that.add_field(key_field, null, null, true);
                // then add it to the pk
                that.pk.add_field(f);

            });
            each(kv_def[1], (value_field, i) => {
                //console.log('value_field', value_field);
                that.add_field(value_field);
            });


            //console.log('indexes_defs', indexes_defs);
            //console.log('kv_def', kv_def);
            each(indexes_defs, (index_def) => {
                //var new_index = new Index(index_def);
                //console.log('index_def', index_def);
                that.add_index(index_def);
                //indexes.push(new_index);
            });
            //throw 'stop';

            //console.log('kv_def', kv_def);
            //console.log('kv_def[0]', kv_def[0]);
            //console.log('kv_def[1]', kv_def[1]);

            // Adding fields should maybe put the field into the fields table.
            // check the typr of these...
            //console.log('tof(kv_def[0])', tof(kv_def[0]));

        }
    }

    // Seems like the field would be added to the record definition.

    // add_field('type', XAS2_NUMBER, tbl_native_types);

    // Second param is the type.
    // Third param is is_pk
    // Fourth param is a table it is a foreign key reference to.

    /*
    add_field_to_fields_table(field) {
        var table_fields = this.table.db.map_tables['table fields'];
        var field_record = field.

        table_fields.add_record();

    }
    */

    // Possibility of creating a new pk incrementor in the table if it's a pk field.

    // Generally would be better to set the field type.

    add_field(field, id = -1, i_type = null, is_pk = false, fk_to_table) {
        // make the id -1 for no id set here, use incrementor.
        // want better parameter handling.
        //  maybe do that later.
        //console.log('i_type', i_type);
        // Make choosing the type optional.
        //  Less about enforcing types, more about being able to recognise an xas2 number (or more than one of them) has been given for a field which is a foreign key, that's the right type, put it in.
        //   Then if a string value is given, we can do a lookup. Would need to know something like the name is the identifier, or we are giving it the name value to look up.

        var a = arguments;
        //console.log('add_field arguments', arguments);

        // Needs to determine if the field is a PK.

        var item_field, field_name, first_char, field_incrementor;
        var table = this.table;
        // make use of own field incrementor.

        // Should have an indexes incrementor too?
        //  Where the index gets an id?

        // This is Field parsing.
        //  Could move this code to Field.ensure_is_field

        // Depending on the name of the field, the type may be given.
        //  This is the point where we assign the type of the field if it is indicated in the name.


        //let get_field_type_from_name




        if (field instanceof Field) {
            item_field = field;
        } else {
            //var id;

            if (id === -1 || id === null) {
                id = table.inc_fields.increment();
            } else {

            }

            field_name = a[0];
            // This does looks like field parsing, so could make a Field object from the 'field' object.
            //console.log('field', field);
            //console.log('tof field', tof(field));

            // This is tricky, because the table is not fully defined.
            //  Its record def could be in the midst of being constructed.
            //console.log('field_name', field_name);

            // Or if we give the field a null type, it 
            item_field = new Field(field_name, table, id, i_type, is_pk, fk_to_table);

            // Then could receive something back from the field object saying that it has an index?
            //  Saying that it is unique, then we set up the unique index.
        }


        //console.log('field_name', field_name);

        //console.log('item_field', item_field);
        //throw 'stop';
        if (item_field) {
            field_name = item_field.name;

            if (!this.map_fields[field_name]) {
                this.fields.push(item_field);
                this.map_fields[field_name] = item_field;

                if (item_field.is_pk) {
                    this.pk.add_field(item_field);

                    // Ensure the table has got a pk incrementor?

                }
            }




            //this.add_field_to_fields_table(item_field);

            //throw 'stop';
            // May be best to add it to the actual fields table?
        }

        return item_field;
    }


    // Maybe should not be done here, but within the DB as a separate process in getting the model as db rows.
    //  Seems easier not to keep these records of index structure, and calculate them when needed.

    /*
    add_index_to_index_table(index) {
        var table_indexes = this.table.db.map_tables['table indexes'];
        var field_record_def = index.to_arr_record_def();
        console.log('field_record_def', JSON.stringify(field_record_def));
        table_indexes.add_record(field_record_def);
    }
    */

    // Validation that records are in the correct format could be useful, however the encoding system is flexible so that it's not necessary in order to get the data stored.



    // get map fields merges the fields from the pk with the value...?
    //  but would need to set it either within the primary key or value section.



    // Possibly represent foreign keys as part of the field.




    add_foreign_key(field_name, foreign_table) {

        // foreign table is a string name or the table itself?

        if (!(foreign_table instanceof Table)) {
            foreign_table = this.table.db.map_tables[foreign_table];
            if (!foreign_table) {
                throw 'Table not found';
            }
        };

        // link to the actual fk field?




        // May keep a map of the foreign keys by field name / field number
        //  This way, when a record is added, its values can be looked up against the foreign key.

        var fk = new Foreign_Key(field_name, foreign_table);
        this.foreign_keys.push(fk);
        this.map_foreign_keys[field_name] = fk;

        // Then also set the field so that it's now labelled as a foreign key.

        return fk;

    }

    get_arr_record_index_values(arr_record) {
        //console.log('arr_record', arr_record);
        var res = [];

        each(this.indexes, index => {
            //console.log('index', index);

            var arr_rec_idx = index.arr_record_to_index_arr_data(arr_record);
            res.push(arr_rec_idx);
        });

        // The index fields array daya
        //  won't have index prefix, index number, 

        //console.log('res', res);


        //throw 'stop';
        return res;
    }

    add_index(idx) {


        //could give it more params.

        var a = arguments;
        a.l = a.length;


        // Index should maybe use OO index objects, if it would help to structure the code better.
        //  Really want to use some autoincrementing records.

        // As well as autoincrementing records, we need indexes that are specified to be unique.
        //  Making indexes OO would help them to have a 'unique' property specified.
        //  We can then use the Index class objects themselves to construct queries.

        // Indexes will be defined in an OO way.
        //  Index ids could come about through an incrementor. Each table would have an index incrementor.

        // Indexes need an id (within the table)
        //console.log('add_index a', a);

        var idx_2;
        //console.log('idx instanceof Index', idx instanceof Index);
        if (idx instanceof Index) {
            idx_2 = idx;
        } else {
            var sig = get_a_sig(a);

            if (a.l === 1) {
                //console.log('this', this);
                //console.log('this.table.db', this.table.db);
                //console.log('this.table.name', this.table.name);
                //console.log('this.table', this.table);
                var id = this.table.inc_indexes.increment();
                //console.log('** add_index id', id);
                //console.log('idx', idx);

                // Adds an index to a field?

                // is it a field in an array?
                //console.log('tof(idx)', tof(idx));
                //console.log('idx[0]', idx[0]);

                // Quite a hack here, solves Idx inside arr inside arr
                if (tof(idx) === 'array' && idx.length === 1 && tof(idx[0]) === 'array' && idx[0][0].__type_name === 'index') {
                    idx = idx[0][0];
                }

                idx_2 = new Index(idx, this.table, id);
                // index with idx spec, to this table with given id.

                //console.log('idx_2', idx_2);
            } else {
                //console.log('add_index sig', sig);

                if (sig === '[n,a]') {
                    //var table_id = a[0];

                    var field_id = a[0];
                    var arr_kv_index_record = a[1];

                    //console.log('field_id', field_id);
                    //console.log('arr_kv_index_record', arr_kv_index_record);


                    // Need to deal with these arr key values coming in as numbers, not string field names.


                    //var id = this.table.inc_indexes.increment();
                    idx_2 = new Index(arr_kv_index_record, this.table, field_id);
                    //console.log('idx_2', idx_2);
                    //throw 'stop';
                }

                if (sig === '[n,n,a]') {
                    throw 'stop';
                    //var table_id = a[0];

                    //var field_id = a[0];
                    //var arr_kv_index_record = a[1];
                    //var arr_kv_index_record = a[1];

                    //console.log('field_id', field_id);
                    //console.log('arr_kv_index_record', arr_kv_index_record);

                    // Need to deal with these arr key values coming in as numbers, not string field names.
                    var id = this.table.inc_indexes.increment();
                    idx_2 = new Index(arr_kv_index_record, this.table, id);
                    //console.log('idx_2', idx_2);
                    //throw 'stop';
                }

                // n,n,a
                //  don't autoincrement the table's incrementor.






                //throw 'stop';
            }




        }



        //ar index_key_def = idx[0];
        //var index_value_field = idx[1]; // foreign key?

        this.indexes.push(idx_2);
        //this.add_index_to_index_table(idx_2);




        // and maintain a map of indexes too?

        // Worth making the record in the index table.

        // Index links key and value pairs. Value should be a primary key.
        //  Sometime a primary key would be made up of a key and value.

        // [table_id, index_id][index_type, kv_fields]
        //  will need to encode the various key and value fields as array of ids.
        //  we keep track of the field ids.

        // Reconstructing the indexing system will help to create the records properly, creating the indexing records.
        //  Possibility of having that done on the server


        // index.to_table_record_def
        //  Indexes are essentially a bunch of xas2 numbers that get stored.
        //   







        // this.indexes.push([index_key_def, index_value_field]);
        // idx
        return idx_2;
    }

    get_field_names() {
        var res = [];
        each(this.fields, (field) => {
            res.push(field.name);
        });
        return res;
    }

}

module.exports = Record_Def;