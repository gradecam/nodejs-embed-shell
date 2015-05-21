#!/usr/bin/env node
/* jshint node:true, unused:true */

var shell = require('../lib/embed-shell');


function main() {
    var config = {
        context: {
            demo: true,
        },
        doc: [
            'Demo shell.',
        ],
    };
    var prog = require('commander');
    prog.option('-p, --prompt [prompt]', 'shell prompt');
    prog.parse(process.argv);
    config.prompt = prog.prompt;
    shell(config);
}


if (!module.parent) {
    main();
}
