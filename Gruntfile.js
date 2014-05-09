/* jshint node:true */
var path = require('path');

module.exports = exports = function(grunt) {
    'use strict';

    var SAUCELAB_BROWSERS = [
        // Windows 7 -- IE
        {
            browserName: 'internet explorer',
            version: '8',
            platform: 'Windows 7'
        },
        {
            browserName: 'internet explorer',
            version: '9',
            platform: 'Windows 7'
        },
        {
            browserName: 'internet explorer',
            version: '10',
            platform: 'Windows 7'
        },
        {
            browserName: 'internet explorer',
            version: '11',
            platform: 'Windows 7'
        },

        // Windows 7 -- Chrome
        {
            browserName: 'chrome',
            version: '26',
            platform: 'Windows 7'
        },
        {
            browserName: 'chrome',
            version: '30',
            platform: 'Windows 7'
        },
        {
            browserName: 'chrome',
            version: '34',
            platform: 'Windows 7'
        },

        // Windows XP -- Firefox
        {
            browserName: 'firefox',
            version: '3.5',
            platform: 'Windows XP'
        },
        {
            browserName: 'firefox',
            version: '28',
            platform: 'Windows XP'
        },
        {
            browserName: 'firefox',
            version: '29',
            platform: 'Windows XP'
        },

        // OS X 10.9 -- Firefox
        {
            browserName: 'firefox',
            version: '28',
            platform: 'OS X 10.9'
        },
        {
            browserName: 'firefox',
            version: '28',
            platform: 'OS X 10.9'
        },

        // OS X 10.9 -- Safari
        {
            browserName: 'safari',
            version: '7',
            platform: 'OS X 10.9'
        },

        // OS X 10.8 -- Safari
        {
            browserName: 'safari',
            version: '6',
            platform: 'OS X 10.8'
        },
        {
            browserName: 'firefox',
            version: '28',
            platform: 'OS X 10.9'
        },
    ];

    grunt.initConfig({
        casper: {
            options: {
                pre: './test/init.coffee',
                test: true
            },

            indexedDB: {
                options: {
                    args: [
                        '--driver=asyncStorage',
                        '--driver-name=IndexedDB',
                        '--url=indexeddb'
                    ],
                    engine: 'slimerjs'
                },
                src: [
                    'test/test.*.coffee'
                ]
            },

            localstorageGecko: {
                options: {
                    args: [
                        '--driver=localStorageWrapper',
                        '--driver-name=localStorage',
                        '--url=localstorage'
                    ],
                    engine: 'slimerjs'
                },
                src: [
                    'test/test.*.coffee'
                ]
            },

            localstorageWebKit: {
                src: [
                    'test/test.*.coffee'
                ]
            },

            websql: {
                options: {
                    args: [
                        '--driver=webSQLStorage',
                        '--driver-name=WebSQL',
                        '--url=websql'
                    ]
                },
                src: [
                    'test/test.*.coffee'
                ]
            }
        },
        concat: {
            options: {
                separator: '',
            },
            localforage: {
                src: [
                    // https://github.com/jakearchibald/es6-promise
                    'bower_components/es6-promise/promise.js',
                    'src/drivers/**/*.js',
                    'src/localforage.js'
                ],
                dest: 'dist/localforage.js',
                options: {
                    banner:
                        '/*!\n' +
                        '    localForage -- Offline Storage, Improved\n' +
                        '    Version 0.8.0\n' +
                        '    http://mozilla.github.io/localForage\n' +
                        '    (c) 2013-2014 Mozilla, Apache License 2.0\n' +
                        '*/\n'
                }
            }
        },
        connect: {
            test:{
                options:{
                    base: '.',
                    hostname: '*',
                    port: 9999
                }
            }
        },
        jasmine: {
            api: {
                options: {
                    specs: 'test/test.api.js',
                    vendor: [
                        'dist/localforage.js'
                    ]
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            source: [
                'Gruntfile.js',
                'src/*.js',
                'src/**/*.js',
                'test/**/test.api.js'
            ]
        },
        'saucelabs-jasmine': {
            all: {
                options: {
                    username: process.env.SAUCE_USERNAME,
                    key: process.env.SAUCE_ACCESS_KEY,
                    urls: ['http://localhost:9999/test/test.main.html'],
                    tunnelTimeout: 5,
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 3,
                    browsers: SAUCELAB_BROWSERS,
                    testname: 'localForage Tests'
                }
            }
        },
        shell: {
            options: {
                stdout: true
            },
            component: {
                command: path.resolve('node_modules', 'component', 'bin',
                                      'component-build') +
                         ' -o test -n localforage.component'
            },
            publishDocs: {
                command: 'rake publish ALLOW_DIRTY=true'
            },
            serveDocs: {
                command: 'bundle exec middleman server'
            }
        },
        uglify: {
            localforage: {
                files: {
                    'dist/localforage.min.js': ['dist/localforage.js'],
                    'docs/localforage.min.js': ['dist/localforage.js']
                }
            }
        },
        watch: {
            build: {
                files: ['src/*.js', 'src/**/*.js'],
                tasks: ['build']
            },
            grunt: {
                files: [
                    'Gruntfile.js'
                ]
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('docs', ['shell:serveDocs']);
    grunt.registerTask('publish', ['build', 'shell:publishDocs']);
    grunt.registerTask('serve', ['connect', 'watch']);

    var testTasks = ['build', 'jshint', 'shell:component', 'jasmine'];

    // Run tests on travis with Saucelabs.
    if (process.env.TRAVIS_JOB_ID ||
        (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY)) {
        testTasks.push('connect:test');
        testTasks.push('saucelabs-jasmine');
    }

    grunt.registerTask('test', testTasks);
};
