
const CommonFunctions = {
    remove_linebreaks( str ) {
        return str.replace( /[\r\n]+/gm, "" );
    }
}

module.exports = CommonFunctions;