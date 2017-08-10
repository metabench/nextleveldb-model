// The Database abstraction.

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




var jsgui = require('jsgui3');
var each = jsgui.each;

var Incrementor = require('./incrementor');
var Table = require('./table');
var Record = require('./record');


var Binary_Encoding = require('binary-encoding');
// should have some connected model classes, extending these.

class Database {
    constructor(spec) {
        this.__type_name = 'database';
    }


    // Worth having the full database creation here.
    //  Create the full rows / values of an initial database, and output that without needing to use any DB software.

    // Should be able to test an existing model against an existing database.
    //  Show which keys from the model are there.
    //   The keys from the model will show the necessary database 

    create_db_core_model() {
        // Only creates the model, rather than does anything connected directly with the db.

        // Core incrementors
        //  Core tables
        //   The indexes

        var incrementors = this.incrementors = [];
        var tables = this.tables = [];
        var map_tables = this.map_tables = {};

        // name, value, id
        var inc_incrementor = this.inc_incrementor = new Incrementor('incrementor', 0, 1);
        incrementors.push(inc_incrementor);


        incrementors.push(this.new_incrementor('table'));
        //var inc_table = new Incrementor('table', 0, 0);


        // Not sure we really need the global prefix incrementor.

        // // Table id incrementor?




        //var inc_global_prefix = new Incrementor('global_prefix', 1, 1);


        // Could increment this as tables get made.


        


        //var inc_native_types = new Incrementor('native_types', 0, 3);
        // We have the number of records / incrementor for the native types table.

        //var incrementors = this.incrementors = [inc_incrementor, inc_global_prefix, inc_table];


        var map_incrementors = {};
        each(incrementors, (incrementor) => {
            map_incrementors[incrementor.name] = incrementor;
        });

        this.map_incrementors = map_incrementors;





        // The incrementors get added to as things get created.
        //  We can work out how much each of the incrementors increases by durting the creation phase.

        // And the index of the tables (for the moment).

        // How about fill table definitions given as one parameter.
        //  The storage parameter.
        //  Given with a single array.



        // Table should have a reference to the db.
        //  Then they can use the table incrementor.


        


        
        var tbl_tables = new Table('tables', this);

        // Don't use add_table, because it will create the relevant table record and table field records. These tables don't yet exist.
        //this.add_table(tbl_tables);
        tables.push(tbl_tables);



        map_tables[tbl_tables.name] = tbl_tables;
        this.tbl_tables = tbl_tables;

        //inc_table.increment();



        tbl_tables.add_index([['name'], ['id']]);


        // A table fields table would help too.

        tbl_tables.add_field('+id');
        tbl_tables.add_field('name');

        // Don't need an incrementor for indexes right now.

        //tbl_tables.add_index(['name', 'prefix']);


        // A definition of the record with the field names?
        //  In many cases we don't need to give the type, it can be detected.

        // Giving the record def could help.
        //  Want to know if any field is part of the key or value, and its index there.

        // could give the key value, or record storage definition too.

        //var native_types_kv_def = ['id', 'name'];


        // Give native types an auto-incrementing key.


        //var native_types_kv_def = [['id'], ['name']];
        //var native_types_only_index = [['name'], ['id']];

        //var native_types_storage_def = [native_types_kv_def, [native_types_only_index]];

        var tbl_native_types = new Table('native types', this);
        tbl_native_types.add_field('+id');
        tbl_native_types.add_field('name');
        map_tables[tbl_native_types.name] = tbl_native_types;
        this.tbl_native_types = tbl_native_types;
        tbl_native_types.add_index([['name'], ['id']]);
        
        

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
        tbl_native_types.add_records([[[0], ['xas2']], [[1], ['date']], [[2], ['string']], [[3], ['float32le']]]);
        tables.push(tbl_native_types);
        map_tables[tbl_native_types.name] = tbl_native_types;

        //this.add_table(tbl_native_types);
        this.tbl_native_types = tbl_native_types;

        // The fields table holds the tables' fields.
        //  Maybe call it 'table fields'
        //  Best if the pk is the table id then its field id.

        // Specifying uniqueness within a table...

        var tbl_fields = new Table('table fields', this);
        tables.push(tbl_fields);
        map_tables[tbl_fields.name] = tbl_fields;
        
        this.tbl_fields = tbl_fields;

        //this.add_table(tbl_fields);
        //var tables = this.tables = [tbl_tables, tbl_native_types, tbl_fields];


        // Say true to the id being an autoincrementing primary key?

        // Without specifying if a field is a key or a value, the system will use heuristics (colloquially its own guess).

        


        tbl_tables.add_record([[tbl_tables.id], [tbl_tables.name]]);
        tbl_tables.add_record([[tbl_native_types.id], [tbl_native_types.name]]);
        tbl_tables.add_record([[tbl_fields.id], [tbl_fields.name]]);

        // Then creating the core model should set the incrementors accordingly.
        //  Need a way of indexing these native type records too.

        
        //each(tables, (table) => {
        //    map_tables[table.name] = table;
        //});

        //this.map_tables = map_tables;

    }

