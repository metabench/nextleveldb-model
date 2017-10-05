
// Will have different types of queries

// Queries will be serialised to binary.

class Query {
    constructor(id, page_size = 0) {
        this.id = id;
        this.page_size = page_size;
    }
}

// Need to be able to encode a record fully into a buffer.
//  Would mean storing the length of the key?


// Put Record
// 0 
// ----------

// Put records
// 1
// -----------




// Keys_In_Range_Query - using full keys
// 10
// ---------------------
//  don't give table IDs
//  This can be got with other parts of the Model.

// Records_In_Range_Query
// 11
// ---------------------

// Need to have queries on the server that make use of the indexes
//  This would require the server-side to have knowledge of the model.
//  This is also why having the model encoded into the database would help.

// Or have a query that gets records according to indexes. Relies on the query generator knowing how the indexes are.




// DB will need to know how to get records according to an index. That should be possible. Could read full pages of indexes and then get the results.

// Want some more basic keys for the moment.

// Don't want to make the DB server side of it all that complex.
//  Want to be able to leave the server running for a long time without changing it.


Query.Keys_In_Range = require('./queries/keys_in_range');
Query.Records_In_Range = require('./queries/records_in_range');


module.exports = Query;