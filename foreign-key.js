// Possibly will not use this.
//  Will have something within Field that can indicate it is a foreign key reference.

// A foreign key seems less like a thing than many other things. It is essentially a note that a reference is in place.

class Foreign_Key {
    // Maybe foreign key could do some of the lookup.

    // Referring to the field itself would make more sense.

    // Then what about referring to a default name field?
    //  A table could possibly have a field, called 'name' or not, that is the default field when looking up a name.
    //  May have currencies with their names, and want to add them, and have this automatic lookup done.

    // Would probably be worth getting the data added to the system soon.
    //  Maybe some validation of input field types?

    // Basically want to add a lot of data to the database soon, keeping it streaming.
    //  Not so sure that a forei9gn key table within the database is so important.


    // Could have record encoding and decoding procedures which make use of foreign key information.
    //  Storing field types would definitely help with this encoding / decoding.






    'constructor'(field_name, foreign_table) {



        this.field_name = field_name;
        this.foreign_table = foreign_table;

        // Probably best to have a reference to the table, the field.

        // refers one field in this table to a field in another table.
        //  if we do set_fk, it finds the field, and sets its foreign_key_to_table value.

        // Want to do this so we can add records more easily.
        //  It can know to translate some values that it receives, most likely strings into numeric ids, and vice versa.






    }
}

module.exports = Foreign_Key;