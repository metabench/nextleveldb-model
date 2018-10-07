// Initialises the rest of them out of buffers.

// Each type has its own prefix for buffers where it gets encoded into Buffers.
//  Binary_Encoding does not handle buffer-backed db types.


const Key = require('./key');
const Key_List = require('./key-list');
const Record = require('./record');
const Record_List = require('./record-list');
const Value = require('./value');
const xas2 = require('xas2');
const Binary_Encoding = require('binary-encoding');

// Trouble is, we don't have a prefix for no prefix.
//  Treat them as encoding overwrites.

/*
const NONE = 0;
const RECORD = 1;
const KEY = 2;
const VALUE = 3;
*/

//const NONE = 0;
const RECORD = 200;
const KEY = 201;
const VALUE = 202;
const NONE = 210; // D2

const _from = (buf) => {
    let pos = 0, prefix;
    [prefix, pos] = xas2.read(buf, pos);

    // prefix could be one of the numbers in binary encoding.



    let buf_the_rest = Buffer.alloc(buf.length - pos);
    buf.copy(buf_the_rest, 0, pos);

    // 
    console.log('buf', buf);
    console.log('prefix', prefix);

    // Be sure to indicate no prefix in the Command_Message then.

    if (prefix === RECORD) {
        //console.log('RECORD prefix');
        // then create the record out of that buf_the_rest
        return new Record(buf_the_rest);
    } else if (prefix === NONE) {
        //console.log('RECORD prefix');
        // then create the record out of that buf_the_rest
        return buf_the_rest;
        //return Binary_Encoding.decode_buffer(buf_the_rest);
    } else {

        //return Binary_Encoding.decode_buffer(buf);
        //return buf_the_rest;
        console.log('pre decode');
        console.trace();
        console.log('buf', buf);
        return Binary_Encoding.decode_buffer(buf);

        //console.trace();
        //throw 'NYI';
    }

}


const decode_args_buffers = (arr) => {
    return arr.map(item => {
        if (item instanceof Buffer) {
            //return from(item);
            return item;
        } else {
            return item;
        }
    });
}


module.exports = {
    //from: from,
    decode_args_buffers: decode_args_buffers
}
