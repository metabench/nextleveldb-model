// Want to make paging system easy to use, reading from binary buffer that represents a query.
//  Using OO query parsing on the server may well be better.
//   Easier to test. Queries get created on the client, and can be parsed there to see if the parsing works correctly.


var xas2 = require('xas2');


const NO_PAGING = 0;
const PAGING_RECORD_COUNT = 1;
const PAGING_KEY_COUNT = 2;
// Followed by p number
const PAGING_BYTE_COUNT = 3;
const PAGING_TIMED = 4;

const PAGING_AND_EXTENDED_OPTIONS = 5;





// This is going to allow extended options, such as limit and reverse.
//  Want it so that it recognises that there are extended paging / results options, and then provides the data in that kind of way.




// Paging objects could raise events themselves. ???
//  Reverse and limit within paging options would be cool.



// This will be used to make it easier to get the last value range.
//  Allows more options to be encoded into the query, while maintaining backwards compatability.
//  Direction and limit are options that are worth having as parameters.

// Maybe better to change to OO paging reading right now.

// Seems less important with get_last_key_in_table but it would be a useful feature nevertheless.



class Paging {
    'constructor' (spec) {



    }
    get buffer() {
        if (this.paging_type === NO_PAGING) {
            return xas2(NO_PAGING).buffer;
        } else {
            return Buffer.concat([xas2(this.paging_type).buffer, xas2(this.page_size).buffer]);
        }
    }
}

class No_Paging extends Paging {
    'constructor' (num_records) {
        super();
        this.paging_type = NO_PAGING;
    }
}

class Record_Paging extends Paging {
    'constructor' (num_records) {
        super();
        this.num_records = num_records;
        this.page_size = num_records;
        this.paging_type = PAGING_RECORD_COUNT;
    }
}

class Key_Paging extends Paging {
    'constructor' (num_keys) {
        super();
        this.num_keys = num_keys;
        this.page_size = num_keys;
        this.paging_type = PAGING_KEY_COUNT;
    }
}

// Byte paging will send complete records though.

class Byte_Paging extends Paging {
    'constructor' (num_bytes) {
        super();
        this.num_bytes = num_bytes;
        this.page_size = num_bytes;
        this.paging_type = PAGING_BYTE_COUNT;
    }
}

class Timed_Paging extends Paging {
    'constructor' (ms_delay) {
        super();
        this.ms_delay = ms_delay;
        this.page_size = ms_delay;
        this.paging_type = PAGING_TIMED;
    }
}



Paging.read_buffer = function (buf, pos = 0) {
    var paging_option, page_size = 0;
    [paging_option, pos] = x.read(buf_the_rest, pos);
    if (paging_option > 0) {
        [page_size, pos] = x.read(buf_the_rest, pos);
    }
    return [paging_option, page_size, pos];
}

Paging.No_Paging = No_Paging;
Paging.No = No_Paging;
Paging.None = No_Paging;

Paging.Record_Paging = Record_Paging;
Paging.Record = Record_Paging;

Paging.Key_Paging = Key_Paging;
Paging.Key = Key_Paging;

Paging.Byte_Paging = Byte_Paging;
Paging.Byte = Byte_Paging;

Paging.Timed_Paging = Timed_Paging;
Paging.Timed = Timed_Paging;

module.exports = Paging;