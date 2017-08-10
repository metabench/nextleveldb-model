var Incrementor = require('./incrementor');
var jsgui = require('jsgui3');
var tof = jsgui.tof;
var each = jsgui.each;


class Field {

    // Could also be assigned an incrementor.

    // Link the field back to the table?
    //  Not (quite) needed yet.
    //   Links to the incrementor where needed.

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




    'constructor'() {
        var a = arguments, l = a.length, t;
        // is the field a key?
        //  

        // is it part of the pk?
        //  is it the entire pk?

        this.is_pk = false;




        if (l === 1) {
            this.name = a[0];
        }
        if (l === 2) {
            this.name = a[0];
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





        if (l === 3) {


            this.name = a[0];
            this.id = a[1];

            t = tof(a[2]);
            if (t === 'string') {
                this.type = a[2];
            } else if (a[2] instanceof Incrementor) {
                this.incrementor = a[2];
            } else if (t === 'boolean') {
                this.is_pk = a[2];
                //this.incrementor = a[2];
            }
        }
        if (l === 4) {

            /*

            this.name = a[0];
            this.id = a[1];
            this.type = a[2];

            this.incrementor = a[3];

            */

            this.name = a[0];
            this.id = a[1];
            this.incrementor = a[2];
            this.is_pk = a[3];

        }


    }
}

module.exports = Field;