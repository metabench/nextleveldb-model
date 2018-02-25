var Field = require('./field');
var lang = require('lang-mini');
var each = lang.each;
var tof = lang.tof;

const XAS2_VALUE_TYPE = 0;


class Primary_Key {
    constructor(table) {
        this.fields = [];
        this.map_fields = {};

        if (!table) {
            console.trace();
            throw 'requires table reference';
        }

        this.table = table;
    }
    get length() {
        return this.fields.length;
    }
    add_field(field) {
        if (!(field instanceof Field)) {
            throw 'stop';
        }
        //this.table.add_field(field);

        if (!this.map_fields[field.name]) {
            this.fields.push(field);
            this.map_fields[field.name] = field;
        }

        if (typeof field.name === 'undefined') {
            console.trace();
            throw 'Field name expected';
        }


        //throw 'stop';



        //
        return field;
    }
    set_def(def) {
        var field;
        var table = this.table,
            t_item;
        var that = this;

        var t_def = tof(def);

        //console.log('pk set_def', def);


        var set_string = (item) => {
            field = table.map_fields[item];

            if (!field) {
                // need to create the field.
                //field = new Field(item, table, table.inc_fields.increment(), true);

                // We don't know the type of the pk.
                //  Assume it is type 0?
                //   Maybe assume that for primary key (constituent) fields.


                // Maybe the wrong place / way to create the field.
                field = table.add_field(item, -1, XAS2_VALUE_TYPE, true);

                //field = table.add_field(item, null, true);

            } else {
                console.trace();
                throw 'stop';
            }


            //console.log('field', field);
            //console.log('table.map_fields', table.map_fields);
            //field = new Field(item, table, table.inc_fields.increment(), true);
            that.add_field(field, -1);
        }

        if (t_def === 'string') {
            set_string(def);
        }


        if (t_def === 'array') {
            each(def, (item) => {
                // need to create a new field
                /*
                str_field = a[0];
                var table = this.table = a[1];
                var id = this.id = a[2];
                this.is_pk = a[3];
                */


                t_item = tof(item);

                if (t_item === 'string') {
                    set_string(item);
                } else {
                    console.log('item', item);
                    console.trace();
                    throw 'Item expected as string';
                }


                // don't actually add it to the table's fields array?
                //table.add_field(field);




            });
        }


        return this;

    }
}

module.exports = Primary_Key;