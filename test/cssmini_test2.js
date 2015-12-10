'use strict';

var assert = require('assert');
var grunt = require('grunt');
var path = require('path');
var util = require('./util.js');

describe('grunt-cssmini testing', function () {

    var expect;
    var result;
    var selectorsMap = JSON.parse(grunt.file.read('selectorsMap.json'));
    var rMini = new RegExp(Object.keys(selectorsMap).join('|'), 'gmi');

    var fixturesDir = 'test/fixtures/app2/';
    var expectDir = 'test/expect/app2/';
    var tmpDir = 'test/tmp/';

    var replace = function(match) {
        return selectorsMap[match];
    };

    var cssFiles = grunt.file.expand(fixturesDir + '/css/*.css');
    var htmlFiles = grunt.file.expand(fixturesDir + '/*.html');

    describe('task app2', function () {
        cssFiles.forEach(function(css) {
            var fileName;
            fileName = path.basename(css);
            it('shoud rename css file selectors => '+css, function (done) {
                expect = grunt.file.read(fixturesDir + 'css/'+fileName).replace(rMini, replace);
                grunt.file.write(expectDir + fileName, expect);
                result = grunt.file.read(tmpDir + fileName);
                // delete comment before assert
                assert.equal(util.deleteCssComment(result), util.deleteCssComment(expect));
                done();
            });
        });

        htmlFiles.forEach(function(html) {
            var fileName;
            fileName = path.basename(html);
            it('shoud rename classNames and ids in html => '+html, function (done) {
                expect = grunt.file.read(fixturesDir + fileName).replace(/<\w+[^>]*?>/g, function(tag) {
                    return tag.replace(/(?:class)=(['"])([a-zA-Z0-9\-\_\s]+?)\1|(?:id)=(['"])([a-zA-Z0-9\-\_\s]+?)\1/g, function(selector) {
                        return selector.replace(rMini, replace)
                    });
                });
                grunt.file.write(expectDir + fileName, expect);
                result = grunt.file.read(tmpDir + 'fixtures/app2/' + fileName);
                assert.equal(result, expect);
                done();
            });
        });

    });

});