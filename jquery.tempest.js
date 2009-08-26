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

"use strict";
(function ($) {
    // PRIVATE VARS AND FUNCTIONS
    var templateCache = {},

        // hack to get the HTML of a jquery object as a string
        jQueryToString = function (jq) {
            return $(document.createElement("div")).append(jq).html();
        },

        // return an array of all the stored templates and the key to 
        // access each of them
        storedTemplates = function () {
            var cache = [];
            $.each(templateCache, function (key, val) {
                cache.push([ key, val ]);
            });
            return cache;
        },

        // determine if the string is a key to a stored template or a 
        // one-time-use template
        chooseTemplate = function (str) {
            if (templateCache[str] !== undefined) {
                return templateCache[str];
            } else {
                return str;
            }
        },

        // return true if an object is an array
        isArray = function (objToTest) {
            return Object.prototype
                         .toString
                         .apply(objToTest) === "[object Array]";
        },

        // call a rendering function on arrays of objects or just single 
        // object seemlessly
        renderEach = function (data, f) {
            if (isArray(data)) {
                return $.each(data, f);
            } else {
                return f(0, data);
            }
        },

        // Clean the passed value the best we can
        cleanVal = function (val) {
            if (val instanceof $) {
                return jQueryToString(val);
            } else if (!isArray(val) && typeof(val) === "[object Object]") {
                if (typeof(val.toHTML) === "function") {
                    return cleanVal(val.toHTML());
                } else {
                    return val.toString();
                }
            } else {
                return val;
            }
        },

        // traverse a path of an obj from a string representation, 
        // ie "object.child.attr"
        getValFromObj = function (str, obj) {
            var path = str.split("."),
                val = obj[path[0]];
                i;
            for (i = 1; i < path.length; i++) {
                // filter for undefined values
                if (val !== undefined) {
                    val = val[path[i]];
                } else {
                    return "";
                }
            }

            // make sure the last peice did not end up undefined
            val = val || "";
            return cleanVal(val);
        },

        // base text node
        textNode = {
            text.text: "",
            render: function () {
                return self.text;
            }
        },

        // base if node
        ifNode = {
            nodes: [],
            condition: false,
            render: function () {
                var rendered_nodes = [],
                    nodes = self.nodes;
                if (self.condition) {
                    $.each(nodes, function (i, node) {
                        rendered_nodes.push(node.render());
                    });
                    return rendered_nodes.join("");
                }
                return "";
            }
        },

        // return the template rendered with the given object(s) as jQuery
        renderToJQ = function (str, objects) {
            var template = chooseTemplate(str),
                lines = [];

            renderEach(objects, function (i, obj) {
                // ...
                // break template in to nodes and handle bool logic here
                // ...
                lines.push(template.replace(/\{\{[ ]?[\w\-\.]+?[ ]?\}\}/g,
                    function (match) {
                        var attr = match.replace(/\{\{[ ]?/, "")
                                        .replace(/[ ]?\}\}/, ""),
                            val = obj[attr] || "";
                        if (val === "" && attr.search(/\./) !== -1) {
                            return getValFromObj(attr, obj);
                        }
                        return cleanVal(val);
                    }
                ));
            });

            // return jQuery objects
            return $(lines.join(""));
        };

    // EXTEND JQUERY OBJECT
    $.extend({
        tempest: function () {
            var args = arguments;

            if (args.length === 0) {

                return storedTemplates();

            } else if (args.length === 2 && 
                       typeof(args[0]) === "string" && 
                       typeof(args[1]) === "object") {

                return renderToJQ(args[0], args[1]);

            } else if (args.length === 1 && typeof(args[0]) === "string") {

                // template getter
                return templateCache[args[0]];

            } else if (args.length === 2 && 
                       typeof(args[0]) === "string" && 
                       typeof(args[1]) === "string") {

                // template setter
                templateCache[args[0]] = args[1].replace(/^\s+/g, "")
                                                .replace(/\s+$/g, "")
                                                .replace(/[\n\r]+/g, "");
                return templateCache[args[0]];

            } else {

                // raise an exception becuase no use case matched the arguments
                throw ({
                    name: "Input Error",
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