    new_incrementor(name) {
        var id = this.inc_incrementor.increment();

        var res = new Incrementor(name, id, 0);
        return res;
    }


    add_tables_fields_to_fields_table(table) {
        var tbl_fields = this.tbl_fields;

        each(table.fields, (field) => {

            // not storing field types right now.

            tbl_fields.add_record([field.name]);
        });
    }

    add_table(table_def) {
        var tables = this.tables, map_tables = this.map_tables;
        var table;
        if (table_def instanceof Table) {
            table = table_def;
        } else {
            table = new Table(table_def);
        }
        tables.push(table);
        map_tables[table.name] = table;

        // Will also put the table's fields into records.
        //  Relies on the tables table and table fields existing though.

        this.add_tables_fields_to_fields_table(table);

        // add record to tables table

        this.tbl_tables.add_record([[table.id], [table.name]]);

        //throw 'stop';

        return table;
    }

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

            //var incrementor_binary_record = incrementor.get_record_bin();
            //res.push(incrementor_binary_record);

            //var incrementor_index_binary_records = incrementor.get_index_bin();
            //res.push(incrementor_index_binary_records[0]);

        });

        each(tables, (table) => {

            // The table record itself.

            // All of the records in the table
            // All of the index records applying to the table

            // Just the records for the tables themselves.

            // record in the table table


            // use function to get all fields, including records and their indexing records.

            // Tables will need to put data into the indexing part.

            //  Whenever a table index gets made, it needs a record put into the table indexes table.

            var table_all_db_records = table.get_all_db_records_bin();
            each(table_all_db_records, (table_db_record) => {
                res.push(table_db_record);
            });
            

            //throw 'stop';


            /*
            var table_binary_record = table.get_own_record_bin();
            res.push(table_binary_record);

            //console.log('table_binary_record', table_binary_record);





            var table_index_binary_records = table.get_own_index_bin();
            console.log('table_index_binary_records.length', table_index_binary_records.length);
            res.push(table_index_binary_records[0]);   // see how many there are.
            */

            // use a single function to get all of the table's records.


            // At a later stage, will add in the tables needed to use various services, such as Bitfinex.
            //  Using the model, will better be able to define key ranges for specific bitfinex etc data - useful for storage and retrieval.



            // The native types table has records.
            //  Need to define storage?
            //  The names are indexed by id.
            //   Know that names are string while id is xas2.

            // Then the records for the indexes.

            // get all records & record index data

            // table.get_records_with_index_data

            // Then we will have the tables generating their data.



        });

        // There is the table of tables.
        //  That is going to provide us mroe info, but it needs to be set with the correct info to start with.


        // We can try adding a variety of tables to the core model.
        //  Various platforms will mainly require storage definitions.
        //  That abstraction will be easy to manage.



        // After this, want to add definitions for market providers, and specific market providers such as bittrex.
        //  By making an abstract model of the bittrex data, we won't need as much (or any) bittrex specific procedural code.


        // Would definitely like this saving to the database within 1 week time.
        //  Estimated 4 large coding sessions + a bit of extra time.








        // then for the tables and their indexes.


        return res;


    }

    get_model_rows_decoded() {
        var model_rows = this.get_model_rows();

        //var res = new Array(model_rows.length);
        var res = [];

        each(model_rows, (model_row) => {
            //console.log('model_row', model_row);


            // Incrementors look OK so far.
            //  Let's see how records (keys and values), as well as index records (keys and values) decode with the multi-decoder.

            var buf_key = model_row[0];
            var buf_value = model_row[1];

            //console.log('buf_key', buf_key);
            //console.log('buf_value', buf_value);

            var value = null;

            // Decode buffer could tell from odd or even.
            var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);
            if (buf_value) {
                //console.log('buf_key', buf_key);
                //console.log('buf_value', buf_value);
                //console.log('key_1st_value', key_1st_value);

                if (key_1st_value === 0) {
                    value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_value);
                } else {
                    value = Binary_Encoding.decode_buffer(buf_value);
                }

                
            }


            // decode buffer, but say there are multiple xas2 prefixes
            //  the indexes have a prefix fro the index space, then the index index.
            //   so multiple indexes on one table have their own concise unique prefix space.

            // could read the very first xas2 number of the record to work out if it is table (even) or index (odd).

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


                // odd, meaning indexes, so 2 prefixes
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);

            }


            //throw 'stop';




            //console.log('decoded_key', decoded_key);
            //console.log('value', value);

            var decoded_record = [decoded_key, value];
            //console.log('decoded_record', decoded_record);
            res.push(decoded_record);

            //throw 'stop';


        });

        return res;

    }

    // get all model rows...
    //  will be useful for starting a database / loading the right data into place to begin with.
    //  all rows in the database model, to go into the database that's in production.






}


