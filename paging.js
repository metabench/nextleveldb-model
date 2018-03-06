// Want to make paging system easy to use, reading from binary buffer that represents a query.
//  Using OO query parsing on the server may well be better.
//   Easier to test. Queries get created on the client, and can be parsed there to see if the parsing works correctly.


var xas2 = require('xas2');


const NO_PAGING = 0;
const PAGING_RECORD_COUNT = 1;
// Followed by p number
const PAGING_BYTE_COUNT = 2;
const PAGING_TIMED = 3;

// Paging objects could raise events themselves.
//  



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

Paging.Byte_Paging = Byte_Paging;
Paging.Byte = Byte_Paging;

Paging.Timed_Paging = Timed_Paging;
Paging.Timed = Timed_Paging;

module.exports = Paging;