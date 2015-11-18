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
            new gutil.PluginError('gulp-css-mini', 'no classId to assign');
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

var R_EXCLUDE_SELECTOR = /\#|\.j\-/;
var excludes;
var _cssHasMinied = false;

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
        var type ,
        newId;

        if (excludes.indexOf(selector) !== -1 || R_EXCLUDE_SELECTOR.test(selector)) {
            return selector;
        }

        type = selector[0];

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

    grunt.registerMultiTask('cssmini', 'zip css selectors in css or html files.', function () {
        var options = this.options();
        var cssSrcDir = options.cssSrcDir;
        var selectorsHash = options.hashMapFile;
        var middlewares = options.plugins || [];

        excludes = options.excludes || [];

        if (! _cssHasMinied) {
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
                grunt.log.ok((destpath+ ' successfully compiled!').green);
            });

            if (selectorsHash) {
                if (selectorsHash === true) {
                    selectorsHash = {
                        name: 'selectorsHashMap.json',
                        src: './'
                    };
                }
                fs.writeFileSync(path.join(selectorsHash.src, selectorsHash.name), JSON.stringify(selectorHash, null, ' '));
            }
            _cssHasMinied = true;
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            // Concat specified files.
            var _fileList;

            _fileList = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            });

            _fileList.map(function (filepath) {
                var content = grunt.file.read(filepath);
                var dest = path.join(f.dest, path.join(filepath).split(path.sep).slice(1).join(path.sep));

                content = content.replace(/<\w+[^>]+>/gi, function(tag) {
                    var _tag = tag.replace(/(?:class)=(['"])([a-zA-Z0-9\-\_\s]+?)\1/gi, function(match, comma, className) {
                        return [
                            'class="',
                            className.split(' ').map(function(item) {
                                var _item = '.' + item;

                                return (excludes.indexOf(_item) !== -1 || R_EXCLUDE_SELECTOR.test(_item)) ?
                                    item:
                                selectorHash[item] || item;
                            }).join(' '),
                            '"'
                        ].join('');
                    }).replace(/(?:id)=(['"])([a-zA-Z0-9\-\_\s]+?)\1/gi, function(match, comma, idName) {
                        var _idName = '#'+idName;

                        if (excludes.indexOf(_idName) !== -1 || R_EXCLUDE_SELECTOR.test(_idName)) {
                            return match;
                        }

                        return [
                            'id="',
                            selectorHash[idName] || idName,
                            '"'
                        ].join('');
                    });

                    // other compile rules
                    if (options.angularjs) {
                        // angular derective transfer
                        _tag.replace(/(?:ng-class)=(['"])([\s\S]*?)\1/gi, function(match, comma, exp) {
                            return exp.replace(/(['"])([a-zA-Z0-9\-\_]+?)\1/g, function(match2, g1, className) {
                                var _className = '.'+className;

                                if (excludes.indexOf(_className) !== -1 || R_EXCLUDE_SELECTOR.test(_className)) {
                                    return match2;
                                } else {
                                    return match2.replace(className, selectorHash[className] || className);
                                }
                            });
                        });
                    }

                    // custom plugin
                    middlewares.forEach(function(plugin) {
                        _tag = plugin(_tag, options);
                    });

                    return _tag;
                });

                grunt.file.write(dest, content);

                grunt.log.ok(('File "' + dest + '" created.').green);
            });
        });
    });

};
