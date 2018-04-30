var lang = require('lang-mini');
var tof = lang.tof;
var xas2 = require('xas2');
var each = lang.each;
var is_arr_of_strs = lang.is_arr_of_strs;
var is_arr_of_arrs = lang.is_arr_of_arrs;
var get_a_sig = lang.get_a_sig;


var Incrementor = require('./incrementor');
var Record = require('./record');
var Field = require('./field');
var Index = require('./index-def');
var Foreign_Key = require('./foreign-key');
//var Database = require('./database');

var Binary_Encoding = require('binary-encoding');
var encode_to_buffer = Binary_Encoding.encode_to_buffer;

var Record_Def = require('./record-def');
var Table_Record_Collection = require('./table-record-collection');


//var Model_Database = require('./database');

var database_encoding = require('./encoding');

// Each table will have its lower level data in the DB, and means of interacting with it here.

const table_table_key_prefix = 2;

const special_characters = {
    '!': true,
    '+': true
}

// Does seem like a split between handling the definition of a record, and the multitude of records in the table.
// Could possibly make Table_Record_Collection and specifically have that administer the records themselves associated with this model.
//  That would be a more appropriate place to have indexing of the records as well.

// Probably a better way to modularise the code, reducing complexity within the Table class itself, and allowing record definitions to be worked on outside of tables.

// Not sure about using jsgui collection for the table records collection.
//  May want something more specific.


// Table definitely looks more streamlined having separated definition and record collection parts.
//  Now need to get it to work, and get the record colleciton part working properly.

// 13/08/2017 Night - Have moved a lot of the functionality out of Table itself.
//  This will make it easier to put indexing into place.

// Still want to add records using a foreign key.
//  Will be worth rendering web pages, and displaying pages as HTML.
//  


// 29/11/2017 - 

// Likely to replace this with some OO code.
//  Will generally keep the data stored in a Buffer.


/*
const encode_model_row = (model_row) => {
    //console.log('model_row', model_row);

    if (model_row instanceof Buffer) {
        var arr_res = [xas2(model_row.length).buffer, model_row, xas2(0).buffer];
    } else {
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
*/



