var lang = require('lang-mini');
var tof = lang.tof;
var each = lang.each;
var is_array = lang.is_array;
var arrayify = lang.arrayify;
var Fns = lang.Fns;


const encode_model_row = require('./database').encode_model_row;

const B_Record = require('./buffer-backed/record');

/*

var _inc_key = function(int_incrementor_id) {
    var x_0 = xas2(0);
    var x_inc = xas2(int_incrementor_id);
    return Buffer.concat([x_0.buffer, x_inc.buffer]);
};


The incrementor key prefix is 0.
Could have key prefix of 1 for the index of incrementors by name.
Looking up the incrementors by name would assist in being able to access and use them.


Incrementor needs to be usable for giving values.
We may use model to create a whole bunch of records. That would be good for testing, as well as for putting in the db itself.

// Giving an incrementor with a field?
//  Don't want to make it too complex.



*/
//var Binary_Encoding = 
var encode_to_buffer = require('binary-encoding').encode_to_buffer;
var xas2 = require('xas2');


const XAS2 = 0;
const DOUBLEBE = 1;
const DATE = 2;

const STRING = 4;
const BOOL_TRUE = 6;
const BOOL_FALSE = 7;
const NULL = 8;
const BUFFER = 9;

class Incrementor {
    constructor(spec) {

        var a = arguments;
        this.value = 0;
        this.id = 0;
        // Need to be careful about incrementors sharing indexes.

        // Each incrementor should have an id from the database.
        //  It can make use of the db's own incrementor incrementor.


        if (a.length === 1) {
            var t_spec = tof(spec);
            if (t_spec === 'object') {
                if (spec.name) this.name = spec.name;
            }
            if (t_spec === 'string') {
                this.name = a[0];
            }
        }
        if (a.length > 1) {

            if (a.length === 2) {
                var name = a[0];
                var i_value = a[1]; // test it's positive integer?

                this.name = name;
                this.value = i_value;
            }
            if (a.length === 3) {
                var name = a[0];
                var i_id = a[1];
                var i_value = a[2]; // test it's positive integer?


                this.name = name;
                this.value = i_value;
                this.id = i_id;
            }

        }


    }

    increment(n = 1) {
        var res = this.value;
        this.value = this.value + n;
        return res;
    }

    // Can ensure the incrementors are in the database.
    //  Will also be necessary / useful to index the incrementors by name.
    //    (incrementor table sounds too tricky?, as incrementors are a lower level feature that tables are built on)


    // get all db records as binary
    //  array of array record items.
    //   keys and values encoded as buffers.
    // the record for the incrementor itself
    //  needs to know the incrementor's value

    get_all_db_records_bin() {
        // Had a bug before.


        var res = [];
        res.push(this.get_record_bin());
        //res = res.concat(this.get_index_bin());

        //console.log('res', res);
        //throw 'stop';
        //console.log('-----------');
        //console.log('');
        return res;
    }

    // get records

    // or record

    get record() {
        return new B_Record(this.get_record_bin());
    }


    get_all_db_records() {
        var res = [this.get_record(), this.get_index()];
        return res;
    }

    // the incrementor indexes...
    //  not using them right now.


    // Need to be sure that the incrementors' values always get written as xas2.
    get_record() {
        return [
            [0, this.id, this.name],
            [this.value]
        ];
    }

    get_index() {
        return [
            [1, this.name, this.id], null
        ];
    }

    get_record_bin() {

        // Want this as an encoded model row.
        //  ?


        // key 0 for incrementors prefix, incrementor id
        // Have the 0 as its first item, encoded as an xas2

        //var bufs_key = encode_to_buffer([0, this.id]);
        //console.log('***** this.id', this.id);

        var buf_name = Buffer.from(this.name);
        // STRING

        // 2 xas2 prefixes here

        var bufs_key = Buffer.concat([xas2(0).buffer, xas2(this.id).buffer, xas2(STRING).buffer, xas2(buf_name.length).buffer, buf_name]);

        // 0 for incrementor, then the incrementor id,
        //  and then the incrementor name would help.
        // Reconstructing all of the incrementors before putting together the tables makes sense.


        //var bufs_key = encode_to_buffer([this.id], 0);

        //var buf_val = xas2(this.value + 500).buffer;
        var buf_val = xas2(this.value).buffer;
        //console.log('this.name', this.name);
        //console.log('this.value', this.value);
        //var buf_val = Buffer.concat([xas2(1).buffer, xas2(this.value).buffer, xas2(1).buffer]);
        //  Always point to a single id pk?
        //var buf_val = encode_to_buffer([this.value]); // Longer encoding form. Much more flexible.

        var res = [bufs_key, buf_val];

        //console.log('incrementor get_record_bin res', res);
        //console.log('this.id', this.id);
        //throw 'stop';
        return res;
    }



    // Will also create an index record for an incrementor.

    get_index_bin() {
        // the name, the id.
        // make xas2 capable of storing a string and showing how long it is?
        // incrementors themselves - global prefix of 0           (MAGIC NUMBER)
        // the incrementors index will have a global prefix of 1. (MAGIC NUMBER)
        // returns an array containing pairs (nested array)
        // Need to get the key as a buffer.

        // prefix space 1, index number 0 within incrementor indexes, name, incrementor id

        //var arr_idx_key = [1, 0, this.name, this.id];
        var arr_idx_key = [this.name, this.id];
        var buf_key = encode_to_buffer(arr_idx_key, 1, 0);
        //console.log('buf_key', buf_key);

        var res = [
            [buf_key, null]
        ];
        //console.log('res', res);
        //throw 'stop';
        return res;

    }

}

Incrementor.get_by_name = (name) => {
    // build the key using xas2?

    // Incrementor by name index would be in keyspace 1
    var incrementor_name_lookup_key = xas2([1, name]);
    console.log('incrementor_name_lookup_key', incrementor_name_lookup_key);

}

module.exports = Incrementor;