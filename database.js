// The Database abstraction.

// Much will happen within the Model. It will have the means to produce records that fit in within the DB structure, and be useful for normalization.
//  

// This will help to get the theory of what gets added to the database more testable and explainable.
//  Before a db is set up, it will be possible to tell how many records get added to LevelDB.

// May be worth making this into another module, that can be accessed by clients as well.
//  Want it to be possible to use these models server-side as setup, but they could be useful on client-side to define databases.
//  Could possibly upload the model to the server, or it could send the lower level setup / ensure instructions to the server.

// There is a bit more to do to get a database definition that works in theory, with clearly defined spaces for records to go.
//  It would be nice if it generated getting started / help files.

// Next stage is to make more tables that are like plugins.
//  Ideally want to define some data and record types.

// 07/08/2017 - May be best to put the indexes into the database in terms of how they are defined.
//  Could require different encoding?

// Also will reconstruct model database from system rows.
//  Recreating the Table objects will be useful.
//  Will enable further data to be loaded into that model database, which would then assign it the key-value encoding to go into the database.

// Seems like a good few more days of programming.
//  Want there to be a fairly seamless process where we have records, know what table they belong to, the data transformation pipeline is specified, then we put that data into the
//  database in the right kind of formatting.

// Trades that get put into the db will be sequential, if they have trade ids.
// Also need to consider latest price snapshots when they are available.
//  Different exchanges will provide data in different ways, some better than others.

// Decoding the tables and fields from db records seems useful.
//  Would then be able to normalize and index data as it comes in.

// Then it would be easy to connect to an existing database, load the system model, then load some other tables (like currencies) into that model,
//  then trading data records can be made within that model, and their keys and values sent to the live db. The live db would operate with its own model to create the proper index records for the trade / price data.

/*
    1. connect to an existing database
    2. load the system model
    3. then load some other tables (like currencies and markets) into system model
    4. trading data records can be made within model
    5. their keys and values sent to the live db (encoded as binary)
    6. live db would operate with its own model (system model + lookup tables) to create the proper index records for the trade / price data

Seems like quite a lot more work to do, but this way helps to guarantee consistency, and once it's made, ease of use.
Should be fairly performant, with some lookup data held within JavaScript objects.

Once this is done:

1. Capture live prices of currencies
2. Make an OO class to load up historical data and to provide updates
    Connected to the DB, but keeps the values in-memory.

(More OO data structures that keep a bunch of time-value sequences in memory)

Once we have the classes that connect up the DB, sync with it (loading data to memory) and then have that data simply arranged in RAM for analysis, there will be a lot more potential.

Mathematical analysis
GUI programming displaying graphs

GUI programming displaying the contents of the tables
    This seems important to push progress on the Data_Grid.

Displaying the last day or whatever of price movements using a Data_Grid along with a Line_Chart would look nice.

Very much worth making some kind of connected_db, connected_table (and connected_record classes later?)

With connected_table, we should be able to input a record with one simple command.
  Would handle some normalization through key lookup itself.

Then will be able to accept the large number of records that need to be put in place.
Indexing records by [market, time] and / or [time] and putting those records into buckets as multiple can happen at the same time.

Or have a unique index by time [market, time, pk] or [time, pk], as that would be conceptually similar to buckets apart from using multiple lower level records.
Buckets on one record could be more efficient for getting the set of ids quickly.

Index bucketing seems like a useful technique for some situations, but at present not necessary.
Could be a decent efficiency improvement, could use a bucketed index, and define that as another index type (that does not require unique index keys)


Want there to be simple APIs to use in terms of getting the data, then storing it.

Then retrieving it.


Want an OO system that presents the data in a form that's easy to use for the programmer.


// Having a working CockroachDB would help with loading the data into it, then getting the data out of it.

// could have CockroachDB_Assets_Client

*/


var lang = require('lang-mini');
/*
var each = lang.each;
var get_a_sig = lang.get_a_sig;
var clone = lang.clone;
var tof = lang.tof;
*/

const {each, get_a_sig, clone, tof, Evented_Class} = lang;

var Incrementor = require('./incrementor');
var Table = require('./table');
var Record = require('./record');
const deep_equal = require('deep-equal');

var Binary_Encoding = require('binary-encoding');
var xas2 = require('xas2');
// should have some connected model classes, extending these.

let database_encoding = require('./encoding');

let decode_model_rows = database_encoding.decode_model_rows;
let encode_model_row = database_encoding.encode_model_row;

const deep_diff = require('deep-object-diff').diff;

const Record_List = require('./buffer-backed/record-list');


// However, we should include the native types.
//  Don't completely correspond to the encoding number
//  could have the type and the value encoded. Eg true, false, positive int 0, positive int 1

// 0 - xas2 number
// 1 - 64 bit BE float
// 2 - unix time in ms           t
// 3 - unix time range in ms     [t, t]
// 4 - string                    [xas2(l), str]
// 5 - indexed xas2 number, representing a string
// 6 - bool, 1 byte
// 7 - null. No further data
// 8 - buffer of binary data


const NT_XAS2_NUMBER = 1;
const NT_DATE = 2;
const NT_TIME = 3;
const NT_STRING = 4;
const NT_FLOAT32_LE = 5;

const map_core_table_names = {
    'tables': true,
    'native types': true,
    'table fields': true,
    'table indexes': true
}

const add_table_event_listeners = (db, table) => {
    // listen for changes where the table has new foreign key fields (that refer elsewhere)

    table.on('change', e_change => {
        //console.log('add_table_event_listeners change', e_change);
    });

}

class Database extends Evented_Class {

    // Database could have a name.
    //  Storing a name as a DB Property would be useful.
    //  A System Properties table would be of use.

