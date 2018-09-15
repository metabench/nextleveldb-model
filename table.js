const lang = require('lang-mini');
const tof = lang.tof;
const xas2 = require('xas2');
const each = lang.each;
const is_arr_of_strs = lang.is_arr_of_strs;
const is_arr_of_arrs = lang.is_arr_of_arrs;
const get_a_sig = lang.get_a_sig;
const Evented_Class = lang.Evented_Class;
const Incrementor = require('./incrementor');
const Record = require('./record');
const Field = require('./field');
const Index = require('./index-def');
const Foreign_Key = require('./foreign-key');
//var Database = require('./database');
const Binary_Encoding = require('binary-encoding');
const encode_to_buffer = Binary_Encoding.encode_to_buffer;
const Record_Def = require('./record-def');
const Table_Record_Collection = require('./table-record-collection');
//var Model_Database = require('./database');
const database_encoding = require('./encoding');
// Each table will have its lower level data in the DB, and means of interacting with it here.

const table_table_key_prefix = 2;

const special_characters = {
    '!': true,
    '+': true
}


let kp_to_range = buf_kp => {
    let buf_0 = Buffer.alloc(1);
    buf_0.writeUInt8(0, 0);
    let buf_1 = Buffer.alloc(1);
    buf_1.writeUInt8(255, 0);
    return [Buffer.concat([buf_kp, buf_0]), Buffer.concat([buf_kp, buf_1])];
}

class Table extends Evented_Class {
    constructor(spec) {
        super(spec);
        var a = arguments,
            sig;
        a.l = a.length;

        sig = get_a_sig(a);
        var id;
        this.record_def = new Record_Def(null, this);
        this.__type_name = 'table';
        var that = this,
            t, field_name, new_field;
        // The table linking back to the db, so that it can get the global incrementor.
        var name, db, storage;
        var spec_record_def;
        if (a.length === 1) {
            var t_spec = tof(spec.name);
            if (t_spec === 'string') this.name = spec.name;
        }

        if (a.length === 2) {
            var ta0 = tof(a[0]);
            //console.log('ta0', ta0);

            if (ta0 === 'array') {
                console.log('a[0]', a[0]);
                console.trace();
                throw 'stop';
            }
            name = a[0];
            this.db = db = a[1];
        }

        if (a.length === 3) {
            if (sig === '[s,?,n]') {
                name = a[0];
                this.db = db = a[1];
                this.id = id = a[2];
            } else {
                name = a[0];
                this.db = db = a[1];
                spec_record_def = a[2];
            }
        }

        if (sig === '[s,?,n,a]') {
            name = a[0];
            this.db = db = a[1];
            this.id = id = a[2];
            if (a[3].length === 3 || a[3].length === 4) {
                if (tof(a[3][0]) === 'number') {
                    var inc_fields_id = a[3][0];
                    var inc_indexes_id = a[3][1];
                    var inc_foreign_keys_id = a[3][2];

                    this.inc_fields = db.incrementors[inc_fields_id];
                    this.inc_indexes = db.incrementors[inc_indexes_id];
                    this.inc_foreign_keys = db.incrementors[inc_foreign_keys_id];
                } else {
                    this.inc_fields = a[3][0];
                    this.inc_indexes = a[3][1];
                    this.inc_foreign_keys = a[3][2];
                }
            }
            if (a[3].length === 4) {
                if (tof(a[3][0]) === 'number') {
                    var inc_pk_id = a[3][3];
                    this.pk_incrementor = db.incrementors[inc_pk_id];
                } else {
                    this.pk_incrementor = a[3][3];
                }
            }
        }
        if (name) this.name = name;
        if (db) {
            if (!this.inc_fields) this.inc_fields = db.new_incrementor('inc_field_' + this.name);
            if (!this.inc_indexes) this.inc_indexes = db.new_incrementor('inc_idx_' + this.name);
            if (!this.inc_foreign_keys) this.inc_foreign_keys = db.new_incrementor('inc_fk_' + this.name);
            if (typeof this.id === 'undefined') {
                id = this.id = db.map_incrementors['table'].increment();
                //console.log('id', id);
                //console.log('name', name);
            }
        } else {
            console.trace();

            // Use a pseudo-incrementor?
            //  As in we don't add the incrementors to the database (yet)
            //  For the moment we just want to create the table object, not sure if we want it added to the db.

            throw 'Create new incrementors not connected to db';

        }

        this.record_def.on('change', e_change => {
            //console.log('record_def e_change', e_change);
            // raise a change event on the Table

            //console.log('pre raise table (this) change');
            this.raise('change', e_change);
        });

        if (spec_record_def) {
            //console.log('spec_record_def', spec_record_def);
            this.record_def.set_def(spec_record_def);
            //this.record_def = new Record_Def(spec_record_def, this);
        } else {
            //this.record_def = new Record_Def(null, this);
        }
        this.records = new Table_Record_Collection(this);
        this.key_prefix = 2 + id * 2;
        this.indexes_key_prefix = this.key_prefix + 1;
        //throw 'stop';
        var new_inc, is_key, first_char;
    }

