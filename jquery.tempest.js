// Tempest jQuery Templating Plugin
// ================================
//
// Copyright (c) 2009 Nick Fitzgerald - http://fitzgeraldnick.com/
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// JSLint
/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
"use strict";

(function ($) {
    // PRIVATE VARS AND FUNCTIONS
    var templateCache = {},
        
        // TAG REGULAR EXPRESSIONS
        // Overwrite these if you want, but don't blame me when stuff goes wrong.
        OPEN_VAR_TAG = /\{\{[ ]*?/g,
        CLOSE_VAR_TAG = /[ ]*?\}\}/g,
        OPEN_BLOCK_TAG = /\{%[ ]*?/g,
        CLOSE_BLOCK_TAG = /[ ]*?%\}/g,

        // Probably, you don't want to mess with these, as they are built from 
        // the ones above.
        VAR_TAG = new RegExp(OPEN_VAR_TAG.source + 
            "[\\w\\-\\.] + " + 
            CLOSE_VAR_TAG.source, "g"),
        BLOCK_TAG = new RegExp(OPEN_BLOCK_TAG.source + 
            "[\\w]+?[ ]+?[\\w\\-\\.]*?" + 
            CLOSE_BLOCK_TAG.source, "g"),
        END_BLOCK_TAG = new RegExp(OPEN_BLOCK_TAG.source + 
            "end[\\w]*?" + 
            CLOSE_BLOCK_TAG.source, "g"),

        // A few quick functions for testing what type of tag a token is with 
        // the regexs.
        isBlockTag = function (token) {
            return BLOCK_TAG.test(token);
        },
        isEndTag = function (token) {
            return END_BLOCK_TAG.test(token);
        },
        isVarTag = function (token) {
            return VAR_TAG.test(token);
        },

        // All block tags stored in here. Tags have a couple things to work 
        // with:
        //
        // * "args" property is set before render: 
        //     - Example: {% tag_type arg1 arg2 foo bar %}
        //         * The "args" property would be set to 
        //               ["arg1", "arg2", "foo", "bar"] 
        //           in this example. The tag's render method could look them 
        //           up in the context object, or could do whatever it wanted 
        //           to do with it.
        // * "subNodes" property which is an array of all the nodes between 
        //   the block tag and it's corresponding {% end... %} tag
        //     - NOTE: This property is only set for a block if it has the 
        //       "expectsEndTag" property set to true.
        // * Every block tag should have a "render" method that takes one 
        //   argument: a context object. It should return a string.
        BLOCK_NODES = {
            "if": {
                expectsEndTag: true,
                render: function (context) {
                    var rendered_nodes = [],
                        subNodes = this.subNodes;

                    // Check the truthiness of the argument.
                    if (!!this.args[0]) {
                        $.each(subNodes, function (i, node) {
                            rendered_nodes.push(node.render(context));
                        });
                    } 
                    return rendered_nodes.join("");
                }
            }
        },

        // Base text node object for prototyping.
        baseTextNode = {
            render: function (context) {
                return this.text || "";
            }
        },

        // Base variable node object for prototyping.
        baseVarNode = {
            name: "",
            render: function (context) {
                var val = context[this.name] || "";
                if (val === "" && this.name.search(/\./) !== -1) {
                    return getValFromObj(this.name, context);
                }
                return cleanVal(val);
            }
        },

        // Clean the passed value the best we can.
        cleanVal = function (val) {
            if (val instanceof $) {
                return jQueryToString(val);
            } else if (!isArray(val) && typeof(val) === "object") { 
                if (typeof(val.toHTML) === "function") {
                    return cleanVal(val.toHTML());
                } else {
                    return val.toString();
                }
            } else {
                return val;
            }
        },

        // Traverse a path of an obj from a string representation, 
        // for example "object.child.attr".
        getValFromObj = function (str, obj) {
            var path = str.split("."),
                val = obj[path[0]],
                i;
            for (i = 1; i < path.length; i++) {
                // Return an empty string if the lookup ever hits undefined.
                if (val !== undefined) {
                    val = val[path[i]];
                } else {
                    return "";
                }
            }

            // Make sure the last piece did not end up undefined.
            val = val || "";
            return cleanVal(val);
        },

        // Hack to get the HTML of a jquery object as a string.
        jQueryToString = function (jq) {
            return $(document.createElement("div")).append(jq).html();
        },

        // Make a new copy of a given object with psuedo class style heritage.
        makeObj = function (obj) {
            if (obj === undefined) {
                return obj;
            }
            var O = function () {};
            O.prototype = obj;
            return new O();
        },

        // Return an array of key/template pairs.
        storedTemplates = function () {
            var cache = [];
            $.each(templateCache, function (key, templ) {
                cache.push([ key, templ ]);
            });
            return cache;
        },

        // Determine if the string is a key to a stored template or a 
        // one-time-use template.
        chooseTemplate = function (str) {
            return typeof templateCache[str] === "string" ?
                templateCache[str] :
                str;
        },

        // Return true if (and only if) an object is an array.
        isArray = function (objToTest) {
            return Object.prototype
                         .toString
                         .apply(objToTest) === "[object Array]";
        },

        // Call a rendering function on arrays of objects or just a single 
        // object seamlessly.
        renderEach = function (data, f) {
            if (isArray(data)) {
                return $.each(data, f);
            } else {
                return f(0, data);
            }
        },

        // Split a template in to tokens which will eventually be converted to 
        // nodes and then rendered.
        tokenize = function (templ) {
            return templ.split(new RegExp("(" + VAR_TAG.source + "|" + 
                                          OPEN_BLOCK_TAG.source + "|" + 
                                          CLOSE_BLOCK_TAG.source + ")"));
        },

        // "Lisp in C's clothing." - Douglas Crockford I believe.
        cdr = function (arr) {
            return arr.slice(1);
        },

        // Array.push changes the original array in place and returns the new 
        // length of the array rather than the the actual array itself. This 
        // makes it unchainable, which is ridiculous.
        append = function (item, list) {
            return list.concat([item]);
        },

        // Take a token and create a variable node from it.
        makeVarNode = function (token) {
            var node = makeObj(baseVarNode);
            node.name = token.replace(OPEN_VAR_TAG, "")
                             .replace(CLOSE_VAR_TAG, "");
            return node;
        },

        // Take a token and create a text node from it.
        makeTextNode = function (token) {
            var node = makeObj(baseTextNode);
            node.text = token;
            return node;
        },

        // A recursive function that terminates either when all tokens have 
        // been converted to nodes or an end-block tag is found.
        makeNodes = function (tokens) {
            return (function (nodes, tokens) {
                var token = tokens[0];
                return tokens.length === 0 ?
                           [nodes, [], true] : 
                       isEndTag(token) ? 
                           [nodes, cdr(tokens)] :
                       isVarTag(token) ? 
                           arguments.callee(append(makeVarNode(token), nodes), cdr(tokens)) :
                       isBlockTag(token) ? 
                           makeBlockNode(nodes, tokens, arguments.callee) :
                       // else
                           arguments.callee(append(makeTextNode(token), nodes), cdr(tokens));
                       
            }([], tokens));
        },

        // Create a block tag's node by hijacking the "makeNodes" function 
        // until an end-block is found.
        makeBlockNode = function (nodes, tokens, f) {
            // Remove the templating syntax and split the type of block tag and
            // its arguments.
            var bits = tokens[0].replace(OPEN_BLOCK_TAG, "")
                                .replace(CLOSE_BLOCK_TAG, "")
                                .split(/[ ]+?/),

                // The type of block tag is the first of the bits, the rest 
                // (if present) are args
                type = bits[0],
                args = cdr(bits),

                // Make the node from the set of block tags that Tempest knows 
                // about.
                node = makeObj(BLOCK_NODES[type]),
                resultsArray;

            // Ensure that the type of block tag is one that is defined in 
            // BLOCK_NODES
            if (node === undefined) {
                throw ({
                    name: "TemplateSyntaxError",
                    message: "Unkown Block Tag."
                });
            }

            node.args = args;

            if (node.expectsEndTag === true) {
                resultsArray = makeNodes(tokens);
                if (resultsArray[2] !== undefined) {
                    // The third item in the array returned by makeNodes is 
                    // only defined if the last of the tokens was made in to a 
                    // node and it wasn't an end-block tag.
                    throw ({
                        name: "TemplateSyntaxError",
                        message: "A block tag was expecting an ending tag but it was not found."
                    });
                }
                node.subNodes = resultsArray[0];
                tokens = resultsArray[1];
            }

            // Continue where we were before the block node.
            return f(append(node, nodes), cdr(tokens));
        },

        // Return the template rendered with the given object(s) as a jQuery 
        // object.
        renderToJQ = function (str, objects) {
            var template = chooseTemplate(str),
                lines = [];

            renderEach(objects, function (i, obj) {
                var resultsArray = makeNodes(tokenize(template), obj),
                    nodes = resultsArray[0];

                // Check for tokens left over in the results array, this means 
                // that not all tokens were rendered because there are more 
                // end-block tagss than block tags that expect an end.
                if (resultsArray[1].length !== 0) {
                    throw ({
                        name: "TemplateSyntaxError",
                        message: "An unexpected end tag was found."
                    });
                }

                // Render each node and push it to the lines.
                $.each(nodes, function (i, node) {
                    lines.push(node.render(obj));
                });
            });

            // Return the joined templates as jQuery objects
            return $(lines.join(""));
        };

    // EXTEND JQUERY OBJECT
    $.extend({
        tempest: function () {
            var args = arguments;

            if (args.length === 0) {

                // Return key/template pairs of all stored templates.
                return storedTemplates();

            } else if (args.length === 2 && 
                       typeof(args[0]) === "string" && 
                       typeof(args[1]) === "object") {

                // Render an object or objects to a template.
                return renderToJQ(args[0], args[1]);

            } else if (args.length === 1 && typeof(args[0]) === "string") {

                // Template getter.
                return templateCache[args[0]];

            } else if (args.length === 2 && 
                       typeof(args[0]) === "string" && 
                       typeof(args[1]) === "string") {

                // Template setter.
                templateCache[args[0]] = args[1].replace(/^\s+/g, "")
                                                .replace(/\s+$/g, "")
                                                .replace(/[\n\r]+/g, "");
                return templateCache[args[0]];

            } else {

                // Raise an exception because the arguments did not match the API.
                throw ({
                    name: "InputError",
                    message: "jQuery.tempest can't handle the given arguments."
                });

            }
        }
    });

    // GET ALL TEXTAREA TEMPLATES ON READY
    $(document).ready(function () {
        $("textarea.tempest-template").each(function (obj) {
            templateCache[$(this).attr('title')] = $(this).val()
                                                          .replace(/^\s+/g, "")
                                                          .replace(/\s+$/g, "")
                                                          .replace(/[\n\r]+/g, "");
            $(this).remove();
        });
    });
}(jQuery));
