// Make this extend an array?

// Will provide facade to an array, as well as other functionality
//  Ability to serialise and deserialise a record collection.
//  That is a structural advantage to splitting this out of Table.
//  Nicer encapsulation.
var lang = require('lang-mini');
var tof = lang.tof;
var xas2 = require('xas2');
var each = lang.each;
var is_arr_of_strs = lang.is_arr_of_strs;
var is_arr_of_arrs = lang.is_arr_of_arrs;

var Incrementor = require('./incrementor');
var Record = require('./record');
var Field = require('./field');
var Index = require('./index-def');
var Foreign_Key = require('./foreign-key');

var Binary_Encoding = require('binary-encoding');
var encode_to_buffer = Binary_Encoding.encode_to_buffer;


// And use multiple indexes here too?
//  There are the index definitions.

// At the moment, this is not building up an index of the values.
//  There are some tables it's (more) important to have a cache of the values and the index of the values for fast lookup in the model.


// Seems not to have properly working indexes.
//  There should be relatively simple indexes, held within a model.
//   It should keep a map of what index values point to what records.
//   The indexes themselves maybe should contain a collection of index records.
//    Or a JS map of the records.
//     Including a Map in the indexes could help the lookup of records using the values appropriate to the index.

// May be worth using a simpler DB model, with simpler indexes to get started.
//  Bittrex has a lot of currency records to check individually that they are OK.






class Table_Record_Collection {
    'constructor' (table) {

        this.table = table;

        this.arr_records = [];

        //var table_indexes_def = table.indexes;
        // multiple indexes
        // refer to the table def to see how many indexes there are.

        this.indexes = new Array(this.table.record_def.indexes.length);
        this.map_keys = new Map();

        var c, l = this.indexes.length;
        for (c = 0; c < l; c++) {
            this.indexes[c] = {};
        }

        // map of the records

        //console.log('this.table.record_def.indexes.length', this.table.record_def.indexes.length);
        //console.log('this.table.name', this.table.name);
        //throw 'stop';

        // Using the index def (available through the table), we will need to put records into indexes.

        // May be best to have a Table_Record_Collection_Index class.
        //  The index would link to the more abstract definition, and it could even make use of processing capability in the definition version.
        //   The definition version is for doing processing in the abstract, while other classes are for representing instances of objects.

        // a number of different map indexes.
        //  map from index key values to primary key.

        // Seems worthwhile to have a table of table indexes.
        //  which fields are in the key, (which are in the value)
        //   it refers to the primary key automatically, but the pk may be expressed with more than one value.

        // Will need to refer back to the table, as there are index records


        // Different types of indexes.

        // Index [definition]
        // Then we could have a Records_Index
        //  Would take an index definition, and do its indexing accordingly.
        //   Using JavaScript arrays, maps etc.


        // Index definition


        // There could be multiple indexes... and indexing by multiple fields.
        //  May be complex to implement that fully in the model.
        // Indexing by one specific field at a time seems easy enough.
        //  Allow for indexing by multiple fields.
        //   So would maybe need to use a JavaScript map

        // There may be multiple 

        // The index definitions would be within the record definitions.
        //  The indexes themselves would be within this collection part.

        // And multiple indexes too.
        //  May want to map the indexes by what fields they represent.

        // Probably worth getting on with this OOP so that it all works smoothly and logically


        // Actual working index
        // table-record-collection-index
        // records-index

        //  For the moment, bake that into this collection.



        // Do want records that get added to the model to also have indexes within the model, which the model can use.
        //  It's not just for outputting the indexes to the db.



    }

    // Could do this only for the newer servers.
    //  Have a lower level function that does it.

    // Though for the moment, we are just doing it in the model here.

