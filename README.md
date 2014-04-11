Simple Terminal
===============

A very simple simulated terminal. Only propertly tested in Chrome. Contributions welcome.

Requires FancyInput (http://dropthebit.com/demos/fancy_input/fancyInput.html)

Version:  1.0.0
 
Usage
-----

$('div').terminal({
    prompt: 'whatever:',
    intro: 'Some intro text',
    command: function(command, terminal) {
        // Functionality here.
    }
});

Parameters
----------

 * prompt: An optional custom command prompt ('$' by default).
 * intro: Some optional intro text.
 * command: The logic for each command. The terminal object includes:
    * echo: Output a simple text message.
    * success: Output a success messsage.
    * error: Output an error message.

Copyright (c) 2014 Jude Osborn

Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