    constructor(spec) {
        super();
        this.__type_name = 'database';
        // Such a core part of the Model that we'll do it here.

        var map_incrementors = this.map_incrementors = {};
        var incrementors = this.incrementors = [];
        var tables = this.tables = [];
        var map_tables = this.map_tables = {};
        let map_tables_by_id = this.map_tables_by_id = {};
        // map indexes by fields.

        if (typeof spec === 'undefined') {
            //throw 'stop';

            this.create_db_core_model();
        }

        if (spec === false) {

        } else {
            var t_spec = tof(spec);
            if (t_spec === 'array') {
                // load the db def.
                this.load_db_arr_def(spec);

            } else {

            }
        }
    }

    get arr_table_ids_and_names() {
        var tables = this.tables,
            l = tables.length;
        var res = new Array(l);
        each(tables, (table, i) => {
            res[i] = [table.id, table.name];
        })
        return res;
    }

    get map_table_kps() {
        var tables = this.tables,
            l = tables.length;
        var res = {};
        each(tables, (table) => {
            res[table.key_prefix] = table;
        })
        return res;
    }

    // show tables?

    get description() {
        var tables = this.tables,
            l = tables.length;
        var res = [];
        each(tables, (table, i) => {
            //res[i] = [table.id, table.name];
            res.push(table.name + '\n');
            res.push('-'.repeat(table.name.length) + '\n\n');
            res.push('fields\n');
            each(table.fields, (field) => {
                //res.push('\t', field.description);
                res.push('    ', field.description + '\n');
            });
            // and the table indexes

            res.push('indexes\n');
            each(table.indexes, (index) => {
                //res.push('\t', field.description);
                res.push('    ', index.description + '\n');
            });

            res.push('\n');
        })
        return res.join('');
    }

    get_obj_map(table_name, field_name) {
        return this.map_tables[table_name].get_map_lookup(field_name);
    }

    view_decoded_rows() {
        var model_rows = this.get_model_rows();
        each(model_rows, (model_row) => {
            //console.log('1) model_row', model_row);
            console.log('model_row', Database.decode_model_row(model_row));

        });
        console.log('\n\n\n');
    }


    load_db_arr_def(arr_def) {
        // Core model is important for some things, but it's got in the way of loading.
        //  May need to be careful to set some table ids etc.

        // Definition is a list of tables.
        this.create_db_core_model();
        // definition supposes core model already exists.
        var tables = arr_def;
        //var that = this;
        each(tables, (table) => {
            //var table_name = table[0];
            //var table_def = table[1];
            //console.log('\n\n\n');
            //console.log('table', table);
            this.add_table(table);
        });
    }

    load_db_def(def) {
        var t_def = tof(def);
        if (t_def === 'array') {
            return load_db_arr_def(def);
        }
    }

    // Worth having the full database creation here.
    //  Create the full rows / values of an initial database, and output that without needing to use any DB software.

    // Should be able to test an existing model against an existing database.
    //  Show which keys from the model are there.
    //   The keys from the model will show the necessary database 

    create_db_core_model() {

        // Maybe core model should not be created before loading.
        //  Or need to change loading code to avoid messing it up.

        //console.log('create_db_core_model');
        //console.trace();

        this._init = true;
        let incrementors = this.incrementors;
        let map_incrementors = this.map_incrementors
        let tables = this.tables;
        let map_tables = this.map_tables;
        let map_tables_by_id = this.map_tables_by_id;


        //let map_tables_incoming_fks = {};
        // target table, source table (with the field)
        //  want to quickly lookup when a table has got records that refer to it.
        //   then with any record, we can find the references using the db structure and the key, maybe index lookups on that field.
        //  [target table id, source table id, source field id]


        let inc_incrementor = this.inc_incrementor = new Incrementor('incrementor', 0, 1);
        incrementors.push(inc_incrementor);
        let inc_table = this.inc_table = this.new_incrementor('table');
        each(incrementors, (incrementor) => {
            map_incrementors[incrementor.name] = incrementor;
        });

        // Only creates the model, rather than does anything connected directly with the db.
        // Much of the core is created using lower level operations.
        //  This is because it is a platform that some higher level operations rely on.
        //  The platform for the higher level commands / oo is not fully in place before the core db has been created.

        // Seems like it would need to get the id through using the incrementor.

        let tbl_tables = new Table('tables', this);

        // Don't use add_table, because it will create the relevant table record and table field records. These tables don't yet exist.
        //this.add_table(tbl_tables);
        tables.push(tbl_tables);
        //inc_table.increment();

        map_tables[tbl_tables.name] = tbl_tables;
        map_tables_by_id[tbl_tables.id] = tbl_tables;
        this.tbl_tables = tbl_tables;

        // add event listeners for the tables.

        tbl_tables.set_pk('+id');
        tbl_tables.add_field('name', -1, NT_STRING);

        tbl_tables.add_index([
            ['name'],
            ['id']
        ]);

        var tbl_native_types = new Table('native types', this);
        tbl_native_types.add_field('+id', -1);
        tbl_native_types.add_field('name', -1, NT_STRING);
        map_tables[tbl_native_types.name] = tbl_native_types;
        map_tables_by_id[tbl_native_types.id] = tbl_native_types;
        this.tbl_native_types = tbl_native_types;
        tbl_native_types.add_index([
            ['name'],
            ['id']
        ]);

        tbl_native_types.add_records([
            [[0], ['xas2']],
            [[1], ['date']],
            [[2], ['string']],
            [[3], ['float32le']]
        ]);
        tables.push(tbl_native_types);
        //inc_table.increment();
        tbl_native_types.pk_incrementor.value = 4;
        //map_tables[tbl_native_types.name] = tbl_native_types;

        //this.add_table(tbl_native_types);
        //this.tbl_native_types = tbl_native_types;

        var tbl_fields = new Table('table fields', this);
        tables.push(tbl_fields);
        //inc_table.increment();
        map_tables[tbl_fields.name] = tbl_fields;
        map_tables_by_id[tbl_fields.id] = tbl_fields;

        // Should not have its own autoincrementing id, apart from 
        var tbl_table_indexes = this.tbl_indexes = new Table('table indexes', this);
        tables.push(tbl_table_indexes);
        //inc_table.increment();
        map_tables[tbl_table_indexes.name] = tbl_table_indexes;
        map_tables_by_id[tbl_table_indexes.id] = tbl_table_indexes;

        // 
        tbl_fields.set_pk(['table_id', 'id']);
        tbl_fields.set_fk('table_id', tbl_tables);

        tbl_fields.add_field('name', -1, NT_STRING);

        this.tbl_fields = tbl_fields;

        //this.tbl_fields = tbl_fields;

        var add_table_table_record = (table) => {

            //console.log('add_table_table_record table.name', table.name);
            //console.log('table.inc_foreign_keys.id', table.inc_foreign_keys.id);
            //console.log('table.inc_foreign_keys.id',)

            // Need more work on binary encoding array items.
            //  Maybe need more work on binary decoding these embedded arrays.

            //console.log('[table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]', [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]);
            //throw 'stop';

            // 

            if (table.pk_incrementor) {
                tbl_tables.add_record([
                    [table.id],
                    [table.name, [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id, table.pk_incrementor.id]]
                ]);
            } else {
                tbl_tables.add_record([
                    [table.id],
                    [table.name, [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]]
                ]);
            }
            tbl_tables.pk_incrementor.increment();
        }

        //this.tbl_tables.add_record([[table.id], [table.name, [table.incrementors[0].id, table.incrementors[1].id, table.incrementors[2].id]]]);

        add_table_table_record(tbl_tables);
        add_table_table_record(tbl_native_types);
        add_table_table_record(tbl_fields);
        add_table_table_record(tbl_table_indexes);
        this._init = false;

        // Adding the record to the tables table.
        //  That should maybe be done later, or after changes to the table object.

        this.add_tables_fields_to_fields_table(tbl_tables);
        this.add_tables_fields_to_fields_table(tbl_native_types);
        this.add_tables_fields_to_fields_table(tbl_fields);
        this.add_tables_fields_to_fields_table(tbl_table_indexes);

        this.add_tables_indexes_to_indexes_table(tbl_tables);
        this.add_tables_indexes_to_indexes_table(tbl_native_types);
        this.add_tables_indexes_to_indexes_table(tbl_fields);
        this.add_tables_indexes_to_indexes_table(tbl_table_indexes);
        // no, the table incrementor

        // Seems more of an issue upon loading.
        // this seems to make problems in some cases.

        // This does cause some problems.
        //  It's worth making a fix specifically for this.

        //inc_table.increment(6); // Space for more system tables.
        //tbl_tables.pk_incrementor.increment(6);
    }