    ensure_record_no_overwrite(arr_record) {
        //console.log('ensure_record_no_overwrite arr_record', arr_record);

        // Need to check that the 

        // Need to work out which of these fields is the key.
        var pks, vals;

        if (is_arr_of_arrs(arr_record) && arr_record.length === 2) {
            console.log('arr_record', arr_record);
            pks = arr_record[0];
            vals = arr_record[1];
            console.trace();
            throw 'not yet implemented'
        } else {

            var pk_def = this.table.record_def.pk;
            //console.log('pk_def.length', pk_def.length);

            //console.log('pk_def', pk_def);
            // Seems an undefined field has crept in there.

            // Upon loading the bittrex currencies into the model, need to check the keys.

            var record_pk_fields = arr_record.slice(0, pk_def.length);

            // and look at unique indexes.
            //  

            //console.log('record_pk_fields', record_pk_fields);


            //console.log('record_pk_fields.length', record_pk_fields.length);

            // then do we already have such a record?

            // try to get the record by key

            //this.table.records.get

            // 

            // Use the index, not the map keys



            var has_key = this.map_keys.has(record_pk_fields);

            // Look up the record in the indexes
            //  unique indexes?
            //

            // lookup in both/all indexes
            //  need to know which fields from the record go into the index.

            // look at the record def's indexes.
            var def_indexes = this.table.record_def.indexes;
            //console.log('def_indexes', def_indexes);

            // get_arr_record_index_values

            var index_values = this.table.record_def.get_arr_record_index_values(arr_record);
            //console.log('index_values', index_values);


            // then try index lookup.





            // The index values for that record.
            //  Check them against the indexes.

            var match_info = [];
            // test the index values to see if they are in the table.
            var found = false;


            each(this.indexes, (index, c) => {
                //console.log('index', index);

                var to_look_up = index_values[c];
                //console.log('to_look_up', to_look_up);
                //console.log('typeof to_look_up', typeof to_look_up);
                // look up that record.

                //console.log('to_look_up', JSON.stringify(to_look_up));

                var item = index[JSON.stringify(to_look_up)];
                if (!!item) found = true;




            })
            //console.log('found', found);

            // Not adding preexisting records through the index lookup.
            //  Seems like index system in Model now actually works.



            //console.log('this.indexes', this.indexes);
            //throw 'stop';

            // Then want to get the indexed versions of the records.







            //this.


            //console.log('this.map_keys', this.map_keys);
            //console.log('this.map_keys.length', this.map_keys.length);

            //console.log('has_key', has_key);

            //console.trace();
            //throw 'stop';

            if (!has_key && !found) {
                return this.add_record(arr_record);
            } else {
                return false;
            }

            //this.table.







            // look up the record by key...
            //  after transforming it into a kv record


        }

    }

    ensure_records_no_overwrite(arr_records) {
        //console.log('trc ensure_records_no_overwrite arr_records.length', arr_records.length);
        // These records won't contain the table pk.

        // Will need to do key lookup on the records.
        var that = this;
        var res = [];
        var i_res;
        each(arr_records, (arr_record) => {

            // Ensuring one record with no overwrite.
            //  It should also check against the indexed / unique fields.

            i_res = (that.ensure_record_no_overwrite(arr_record));
            if (i_res) res.push(i_res);
        });
        return res;
    }

    // filter... make a new table record collection, using the filter function on each of them.



    get length() {
        return this.arr_records.length;
    }

    to_array() {
        var res = [];
        each(this.arr_records, (record) => {
            res.push(record.to_array());
        });
        return res;
    }

    get_inner_db_records() {
        // calculates them, not gets them from the DB.
        var res = [];
        each(this.arr_records, (record) => {
            res.push(record.get_own_record_bin());
        });
        return res;

    }

