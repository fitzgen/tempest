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

(function($) {
    // PRIVATE VARS AND FUNCTIONS
    var templateCache = {},

        // hack to get the HTML of a jquery object as a string
        JQtoString = function (jq) {
            return $(document.createElement("div")).append(jq).html();
        },

        // return an array of all the stored templates and the key to 
        // access each of them
        storedTemplates = function () {
            var cache = [];
            $.each(templateCache, function(key, val) {
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
            return Object.prototype.toString.apply(objToTest) === "[object Array]";
        },

        // call a rendering function on arrays of objects or just single 
        // object seemlessly
        renderToString = function (data, f) {
            if (isArray(data)) {
                return $.each(data, f);
            } else {
                return f(0, data);
            }
        },

        // return the template rendered with the given object(s) as jQuery
        renderToJQ = function (str, objects) {
            var template = chooseTemplate(str),
                lines = [];

            renderToString(objects, function(i, obj) {
                var rendered = template;
                $.each(obj, function(attr, val) {
                    var regex = new RegExp("\{{2}[ ]?" + 
                                           attr + 
                                           "[ ]?\}{2}", "g");
                    if (val instanceof $) {
                        // special case for jQuery objects
                        rendered = rendered.split(regex)
                                           .join(JQtoString(val));
                    } else {
                        rendered = rendered.split(regex).join(val);
                    }
                    // TODO: if something is an object test for a toHTML 
                    // function, use that if it exists, but if it returns 
                    // jquery, handle it also, using dot notation to access 
                    // object attribute and properties
                });
                lines.push(rendered);
            });

            // return jQuery objects
            return $(lines.join(""));
        };

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
                throw({
                    name: "Input Error",
                    message: "jQuery.tempest can't handle the given arguments.",
                });

            }
        },
    });

    // Gather all the existing templates on the page and save them in the cache.
    $(document).ready(function (){
        $("textarea.tempest-template").each(function(obj) {
            templateCache[$(this).attr('title')] = $(this).val()
                                                          .replace(/^\s+/g, "")
                                                          .replace(/\s+$/g, "")
                                                          .replace(/[\n\r]+/g, "");
            $(this).remove();
        });
    });
})(jQuery);
