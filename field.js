var Incrementor = require('./incrementor');
var lang = require('lang-mini');
var tof = lang.tof;
var each = lang.each;
var get_a_sig = lang.get_a_sig;

const special_characters = {
    '!': true,
    '+': true,
    '&': true
}

// Index type IDs?
//  Not really sure of the use for these.
//  They are already encoded into the system. Could say that they are all unique indexes so far and introduce other index types too.

const NT_XAS2_NUMBER = 1;
const NT_DATE = 2;
const NT_TIME = 3;
const NT_STRING = 4;
const NT_FLOAT32_LE = 5;

const map_nt_ids = {
    'xas2': 0,
    'date': 1,
    'time': 1,
    'string': 2,
    'float32le': 3
}

class Field {

    // Could also be assigned an incrementor.

    // Link the field back to the table?
    //  Not (quite) needed yet.
    //   Links to the incrementor where needed.
    //   Looks like it should link back to the table, to access incrementors, the db's new incrementor.

    // name

    // Generally field objects should be given IDs.
    //  They are ids within tables. They'll be represented with xas2 at some point.

    // name, id
    //  its id is the order within the table.
    //   fields can appear in a list.


    // name
    //  could automatically choose type.

    // name, id, type

    // name, id, incrementor
    //  the incrementor increments using xas2 +ve integers including 0, onwards

    // name, id, type, incrementor
    // We use the incrementors at a later point in time, but it's worth having reference to them.

    // Could store fk info in here.

