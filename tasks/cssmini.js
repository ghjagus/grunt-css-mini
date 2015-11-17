/*
 * grunt-css-mini
 * https://github.com/ghjagus/grunt-css-mini
 *
 * Copyright (c) 2015 jagusou
 * Licensed under the MIT license.
 */

'use strict';

var selectorHash = {};
var fs = require('fs');
var path = require('path');

var classGenerator = {
    asset: 'abcdefghijkmnpqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ'.split(''),
    index: {
        left: -1,
        middle: 0,
        right: 0
    },
    getClassId: function() {
        this.index.left++;

        if (this.index.left > this.stepNum) {
            this.index.left = 0;
            this.index.middle++;
        }

        if (this.index.middle > this.stepNum) {
            this.index.middle = 0;
            this.index.right++;
        }

        if (this.index.right > this.stepNum) {
           console.log('no classId to assign');
            return;
        }

        this.id++;

        return [
            this.asset[this.index.left],
            this.asset[this.index.middle],
            this.asset[this.index.right]
        ].join('');
    },
    init: function() {
        this.stepNum = this.asset.length - 1;
        this.id = -1;
    }
};

classGenerator.init();

var cssRulesCache = {
    sufix: '$',
    counter: 0,
    data: {}
};

var commentCache = {
    sufix: '!',
    counter: 0,
    data: {}
};

function preHandleCSS(content) {
    return content.replace(/{[^}]*?}/g, function(match, index, input) {
        var key = cssRulesCache.sufix + cssRulesCache.counter++;
        cssRulesCache.data[key] = match;
        return key;
    });
}

function preHandleComment(content) {
    return content.replace(/\/\*[\s\S]+?\*\//gim, function(match) {
        var key = commentCache.sufix + commentCache.counter++;
        commentCache.data[key] = match;
        return key;
    });
}

function mini(content) {
    return content.replace(/(?:[#\.][a-zA-Z0-9\-\_]+)/gi, function(selector, index, input) {
        var type = selector[0],
        newId;

        // delete ./# in class，id str
        selector = selector.slice(1);
        if (! selectorHash[selector]) {
            newId = classGenerator.getClassId();
            selectorHash[selector] = newId;
        } else {
            newId = selectorHash[selector];
        }
        return type + newId;
    });
}

function reborn(content) {
    // recover to css
    return content.replace(/(?:\!\d+)|(?:\$\d+)/g, function(match) {
        var type = match[0];
        var ret;

        switch (type) {
            case '!':
                ret = commentCache.data[match];
                break;
            case '$':
                ret = cssRulesCache.data[match];
                break;
            default :;
        }

        return ret;
    });
}

module.exports = function (grunt) {

    grunt.registerMultiTask('cssmini', 'a grunt plugin to zip css selectors in css or html files.', function () {
        var options = this.options();
        var cssSrcDir = options.cssSrcDir;
        var cb = this.async();

        if (!grunt.file.isDir(cssSrcDir)) {
            grunt.log.error('css directory' + cssSrcDir + ' is not found');
            return;
        }

        options.cssOutputDir = options.cssOutputDir || 'dist';

        grunt.file.expand(cssSrcDir + '**/*.css').forEach(function(cssFile) {
            var content = grunt.file.read(cssFile);
            var fileName = path.basename(cssFile, '.css');
            var destpath = path.join(options.cssOutputDir, fileName+'.css');

            content = reborn(mini(preHandleComment(preHandleCSS(content))));
            grunt.file.write(destpath, content);
            grunt.verbose.writeln(destpath+ 'create successfully!');
        });

        return;
        //TODO html, template compile

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            // Concat specified files.
            var src = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Read file source.
                return grunt.file.read(filepath);
            }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            src += options.punctuation;

            // Write the destination file.
            grunt.file.write(f.dest, src);

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

};
