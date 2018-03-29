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

*/


var lang = require('lang-mini');
var each = lang.each;
var get_a_sig = lang.get_a_sig;
var clone = lang.clone;
var tof = lang.tof;

var Incrementor = require('./incrementor');
var Table = require('./table');
var Record = require('./record');


var Binary_Encoding = require('binary-encoding');
var xas2 = require('xas2');
// should have some connected model classes, extending these.


const deep_diff = require('deep-object-diff').diff;

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

class Database {

    // Database could have a name.
    //  Storing a name as a DB Property would be useful.
    //  A System Properties table would be of use.

    constructor(spec) {
        this.__type_name = 'database';

        // Such a core part of the Model that we'll do it here.

        var map_incrementors = this.map_incrementors = {};
        var incrementors = this.incrementors = [];
        var tables = this.tables = [];
        var map_tables = this.map_tables = {};
        let map_tables_by_id = this.map_tables_by_id = {};

        // not giving a spec?


        //console.log('typeof spec', typeof spec);

        if (typeof spec === 'undefined') {
            //throw 'stop';

            this.create_db_core_model();
        }

        if (spec === false) {

        } else {
            // could give a db def as an array.
            //  would have a number of tables that get added.

            //var inc_incrementor = this.inc_incrementor = new Incrementor('incrementor', 0, 1);
            //incrementors.push(inc_incrementor);


            //incrementors.push(this.new_incrementor('table'));
            //this.inc_table = this.new_incrementor('table');
            //incrementors.push(this.inc_table);


            //each(incrementors, (incrementor) => {
            //    map_incrementors[incrementor.name] = incrementor;
            //});

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

    get description() {
        var tables = this.tables,
            l = tables.length;
        var res = [];
        each(tables, (table, i) => {
            //res[i] = [table.id, table.name];
            res.push(table.name);
            res.push('-'.repeat(table.name.length) + '\n');

            res.push('fields');
            each(table.fields, (field) => {
                res.push('\t', field.description);
            })

            res.push('\n');
        })
        return res.join('\n');
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
        // Definition is a list of tables.
        this.create_db_core_model();


        var tables = arr_def;
        var that = this;
        each(tables, (table) => {
            //var table_name = table[0];
            //var table_def = table[1];

            //console.log('\n\n\n');
            //console.log('table', table);
            that.add_table(table);
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

        console.log('create_db_core_model');
        this._init = true;
        let incrementors = this.incrementors;
        let map_incrementors = this.map_incrementors
        let tables = this.tables;
        let map_tables = this.map_tables;
        let map_tables_by_id = this.map_tables_by_id;

        let inc_incrementor = this.inc_incrementor = new Incrementor('incrementor', 0, 1);
        incrementors.push(inc_incrementor);
        this.inc_table = this.new_incrementor('table');
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

        map_tables[tbl_tables.name] = tbl_tables;
        map_tables_by_id[tbl_tables.id] = tbl_tables;
        this.tbl_tables = tbl_tables;

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


        // The table incrementors are broken at some point.
        //  Need to trace how they get put into the current DB.



        // Define the types of the values?
        //tbl_native_types.add_records(['xas2', 'date', 'string', 'float32le']);


        // Autoincrementing key would make adding the native types records more concise here.
        //  Though it's nice to have them defined in a list.
        //tbl_native_types.add_records([[0, 'xas2'], [1, 'date'], [2, 'string'], [3, 'float32le']]);
        // Could have an add_records_by_values where there is an automatically assigned id.



        // Could have it automatically generate ids.
        //  That makes sense, especially if we don't want to give ids / are not able to.

        // A table of bittrex currencies would fit that.
        //  We want our own int that represents it, likely fits into 1 byte, rather than a longer string.
        //  More db normalisation.

        // Space within tables to use incrementors for fields...
        //  Simpler to do this with an auto-incrementor?

        // May encode null types at some points.
        //  It will just be a null value within the record.


        tbl_native_types.add_records([
            [
                [0],
                ['xas2']
            ],
            [
                [1],
                ['date']
            ],
            [
                [2],
                ['string']
            ],
            [
                [3],
                ['float32le']
            ]
        ]);
        tables.push(tbl_native_types);
        //map_tables[tbl_native_types.name] = tbl_native_types;

        //this.add_table(tbl_native_types);
        //this.tbl_native_types = tbl_native_types;

        var tbl_fields = new Table('table fields', this);
        tables.push(tbl_fields);
        map_tables[tbl_fields.name] = tbl_fields;
        map_tables_by_id[tbl_fields.id] = tbl_fields;


        // Should not have its own autoincrementing id, apart from 
        var tbl_table_indexes = this.tbl_indexes = new Table('table indexes', this);
        tables.push(tbl_table_indexes);
        map_tables[tbl_table_indexes.name] = tbl_table_indexes;
        map_tables_by_id[tbl_table_indexes.id] = tbl_table_indexes;

        tbl_fields.set_pk(['table_id', 'id']);
        tbl_fields.set_fk('table_id', tbl_tables);

        tbl_fields.add_field('name', -1, NT_STRING);

        this.tbl_fields = tbl_fields;

        this.tbl_fields = tbl_fields;

        var add_table_table_record = (table) => {

            // Need more work on binary encoding array items.
            //  Maybe need more work on binary decoding these embedded arrays.

            //console.log('[table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]', [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]);
            //throw 'stop';

            tbl_tables.add_record([
                [table.id],
                [table.name, [table.inc_fields.id, table.inc_indexes.id, table.inc_foreign_keys.id]]
            ]);
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
        } else {
            if (table_def instanceof Table) {
                table = table_def;
            } else {
                if (sig === '[a]') {
                    var a_sig = get_a_sig(a[0]);
                    //console.log('a_sig', a_sig);

                    if (a_sig === '[s,a]') {
                        var table_name = a[0][0];
                        var table_inner_def = a[0][1];
                        table = new Table(table_name, this, table_inner_def);
                    }
                    //throw 'stop';
                } else {
                    if (sig === '[s]') {
                        table = new Table(a[0], this);
                    } else {
                        if (sig === '[s,n]') {
                            table = new Table(a[0], this, a[1]);
                        } else {
                            if (sig === '[s,n,a]') {
                                table = new Table(a[0], this, a[1], a[2]);
                            } else {
                                table = new Table(table_def, this);
                            }
                        }
                    }
                }
                // Assign it to the db.
                // name, db, record_def
            }
        }

        tables.push(table);
        map_tables[table.name] = table;
        map_tables_by_id[table.id] = table;

        // Will also put the table's fields into records.
        //  Relies on the tables table and table fields existing though.

        // Relies on the model init being over.
        //   Need to be (more) CAREful to do this appropriately.

        //console.log('');
        //console.log('this._init', this._init);
        //console.log('table.name', table.name);
        //console.trace();
        //console.log('');

        if (!this._init) {
            this.add_tables_fields_to_fields_table(table);
            // and assign the field records to the fields while doing this.
            // add record to tables table
            // Want to encode an array within a record. Should be OK.

            var arr_inc_ids = table.own_incrementor_ids;

            this.tbl_tables.add_record([
                [table.id],
                [table.name, arr_inc_ids]
            ]);
            this.add_tables_indexes_to_indexes_table(table);
        }
        return table;
    }

    table_exists(table_name) {
        return !!this.map_tables[table_name];
    }

    ensure_table(table_def) {
        var sig = get_a_sig(table_def);
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

        each(tables, (table) => {
            var table_all_db_records = table.get_all_db_records_bin();
            each(table_all_db_records, (table_db_record) => {
                res.push(table_db_record);
            });
        });
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
        var model_rows = this.get_model_rows();
        //console.log('model_rows.length', model_rows.length);
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
            // encode_model_row
            res.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(row, key_prefix)));
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

    /*
    diff(model_db) {
        // diffing this against model_table

        let my_rows = this.get_arr_model_rows();
        let other_rows = model_db.get_arr_model_rows();
        // can use deep-object-diff

        let diff = deep_diff(my_rows, other_rows);

        //console.log('diff', diff);


    }
    */
    // get all model rows...
    //  will be useful for starting a database / loading the right data into place to begin with.
    //  all rows in the database model, to go into the database that's in production.

    // then other functions...
    //  Need to decode records

    // They may not have the table reference though...
    //  Don't get decoded to OO right now?
    //   Could use an active record to persist them to the DB? Seems unnecessary.
}

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~\\

var decode_key = (buf_key) => {
    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    var decoded_key;
    //if (key_1st_value % 2 === 0) {
    if (key_1st_value % 2 === 0 && key_1st_value > 0) {
        // even, so it's a table, so 1 prefix
        // Have incrementor work differently - just xas2s in keys and values.
        decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
    } else {
        // odd, meaning indexes, so 2 prefixes. Includes the incrementors.
        decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
    }
    return decoded_key;
}

// encode key
//  encode index key
//   index_kp, index_id, arr_index_values

var encode_index_key = (index_kp, index_id, arr_index_values) => {
    var res = Binary_Encoding.encode_to_buffer(arr_index_values, index_kp, index_id);
    return res;
}
var encode_key = (kp, arr_values) => {
    var res = Binary_Encoding.encode_to_buffer(arr_values, kp);
    return res;
}

var decode_keys = lang.arrayify(decode_key);

var decode_model_row = (model_row, remove_kp) => {
    var buf_key = model_row[0];
    var buf_value = model_row[1];
    var value = null;
    // Decode buffer could tell from odd or even.
    var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
    if (buf_value) {
        if (key_1st_value === 0) {
            value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
        } else {
            value = Binary_Encoding.decode_buffer(buf_value);
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
        decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);
    } else {
        try {
            decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);
        } catch (err) {
            decoded_key = '[DECODING ERROR: ' + err + ']';
        }
    }
    if (remove_kp) {
        decoded_key.splice(0, remove_kp);
    }
    return [decoded_key, value];
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
    each(model_rows, (model_row) => {
        //console.log('model_row', model_row);
        // Incrementors look OK so far.
        //  Let's see how records (keys and values), as well as index records (keys and values) decode with the multi-decoder.
        //console.log('pre decode');
        let decoded = decode_model_row(model_row, remove_kp);
        //console.log('decoded', decoded);
        res.push(decoded);
        //throw 'stop';
        //console.log('post decode');
    });
    return res;
}


// Should possibly be renamed
//  More detail about what encoding it starts with, what the result is.
//  This only does a partial encoding of already binary rows.
var encode_model_row = (model_row) => {
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

var get_arr_rows_as_buffer = (arr_rows) => {
    // for every row, encode it using the Binary_Encoding.

    // They may not have the table key prefix?

}

var encode_arr_rows_to_buf = (arr_rows, key_prefix) => {
    var res = [];
    each(arr_rows, (row) => {
        // encode_model_row
        res.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(row, key_prefix)));
    });
    return Buffer.concat(res);
}

var encode_model_rows = (model_rows) => {
    var res = [];

    each(model_rows, (model_row) => {
        res.push(encode_model_row(model_row));
    });

    return Buffer.concat(res);
}

// filter out index rows.

var load_arr_core = (arr_core) => {
    var decoded_core = decode_model_rows(arr_core);

    //console.log('decoded_core', decoded_core);
    // Should have the index table rows showing up in prefix 8
    var arr_by_prefix = [];
    each(decoded_core, (row) => {
        var row_copy = clone(row);
        var arr_row_key = row_copy[0];
        var key_prefix = arr_row_key[0];
        arr_row_key.splice(0, 1);
        arr_by_prefix[key_prefix] = arr_by_prefix[key_prefix] || [];
        arr_by_prefix[key_prefix].push(row_copy);
    });

    var arr_incrementor_rows = arr_by_prefix[0];
    var arr_table_tables_rows = arr_by_prefix[2];
    var arr_table_native_types_rows = arr_by_prefix[4];
    var arr_table_field_rows = arr_by_prefix[6];
    var arr_table_index_rows = arr_by_prefix[8];

    var db = new Database(false);
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
    //throw 'stop';
    each(arr_incrementor_rows, (inc_row) => {
        //console.log('inc_row', inc_row);
        var inc_id = inc_row[0][0];
        var inc_name = inc_row[0][1];
        var inc_value = inc_row[1];

        //var inc = new Incrementor

        db.add_incrementor(inc_id, inc_name, inc_value);

    });

    db.inc_incrementor = db.incrementors[0];
    db.inc_table = db.incrementors[1];


    var arr_table_names = [];
    each(arr_table_tables_rows, (v, i) => {
        arr_table_names[i] = v[1][0];
    });

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

    each(arr_table_names, (table_name, i) => {

        var table_table_row = arr_table_tables_rows[i];
        arr_table_incrementor_ids = table_table_row[1][1];

        // Need to be careful to save the id incrementor, if it exists.
        //console.log('arr_table_incrementor_ids', arr_table_incrementor_ids);
        var arr_table_incrementors = [];

        each(arr_table_incrementor_ids, (id) => {
            arr_table_incrementors.push(db.incrementors[id]);
        });

        // Need to switch off the this._init option at the right point.

        if (!map_system_table_names[table_name]) {
            db._init = false;
        }

        var table = db.add_table(table_name, i, arr_table_incrementors);

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
            db.tbl_indexes = table;
        }
        if (table.name === 'users') {
            db.tbl_users = table;
        }

        //console.log('');
        //console.log('table.name', table.name);
        //console.log('table.pk_incrementor', table.pk_incrementor);
        //console.log('arr_table_incrementors', arr_table_incrementors);

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

        var table = db.tables[table_id];
        console.log('field read ' + field_name + ': data_type_id', data_type_id);

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
    //console.log('2) db.tables', db.tables);
    //throw 'stop';

    /*
    [ 'tables',
      'native types',
      'table fields',
      'table indexes',
      'users' ]
    */

    // Then put the tables' indexes back together.




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
        var table = db.tables[table_id];

        var idx_kv = [index_keys, ir_value];

        // the keys and values may need a lookup
        //console.log('idx_kv', idx_kv);

        var idx = table.add_index(index_id, idx_kv);
        //console.log('idx', idx);

    });


