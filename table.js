var jsgui = require('jsgui3');
var tof = jsgui.tof;
var xas2 = require('xas2');
var each = jsgui.each;
var is_arr_of_strs = jsgui.is_arr_of_strs;
var is_arr_of_arrs = jsgui.is_arr_of_arrs;
var get_a_sig = jsgui.get_a_sig;

var Incrementor = require('./incrementor');
var Record = require('./record');
var Field = require('./field');
var Index = require('./index');
var Foreign_Key = require('./foreign-key');

var Binary_Encoding = require('binary-encoding');
var encode_to_buffer = Binary_Encoding.encode_to_buffer;

var Record_Def = require('./record-def');
var Table_Record_Collection = require('./table-record-collection');

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



        var a = arguments, sig; a.l = a.length;

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

        var that = this, t, field_name, new_field;

        // The table linking back to the db, so that it can get the global incrementor.
        var name, db, storage;
        var spec_record_def;

        // And a constructor where we give the table the actual incrementor.
        sig = get_a_sig(a);
        //console.log('Table constructor sig', sig);


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
            console.log('ta0', ta0);

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
                console.log('spec_record_def', JSON.stringify(spec_record_def));
            //storage = a[2];
            }
        }

        if (sig === '[s,?,n,a]') {
            name = a[0];
            this.db = db = a[1];
            this.id = id = a[2];

            // need to go through that array, maybe doing lookups
            //console.log('a[3][0]', a[3][0]);
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

            

            //var inc_fields = 
            //var inc_indexes = 
            //var inc_foreign_keys = 
        }

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

            if (typeof this.id === 'undefined') {
                id = this.id = db.map_incrementors['table'].increment();
            }
        } else {
            console.trace();
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

    get own_incrementor_ids() {
        return [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id];
    }
    add_field() {
        //var args = Array.prototype.slice.call(arguments);
        //args.push(this);
        return this.record_def.add_field.apply(this.record_def, arguments);
    }

    add_record() {
        return this.records.add_record.apply(this.records, arguments);
    }
    add_records() {
        return this.records.add_records.apply(this.records, arguments);
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
    // and the index instances of the records?



    // get_all_db_records_bin
    get_all_db_records_bin() {
        // include the indexes here?

        var buf_records = this.records.get_all_db_records_bin.apply(this.records, arguments);
        //  and this makes the index records too?

        //var buf_indexes = 

        return buf_records;



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

module.exports = Table;

