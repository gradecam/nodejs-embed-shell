/* jshint node:true, unused: true */
'use strict';

module.exports = embedShell;

var repl     = require('repl');

var Q = require('q');
var _ = require('lodash');

var resolveObject = function(obj) {
    // The purpose of this is simply to flatten all values into an array so
    // that it can be used with a Q.all
    var arr = [];
    var recursiveResult;
    _.each(obj, function(val, key, obj) {
        if (!val) {
            return;
        }
        if (typeof(val) == 'object') {
            if (Q.isPromiseAlike(val)) {
                arr.push(val);
                val.then(function(resolvedVal) {
                    obj[key] = resolvedVal;
                });
            } else {
                recursiveResult = resolveObject(val);
                if (recursiveResult[0]) {
                    arr.push(recursiveResult[1]);
                }
            }
        }
    });
    return [!!arr.length, Q.all(arr).then(function() { return obj; })];
};

function embedShell(options) {
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

    function watch(key) {
        pending[key] = true;
    }

    function unwatch(key) {
        delete pending[key];
    }

    function resolver() {
        _.each(_.omit(shell.context, keys, _.keys(pending)), function(val, key) {
            var isPromise = Q.isPromiseAlike(val);
            var result = resolveObject(val);
            if (result[0]) {
                watch(key);
                result[1].done(function(resolved) {
                    console.log('resolved:', key);
                    if (isPromise) {
                        shell.context[key] = resolved;
                    }
                    unwatch(key);
                }, function(e) {
                    console.log('failed:', key);
                    shell.context[key] = e;
                    unwatch(key);
                });
            }
        });
    }
    setInterval(resolver, 1000);
    return shell;
}
