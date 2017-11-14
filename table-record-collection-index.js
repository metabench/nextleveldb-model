var lang = require('lang-mini');
var tof = lang.tof;
var xas2 = require('xas2');
var each = lang.each;
var is_arr_of_strs = lang.is_arr_of_strs;
var is_arr_of_arrs = lang.is_arr_of_arrs;

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


    // Currently not indexing the records on the client, or in the Model.

    // Seems important to check / rebuild / build indexes on the server.
    //  Having an (active) model running on the server will help it to automatically create indexes.

    // Also, it should be possible on the client to create index values to ll put them to the server.
    //  Could have it so that only some users in the authenticated db can do ll_put operations.
    //   Seems like a (very) super user operation.

    







    constructor(index_def) {

        this.index_def = index_def;
        this.map_records = []; 





    }
    add_record(record) {

    }
}


module.exports = Table_Record_Collection_Index;