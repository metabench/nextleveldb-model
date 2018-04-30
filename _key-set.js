// Not sure about using this.
//  Because of how it does the comparison.

// May make new classes for both key and record, binary backed.



class Key_Set extends Set {
    constructor(spec) {
        super();
    }
}

// Takes keys, which have a binary representation.

module.exports = Key_Set;

if (require.main === module) {
    let ks = new Key_Set();

} else {

}