    get_inner_index_records() {
        var res = [];

        // use map_fields (somehow).
        //  Go through all of the indexes, and index the record according to that index.

        var indexes = this.indexes;

        each(this.arr_records, (record) => {
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

    get_arr_data_index_records() {


        // record_to_index_arr_data
        var res = [];
        var that = this;
        var indexes = this.table.record_def.indexes;

        each(this.arr_records, (record) => {
            // Why are there undefined records?

            if (record) {
                //console.log('that.name', that.name);
                // Need to be able to encode the indexes too in the indexes.

                //res.push(record.get_own_record_bin());

                var push_record_indexes = () => {
                    each(indexes, (index) => {
                        // res.push(rec_idx);

                        // then output the index record.
                        var indexed_record = [index.record_to_index_arr_data(record), null];
                        console.log('indexed_record', indexed_record);
                        console.log('record', record);
                        console.log('record.table.record_def.pk', record.table.record_def.pk);
                        throw 'stop';
                        res.push(indexed_record);

                        //console.trace();
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


    get_all_db_records() {
        var res = [];
        var that = this;
        var indexes = this.table.record_def.indexes;
        each(this.arr_records, (record) => {
            if (record) {
                res.push(record.get_own_record());
                var push_record_indexes = () => {
                    each(indexes, (index) => {
                        var indexed_record = [index.record_to_index_arr(record), null];
                        res.push(indexed_record);
                    });
                }
                push_record_indexes();
            }
        });
        return res;
    }

    get_all_db_records_bin() {

        // When there are no records...
        //  Need to be careful not to add an empty array to come results.

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
        var indexes = this.table.record_def.indexes;

        // Looks like 'table fields' table has had records incorrectly added.
        //  Whenever a field gets added to a table, we should add another table fields record.

        // then for each record, we get the record itself, along with its index records.
        //console.log('\nthis.arr_records.length', this.arr_records.length);
        //console.log('this.table.name', this.table.name);

        each(this.arr_records, (record) => {
            // Why are there undefined records?

            if (record) {
                //console.log('that.name', that.name);
                // Need to be able to encode the indexes too in the indexes.

                res.push(record.get_own_record_bin());

                var push_record_indexes = () => {
                    //console.log('indexes.length', indexes.length);
                    //console.log('indexes', indexes);

                    // Why are there undefined indexes?

                    each(indexes, (index) => {
                        // res.push(rec_idx);

                        // then output the index record.
                        var indexed_record = [index.record_to_index_buffer(record), null];
                        //console.log('indexed_record', indexed_record);
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

    each_record(cb_record) {
        each(this.arr_records, cb_record);
    }

    index_record(record) {
        var def_indexes = this.table.record_def.indexes;
        // Separate Index_Def and Index_Record

        // get the string key of the record.
        //  stringify its value.
        //  simplest way, just store that.
        var arr_coll_indexes = this.indexes;

        //console.log('index_record def_indexes', def_indexes);
        each(def_indexes, (index, i) => {

            // undefined index in place?

            // res.push(rec_idx);
            //console.log('i', i);
            //console.log('index', index);

            // then output the index record.

            var key = index.record_to_key_string(record);
            // key according to the index...

            //console.log('key', key);
            //console.log('i', i);



            arr_coll_indexes[i] = arr_coll_indexes[i] || {};
            arr_coll_indexes[i][key] = record;



            //console.log('arr_coll_indexes', arr_coll_indexes);

            //throw 'stop';

            //var indexed_record = [index.record_to_index_buffer(record), null];


            //console.log('indexed_record', indexed_record);
            //res.push(indexed_record);
            //throw 'stop';

            //res.push(
        });
    }

    add_record(record, dont_index = false) {
        //console.log('add_record');
        // The record may need to make use of an incrementor.
        //  Could possibly make records correspond with fields.
        //  Then records could also have an ordering of fields within their keys and values.

        // Making the OO bulkier with fields makes sense.

        var new_record = this.new_record(record);
        //console.log('new_record', new_record);

        if (new_record) {
            // The record should not have the table id normally.
            //  However, when we need to identify the table id it is useful.
            //  add_records_with_table_ids.

            this.arr_records.push(new_record);
            //console.log('dont_index', dont_index);
            if (!dont_index) {
                //
                this.index_record(new_record);
            }
            //throw 'stop';


            // Then for each index, we index the record.
        } else {
            console.trace('failed to add table record');
            console.log('record', record);
            throw 'stop';
        }
        // then add to the index of this table.
        //this.index_record(res);
        //console.log('res', res);
        return new_record;
    }
    add_records(records, dont_index = false) {
        var that = this,
            res = [];
        each(records, (record) => {
            //console.log('\n\nrecord', record);
            res.push(that.add_record(record, dont_index));
        });
        return res;
    }

    // Splices the table id out of the key
    add_record_including_table_id_in_key(record, dont_index = false) {
        //console.log('add_record');
        // The record may need to make use of an incrementor.
        //  Could possibly make records correspond with fields.
        //  Then records could also have an ordering of fields within their keys and values.

        // Making the OO bulkier with fields makes sense.
        //console.log('add_record_including_table_id_in_key');
        //console.log('1) record', record);


        record[0].splice(0, 1);

        //console.log('2) record', record);

        //throw 'stop';

        /*

		var new_record = this.new_record(record);
		//console.log('new_record', new_record);
		
		if (new_record) {
			// The record should not have the table id normally.
			//  However, when we need to identify the table id it is useful.
			//  add_records_with_table_ids.

            this.arr_records.push(new_record);
            this.index_record(new_record);
			// Then for each index, we index the record.
		} else {
			console.trace('failed to add table record');
			console.log('record', record);
			throw 'stop';
		}
		// then add to the index of this table.
		//this.index_record(res);
        //console.log('res', res);
		return new_record;
		*/
        return this.add_record(record, dont_index);
    }

    add_records_including_table_id_in_key(records, dont_index = false) {
        var that = this;
        each(records, (record) => {
            //console.log('\n\nrecord', record);
            that.add_record_including_table_id_in_key(record, dont_index);
        });

    }
    new_record(record) {
        var res;
        //console.log('record instanceof Record', record instanceof Record);
        //console.log('record', record);

        if (!(record instanceof Record)) {
            // is the record shorter by 1?
            //console.log('record', record);


            // Can't do this while just creating a new record without adding it.
            //  

            if (record[0] === null) {
                // need to make a new key for the data.
                //console.log('this.table.pk_incrementor', this.table.pk_incrementor);
                //throw 'stop';

                if (this.table.pk_incrementor) {
                    record[0] = [this.table.pk_incrementor.increment()];
                }
                // Need to use the right incrementor for the id.
                // Need to access the right field(s).
                //this.generate_new_key();
                //throw 'stop'
                //res = new Record(record, this);
            }

            if (is_arr_of_arrs(record) && record.length === 2) {
                //console.log('record in arrays of keys and values form');

                if (record[0][0] === null) {

                    if (this.table.pk_incrementor) {
                        record[0][0] = [this.table.pk_incrementor.increment()];
                    }
                }

                res = new Record(record, this.table);
                //throw 'stop';

            } else {
                // The Record should know the field name and number for all its data?
                var data_length = this.table.record_def.fields.length;
                // be able to get the fields from the table...?

                //console.log('data_length', data_length);
                //console.log('record.length', record.length);

                //console.log('record', record);

                // Could automatically create a new PK incrementor for every table that gets made / loaded.
                //  When we load a table from the db, we want to get the current incrementor values.

                if (record.length === data_length - 1) {
                    var kv_record = [
                        [this.table.pk_incrementor.increment()], record
                    ];
                    res = new Record(kv_record, this.table);
                } else {
                    // 
                    res = new Record(kv_record, this.table);
                }

                //throw 'stop';
            }
        } else {
            res = record;
        }
        return res;
    }
    new_records(records) {
        var that = this;
        var res = [];
        each(records, (record) => {
            //console.log('\n\nrecord', record);
            res.push(that.new_record(record));
        });
        return res;
    }

    // adding arr_table records
    //  could compare the structure to start with.

    add_arr_table_records(at_records) {
        // can check against the table keys.
        //var table_keys = 
        // table has got fields.
        var that = this;

        each(at_records.values, (v, i) => {
            //console.log('v', v);
            //console.log('at_records.keys', at_records.keys);
            // don't know if record is formatted right
            that.add_record(v);
        })
    }

    // Get some kind of a map of the records.
    //  Could possibly use indexing records in the model too, but not sure about that in some cases.




}

var p = Table_Record_Collection.prototype;
p.each = p.each_record;

module.exports = Table_Record_Collection;