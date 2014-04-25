'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-shell');
    
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
                'config/*.js',
                'fns/**/*.js',
                'game/**/*.js',
                '*.js'
            ],
            test: {
                options: {
                    jshintrc: 'spec/.jshintrc'
                },
                src: ['spec/**/*.js']
            }
        },


        // shell commands
        shell: {
            deploy: {
                command: 'modulus deploy --project-name futurism-multi-staging'
            }
        }

    });



    grunt.registerTask('serve', function () {
        grunt.task.run([
            'nodemon'
        ]);
    });
    
    
    grunt.registerTask('deploy', function() {
        grunt.task.run([
            'shell:deploy'
        ]);
    });


};