    add_incrementor() {
        // Use the incrementor incrementor to get the new incrementor id?
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a);
        //console.log('add_incrementor sig', sig);
        //throw 'stop';
        if (sig === '[n,s,n]') {
            var id = a[0],
                name = a[1],
                value = a[2];

            var res = new Incrementor(name, id, value);
            this.incrementors.push(res);
            //console.log('this', this);
            this.map_incrementors[name] = res;
            return res;
        } else {
            console.trace();
            throw 'Unexpected incrementor signature, ' + sig;
        }
    }

    new_incrementor(name) {
        var id = this.inc_incrementor.increment();
        var res = new Incrementor(name, id, 0);
        this.incrementors.push(res);
        //console.log('this', this);
        this.map_incrementors[name] = res;
        return res;
    }

    //get tables() {
    //    return this.record_def.tables;
    //}
    add_tables_indexes_to_indexes_table(table) {
        var tbl_indexes = this.tbl_indexes;
        var that = this;
        //console.log('table.fields.length', table.fields.length);
        //throw 'stop';
        each(table.indexes, (index) => {
            // Store a bit of info alongside.
            //  Is it a primary key
            //  Info on it being a foreign key - what table it refers to.
            // This is to do with the fields table's fields. Need to be somewhat careful with this.
            var arr_kv_index_record = index.get_kv_record();
            var ti_record = tbl_indexes.add_record(arr_kv_index_record);
        });
        //throw 'stop';
    }

    add_tables_fields_to_fields_table(table) {
        //console.log('add_tables_fields_to_fields_table table.name', table.name);
        var tbl_fields = this.tbl_fields;
        //console.log('table.fields.length', table.fields.length);
        //throw 'stop';
        each(table.fields, (field) => {
            var arr_kv_field_record = field.get_kv_record();
            var tf_record = tbl_fields.add_record(arr_kv_field_record);
            field.db_record = tf_record;
        });
    }

    add_table(table_def) {
        var a = arguments;
        var tables = this.tables,
            map_tables = this.map_tables,
            map_tables_by_id = this.map_tables_by_id;
        var table, name;
        var sig = get_a_sig(a);

        // , add_fields_and_indexes_table_records = false
        // Long complex sig now.
        let add_fields_and_indexes_table_records = false;

        // Should probably get the table id here from using the incrementor, rather than from within the table constructor.
        //console.log('add_table sig', sig);
        //console.log('a', a);
        //console.log('table_def', table_def);
        // the table def maybe does not contain a reference to the database.
        //  That should be added.
        // 
        // Could check that an added table has its fields set up right.
        //  A more thorough test procedure could do this, all within the model.
        //  Create a model with core rows, add a table, then check its autoincremented fields are set up right.
        // Maybe they had been right all along, just it had not looked up FK references to find the type of the field.
        //  
        if (sig === '[s,a]') {
            name = a[0];
            var spec_record_def = a[1];
            table = new Table(name, this, spec_record_def);
        } else if (table_def instanceof Table) {
            table = table_def;
        } else if (sig === '[a]') {
            var a_sig = get_a_sig(a[0]);
            //console.log('a_sig', a_sig);
            //throw 'stop';
        } else if (a_sig === '[s,a]') {
            var table_name = a[0][0];
            var table_inner_def = a[0][1];
            table = new Table(table_name, this, table_inner_def);
        } else if (sig === '[s]') {
            table = new Table(a[0], this);
        } else if (sig === '[s,n]') {
            table = new Table(a[0], this, a[1]);
        } else if (sig === '[s,n,a]') {
            table = new Table(a[0], this, a[1], a[2]);
        } else if (sig === '[s,n,a,b]') {
            add_fields_and_indexes_table_records = a[3];
            table = new Table(a[0], this, a[1], a[2]);
        } else {
            table = new Table(table_def, this);
        }

        each(table.fields, field => {
            if (field.fk_to_table) {
                //console.log('fk field', field);
                let to_table_id = field.fk_to_table.id;
                // and it goes to the pk of the table
                
                let from_table_id = field.table.id;
                let from_field_id = field.id;

                console.log('foreign key: [to_table_id, from_table_id, from_field_id]', [to_table_id, from_table_id, from_field_id]);

                this.map_tables_incoming_fks = this.map_tables_incoming_fks || {};

                this.map_tables_incoming_fks[to_table_id] = this.map_tables_incoming_fks[to_table_id] || {};
                this.map_tables_incoming_fks[to_table_id][from_table_id] = from_field_id;
                
                //this.map_tables_incoming_fks[[to_table_id, from_table_id].toString()] = from_field_id;
            }
            // if it points towards another field, then we want to put it in a map of incoming fk refs
            // With some tables, we may want to find every field that refers to it.
        });
        // Assign it to the db.
        // name, db, record_def

        //console.log('add_table table.name', table.name);


        // We don't get these change listeners as its building the table.
        //  They would be useful as wqe want to notice when the table adds a field with a foreign key.

        // At this point we could scan the tables to see which fields have got foreign keys.
        //  Iterating all fields would help.

        //console.log('pre atl');
        add_table_event_listeners(this, table);

        tables.push(table);
        map_tables[table.name] = table;
        map_tables_by_id[table.id] = table;

        // add_fields_and_indexes_table_records

        if (add_fields_and_indexes_table_records || !this._init) {
            this.add_tables_fields_to_fields_table(table);
            // and assign the field records to the fields while doing this.
            // add record to tables table
            // Want to encode an array within a record. Should be OK.
            var arr_inc_ids = table.own_incrementor_ids;
            // ensure record?
            this.tbl_tables.add_record([
                [table.id],
                [table.name, arr_inc_ids]
            ]);
            this.add_tables_indexes_to_indexes_table(table);
        }
        //console.log('this', this);
        this.raise('change', {
            'name': 'add_table',
            'value': table
        });
        return table;
    }

    iterate_all_fields(handler) {
        each(this.arr_tables, table => {
            each(table.fields, field => {
                handler(field);
            });
        });
    }

    table_exists(table_name) {
        return !!this.map_tables[table_name];
    }

    ensure_table(table_def) {
        var sig = get_a_sig(table_def);
        //console.log('Database ensure_table table_def sig', sig);
        if (sig === '[s,a]') {
            let name = a[0];
            if (this.table_exists(name)) {
                // nothing to do
                return true;
            } else {
                var spec_record_def = a[1];
                return this.add_table(table_def);
            }
            // check if the table exists.
            //var spec_record_def = a[1];
            //table = new Table(name, this, spec_record_def);
        }
    }

    each_record(cb_record) {
        each(this.tables, (table) => {
            //console.log('table', table);
            each(table.records, cb_record);
        })
    }

    records_to_buffer() {
        var arr_res = [];
        this.each_record((record) => {
            arr_res.push(record.to_buffer());
        })
        return Buffer.concat(arr_res);
    }

    // to_buffer?
    records_with_indexes_to_buffer() {
        var arr_res = [];
        // Why are there empty records?
        this.each_record((record) => {
            if (!record) {
                console.log('record.table.name', record.table.name);
                console.trace();
                console.log('empty record');
                throw 'empty record';
            }
            arr_res.push(record.to_buffer_with_indexes());
        })
        return Buffer.concat(arr_res);
    }
    // to_buffer
    // Maybe worth retiring or renaming this.
    //  Gets an array of encoded rows.


    get_arr_model_rows() {
        var incrementors = this.incrementors;
        var tables = this.tables;
        var res = [];
        each(incrementors, (incrementor) => {
            var incrementor_db_records = incrementor.get_all_db_records();
            each(incrementor_db_records, (incrementor_db_record) => {
                res.push(incrementor_db_record);
            });
        });
        each(tables, (table) => {
            var table_all_db_records = table.get_all_db_records();
            each(table_all_db_records, (table_db_record) => {
                res.push(table_db_record);
            });
        });
        return res;
    }

    // Is there a way to get these decoded to start with, rather than getting all db records bin
    // Gets them as binary
    get_model_rows() {

        // Still seems like the tables have been put together wrong.

        // incrementor rows...
        var incrementors = this.incrementors;
        var tables = this.tables;
        var res = [];

        each(incrementors, (incrementor) => {
            var incrementor_db_records = incrementor.get_all_db_records_bin();
            each(incrementor_db_records, (incrementor_db_record) => {
                res.push(incrementor_db_record);
            });
        });
        // Tables should be in order.Not sure why it's not.
        //  Could look into the ordering of tables here.
        //console.log('this.table_names', this.table_names);

        each(tables, (table) => {
            //console.log('get_model_rows table.name', table.name);
            var table_all_db_records = table.get_all_db_records_bin();
            each(table_all_db_records, (table_db_record) => {
                res.push(table_db_record);
            });
        });
        //throw 'stop';
        return res;
    }

    // or records?
    get rows() {
        var incrementors = this.incrementors;
        var tables = this.tables;
        var res = [];
        // these are definitions, not the table records themselves.
        each(incrementors, (incrementor) => res.push(incrementor.record));
        // invluding the index records of that table.
        //  should generate those index records too.
        //  but the model should have loaded the indexes
        each(tables, table => res.push.apply(res, table.b_records));
        // 
        return res;
    }

    get_table_records_length(table_name) {
        var table = this.map_tables[table_name];
        return table.records.length;
    }

    get_table_records(table_name) {
        var table = this.map_tables[table_name];
        return table.records;
    }

    get_idx_records_by_record(arr_record) {
        let kp = arr_record[0][0];
        let table_id = (kp - 2) / 2;
        let table = this.map_tables_by_id[table_id];
        arr_record[0].shift();
        let record = new Record(arr_record, table);
        let indexes = record.get_arr_index_records();
        return indexes;
    }

    get_table_kv_field_names(table_name) {
        return this.map_tables[table_name].kv_field_names;
    }

    get non_core_tables() {
        var res = [];
        each(this.tables, (table) => {
            if (!map_core_table_names[table.name]) {
                res.push(table);
            }
        })
        return res;
    }

    get table_names() {
        var res = [];
        each(this.tables, (table) => {
            res.push(table.name);
        })
        return res;

    }

    get_model_rows_decoded() {
        var model_rows = this.get_model_rows();
        return (decode_model_rows(model_rows));
    }

    get_model_rows_encoded() {
        // Think this all the model rows though...?
        var model_rows = this.get_model_rows();
        //console.log('model_rows.length', model_rows.length);
        //throw 'stop';
        var arr_simple_encoded = [];
        each(model_rows, (model_row) => {
            // model_rows
            //console.log('model_row', model_row);
            arr_simple_encoded.push(encode_model_row(model_row));
        });
        var buf_simple_encoded = Buffer.concat(arr_simple_encoded);
        return buf_simple_encoded;
        //var res = new Array(model_rows.length);
    }

    encode_table_model_rows(table_name, arr_rows) {
        var key_prefix = this.map_tables[table_name].key_prefix;
        var res = [];
        each(arr_rows, (row) => {
            res.push(encode_model_row(database_encoding.encode_pair_to_buffers(row, key_prefix)));
        });
        return Buffer.concat(res);
        //res.concat();
    }

    ensure_table_records_no_overwrite(table_name, arr_records) {
        var table = this.map_tables[table_name];
        // Don't overwrite the keys or the values
        //  Can't have matching names.
        //   Enforcing unique constraints while putting records in the normal way should be enough.
        return table.ensure_records_no_overwrite(arr_records);
    }

    diff(other_model) {
        let my_model_rows = this.get_model_rows_decoded();
        let their_model_rows = other_model.get_model_rows_decoded();
        //console.log('my_model_rows', my_model_rows);
        //console.log('their_model_rows', their_model_rows);
        let res = Database.diff_model_rows(my_model_rows, their_model_rows);
        res.count = res.changed.length + res.added.length + res.deleted.length;
        //res.orig = this;
        //res.other = other_model;
        return res;
    }

    get non_core_table_names() {
        return this.table_names.filter(name => !map_core_table_names[name]);
    }

    get map_tables_fk_refs() {
        let res = {};
        each(this.tables, table => {
            let outward_fk_refs = table.outward_fk_refs;
            if (outward_fk_refs.length > 0) {
                res[table.name] = outward_fk_refs;
            }
        });
        return res;
    }

    table_id(table) {
        let t_table = tof(table);
        if (t_table === 'number') return table;
        if (t_table === 'string') {
            return this.map_tables[table].id
        } else {
            if (table.id !== undefined) return table.id;
        }
        return table;
    }

    // new_existing_record
    //  

    create_index_records_by_record(arr_record) {
        // generates them.

        let table_pk = arr_record[0][0];
        let table_id = (table_pk - 2) / 2;
        //console.log('create_index_records_by_record table_pk', table_pk);
        //console.log('table_id', table_id);
        // 

        let table = this.map_tables_by_id[table_id];

        //console.log

        let record = new Record(arr_record, table);
        //console.log('record', record);
        let idxs = record.get_arr_index_records();
        //console.log('idxs', idxs);
        return idxs;

    }

    arr_records_to_records_with_index_records(arr_records) {
        let res = [];
        //console.log('arr_records', arr_records);
        each(arr_records, record => {
            //console.log('record', record);
            res.push(record);
            let index_records = this.create_index_records_by_record(record);
            each(index_records, idx_record => res.push(idx_record));
        })
        return res;

    }

    get index_count_per_table() {
        let res = [];
        each(this.tables, table => {
            res.push([table.name, table.indexes.length]);
        })
        return res;
    }
}





