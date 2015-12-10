/*
 * grunt-css-mini
 * https://github.com/ghjagus/grunt-css-mini
 *
 * Copyright (c) 2015 jagusou
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['test/tmp', 'test/expect']
        },

        // Configuration to be run (and then tested).
        cssmini: {
            options: {
                selectorsMap: true
            },
            app1: {
                options: {
                    cssSrc: ['test/fixtures/app1/css/*.css'],
                    cssDest: 'test/tmp'
                },
                src: 'test/fixtures/app1/*.html',
                dest: 'test/tmp'
            },
            app2: {
                options: {
                    cssSrc: ['test/fixtures/app2/css/*.css'],
                    cssDest: 'test/tmp'
                },
                src: 'test/fixtures/app2/*.html',
                dest: 'test/tmp'
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: 'test/*.js'
            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');

    // These plugins provide necessary tasks.

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'cssmini', 'mochaTest']);

    grunt.registerTask('default', ['cssmini']);

};
