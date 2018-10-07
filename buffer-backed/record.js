/*
    17/05/2018 - Maybe this is a 'row' rather than a 'record'. A record encompasses index rows as well.
    // A record could be composed of its index rows too.
    // Removal of index rows when the record changes may be the best approach.


*/

const Row = require('./row');

const lang = require('lang-mini');
const def = lang.is_defined;
const each = lang.each;

let Binary_Encoding = require('binary-encoding');
let xas2 = require('xas2');
let Key = require('./key');
let Value = require('./value');

const database_encoding = require('../encoding');

const XAS2 = 0;
const STRING = 4;
const BUFFER = 9;
const ARRAY = 10;


// Standard data 0. just normal decoding.

// ~-~-~-~-~-~-~-~-~-~-~-~-~-
// Supplementary encoding
/*
const NONE = 0;
const RECORD = 1;
const KEY = 2;
const VALUE = 3;
*/

const RECORD = 200;
const KEY = 201;
const VALUE = 202;
const NONE = 210;

// Record_Row
//  That should be what this is really called.

// A row is not necessarily a record row. A record itself has got index rows too sometimes.

class Record extends Row {
    constructor(...args) {
        super(...args);

        //super.apply(this, a);
    }

    get table_id() {
        let kp = this.kp;
        if (kp === 0) {
            throw 'NYI';
        } else {
            if (kp % 2 === 0) {
                // even#

                return (kp - 2) / 2;

                // if its an incrementor, maybe we can know the table from it.

            } else {
                return (kp - 3) / 2;
            }
        }
    }

    get_index_rows(model_table) {
        // Index row spec:
        //  index fields in order, then the key

        // An Index_Row could be quite useful as a specific type of row.
        //  Record_List could produce these when asked.

        // go through the indexes
        //  

        // Different types of rows would have their own validation.

        each(this.record_def.indexes.indexes, index => {
            // then go through the index fields.
            //  use the field numbers / ids

            // key fields and value fields.

            // .kv_fields

            // then use the ids.

            // An Index_Row would help.

            // get the keys and values for the index, then give them to the index row constructor.
            //  index row constructor will encode those double KPs in the constructor.

            // index fields ids

            let kv_field_ids = index.kv_field_ids;
            // then read the field values into new kv arrays

            let index_value_kv = [[], []];

            // then go through each of them, putting them into the kv values.

            // Extracting out the specific fields from the keys and the values.

            // Database encoding get_values_at
            //  and give it a fwew indexes (in sorted order) to select from.
            //   it advances through those, skipping the ones that don't get selected from.

            // There is buffer_select_from_buffer.
            //  it looks like it can be done.

            // This will be a fairly high-performance way to get from the index kv defs and the b_record_row to the index b_rows

            // [buf_selected_value_fields, total_value_fields_count] = Binary_Encoding.buffer_select_from_buffer(buf_value, arr_indexes, 0, 0, total_key_fields_count);

            // 














        });



    }


}

module.exports = Record;