// Should possibly be renamed
//  More detail about what encoding it starts with, what the result is.
//  This only does a partial encoding of already binary rows.


// filter out index rows.

var load_arr_core = (arr_core) => {
    //console.log('load_arr_core');
    //throw 'stop';

    //console.log('arr_core', arr_core);
    // Worth loading them up as OO rows.

    //console.trace();


    //var decoded_core = database_encoding.decode_model_rows(arr_core);

    let record_list = new Record_List(arr_core);
    //console.log('record_list', record_list);
    //console.log('record_list.length', record_list.length);
    //throw 'stop';
    let db;
    if (record_list.length > 0) {
        var arr_by_prefix = [];

        // simple to get the kp from each row now.

        record_list.each(row => {
            //console.log('load_arr_core row', row);
            arr_by_prefix[row.kp] = arr_by_prefix[row.kp] || [];
            // could keep the row here in the model in binary format and decode it as needed.
            //  for the moment, will use the decoded row, thats what it expects here.

            //console.log('row.decoded_no_kp', row.decoded_no_kp);

            arr_by_prefix[row.kp].push(row.decoded_no_kp);
        });


        //throw 'stop';

        var arr_incrementor_rows = arr_by_prefix[0];
        var arr_table_tables_rows = arr_by_prefix[2];

        //console.log('arr_incrementor_rows', arr_incrementor_rows);
        //console.log('arr_table_tables_rows', arr_table_tables_rows);
        //console.log('arr_incrementor_rows.length', arr_incrementor_rows.length);
        //console.log('arr_table_tables_rows.length', arr_table_tables_rows.length);
        //throw 'stop';

        var arr_table_native_types_rows = arr_by_prefix[4];
        var arr_table_field_rows = arr_by_prefix[6];
        var arr_table_index_rows = arr_by_prefix[8];

        db = new Database(false);
        db._init = true;
        // May well be best to encode more data within each incrementor.
        //  What it does
        //   0 incrementor incrementor
        //   1 tables incrementor
        //   2 table specific incrementor, table fields
        //   3 table specific incrementor, table indexes
        //   4 table specific incrementor, table fks
        //   5 table specific incrementor, table specific field value autoincrement, field id

        // Though the field can link back to the incrementor anyway.


        // When recreting rows, may need to avoid using an incrementor.
        //console.log('arr_incrementor_rows', arr_incrementor_rows);

        each(arr_incrementor_rows, (inc_row) => {
            //console.log('inc_row', inc_row);
            var inc_id = inc_row[0][0];
            var inc_name = inc_row[0][1];
            var inc_value = inc_row[1] || 0;
            //var inc = new Incrementor
            //console.log('incrementor: inc_id, inc_name, inc_value', inc_id, inc_name, inc_value);
            db.add_incrementor(inc_id, inc_name, inc_value);

        });
        //throw 'stop';

        db.inc_incrementor = db.incrementors[0];
        db.inc_table = db.incrementors[1];

        var arr_table_names = new Array(arr_table_tables_rows.length);
        each(arr_table_tables_rows, (v, i) => {
            //console.log('v', v);
            //console.log('i', i);
            arr_table_names[v[0][0]] = v[1][0];
        });
        //console.trace();
        //throw 'stop';

        let map_table_id_incrementors = {};
        let arr_id_incrementors = [];

        each(db.incrementors, db_incrementor => {
            //console.log('db_incrementor', db_incrementor);
            if (db_incrementor.name.lastIndexOf('_id') === db_incrementor.name.length - 3) {
                arr_id_incrementors.push(db_incrementor);
                let table_name = db_incrementor.name.substring(4, db_incrementor.name.length - 3);
                //console.log('table_name', table_name);
                map_table_id_incrementors[table_name] = db_incrementor;
            }
        });
        //

        //console.log('arr_table_names', arr_table_names);
        //throw 'stop';

        // Make a DB and autoconstruct the core?
        //  Probably best to reconstruct the core out of what's in the database.
        //   Possibly some types could be changed / added?

        let map_system_table_names = {
            'tables': true,
            'native types': true,
            'table fields': true,
            'table indexes': true
        }

        // Give the table an array of its incrementors too.
        //  Don't have the table recreate its own.

        //this._init = false;

        // needs to be a map of tables.
        //  Tables can now skip IDs.
        //   Leaving space for more system tables.

        //console.log('arr_table_tables_rows', arr_table_tables_rows);


        // Go through the table table rows themselves instead

        each(arr_table_tables_rows, table_table_row => {
            //console.log('table_table_row', table_table_row);
            arr_table_incrementor_ids = table_table_row[1][1];
            //console.log('arr_table_incrementor_ids', arr_table_incrementor_ids);

            var arr_table_incrementors = [];

            each(arr_table_incrementor_ids, (id) => {
                arr_table_incrementors.push(db.incrementors[id]);
            });
            //console.log('arr_table_incrementors', arr_table_incrementors);

            let table_name = table_table_row[1][0];
            //console.log('table_name', table_name);
            let table_id = table_table_row[0][0];


            let is_system_table = map_system_table_names[table_name];

            //let table;

            //if (is_system_table) {
            //    table = db.add_table(table_name, table_id, arr_table_incrementors);
            //} else {
            //    table = db.add_table(table_name, table_id, arr_table_incrementors);
            //}
            let table = db.add_table(table_name, table_id, arr_table_incrementors);

            //console.log('db.tables.length', db.tables.length);

            if (table.name === 'tables') {
                db.tbl_tables = table;
            }
            if (table.name === 'native types') {
                db.tbl_native_types = table;
            }
            if (table.name === 'table fields') {
                db.tbl_fields = table;
            }
            if (table.name === 'table indexes') {
                //console.log('we are making the indexes table.')
                db.tbl_indexes = table;
                //console.log('table', table);
            }
            if (table.name === 'users') {
                db.tbl_users = table;
            }
            
            if (!table.pk_incrementor) {
                if (map_table_id_incrementors[table.name]) {
                    table.pk_incrementor = map_table_id_incrementors[table.name];
                    //console.log('table.name', table.name);
                    //console.log('table.pk_incrementor', table.pk_incrementor);
                }
            }
        });

        // so seems the primary key incrementors were not recorded.
        //  They are vital for some operations.
        //console.log('db.incrementors', db.incrementors);

        //throw 'stop';
        // Not sure the incrementors got created in the DB properly.

        //throw 'stop';

        //console.log('db.incrementors', db.incrementors);
        //throw 'stop';

        //each(db.tables, (table) => {
        // Then once 
        //});

        // Quite possibly load the system tables first?
        //  Probably not necessary, should be possible to reconstruct the Model structure.


        //console.log('arr_table_field_rows', arr_table_field_rows);
        //console.log('arr_table_field_rows.length', arr_table_field_rows.length);
        //console.log('db.tables.length', db.tables.length);
        //console.log('1) db.tables', db.tables);
        // Stop the initialisation at some point, as we need the rest of the tables added in normal mode.

        // Add the fields to the tables.
        each(arr_table_field_rows, (table_field_row) => {
            //var table_id = (table_field_row[0][0] - 2) / 2;

            //console.log('table_field_row', table_field_row);

            // Parse it differently depending on length

            var lv = table_field_row[1].length;
            var table_id = table_field_row[0][0];
            //console.log('table_id', table_id);


            var field_id = table_field_row[0][1];

            var field_name, data_type_id, is_pk, fk_to_table_id;

            if (lv === 1) {
                field_name = table_field_row[1][0];
            } else if (lv === 2) {
                field_name = table_field_row[1][0];

                if (typeof table_field_row[1][1] === 'boolean') {
                    //console.log('table_field_row', table_field_row);
                    //throw 'stop';
                    console.log('reinterpreting malformatted field row', table_field_row);
                    is_pk = table_field_row[1][1];
                } else {
                    data_type_id = table_field_row[1][1];
                }


            } else if (lv === 3) {
                field_name = table_field_row[1][0];
                data_type_id = table_field_row[1][1];
                is_pk = table_field_row[1][2];
            } else if (lv === 4) {
                field_name = table_field_row[1][0];

                // Bug fix for field encoding problem in early version, wrting bug since fixed.
                if (typeof table_field_row[1][1] === 'boolean') {
                    //console.log('table_field_row', table_field_row);
                    //throw 'stop';
                    console.log('reinterpreting malformatted field row', table_field_row);
                    data_type_id = table_field_row[1][2];
                    //console.log('data_type_id', data_type_id);

                    is_pk = table_field_row[1][1];
                    fk_to_table_id = table_field_row[1][3];
                } else {
                    data_type_id = table_field_row[1][1];
                    //console.log('data_type_id', data_type_id);
                    is_pk = table_field_row[1][2];
                    fk_to_table_id = table_field_row[1][3];
                }
            }

            // 
            //var table = db.tables[table_id];
            var table = db.map_tables_by_id[table_id];
            //console.log('!!table', !!table);

            //console.log('field read ' + field_name + ': data_type_id', data_type_id);

            /*
            console.log('table_id', table_id);
            console.log('field_id', field_id);
            console.log('field_name', field_name);
            console.log('data_type_id', data_type_id);
            console.log('is_pk', is_pk);
            console.log('fk_to_table_id', fk_to_table_id);
            */

            //console.log('table', table);

            //console.log('db.tables.length ' + db.tables.length);

            // Definitely need to set the field ID!

            //console.log('1) data_type_id', data_type_id);
            if (typeof data_type_id === 'boolean') {
                console.trace();
                console.log('lv', lv);

                console.log('table_field_row', table_field_row);

                throw ('data_type_id expected to be integer');
            }

            table.add_field(field_name, field_id, data_type_id, is_pk, fk_to_table_id);
            // then need to make sure the field appears in the map.

            // Then will test this reconstruction with a more advanced database structure, such as one to hold cryptocurrencies.

            if (is_pk) {
                //table.record_def.
            } else {

            }
        });

        // arr_table_index_rows
        each(arr_table_index_rows, (table_index_row) => {
            //console.log('table_index_row', table_index_row);

            // Then reconstruct the index 
            // Create an index object with this specification...
            // May need to look up the exact fields, create the object references.


            // Then, shortly after this, work on getting cryptodb records made.
            //  Get the data coming in.
            //  Save it to a record stream.

            // May be useful indexing trades by time, in buckets.
            //  Would get more than one trade at any point in time.

            var ir_key = table_index_row[0];
            var ir_value = table_index_row[1];

            var table_id = ir_key[0];
            var index_id = ir_key[1]; // index within table

            // then all the fields that are being indexed

            var index_keys = clone(ir_key);
            index_keys.splice(0, 2);

            //console.log('index_keys', index_keys);
            //console.log('ir_value', ir_value);
            // the value probably corresponds with the primary key of the table.
            var table = db.map_tables_by_id[table_id];
            var idx_kv = [index_keys, ir_value];
            // the keys and values may need a lookup
            //console.log('idx_kv', idx_kv);
            var idx = table.add_index(index_id, idx_kv);
            //console.log('idx', idx);

        });

        db.tbl_native_types.add_records(arr_table_native_types_rows);

        db.tbl_tables.add_record([
            [db.tbl_tables.id],
            [db.tbl_tables.name, db.tbl_tables.own_incrementor_ids]
        ]);
        db.tbl_tables.add_record([
            [db.tbl_native_types.id],
            [db.tbl_native_types.name, db.tbl_native_types.own_incrementor_ids]
        ]);
        db.tbl_tables.add_record([
            [db.tbl_fields.id],
            [db.tbl_fields.name, db.tbl_fields.own_incrementor_ids]
        ]);
        if (db.tbl_indexes) db.tbl_tables.add_record([
            [db.tbl_indexes.id],
            [db.tbl_indexes.name, db.tbl_indexes.own_incrementor_ids]
        ]);

        // May redo the creation of db model from rows.
        //  At least mak sure all bases are covered.
        //  So far, some records are missed from the model.
        //   Need to see why some records / incrementors have not been put in the db already.
        //   Hopefully there are not many fixes left to do until the data platform works.

        each(db.tables, (table) => {
            //console.log('db.tables table name', table.name);
            let own_ttr = table.own_table_table_record;
            //console.log('own_ttr', own_ttr);
            let tr;
            if (!own_ttr) {
                // Should put the PK in there.
                tr = db.tbl_tables.add_record([
                    [table.id],
                    [table.name, table.own_incrementor_ids]
                ]);
                //console.log('[table.name, table.own_incrementor_ids]', [table.name, table.own_incrementor_ids]);
                //console.log('tr', tr);
            }
            // db.table
            //db.

            // Ensure its in the tables table...
            //this.add_tables_fields_to_fields_table(tbl_tables);
            // OK but they should have been loaded already?
            db.add_tables_fields_to_fields_table(table);
            db.add_tables_indexes_to_indexes_table(table);
        });
        db._init = false;
    }
    // then go through the individual records.
    /*
            // When adding these, it will use the already high value of some incrementors.
            db.add_tables_fields_to_fields_table(table);
    each(record_list, row => {
        console.log('row', row);
    })
    */
    //throw 'stop';
    //console.log('decoded_core', decoded_core);
    // The core should have been provided with the tables in the right order.
    //  Don't know why the order of tables has got jumbled.
    // Should have the index table rows showing up in prefix 8

    // then go through the table indexes.
    //  want to separate them by tables.
    //  
    return db || new Database();
}