class Table {
    constructor(spec) {

        // Table key prefix
        //  Table indexes key prefix = table key prefix + 1

        // Makes sense to separate the definition of a record from the table itself.

        // Would the record definition store the foreign key info?
        //  The relevant fields that use foreign keys may / should have those foreign key references.

        // 13/08/2017
        //  Splitting record def up from the table itself.
        //   Record def will deal with the parsing and details of how records are defined. The records themselves are different.
        //   Does sort out the more jumbled part of Table though.

        //  Maybe it provides some more clarity though.
        //  Would go well with Table_Record_Collection. That would make Table much smaller code-wise, to the extent that it's a class to manage calls to disparate but related functionality.

        // Table Record Collection may also need to refer to some indexing data in order to carry out some tasks.
        //  It could refer to the record definition where appropriate.

        // Keep a link to the table record, once it's been made? (in the table records table)



        var a = arguments,
            sig;
        a.l = a.length;

        //console.log('Table constructor 


        // Indexes could apply to the record def anyway?
        //  Table handles the intersection of the record_def and records themselves.

        var id;

        //console.log('a', a);

        this.record_def = new Record_Def(null, this);


        this.__type_name = 'table';

        // This could have an indexes incrementor.
        // Making a new incrementor could be done from the database object.
        //  After all, the incrementor needs a globally unique id.

        //var 

        var that = this,
            t, field_name, new_field;

        // The table linking back to the db, so that it can get the global incrementor.
        var name, db, storage;
        var spec_record_def;

        // And a constructor where we give the table the actual incrementor.
        sig = get_a_sig(a);
        //console.log('Table constructor sig', sig);

        // Could have something in the record def to see if there is an autoincremeinting pk field.


        if (a.length === 1) {
            var t_spec = tof(spec.name);
            if (t_spec === 'string') this.name = spec.name;
            //this.record_def = new Record_Def(null, this);

        }

        if (a.length === 2) {
            //var t_spec = tof(spec.name);

            //if (t_spec !== 'undefined') this.name = spec.name;
            //this.record_def = new Record_Def(null, this);

            //get the type of the first param.





            var ta0 = tof(a[0]);
            //console.log('ta0', ta0);

            if (ta0 === 'array') {
                console.log('a[0]', a[0]);
                console.trace();
                throw 'stop';
            }



            name = a[0];
            this.db = db = a[1];
        }



        if (a.length === 3) {
            if (sig === '[s,?,n]') {
                name = a[0];
                this.db = db = a[1];
                this.id = id = a[2];

            } else {
                // s,?,a

                //var t_spec = tof(spec.name);
                //if (t_spec !== 'undefined') this.name = spec.name;
                name = a[0];
                this.db = db = a[1];
                //this.record_def = new Record_Def(a[2], this);
                spec_record_def = a[2];
                //
                //storage = a[2];
            }
        }



        // Seems like the primary key incrementor is not being stored correctly for the table.
        //  Should make it so that the table's records includes the primary key incrementor for the table.
        //  Also that table primary key incrementors get stored in the incrementors part of the DB.

        // Need to have these primary key incrementors reconstructed.
        //  Can't assume there are 3 incrementors per table.
        //   Could assume 4, with an unused PK incrementor. Could maybe have a row count incrementor though.

        // Looks like that will probably take more work on the model or crypto model db.
        //  May need to start the db anew to get these table pk incrementors stored.

        // Reconstruction of table pk incrementors?
        //  That may be better in the short term.
        //  Could find the highest key value in the tables.










        if (sig === '[s,?,n,a]') {
            name = a[0];
            this.db = db = a[1];
            this.id = id = a[2];

            //console.log('this.id', this.id);

            // need to go through that array, maybe doing lookups
            //console.log('a[3]', a[3]);
            //console.log('a[3].length', a[3].length);

            if (a[3].length === 3 || a[3].length === 4) {
                if (tof(a[3][0]) === 'number') {
                    var inc_fields_id = a[3][0];
                    var inc_indexes_id = a[3][1];
                    var inc_foreign_keys_id = a[3][2];

                    this.inc_fields = db.incrementors[inc_fields_id];
                    this.inc_indexes = db.incrementors[inc_indexes_id];
                    this.inc_foreign_keys = db.incrementors[inc_foreign_keys_id];
                } else {
                    this.inc_fields = a[3][0];
                    this.inc_indexes = a[3][1];
                    this.inc_foreign_keys = a[3][2];
                }
            }
            if (a[3].length === 4) {
                if (tof(a[3][0]) === 'number') {
                    var inc_pk_id = a[3][3];
                    this.pk_incrementor = db.incrementors[inc_pk_id];
                } else {
                    this.pk_incrementor = a[3][3];
                }
            }
            //var inc_fields = 
            //var inc_indexes = 
            //var inc_foreign_keys = 
        }

        //console.log('spec_record_def', JSON.stringify(spec_record_def));

        // Table could have a primary key value incrementor.
        //  That value could already be set to something.




        if (name) this.name = name;
        //console.log('this.name', this.name);

        //console.log('db', db);
        if (db) {
            //this.db = db;

            // The incrementor for the fields... that is part of the db and the table???
            //  Not sure though, as they apply to what is now part of the record def.
            //   These incrementors are used in defining what the record is.

            // 3 incrementors per table.
            //  Seems worth noting down all of their IDs.
            //  Or just the first
            //  Or we can work it out.
            //  (Table id * 3) + 1.

            // When reconstructing database, will be necessary to recreate the incrementors.
            //  Probably best to create the incrementors separately, in one go, then assign them to the tables.

            if (!this.inc_fields) this.inc_fields = db.new_incrementor('inc_field_' + this.name);
            if (!this.inc_indexes) this.inc_indexes = db.new_incrementor('inc_idx_' + this.name);
            if (!this.inc_foreign_keys) this.inc_foreign_keys = db.new_incrementor('inc_fk_' + this.name);

            //var inc_fields = this.inc_fields = this.inc_fields || db.new_incrementor('inc_field_' + this.name);
            //var inc_indexes = this.inc_indexes = this.inc_indexes || db.new_incrementor('inc_idx_' + this.name);
            //var inc_foreign_keys = this.inc_foreign_keys = this.inc_foreign_keys || db.new_incrementor('inc_fk_' + this.name);

            //console.log('this.id', this.id);

            if (typeof this.id === 'undefined') {
                id = this.id = db.map_incrementors['table'].increment();
                //console.log('id', id);
                //console.log('name', name);
            }
        } else {
            console.trace();

            // Use a pseudo-incrementor?
            //  As in we don't add the incrementors to the database (yet)
            //  For the moment we just want to create the table object, not sure if we want it added to the db.

            throw 'Create new incrementors not connected to db';

        }

        if (spec_record_def) {
            //console.log('spec_record_def', spec_record_def);

            this.record_def.set_def(spec_record_def);
            //this.record_def = new Record_Def(spec_record_def, this);
        } else {
            //this.record_def = new Record_Def(null, this);
        }

        this.records = new Table_Record_Collection(this);

        // Does not store the fields like that.
        //  Will be in the OO record_def.

        //if (storage) this.storage = storage;

        // We get the table id from the tables incrementor.
        //console.log('db.map_incrementors', db.map_incrementors);

        // ID is part of the table itself.

        //var id;
        // if (db) 

        //console.log('id', id);

        // and create a new incrementor for the table's indexes?
        //  got it already

        // could use getters to combine the map_fields from the key and value definitions.
        //  


        // Refer to the record def for the map fields for the moment?
        //  There it is split into primary key and value fields.



        //var map_fields = this.map_fields = {};
        //this.map_foreign_keys = {};


        this.key_prefix = 2 + id * 2;

        this.indexes_key_prefix = this.key_prefix + 1;
        //throw 'stop';
        var new_inc, is_key, first_char;

        //console.log('storage', storage);
        /*

        if (storage) {

            // Some fields (particularly the id key field) will have an incrementor as its value/type.
            // an array of fields...
        
            //this.map_fields_2 = map_fields_2;
        }
        */
    }


