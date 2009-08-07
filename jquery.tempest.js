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
    $.fn.tempest = function() {
            var args = arguments;

            if (args.length == 2 && typeof(args[0]) == "string" && typeof(args[1]) == "object") {
                // render a template. $.tempest(str, obj)
                var template;
                try {
                    template = $.fn.tempest.templateCache[args[0]];
                } catch(error) {
                    template = args[0];
                }

                var objects = [];

                var render = function(i, obj) {
                    $.each(obj, function(attr, val) {
                        var regex = new RegExp("%[(]" + attr + "[)]%", "g");
                        var rendered = template.split(regex).join(val);
                        objects.push($(rendered));
                    });
                };

                // handle arrays of objects or just single objects
                if (args[1].length !== undefined) {
                    $.each(args[1], render(i, obj));
                } else {
                    render(-1, args[1]);
                }

                // return jQuery objects
                return objects;
            } else if (args.length == 1 && args[0] == "__init__") {
                // Gather all the existing templates on 
                // the page and save them in the cache.
                // Call this after $(document).ready()
                (function() {
                    $().tempest.templateCache = {};
                    $("textarea.tempest-template").each(function(obj) {
                        $().tempest.templateCache[$(this).attr('id')] = $(this).val();
                        $(this).remove();
                    });
                })()
            } else if (args.length == 1 && typeof(args[0]) == "string") {
                // template getter
                return $.fn.tempest.templateCache[args[0]];
            } else if (args.length == 2 && typeof(args[0]) == "string" && typeof(args[1]) == "string") {
                // template setter
                $.fn.tempest.templateCache[args[0]] = args[1];
                return args[1];
            }
        };
    })(jQuery);