var load_buf = (buf) => {

    //console.log('*load_buf');
    //throw 'stop - likely to need fixing';

    var arr_core = Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf);
    return load_arr_core(arr_core);
}

Database.load = (arr_core) => {

    //console.log('arr_core', arr_core);

    // Load it differently - in fact it would require less code as it's easier to decode now.

    return load_arr_core(arr_core);
}

Database.kp_to_range = buf_kp => {
    let buf_0 = Buffer.alloc(1);
    buf_0.writeUInt8(0, 0);
    let buf_1 = Buffer.alloc(1);
    buf_1.writeUInt8(255, 0);
    // and another 0 byte...?
    return [Buffer.concat([buf_kp, buf_0]), Buffer.concat([buf_kp, buf_1])];
}

Database.diff_model_rows = (orig, current) => {
    let changed = [],
        added = [],
        deleted = [];

    let map_orig = {},
        map_current = {},
        map_orig_records = {};
    each(orig, (record) => {
        //console.log('record', record);
        // so make a record iterable, and it's just the key and the value.
        let [key, value] = record;
        //console.log('[key, value]', [key, value]);
        map_orig[key.toString('hex')] = [value];
        map_orig_records[key.toString('hex')] = record;
    });
    //console.log('map_orig', map_orig);

    each(current, (record) => {
        let [key, value] = record;
        map_current[key.toString('hex')] = [value];
        // does it appear in orig?
        if (map_orig[key.toString('hex')]) {
            if (deep_equal(map_orig[key.toString('hex')][0], value)) {

            } else {
                //changed.push([record]);
                changed.push([map_orig_records[key.toString('hex')], record]);
            }
        } else {
            added.push(record);
        }
    });
    each(orig, (record) => {
        let [key, value] = record;
        //map_orig[key] = value;
        if (map_current[key.toString('hex')]) {

        } else {
            deleted.push(record);
        }
    });
    let res = {
        changed: changed,
        added: added,
        deleted: deleted,
        same: changed.length === 0 && added.length === 0 && deleted.length === 0
    }
    return res;
}


