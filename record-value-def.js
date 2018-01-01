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

class Record_Value_Def {
    constructor() {
        this.fields = [];
        this.map_fields = {};
    }
    add_field(field) {
        if (!(field instanceof Field)) {
            throw 'stop';
        }

        this.fields.push(field);
        this.map_fields[field.name] = field;
        return field;
    }
}

module.exports = Record_Value_Def;