    'constructor'() {
        var a = arguments,
            l = a.length,
            t;
        // is the field a key?
        //  

        // is it part of the pk?
        //  is it the entire pk?

        this.is_pk = false;
        var str_field, first_char;
        this.__type_name = 'field';

        // More Field constructor options for parsing field definitions, such as string fields, primary keys, unique indexes with incrementors.
        // foreign key to table...
        this.fk_to_table = false;

        // A map of inward fk fields?
        //  Collection?

        // map by [table id, field id];
        //  a map of which fields refer to this field.
        //   making a foreign key sets this up (side effect);

        // Being able to find foreign keys that point to any table
        //  Then when there are such foreign keys added, we should have a reference back from the field it points to.
        //   Though something pointing to it is not really a property of something, in a way. Make it a property.

        // being able to get any records referring to a record
        //  check the model to find which tables have such references
        //  do searches based on indexes in order to lookup such references.

        // Whenever a table gets added to the db, look at the fk_to references.
        //  Then assign fk_from references on the fields and on the table.










        // Basically always need a table reference.
        //  Foreign key field should be possible.

        // this.foreign_key_to_table
        //  and it will be that table's PK.

        // The field will have a type.
        //  Often it won't be specified.
        //  Sometimes it will be.

        this.type_id = null;

        var sig = get_a_sig(a);
        //console.log('Field sig', sig);



        if (l === 1) {
            str_field = a[0];
            console.trace();
            throw 'stop - field now reqires a reference to table';
        }

        if (l === 2) {
            str_field = a[0];
            var table = this.table = a[1];
            //console.trace();
            throw 'stop - field now reqires an id to be provided';
        }

        if (l === 3) {
            str_field = a[0];
            var table = this.table = a[1];
            var id = this.id = a[2];
            //console.trace();
            //throw 'stop - field now reqires a reference to table';
        }
        if (l === 4) {
            str_field = a[0];
            var table = this.table = a[1];
            var id = this.id = a[2];

            // Next option - field type.
            //  Want to encode that as an integer.
            //   It would also refer to the native types table?

            // Will be fine to encode null when we have no table type.
            // tbl_native_types.add_records([[[0], ['xas2']], [[1], ['date']], [[2], ['string']], [[3], ['float32le']]]);
            this.type_id = a[3];



            //this.is_pk = a[3];
            //console.trace();
            //throw 'stop - field now reqires a reference to table';
        }
        if (l === 5) {
            str_field = a[0];
            var table = this.table = a[1];
            var id = this.id = a[2];
            this.type_id = a[3];
            this.is_pk = a[4];

            //console.log('str_field', str_field);
            //console.log('this.type_id', this.type_id);
            //this.is_pk = a[3] || false;
            //this.fk_to_table = a[4];
            //console.trace();
            //throw 'stop - field now reqires a reference to table';
        }
        if (l === 6) {
            str_field = a[0];
            var table = this.table = a[1];
            var id = this.id = a[2];
            this.type_id = a[3];
            this.is_pk = a[4] || false;

            // check if it's a table or a number.
            //  if it's a number, look up that table by its id.

            var t_a5 = tof(a[5]);
            if (t_a5 === 'number') {
                this.fk_to_table = this.table.db.tables[a[5]];
            } else {
                this.fk_to_table = a[5];
            }



            //this.fk_to_table = a[4];
            //console.trace();
            //throw 'stop - field now reqires a reference to table';
        }

        if (typeof this.type_id === 'boolean') {
            console.trace();
            throw 'expected integer type_id';
        }



        /*


        if (l === 2) {
            //this.name = a[0];
            str_field = a[0];
            t = tof(a[1]);
            if (t === 'string') {
                this.type = a[1];
            } else if (t === 'number') {
                this.id = a[1];
            } else if (a[1] instanceof Incrementor) {
                this.incrementor = a[1];
                //throw 'inc stop';
            }
        }

        // String, table, incrementor?
        //  Tables could start with their own specific incrementors for the ids of incrementors within tables.
        //  May be a bit of work to properly assign incrementors to tables, both within the model, and then within the db itself.
        //   Important variables for operating the DB need to be stored within the DB itself.

        // A field could be defined in such a way that it creates a new incrementor.
        //  Bit of a side effect here.

        if (l === 3) {

            str_field = a[0];
            //this.name = a[0];
            this.id = a[1];


            t = tof(a[2]);
            //if (t === 'string') {
                // Not encoding field types for the moment.

            //    this.type = a[2];
            //} else
            if (a[2] instanceof Incrementor) {
                this.incrementor = a[2];
            } else if (t === 'boolean') {
                this.is_pk = a[2];
                //this.incrementor = a[2];
            }
        }
        if (l === 4) {
            
            //this.name = a[0];
            //this.id = a[1];
            //this.type = a[2];
            //this.incrementor = a[3];
            
            str_field = a[0];
            //this.name = a[0];
            this.id = a[1];
            this.incrementor = a[2];
            this.is_pk = a[3];

        }

        */
        // can modify the field name...
        //  its not only the name, it may have a special character to start.

        // Problem seems most likely to be with reconstructing the model from remote.
        //  Could make some simpler remote model reconstruction tests.

        // Also, turning the index records into objects would help.
        //  



        var t_field = tof(str_field);
        //console.log('t_field', t_field);
        if (t_field === 'string') {
            // Also split out the part in brackets.
            var str_type;
            var str_prefix_code, field_name, fk_table;

            // parse the field name.
            var parse_field_name = (str_field_name) => {
                //console.log('str_field_name', str_field_name);
                // Check to see if there is ' fk=> '
                //  If so, we split in two and have a fk_table var

                var fk_table = null;

                var pos0, pos1;
                var str_type = null;
                var str_prefix_code = null,
                    field_name, first_char;

                pos0 = str_field_name.indexOf(' fk=> ');
                if (pos0 > 0) {
                    var s_str_field_name = str_field_name.split(' fk=> ');
                    str_field_name = s_str_field_name[0];
                    fk_table = s_str_field_name[1];

                    // Then the type if the combination of the whole primary key.
                    //  Some PKs could be composite (2 or more fields) 

                    // Could see if there is just one PK field, and get its type.
                    // 

                    // Market snapshots looks tricky in some ways. It's got a pk reference to a composite PK.
                    // Let's look up the referred to field type, later on.

                }

                pos0 = str_field_name.indexOf('(');
                if (pos0 > -1) {
                    pos0++;
                    pos1 = str_field_name.indexOf(')', pos0);
                    str_type = str_field_name.substring(pos0, pos1);
                    pos0--;
                } else {
                    pos0 = str_field_name.length;
                }

                if (special_characters[str_field_name[0]]) {
                    str_prefix_code = str_field_name[0];
                    field_name = str_field_name.substring(1, pos0);
                } else {
                    field_name = str_field_name.substring(0, pos0);
                }
                return [str_prefix_code, field_name, str_type, fk_table];
            }
            [str_prefix_code, field_name, str_type, fk_table] = parse_field_name(str_field);
            //console.log('[str_prefix_code, field_name, str_type]', [str_prefix_code, field_name, str_type]);
            this.name = field_name;
            //throw 'stop';

            if (str_prefix_code === '+') {
                var field_incrementor = this.table.db.new_incrementor('inc_' + this.table.name + '_' + field_name);
                //console.log('field_name', field_name);
                // just support a single pk_incrementor for the moment.
                //that.pk_incrementor = new_inc;
                this.table.pk_incrementor = field_incrementor;
                this.is_pk = true;
                this.type_id = NT_XAS2_NUMBER;
                this.table.record_def.pk_field = this;
                // add a field to the pk object.
                //console.log('this.table.record_def.pk', this.table.record_def.pk);
                this.table.record_def.pk.add_field(this);
                //throw 'stop';

            }

            // Means its a PK field, not another field with an unique index.


            if (str_prefix_code === '!') {

                // 25/05/2018 - Not an unique index so far
                //  Don't have constraint checking.
                //  Decided that ! should make a field unique, but so far it puts it in the PK by default, and the other ! fields compose the PK.
                //  Separate uniqueness would help - but could have special rule that says fields with ! by themselves form the PKs.
                //   Also will have it so that unique fields can be outside the PK.

                // Make a unique index for that field. (unless the field is the pk, where is is part of an already existing unique index)
                //var idx_id = this.table.inc_foreign_keys.increment();
                //var idx = this.table.add_index([]);

                //var pk_field = this.table.record_def.pk_field;

                // Need to clarify this
                //  21/05/2018
                //   It's the only place where '!' gets processed.
                //    So far, it's only meant that its a unique index.

                // But then what are the pk fields if they are only given as a combination of these?
                //  How to say that fields are unique together?

                //var arr_pk_fields = this.table.record_def.pk.fields;

                // Think we need some kind of tag on the field to say it's unique.
                //  The field is (also) unique if there is a unique index that applies to it.
                //this.is_unique = true;
                // No, it's not necessarily unique by itself. It's part of the primary key.
                // Maybe change code string.

                // A unique index here.
                //  Currently its just an index. Since it also has the PK fields, it does not need to be unique

                // Do we need to list this PK index here?
                var idx = this.table.add_index([
                    [this], this.table.record_def.pk.fields
                ]);
            }

            // same as above.
            if (str_prefix_code === '&') {

                // An index that points towards the key.
                //  One index from a field.
                //  Don't need index for PK itelse.

                var idx = this.table.add_index([
                    [this], this.table.record_def.pk.fields
                ]);
            }

            if (str_type !== null) {
                //console.log('str_type', str_type);
                var type_id = map_nt_ids[str_type];
                if (typeof type_id === 'number') {
                    this.type_id = type_id;
                }
                //throw 'stop';
            }

            if (fk_table) {
                this.fk_to_table = this.table.db.map_tables[fk_table];
                // It's to the primary key
                let fk_pk = this.fk_to_table.pk;
                if (fk_pk.fields.length === 1) {
                    this.type_id = fk_pk.fields[0].type_id;
                } else {
                    // Would like a composite type id?
                    //  Composite, then see the fields it refers to?
                    //  Composite reference type
                    //   A reference to a PK rather than a field (special case)



                    //console.trace();

                    //console.log('');
                    //console.log('this.table.name', this.table.name);
                    //throw 'NYI';
                }
                //let 

                //  The table's database has not been set yet?
                //  Just give it the table name?


                // side effect - add a foreign key to the table
                // Don't think we need to add it. Just note within the field that its a foreign key to a given table.
                //this.table.add
            }

            if (field_incrementor) {
                //   Field may be given a primary key incrementor, for incrementing its value, or just an incrementor for incrementing its value, not pk. I suppose this will be used for pk though.


                //item_field = new Field(field_name, field_id, field_incrementor, is_pk);
            } else {
                //item_field = new Field(field_name, field_id, is_pk);
            }
        } else {
            console.trace();
            console.log('a', a);
            throw ('expected string');
        }
    }

