const Operators = require('./Operators');
const Clause = require('./Clause');
class Where {
    constructor( clauses, linker ) {
        this.clauses = clauses
        this.linker = linker
    }

    addClause( field, op, value, linker='and' ) {
        this.clauses.push({
            clause: new Clause( field, Operators[op], value ),
            linker:(linker.match(/and|or/i)||[null])[0]
        });

        return this;
    }
}
module.exports = Where