    get inward_fk_tables() {
        // search the db?

        console.log('db.map_tables_incoming_fks', db.map_tables_incoming_fks)

        console.log('db.map_tables_incoming_fks[this.id]', db.map_tables_incoming_fks[this.id]);
    }

    get buf_kp() {
        if (this._buf_kp) {
            return this._buf_kp;
        } else {
            this._buf_kp = xas2(this.key_prefix).buffer;
            return this._buf_kp;
        }
    }

    set_fk() {
        return this.record_def.set_fk.apply(this.record_def, arguments);
    }


    set_pk() {
        return this.record_def.set_pk.apply(this.record_def, arguments);
    }

    add_index() {
        //this.record_def.add_index.apply(this.record_def, arguments);
        return this.record_def.add_index.apply(this.record_def, arguments);



        //return this.record_def.add_index.apply(this, arguments);
    }
    /*
    add_field() {
        var args = Array.prototype.slice.call(arguments);
        args.push(this);
        return this.record_def.add_field.apply(this.record_def, args);
    }
    */


    get unique_fields() {
        console.trace();
        throw 'NYI';
        // Can't specify unique field constraints / indexes right now.
        //return this.record_def.fields.filter(field => field.is_unique);
        return this.record_def.unique_fields;
    }


    get incrementors() {
        var res;
        if (this.pk_incrementor) {
            res = [this.inc_fields, this.inc_indexes, this.inc_foreign_keys, this.pk_incrementor];
        } else {
            res = [this.inc_fields, this.inc_indexes, this.inc_foreign_keys];
        }
        return res;
    }

