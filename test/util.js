'use strict';

module.exports = {
    deleteCssComment: function(content) {
        return content.replace(/\/\*[\s\S]+?\*\//g, '');
    }
};