    /*
    each(arr_table_native_types_rows, native_type_row => {
        console.log('native_type_row', native_type_row);
        // Need to add these native type rows to the model, (with indexing)



    })
    */

    db.tbl_native_types.add_records(arr_table_native_types_rows);

    //console.log('3) db.tables', db.tables);
    //console.log('arr_table_index_rows.length', arr_table_index_rows.length);
    //throw 'stop';

    /*
    each(arr_table_field_rows, (table_field_row) => {
        console.log('table_field_row', table_field_row);
        var key = table_field_row[0], value = table_field_row[1];

        var table_id = key[0], field_id = key[1];

        var name = value[0];
        var i_type = value[1];
        var is_pk = value[2];
        var fk_to_table_id = value[3];

        // should be able to do db.add_table_field_row?

        var table = db.tables[table_id];

        // (field, id = -1, i_type = null, is_pk = false)
        table.add_field(name, table, field_id, i_type, is_pk, fk_to_table_id);




        // 
        



    });
    */
    //throw 'stop';


    // (field, i_type = null, is_pk = false)

    //console.log('db.tables.length', db.tables.length);
    //throw 'stop';

    // Doesn't have the native type records loaded.
    //  


    // Recreating its own db representation.
    //  This looks like the part where we should reset some incrementors