if (require.main === module) {

    //setTimeout(() => {
        var db = new Database();
        db.create_db_core_model();

        var model_rows = db.get_model_rows();

        console.log('model_rows.length', model_rows.length);

        each(model_rows, (model_row) => {
            console.log('model_row', model_row);

        });

        console.log('\n\n\n');
        //throw 'stop';


        var decoded_rows = db.get_model_rows_decoded();
        console.log('decoded_rows', decoded_rows);



        //throw 'stop';

        // Maybe a get_decoded_records function. get_all_records_decoded

    /*

        each(model_rows, (model_row) => {
            //console.log('model_row', model_row);


            // Incrementors look OK so far.
            //  Let's see how records (keys and values), as well as index records (keys and values) decode with the multi-decoder.

            var buf_key = model_row[0];
            var buf_value = model_row[1];

            //console.log('buf_key', buf_key);
            //console.log('buf_value', buf_value);

            var value = null;


            // Decode buffer could tell from odd or even.


            if (buf_value) {


                value = Binary_Encoding.decode_buffer(buf_value);
            }


            // decode buffer, but say there are multiple xas2 prefixes
            //  the indexes have a prefix fro the index space, then the index index.
            //   so multiple indexes on one table have their own concise unique prefix space.

            // could read the very first xas2 number of the record to work out if it is table (even) or index (odd).



            // not all of them are 2 deep for indexes though.
            //  That's where it's a bit tricky.
            //   Table records have got 1 xas2 prefix
            //   Table index records have got 2 xas prefixes.
            //    We need to know which is which.
            //  Could say one is odd, the other is even.
            //   That seems like the best way to differentiate between them for the moment.





            // Just can't read it with 2 prefixes as we don't know it has that many.


            var key_1st_value = Binary_Encoding.decode_first_value_xas2_from_buffer(buf_key);

            //console.log('key_1st_value', key_1st_value);
            var decoded_key;
            if (key_1st_value % 2 === 0) {
                // even, so it's a table, so 1 prefix
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 1);

            } else {


                // odd, meaning indexes, so 2 prefixes
                decoded_key = Binary_Encoding.decode_buffer(buf_key, 2);

            }


            //throw 'stop';



            
            //console.log('decoded_key', decoded_key);
            //console.log('value', value);

            var decoded_record = [decoded_key, value];
            console.log('decoded_record', decoded_record);

            //throw 'stop';


        });
    //}, 1000);

    */


    // Build an initial DB
    

    // Then, for testing purposes, we can go through, looking at the keys.

    // Should be able to use OO code to decode a key, which can either be for a table, a table index, the incrementors, or possibly other things.
    //  Should be nice to have a declarative, and simple way of using LevelDB for relational structures.



    






} else {
    //console.log('required as a module');
}


module.exports = Database;