    get own_incrementor_ids() {
        var res;
        if (this.pk_incrementor) {
            res = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id, this.pk_incrementor.id];
        } else {
            res = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id];
        }
        return res;
    }

    add_field() {
        //var args = Array.prototype.slice.call(arguments);
        //args.push(this);
        //console.log('table add_field ', arguments);
        //console.log('table add_field ');
        return this.record_def.add_field.apply(this.record_def, arguments);
    }

    add_record() {
        return this.records.add_record.apply(this.records, arguments);
    }
    add_records() {
        //console.log('this.records', this.records);
        return this.records.add_records.apply(this.records, arguments);
    }

    ensure_records_no_overwrite() {
        // ensure_records_no_overwrite
        return this.records.ensure_records_no_overwrite.apply(this.records, arguments);
    }

    add_records_including_table_id_in_key() {
        return this.records.add_records_including_table_id_in_key.apply(this.records, arguments);
    }
    // add_records_including_table_id_in_key

    new_record() {
        return this.records.new_record.apply(this.records, arguments);
    }

    new_records() {
        return this.records.new_records.apply(this.records, arguments);
    }

    add_arr_table_records(at_records) {
        return this.records.add_arr_table_records.apply(this.records, arguments);
    }

    get primary_key() {
        return this.record_def.pk;
    }
    get pk() {
        return this.record_def.pk;
    }

    get kp() {
        return this.key_prefix;
    }

    get map_fields() {
        return this.record_def.map_fields;
    }

    get fields() {
        //return Array.concat();
        return this.record_def.fields;
    }
    get indexes() {
        //return Array.concat();
        return this.record_def.indexes;
    }

    get field_names() {
        var res = [];
        each(this.fields, (field) => {
            res.push(field.name);
        });
        return res;
    }

    get kv_field_names() {
        return this.record_def.kv_field_names;
    }

    get kv_fields() {
        return this.record_def.kv_field_names;
    }

    get indexed_field_names() {
        return this.record_def.indexed_field_names;
    }
    get indexed_field_names_and_ids() {
        return this.record_def.indexed_field_names_and_ids;
    }

    get map_indexes_by_field_names() {
        return this.record_def.map_indexes_by_field_names;
    }

    get inward_fk_refs() {
        let res = [];
        each(this.db.tables, table => {
            let has_ref = false;
            each(table.fields, field => {
                if (field.fk_to_table === this) {
                    has_ref = true;
                }
            });
            //if (table.)
            if (has_ref) {
                res.push(table.name);
            }
        })
        return res;
    }
    
    get structure_record() {

        let incrementor_ids;
        //console.log('!!this.pk_incrementor', !!this.pk_incrementor);
        if (this.pk_incrementor) {
            incrementor_ids = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id, this.pk_incrementor.id];
        } else {
            incrementor_ids = [this.inc_fields.id, this.inc_indexes.id, this.inc_foreign_keys.id];
        }
        let res = [
            [table_table_key_prefix, this.id],
            [this.name, incrementor_ids]
        ]
        return res;
    }

    get buf_structure_record() {
        var prefix = this.key_prefix;
        var res = Binary_Encoding.encode_pair_to_buffers(this.structure_record, prefix);
        return res;
    }

    get outward_fk_refs() {
        let res = [];
        let map = {};
        each(this.fields, field => {
            if (field.fk_to_table && !map[field.fk_to_table.name]) {
                map[field.fk_to_table.name] = true;
                res.push(field.fk_to_table.name);
            }
        });
        return res;
    }

    get fields_info() {
        let table = this;
        //console.log('table', table);
        let fields = table.fields;
        //console.log('fields', fields);
        let res = [];

        each(fields, field => {
            let id = field.id;
            let name = field.name;
            let fk_to_table = field.fk_to_table;
            let type_id = field.type_id;
            let obj_res = {
                'id': id,
                'name': name,
                'type_id': type_id
            }
            if (fk_to_table) {
                let fk_pk = fk_to_table.pk;
                let fk_pk_fields = fk_pk.fields;
                let fk_to_fields = [];
                each(fk_pk_fields, fk_to_field => {
                    fk_to_fields.push([fk_to_field.id, fk_to_field.name, fk_to_field.type_id]);
                })
                obj_res.fk_to = {
                    'table_name': fk_to_table.name,
                    'table_id': fk_to_table.id,
                    'fields': fk_to_fields
                }
            }
            res.push(obj_res);
        });
        return res;
    }
    
    get_map_lookup(field_name) {

        var i_field = this.map_fields[field_name].id;
        //console.log('i_field', i_field);

        var res = {};
        this.records.each((record) => {
            var arr_rec = record.to_flat_arr();
            var field_value = arr_rec[i_field];
            res[field_value] = record.key;
        });
        return res;
    }

    get_all_db_records() {
        var arr_records = this.records.get_all_db_records.apply(this.records, arguments);
        return arr_records;
    }

    get b_records() {
        let res = [];
        each(this.records.arr_records, record => {
            each(record.to_b_records(), b_record => {
                res.push(b_record);
            })
        })
        return res;

        //return this.records.arr_records.map(x => x.to_b_records());
    }
    
    get_all_db_records_bin() {
        var buf_records = this.records.get_all_db_records_bin.apply(this.records, arguments);
        return buf_records;
    }

    get_arr_data_index_records() {
        // Get it for a specific record...
        return this.records.get_arr_data_index_records.apply(this.records, arguments);
    }
    get_record_bb_index_records(record) {
        let i = this.indexes,
            l = i.length;
        let res = new Array(l);
        for (let c = 0; c < l; c++) {
            res[c] = i[c].bb_record_to_bb_index_record(record);
        }
        //console.log('get_record_bb_index_records res', res);
        //throw 'stop';
        return res;
    }

    get_index_id_by_field_name(field_name) {
        //console.log('field_name', field_name);
        let field_id = this.map_fields[field_name];
        return this.get_index_id_by_field_id(field_id);
    }

    get_index_id_by_field_id(field_id) {
        let res;
        each(this.indexes, (index, i, stop) => {
            //console.log('index', index);
            if (index.key_fields.length === 1) {
                let kf0 = index.key_fields[0];
                //console.log('Object.keys(kf0)', Object.keys(kf0));

                if (kf0.id === field_id) {
                    res = index.id;
                    stop();
                }
            } else {
                throw 'NYI';
            }
        })
        return res;
    }


    buf_pk_query(arr_pk_part) {
        var res = Binary_Encoding.encode_to_buffer(arr_pk_part, this.key_prefix);
        return res;
    }

    get key_range() {
        return kp_to_range(xas2(this.kp).buffer);
    }

    get buf_structure() {
        // need the incrementor's records.
        // table table record
        // then the table field records
        let all_buf_records = [];
        let buf_inc_records = [];
        let buf_kvs = [];
        //let bufs_encoded_rows = [];
        //throw 'stop';
       // console.log('buf_inc_records', buf_inc_records);
        let ttr = this.structure_record;
        //console.log('ttr', ttr);
        //throw 'stop';
        // Model_Database.encode_arr_rows_to_buf

        let rows = [];

        rows.push(ttr);

        //bufs_encoded_rows.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(ttr, 2)));

        each(this.incrementors, incrementor => {
            //let buf_inc = incrementor.get_all_db_records()[0];
            //console.log('buf_inc', buf_inc);

            let inc_row = incrementor.get_record();
            rows.push(inc_row);
        });
        //throw 'stop';

        each(this.fields, field => {
            let kv_field = field.get_kv_record();
            rows.push(kv_field);

            //const kp_fields_table = 6;

            //kv_field[0].unshift(kp_fields_table);
            // Then encode these model rows, with that kp.

            console.log('kv_field', kv_field);
            //bufs_encoded_rows.push(encode_model_row(Binary_Encoding.encode_pair_to_buffers(kv_field, 6)));

        })
        each(rows, row => console.log('row', row));
        let buf_encoded_rows = database_encoding.encode_rows_including_kps_to_buffer(rows);
        //console.log('* buf_encoded_rows', buf_encoded_rows);
        //throw 'stop';
        return buf_encoded_rows;
    }

    validate_row(row) {
        var res = true;
        var r2 = [row[0].slice(1), row[1]];
        if (r2[0].length + r2[1].length !== this.fields.length) {
            res = false;
        } else {
            // check the fields of this to see if the types match.

        }
        return res;
    }

    // own table table record
    //  may be good to retain a link to it.
    // maybe it does not exist...

    get own_table_table_record() {
        let tbl_tables = this.db.map_tables['tables'];
        let own_index_record_retrieved = tbl_tables.records.indexes[0][JSON.stringify([this.name])];
        return own_index_record_retrieved;
    }
}

var p = Table.prototype;
p.get_obj_map = p.get_map_lookup;

module.exports = Table;