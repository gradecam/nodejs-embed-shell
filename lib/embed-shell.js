/* jshint node:true, unused: true */
'use strict';

var repl     = require('repl');

var Q = require('q');
var _ = require('lodash');


module.exports = function(options) {
    options = options || {};
    options = _.extend({
        output: process.stdout,
        input: process.stdin,
        prompt: options.prompt || 'repl> ',
        ignoreUndefined: true,
        onExit: function() {
            console.log();
            process.exit(0);
        },
        context: options.context || {},
        doc: options.doc || []
    }, options);
    options.doc.push('To exit press ^C twice, or ^D once.');
    _.each(options.doc, function(line) {
        options.output.write(line + '\n');
    });
    var shell = repl.start(options);
    shell.on('exit', options.onExit);
    _.extend(shell.context, options.context,  {
        Q: Q,
        shell: shell,
        __: _
    });
    var keys = _.keys(shell.context);
    keys.push('_', 'shell');
    var pending = {};

    function resolver() {
        _.each(_.omit(shell.context, keys), function(val, key) {
            if (Q.isPromiseAlike(val) && !pending[key]) {
                pending[key] = true;
                val.then(function(v) {
                    console.info('resolved:', key);
                    shell.context[key] = v;
                    delete pending[key];
                });
                val.fail(function(err) {
                    console.error('failed:', key);
                    shell.context[key] = err;
                    delete pending[key];
                });
            }
        });
    }
    setInterval(resolver, 100);
    return shell;
};
