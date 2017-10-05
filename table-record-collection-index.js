var jsgui = require('jsgui3');
var tof = jsgui.tof;
var xas2 = require('xas2');
var each = jsgui.each;
var is_arr_of_strs = jsgui.is_arr_of_strs;
var is_arr_of_arrs = jsgui.is_arr_of_arrs;

var Incrementor = require('./incrementor');
var Record = require('./record');
var Field = require('./field');
var Index = require('./index');
var Foreign_Key = require('./foreign-key');

var Binary_Encoding = require('binary-encoding');
var encode_to_buffer = Binary_Encoding.encode_to_buffer;

class Table_Record_Collection_Index {

    // Only a unique index for the moment.
    //  Field values as string, separated by '_'.
    //  Index definitions themselves will be of some use in getting the string index keys.


    // give it an Index class instance as its definition.





    constructor(index_def) {

        this.index_def = index_def;
        this.map_records = []; 





    }
    add_record(record) {

    }
}


module.exports = Table_Record_Collection_Index;