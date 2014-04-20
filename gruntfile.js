'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-nodemon');
    
    // Define the configuration for all the tasks
    grunt.initConfig({
        
        
        // 
        nodemon: {
            dev: {
                script: 'testServer.js'
            },
            options: {
                watch: [
                    'fns/**/*.js',
                    'game/**/*.js',
                    '*.js',
                    'shared/*.js'
                ]
            }
        },

        
        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'gruntfile.js',
                '<%= yeoman.app %>/scripts/**/*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },


        // Run the node server in server/testServer.js
        develop: {
            server: {
                file: '<%= yeoman.server %>/testServer.js',
                nodeArgs: []
            }
        },


        // shell commands
        shell: {
            jasmine: {
                command: 'jasmine-node server/spec --forceexit',
                options: {
                    stdout: true
                }
            },
            jasmineWatch: {
                command: 'jasmine-node server/spec --autotest --color --watch server/*.js server/fns server/middleware server/models server/multi server/routes shared',
                options: {
                    stdout: true
                }
            }
        }

    });



    grunt.registerTask('serve', function (target) {
        grunt.task.run([
            'nodemon'
        ]);
    });


};