    get_kv_record() {
        var res;
        var table = this.table,
            field = this;

        // need a record type as well.
        // From now on, this will get encoded in many cases, it will be null much of the time.

        // Also include the record type.
        // this.type_id

        //console.log('this.type_id', this.type_id);

        // Also keep info about if the field is unique?
        //  That would change the structure.

        // Include an index type ID as well?




        if (this.type_id === null) {
            if (this.is_pk) {
                if (this.fk_to_table) {
                    res = [
                        [table.id, field.id],
                        [field.name, null, true, this.fk_to_table.id]
                    ];
                } else {
                    res = [
                        [table.id, field.id],
                        [field.name, null, true]
                    ];
                }

            } else if (this.fk_to_table) {
                res = [
                    [table.id, field.id],
                    [field.name, null, null, this.fk_to_table.id]
                ];
            } else {
                res = [
                    [table.id, field.id],
                    [field.name]
                ];
            }
        } else {
            if (this.is_pk) {
                if (this.fk_to_table) {
                    res = [
                        [table.id, field.id],
                        [field.name, this.type_id, true, this.fk_to_table.id]
                    ];
                } else {
                    res = [
                        [table.id, field.id],
                        [field.name, this.type_id, true]
                    ];
                }
            } else if (this.fk_to_table) {
                res = [
                    [table.id, field.id],
                    [field.name, this.type_id, null, this.fk_to_table.id]
                ];
            } else {
                res = [
                    [table.id, field.id],
                    [field.name, this.type_id]
                ];
            }
        }
        return res;
    }
    get description() {
        //var res = this.name + ': type_id: ' + this.type_id + ' ' + (this.is_pk ? 'PRIMARY KEY ' : '') + (this.fk_to_table) ? 'FOREIGN KEY TO ' + this.fk_to_table.name : '';

        //var res = 'field name: ' + this.name + ', type_id: ' + this.type_id + ', table_id: ' + this.table.id;
        var res = 'field_id: ' + this.id + ', field name: ' + this.name + ', type_id: ' + this.type_id + ', table_id: ' + this.table.id;
        if (this.is_pk) {
            res = res + ' PRIMARY KEY';
        }

        return res;
    }
    update_db_record() {
        var db_record = this.db_record;

        if (db_record) {
            var new_kv = this.get_kv_record();
            //console.log('new_kv', new_kv);
            db_record.key = new_kv[0];
            db_record.value = new_kv[1];
            db_record.arr_data = [new_kv[0], new_kv[1]];

        }
    }
}

module.exports = Field;