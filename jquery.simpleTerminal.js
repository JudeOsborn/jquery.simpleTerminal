/*
 * Simple Terminal - A very simple simulated terminal.
 * 
 * Requires FancyInput (http://dropthebit.com/demos/fancy_input/fancyInput.html)
 *
 * Copyright (c) 2014 Jude Osborn
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  1.0.0
 *
 * Usage:
 *  $('div').terminal({
 *     prompt: 'whatever:',
 *     intro: 'Some intro text',
 *     command: function(command, terminal) {
 *         // Functionality here.
 *     }
 * });
 *
 * Parameters:
 *  prompt: An optional custom command prompt ('$' by default).
 *  intro: Some optional intro text.
 *  command: The logic for each command. The terminal object includes:
 *       echo: Output a simple text message.
 *       success: Output a success messsage.
 *       error: Output an error message.
 */
 (function($, window, document, undefined) {
    
    "use strict";
    
    var $window = $(window);
    var $document = $(document);

    $.fn.simpleTerminal = function(options) {
        var $element = this;
        var settings = {
            prompt: '$'
        };

        if (options) {
            $.extend(settings, options);
        }

        settings.prompt += ' ';

        // Have to add all the elements like this or fancyinput chokes.
        $element.html('<div id="content"><div id="empty-line"></div><div id="command-prompt"><div id="status"></div><div id="command-entry"><input type="text"></div></div></div>');

        var $content = $element.find('#content');

        // Create the command line.
        var $commandPrompt = $element.find('#command-prompt');

        var $status = $element.find('#status');
        $status.html(settings.prompt);

        var $fancyInput = $element.find('#command-entry');
        $commandPrompt.append($fancyInput);

        var $commandInput = $element.find('#command-entry input');
        $commandInput.val('').fancyInput();
        $commandInput.focus();
       

        /**
        * Command line history.
        */
        var commandHistory = {
            marker: 0,
            items: [],
            init: function() {
                if (this.items.length === 0) {
                    var cookie = $.cookie('history_items');
                    if (cookie !== undefined) {
                        var items = cookie.split(',');
                        if (items !== undefined) {
                            this.items = items;
                        }
                    }
                }

                this.marker = this.items.length;
            },
            newItem: function(item) {

                // Clip history to a max of the last 20 lines.
                if (this.items.length >= 20) {
                    this.items = this.items.slice(this.items.length - 20, this.items.length);
                }

                this.items.push(item);

                $.cookie('history_items', this.items);
            },
            previous: function() {
                if (this.marker > 0) {
                    this.marker--;
                    updateCommandLine(this.items[this.marker]);
                }
            },
            next: function() {
                if (this.marker < this.items.length) {
                    this.marker++;
                    updateCommandLine(this.items[this.marker]);
                }
            },
            reset: function() {
                this.marker = this.items.length;
            }
        };

        // Get the history going.
        commandHistory.init();

        // Focus on terminal click.
        $document.on('click', '#' + $element.attr('id'), function() {
            $commandInput.focus();
        });

        // Arrow keys go forward or backwords in history.
        $document.on('keydown', '#' + $element.attr('id') + ' #command-entry input', $.throttle(30, function(e) {
            switch (e.which) {

                // Up arrow.
                case 38:
                    e.preventDefault();
                    commandHistory.previous();

                    break;

                // Down arrow.
                case 40:
                    e.preventDefault();
                    commandHistory.next();

                    break;
            }
        }));

        // More key commands.
        $document.on('keydown', '#' + $element.attr('id') + ' #command-entry input', function(e) {
            switch(e.which) {

                // Enter to run a command.
                case 13:
                    var $input = $(this);
                    e.preventDefault();

                    if ($input.val()) {
                        var commandVal = $input.val();
                        terminal.echo(settings.prompt + ' ' + commandVal);
                        $input.val('');
                        $element.find('.fancyInput').find('span').remove();
                        settings.command(commandVal, terminal);
                        commandHistory.newItem(commandVal);
                    } else {
                        terminal.echo(settings.prompt + ' ');
                        $commandInput.focus();
                    }

                    commandHistory.reset();

                    break;

                // Tab completion.
                case 9:
                    e.preventDefault();

                    var words = $commandInput.val().split(' ');
                    var prevWords = words.slice(0, -1);
                    var currWord = words.slice(-1);

                    // Assume commands first and then terminal files after.
                    var filenames = os.files.list();
                    var items = [];
                    if (prevWords.length > 0) {
                        items = filenames.slice(0);
                    } else {
                        for (var c in commands) {
                            items.push(c);
                        }
                    }

                    var cmdComplete = autoComplete(currWord, items);
                    if (cmdComplete.length > 0) {
                        words[words.length - 1] = cmdComplete;
                    }

                    var output = words.join(' ');
                    if (prevWords.length === 0) {
                        output += ' ';
                    }

                    updateCommandLine(output);

                    break;
            }
        });

        /**
        * Add text to the command line.
        *
        * @param: The text to add to the command line.
        */
        function updateCommandLine(text) {
            var $caret = $element.find('.fancyInput .caret');
            $caret.hide();
            $element.find('.fancyInput span').remove();

            if (text !== undefined) {
                for (var i = 0; i < text.length; i++) {

                    // Force non breaking spaces.
                    var textChar = '&nbsp;';
                    if (text[i] !== ' ') {
                        textChar = text[i];
                    }

                    $element.find('.fancyInput div').append('<span>' + textChar + '</span>');
                }

                $element.find('.fancyInput input').val(text);
            } else {
                $element.find('.fancyInput input').val('');
            }

            // Restore the cursor after a slight delay to minimize flickering.
            setTimeout(function() {
                $caret.show();
            }, 200);
        }

        var terminal = {

            /**
            * Clear all lines in the terminal.
            */
            clear: function() {
                $content.find('.line').remove();
            },

            /**
            * Takes care of outputting content to the terminal in various forms.
            * 
            * @param line: The line to output.
            * @param cssClass: An optional css class to include.
            */
            echo: function(line, cssClass) {
                var $clone = $('#empty-line').clone().attr('id', '').addClass('line').html(line);

                if (cssClass !== undefined) {
                    $clone.addClass(cssClass);
                }

                $content.find('#command-prompt').before($clone);
                $element.animate({scrollTop: $element.scrollTop() + $clone.outerHeight(true)}, 0);
            },

            /**
            * A success message.
            *
            * @param line: The line to output.
            */
            success: function(line) {
                terminal.echo(line, 'success');
            },

            /**
            * An error message.
            *
            * @param line: The line to output.
            */
            error: function(line) {

                // Make sure less than and greater than symbols are visible (e.g. "<string>").
                var outputLine = line.replace('<', '&lt;').replace('>', '&gt;');
                terminal.echo(outputLine, 'error');
            }
        };

        if (settings.intro !== undefined) {
            for (var i = 0; i < settings.intro.length; i++) {
                terminal.echo(settings.intro[i]);
            }
        }
    };
})(jQuery, window, document);