Database.load_buf = load_buf;
Database.decode_key = database_encoding.decode_key;
Database.decode_keys = database_encoding.decode_keys;
Database.decode_model_row = database_encoding.decode_model_row;
Database.decode_model_rows = database_encoding.decode_model_rows;
Database.encode_model_row = database_encoding.encode_model_row;
Database.encode_model_rows = database_encoding.encode_model_rows;
Database.encode_arr_rows_to_buf = database_encoding.encode_arr_rows_to_buf;
Database.encode_index_key = database_encoding.encode_index_key;
Database.encode_key = database_encoding.encode_key;


var p = Database.prototype;
//p.encode_model_rows = encode_model_rows;

if (require.main === module) {

    //setTimeout(() => {
    var db = new Database();

    // Gets creates automatically.
    //db.create_db_core_model();
    console.log('db.tables.length', db.tables.length);

    var view_decoded_rows = () => {
        var model_rows = db.get_model_rows();

        //throw 'stop';
        console.log('model_rows.length', model_rows.length);

        each(model_rows, (model_row) => {
            //console.log('model_row', model_row);
            console.log('model_row', Database.decode_model_row(model_row));

        });
        console.log('\n\n\n');
        //throw 'stop';
        //var decoded_rows = crypto_db.get_model_rows_decoded();
        //console.log('decoded_rows', decoded_rows);
    }

    var model_rows = db.get_model_rows();

    console.log('model_rows.length', model_rows.length);

    each(model_rows, (model_row) => {
        console.log('model_row', model_row);

    });

    console.log('\n\n\n');

    view_decoded_rows();
    //throw 'stop';

    var test_full_db_binary_encoding = () => {
        //var decoded_rows = db.get_model_rows_decoded();
        //console.log('decoded_rows', decoded_rows);
        // Simpler encoding... Can get the ll row kvps, and encode them along with some lengths.
        var buf_simple_encoded = db.get_model_rows_encoded();
        //console.log('buf_simple_encoded', buf_simple_encoded);
        //console.log('buf_simple_encoded.length', buf_simple_encoded.length);
        // Then use streaming / evented decoding.
        //  Functional event driven programming?
        // Could be a job for Binary_Encoding

        var buf_se_length = buf_simple_encoded.length;
        Binary_Encoding.evented_get_row_buffers(buf_simple_encoded, (arr_row) => {
            //console.log('arr_row', arr_row);
            var decoded_row = database_encoding.decode_model_row(arr_row);
            console.log('decoded_row', decoded_row);
        });

        // Can try serializing the model to binary, then unserialising / reconstructing it to a model.
        //  Then can compre values from the two.
        var db2 = load_buf(buf_simple_encoded);
        //console.log('db2', db2);
        console.log('db2.tables.length', db2.tables.length);
        var decoded = db2.get_model_rows_decoded();
        //console.log('decoded', decoded);
        view_decoded_rows();
        // It looks like this reloaded database is capable of doing what is needed.
    }
    test_full_db_binary_encoding();

    // A test to do with making a new DB and checking if the autoincrementing fields are typed correctly.
    //  Could include binary encoding and decoding.

    // Will also be useful to specify field types so that values can be checked before they get persisted to make sure they are of the right type.

    // specified field types would definitely help fk-> pk lookups.
    //  that code could be somewhat complex.
    //  would be useful for normalising values.

    let test_autoincrement_field_types = () => {

    }

} else {
    //console.log('required as a module');
}

module.exports = Database;