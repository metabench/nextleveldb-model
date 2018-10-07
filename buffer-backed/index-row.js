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


// Record_Row
//  That should be what this is really called.

// A row is not necessarily a record row. A record itself has got index rows too sometimes.

class Index_Row extends Row {
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

}

module.exports = Index_Row;