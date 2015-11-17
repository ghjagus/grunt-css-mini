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
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        cssmini: {
            options: {
                cssSrcDir: 'dev/css',
                cssOutputDir: 'dist/css'
            },
            html: {
                src: 'dev/*.html',
                dest: 'dist'
            },
            template: {
                src: 'dev/template/**/*.html',
                dest: 'dist/template'
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    //grunt.registerTask('test', ['clean', 'cssmini', 'nodeunit']);
    grunt.registerTask('test', ['cssmini']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