    //  Couldn't we load those tables up anyway.
    // Should we even need to add these?



    // Can't we have all these records loaded anyway when we load the core?

    // Go through the table fields and the table indices.
    //  Recreate them from keys.
    //  Don't use add_tables_fields_to_fields_table as that uses the current values of the incrementors to assign some keys. Want to use the pre-existing values



    // It's the creation of these index and fields records which are the problem.






    each(db.tables, (table) => {

        // When adding these, it will use the already high value of some incrementors.

        db.add_tables_fields_to_fields_table(table);
        //this.add_tables_fields_to_fields_table(tbl_tables);


        db.add_tables_indexes_to_indexes_table(table);
    });


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
        [db.tbl_indexes.name]
    ]);



    db._init = false;

    // then go through the table indexes.
    //  want to separate them by tables.
    //  

    return db;
}

var load_buf = (buf) => {
    var arr_core = Binary_Encoding.split_length_item_encoded_buffer_to_kv(buf);
    return load_arr_core(arr_core);
}

Database.load = (arr_core) => {
    return load_arr_core(arr_core);
}


Database.load_buf = load_buf;
Database.decode_key = decode_key;
Database.decode_keys = decode_keys;
Database.decode_model_row = decode_model_row;
Database.decode_model_rows = decode_model_rows;
Database.encode_model_row = encode_model_row;
Database.encode_model_rows = encode_model_rows;
Database.encode_arr_rows_to_buf = encode_arr_rows_to_buf;
Database.encode_index_key = encode_index_key;
Database.encode_key = encode_key;
//Database.from_buffer = from_buffer;

// encode_arr_model_rows
// encode_arr_model_row




// encode model rows to buffer?
//  encode rows to buffer
//  encode_data_rows_to_buffer



var p = Database.prototype;
p.encode_model_rows = encode_model_rows;


if (require.main === module) {

    //setTimeout(() => {
    var db = new Database();
    db.create_db_core_model();

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

        /*

        Binary_Encoding.evented_get_row_buffers(buf_simple_encoded, (arr_row) => {
            //console.log('arr_row', arr_row);

            var decoded_row = decode_model_row(arr_row);
            console.log('decoded_row', decoded_row);

        });

        // Can try serializing the model to binary, then unserialising / reconstructing it to a model.
        //  Then can compre values from the two.
        */

        var db2 = load_buf(buf_simple_encoded);
        //console.log('db2', db2);
        //console.log('db2.tables.length');

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