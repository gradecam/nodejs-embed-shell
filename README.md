embed-shell
===========

embed-shell is a utility module for embedding an interactive shell with some sane defaults.
The embedded shell will have `lodash`, as `__`, and Q available in the shell context. The shell
context can be further expanded by providing a context object within the options. While the shell
is running a resolver will be invoked periodically to assign the resolved value of a `Promise` to
the shell context variable.

An appropriate `exit` handler will be setup on the shell but no other events will have
default handlers. The embedded shell is returned so that additional handlers can be
attached as necessary.

Usage
-----

    var shell = require('embed-shell');
    var options = {
        context: {
            active: true,
            name: 'Bobb',
            occupation: 'Builder'
        },
        doc: [
            'Anything you want displayed',
            'when the shell is initially embedded.'
        ],
        prompt: 'my prompt> '
    };

    var sh = shell(options);