    get buf_kp() {
        if (this._buf_kp) {
            return this._buf_kp;
        } else {
            this._buf_kp = xas2(this.key_prefix).buffer;
            return this._buf_kp;
        }
    }

    set_fk() {
        return this.record_def.set_fk.apply(this.record_def, arguments);
    }


    set_pk() {
        return this.record_def.set_pk.apply(this.record_def, arguments);
    }

    add_index() {
        //this.record_def.add_index.apply(this.record_def, arguments);
        return this.record_def.add_index.apply(this.record_def, arguments);



        //return this.record_def.add_index.apply(this, arguments);
    }
    /*
    add_field() {
        var args = Array.prototype.slice.call(arguments);
        args.push(this);
        return this.record_def.add_field.apply(this.record_def, args);
    }
    */


    get incrementors() {
        var res;
        if (this.pk_incrementor) {
            res = [this.inc_fields, this.inc_indexes, this.inc_foreign_keys, this.pk_incrementor];
        } else {
            res = [this.inc_fields, this.inc_indexes, this.inc_foreign_keys];
        }
        return res;
    }

    get own_incrementor_ids() {
        var res;
        if (this.pk_incrementor) {
            res = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id, this.pk_incrementor.id];
        } else {
            res = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id];
        }
        return res;
    }

    add_field() {
        //var args = Array.prototype.slice.call(arguments);
        //args.push(this);

        //console.log('table add_field ', arguments);

        return this.record_def.add_field.apply(this.record_def, arguments);
    }

    add_record() {
        return this.records.add_record.apply(this.records, arguments);
    }
    add_records() {
        //console.log('this.records', this.records);
        return this.records.add_records.apply(this.records, arguments);
    }

    ensure_records_no_overwrite() {
        // ensure_records_no_overwrite
        return this.records.ensure_records_no_overwrite.apply(this.records, arguments);
    }

    add_records_including_table_id_in_key() {
        return this.records.add_records_including_table_id_in_key.apply(this.records, arguments);
    }
    // add_records_including_table_id_in_key

    new_record() {
        return this.records.new_record.apply(this.records, arguments);
    }

    new_records() {
        return this.records.new_records.apply(this.records, arguments);
    }

    add_arr_table_records(at_records) {
        return this.records.add_arr_table_records.apply(this.records, arguments);
    }

    // could have a fields getter.
    //  The fields are normally split into key and value.

    get primary_key() {
        return this.record_def.pk;
    }
    get pk() {
        return this.record_def.pk;
    }

    get map_fields() {
        return this.record_def.map_fields;
    }

    get fields() {
        //return Array.concat();
        return this.record_def.fields;
    }
    get indexes() {
        //return Array.concat();
        return this.record_def.indexes;
    }

    get field_names() {
        var res = [];
        each(this.fields, (field) => {
            res.push(field.name);
        });
        return res;
    }

    get inward_fk_refs() {
        let res = [];
        each(this.db.tables, table => {
            let has_ref = false;
            each(table.fields, field => {
                if (field.fk_to_table === this) {
                    has_ref = true;
                }
            });
            //if (table.)
            if (has_ref) {
                res.push(table.name);
            }
        })
        return res;
    }

    get structure_record() {
        /*

        tbl_tables.add_record([
                [table.id],
                [table.name, [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]]
            ]);

            */

        // Table KP

        let incrementor_ids;
        if (this.pk_incrementor) {
            incrementor_ids = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id, this.pk_incrementor.id];
        } else {
            incrementor_ids = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id];
        }

        let res = [
            [table_table_key_prefix, this.id],
            [this.name, incrementor_ids]
        ]
        return res;

    }

    get buf_structure_record() {
        // Encode the model rows.
        //  Could have separate db-binary-encoding
        //   That would help to clean up the code a lot.

        var prefix = this.key_prefix;

        //console.log('this.key', this.key);
        //console.log('prefix', prefix);

        //console.log('[this.key, this.value]', [this.key, this.value]);
        //console.log('prefix', prefix);

        var res = Binary_Encoding.encode_pair_to_buffers(this.structure_record, prefix);
        return res;

    }

    get outward_fk_refs() {
        let res = [];
        let map = {};

        each(this.fields, field => {
            if (field.fk_to_table && !map[field.fk_to_table.name]) {
                map[field.fk_to_table.name] = true;
                res.push(field.fk_to_table.name);
            }
        });
        return res;
    }


    // A server-side download_full_table_records would be useful
    //  Even the record in the tables table.
    //   Could also have some overwrite protection on that side of things.
    //   Noticed that we may not need the tables incrmementor, with there being a tables id and it autoincrements in the tables table.




    // and the index instances of the records?

    get_map_lookup(field_name) {

        //console.log('field_name', field_name);
        // looks it up to the primary key.
        //  don't bother consulting the index right now.

        // Need to use a flattened map of the fields?
        //  Map of the flattened fields?
        //  Have an issue here ... but problem is with decoding elsewhere. With loading tables.

        var i_field = this.map_fields[field_name].id;
        //console.log('i_field', i_field);

        var res = {};
        //var field_i = this.fields[i_field];

        this.records.each((record) => {
            //res[record]
            //console.log('record', record);
            //console.log('record.', record);

            // record get value by field name
            //  or by field id.

            // Change it to flat array
            var arr_rec = record.to_flat_arr();
            //console.log('arr_rec', arr_rec);

            var field_value = arr_rec[i_field];
            //console.log('field_value', field_value);
            //console.log('record.key', record.key);

            // get the pk field or fields.

            //if (record.key)

            res[field_value] = record.key;

            //throw 'stop';

        });
        //console.log('field_i', field_i);
        //console.log('field_i', field_i.name);
        //throw 'stop';
        return res;
    }


    // Get expansive all records
    //  All records associated with the table too
    //   Incrementor records
    //   Field records

    // When doing some updates, could get two sets of records, and compare them.
    //  Do an object diff on before and after
    //   Any records which have changed then get put to the DB.

    // That seems like the right way of carrying out various server-side tasks, such as adding a table.
    //  The difference would be spread accross quite a number of model rows.

    // Doing a diff on the full model rows would work well.
    //  Then can send the changed rows to the database


    get_all_db_records() {
        // include the indexes here? seems not
        //console.log('get_all_db_records');
        //var buf_records = this.records.get_all_db_records_bin.apply(this.records, arguments);

        var arr_records = this.records.get_all_db_records.apply(this.records, arguments);

        //  and this makes the index records too?
        //var buf_indexes = 
        return arr_records;
    }


    // get_all_db_records_bin
    get_all_db_records_bin() {
        // include the indexes here? seems not
        //console.log('get_all_db_records_bin');
        var buf_records = this.records.get_all_db_records_bin.apply(this.records, arguments);
        //  and this makes the index records too?
        //var buf_indexes = 
        return buf_records;
    }

    // 

    get_arr_data_index_records() {

        // Get it for a specific record...



        return this.records.get_arr_data_index_records.apply(this.records, arguments);
    }

    buf_pk_query(arr_pk_part) {
        //var res = [xas2(this.key_prefix).buffer];
        //console.log('Database', Database);

        //var res = Database.encode_key(this.key_prefix, arr_pk_part);

        // Binary_Encoding.encode_to_buffer(arr_values, kp);
        var res = Binary_Encoding.encode_to_buffer(arr_pk_part, this.key_prefix);
        return res;
    }

    get buf_structure() {
        // need the incrementor's records.
        // table table record
        // then the table field records

        let all_buf_records = [];

        let buf_inc_records = [];

        let buf_kvs = [];
        //let bufs_encoded_rows = [];


        //throw 'stop';

        console.log('buf_inc_records', buf_inc_records);



        let ttr = this.structure_record;
        console.log('ttr', ttr);

        //throw 'stop';
        // Model_Database.encode_arr_rows_to_buf

        let rows = [];

        rows.push(ttr);

        //bufs_encoded_rows.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(ttr, 2)));

        each(this.incrementors, incrementor => {
            //let buf_inc = incrementor.get_all_db_records()[0];
            //console.log('buf_inc', buf_inc);


            let inc_row = incrementor.get_record();

            //each(bufs_inc, b => buf_inc_records.push([b[0],
            //    []
            //]))

            //let row = [buf_inc, []]

            rows.push(inc_row);

            //rows.push([bufs_inc[0],
            //    []
            //]);

            /*
            let i_kv_buf = Binary_Encoding.encode_pair_to_buffers([bufs_inc[0],
                []
            ]);
            console.log('i_kv_buf', i_kv_buf);
            buf_kvs.push(i_kv_buf);
            bufs_encoded_rows.push(encode_model_row(i_kv_buf));
            */


        });
        //throw 'stop';

        each(this.fields, field => {
            let kv_field = field.get_kv_record();
            rows.push(kv_field);

            //const kp_fields_table = 6;

            //kv_field[0].unshift(kp_fields_table);
            // Then encode these model rows, with that kp.

            console.log('kv_field', kv_field);
            //bufs_encoded_rows.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(kv_field, 6)));

        })

        //throw 'stop';


        //all_buf_records = all_buf_records.concat(buf_inc_records);
        //all_buf_records.push(ttr);



        //console.log('ttr', ttr);

        //console.log('buf_kvs', buf_kvs);
        //console.log('rows', JSON.stringify(rows, null, 2));


        each(rows, row => console.log('row', row));
        // Then how to encode the records together?

        //throw 'stop';




        // encode_rows

        let buf_encoded_rows = database_encoding.encode_rows_including_kps_to_buffer(rows);



        console.log('* buf_encoded_rows', buf_encoded_rows);
        //throw 'stop';

        return buf_encoded_rows;

        // all_buf_records



        /*
        each(all_buf_records, kv_buf_pair => {
            console.log('kv_buf_pair', kv_buf_pair);

            let encoded_pair = Binary_Encoding.encode_pair_to_buffers(kv_buf_pair, this.key_prefix);
            console.log('encoded_pair', encoded_pair);

            buf_kbs.push(encode_model_row(encoded_pair));
        });
        */

        //console.log('buf_kbs', buf_kbs);



    }

    validate_row(row) {
        // Need to restore the db 

        // Row already has a key prefix?

        // Check row length

        // Is row divided into both key and value

        var res = true;
        var r2 = [row[0].slice(1), row[1]];

        // 

        //console.log('table.fields.length', table.fields.length);

        //console.log('r2.length', r2[0].length + r2[1].length);
        //console.log('r2', r2);

        if (r2[0].length + r2[1].length !== this.fields.length) {
            res = false;
        } else {
            // check the fields of this to see if the types match.

        }
        return res;
    }




    //get_table_table_db_records_bin() {
    // (the record for the table table + single (so far) record for indexing)

    //}



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

var p = Table.prototype;
p.get_obj_map = p.get_map_lookup;

module.exports = Table;