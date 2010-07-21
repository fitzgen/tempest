module("Public API");

test("Access stored templates that were inside textareas",
     1,
     function () {
         var templ1 = $.tempest("template-message") == "<li>{{name}} says \"{{message}}\"</li>";
         var templ2 = $.tempest("template-web-things") == "<li>{{name}} is a {{type}} at {{url}}</li>";
         ok(templ1 == true && templ2 == true);
     });

test("Length of $.tempest() is equal to number of textarea templates pre-defined",
     1,
    function () {
        ok($.tempest().length == 6);
    });

test("Keys to existing templates are in $.tempest()",
     1,
     function () {
         var first = $.tempest()[0];
         var second = $.tempest()[1];
         var first_correct = first[0] == "template-message" || first[0] == "template-web-things";
         var second_correct = second[0] == "template-message" || second[0] == "template-web-things";
         ok(first_correct && second_correct && first[0] != second[0]);
     });

test("Existing templates are in $.tempest()",
     1,
     function () {
         var first = $.tempest()[0];
         var second = $.tempest()[1];
         var first_correct = first[1] == $.tempest("template-message") || first[1] == $.tempest("template-web-things");
         var second_correct = second[1] == $.tempest("template-message") || second[1] == $.tempest("template-web-things");
         ok(first_correct && second_correct && first[1] != second[1]);
     });

test("Template setter",
     1,
     function () {
         var tmpl = "Hello {{variable}}";
         ok($.tempest("hello", tmpl) == tmpl);
     });

test("Template getter",
     1,
     function () {
         var key = "arbitrary";
         var tmpl = "Hello {{variable}}";
         $.tempest(key, tmpl);
         ok($.tempest(key) == tmpl);
     });

test("The text of the rendered template is correct",
     1,
     function () {
         var obj = {"name":"my site", "type":"blog", "url":"http://fitzgeraldnick.com/"};
         var rendered = $.tempest("template-web-things", obj);
         ok(rendered.text() == "my site is a blog at http://fitzgeraldnick.com/");
     });

test("Append a single rendered object to the DOM",
     1,
     function () {
         var len = $("body ul#test li").length;
         var message = {name:"nick", message:"hello world"};
         var rendered = $.tempest("template-message", message);
         $("body ul#test").append(rendered);
         ok(len + 1 == $("body ul#test li").length);
     });

test("The text of the rendered template is correct with array of objs",
     1,
     function () {
         var arr = [{name:"mom", message:"brush your teeth"},
         {name:"heidi", message:"why hello"},
         {name:"bill clinton", message:"I didn't inhale"},
         {name:"OJ and Brittany", message:"Oops I did it again"}];
         var text = $.tempest("template-message", arr).text();

         var expected = [], i = 0;
         while (i < arr.length) {
             expected.push($.tempest("template-message", arr[i]).text());
             i++;
         }
         expected = expected.join("");

         ok(text === expected);
     });

test("Append an array of rendered objects to the DOM",
     1,
     function () {
         var len = $("body ul#test li").length;
         var arr = [{name:"mom", message:"brush your teeth"},
         {name:"heidi", message:"why hello"},
         {name:"bill clinton", message:"I didn't inhale"},
         {name:"OJ and Brittany", message:"Oops I did it again"}];
         var rendered = $.tempest("template-message", arr);
         $("body ul#test").append(rendered);
         ok(len + arr.length == $("body ul#test li").length);
     });

test("Render data to a one-time-use template",
     1,
     function () {
         var obj = {thing:"test", activity:"TESTS"};
         var tmpl = "<li><em>Whoah a one time use {{thing}} for doing {{activity}}</em></li>";
         var rendered = $.tempest(tmpl, obj);
         ok(rendered.text() == "Whoah a one time use test for doing TESTS");
     });

test("Append data from a rendered one-time-use template",
     1,
     function () {
         var len = $("body ul#test li").length;
         var obj = {thing:"test", activity:"TESTS"};
         var tmpl = "<li><em>Whoah a one time use {{thing}} for doing {{activity}}</em></li>";
         var rendered = $.tempest(tmpl, obj);
         $("body ul#test").append(rendered);
         ok(len + 1 == $("body ul#test li").length);
     });

test("Unknown input throws an error",
     1,
     function () {
         try {
             $.tempest(3242354534534);
             ok(false);
         } catch(error) {
             ok(true);
         }
     });

test("Render jQuery objects with their HTML",
     1,
     function () {
         var jq = "<div>jQuery object</div>";
         var rendered = $.tempest("template-message", {
             name: "nick",
             message: $(jq)
         });
         ok(rendered.html() == 'nick says "'+jq+'"');
     });

test("If a template's variable is not passed, default that variable to \"\"",
     1,
     function () {
         var tmpl = "<p>{{ non-existent }}</p>";
         var obj = {};
         ok($.tempest(tmpl, obj).text() === "");
     });

test("Dot notation attribute lookup",
     2,
     function () {
         var obj = {
             obj: { name:"object", type: { attr: "attribute" } }
         };
         var tmpl = "<p>{{ obj.name }} {{ obj.type.attr }}</p>";
         var rendered = $.tempest(tmpl, obj);
         ok(rendered.text() === "object attribute",
            "Works nested once and twice deep");

         tmpl = "My site is: {{ site.name }}";
         rendered = $.tempest(tmpl, {"site": {"name":"my site"}});
         var first = rendered === "My site is: my site";
         rendered = $.tempest(tmpl, {"site": {"name":"your site"}});
         var second = rendered === "My site is: your site";
         ok(first && second,
            "The dot notation/attr look up works with different values but same template. (regression test)");
     });

test("If an object is passed as a variable, render it with the toHTML method if it exists.",
     1,
     function () {
         var obj = {
             obj: { toHTML: function () { return "Hello World" } }
         };
         var tmpl = "<p>{{ obj }}</p>";
         var rendered = $.tempest(tmpl, obj);
         ok(rendered.text() === "Hello World");
     });


test("If statements",
     4,
     function () {
         var obj = { t:true };
         ok($.tempest("if-template", obj).text() === "hello world",
            "When true");

         obj = { t:false };
         ok($.tempest("if-template", obj).text() === "hello ",
            "When false");

         obj = {
             foo: { bar: true }
         };
         ok($.tempest("if-template", obj).text() === "hello !",
            "When attribute true");

         obj = {
             foo: { bar: false }
         };
         ok($.tempest("if-template", obj).text() === "hello ",
            "When attribute false");

     });

test("Testing extension of tag object with custom tags.",
     1,
     function () {
         $.tempest.tags.dumb = {
             expectsEndTag: false,
             render: function (context) {
                 return "DUMMY TAG";
             }
         };
         var text = $.tempest("{% dumb %}", {});
         $.tempest.tags.dumb = undefined;
         ok(text === "DUMMY TAG");
     });

test("Test for tag is working correctly.",
     3,
     function () {
         var context = {
             people: [{name: "Nick"}, {name: "Dave"}, {name: "John"}]
         };

         // Append to <ul> because sometimes text nodes get up in there and mess
         // up the count of html nodes rendered.
         ok($("<ul>").append(
             $.tempest("for-template", context)
         ).children().length === context.people.length);

         context = {
             the: { people: [{name: "Nick"}, {name: "Dave"}, {name: "John"}] }
         };

         // Append to <ul> because sometimes text nodes get up in there and mess
         // up the count of html nodes rendered.
         ok($("<ul>").append(
             $.tempest("nested-for-template", context)
         ).children().length === context.the.people.length);

         context = { posts: [ { comments: [1,2,3] },
                              { comments: [4,5,6] },
                              { comments: [7,8,9] } ] };

         var templ = "{% for p in posts %}{% for i in p.comments %}{{ i }}{% endfor %}{% endfor %}";
         ok($.tempest(templ, context) === "123456789",
            "For loops within for loops, work correctly.");

     });

test("Test that the dom manipulation is working correctly",
     4,
     function () {
         var el = $("<ul/>");

         el.tempest("append", "template-message", {
             name: "foo",
             message: "bar"
         });
         ok(el.children().length === 1);

         el.tempest("prepend", "template-message", {
             name: "foo",
             message: "bar"
         });
         ok(el.children().length === 2);

         el.children().first().tempest("after", "template-message", {
             name: "foo",
             message: "bar"
         });
         ok(el.children().length === 3);

         // Equivalent to el.tempest("html", "template-message", ...)
         el.tempest("template-message", {
             name: "foo",
             message: "bar"
         });
         ok(el.children().length === 1);
     });

test("getContextValue can access children/attributes.",
     1,
     function () {
         ok($.tempest.getContextValue("obj.child", {
             obj: {
                 child: "hello"
             }
         }) === "hello");
     });

test("getContextValue returns an empty string if the attribute is not found.",
     1,
     function () {
         ok($.tempest.getContextValue("obj.fake", {
             obj: {
                 child: "hello"
             }
         }) === "");
     });

module("Private functions");

test("isBlockTag recognizes block tags.",
     1,
     function () {
         ok($.tempest._test.isBlockTag("{% if var %}"));
     });

test("isBlockTag recognizes block tags w/out spaces.",
     1,
     function () {
         ok($.tempest._test.isBlockTag("{%if var%}"));
     });

test("isEndTag recognizes end tags.",
     1,
     function () {
         ok($.tempest._test.isEndTag("{% endif %}"));
     });

test("isEndTag recognizes end tags w/out spaces.",
     1,
     function () {
         ok($.tempest._test.isEndTag("{%endif%}"));
     });

test("isVarTag recognizes variable tags.",
     1,
     function () {
         ok($.tempest._test.isVarTag("{{ var }}"));
     });

test("isVarTag recognizes variable tags w/out spaces.",
     1,
     function () {
         ok($.tempest._test.isVarTag("{{var}}"));
     });

test("cleanVal renders jQuery objects correctly",
     1,
     function () {
         ok($.tempest._test.cleanVal($("p")) === $.tempest._test.jQueryToString($("p")));
     });

test("cleanVal calls toHTML on an object if it exists",
     1,
     function () {
         ok($.tempest._test.cleanVal({
             toHTML: function () {
                 return "foobar";
             }
         }) === "foobar");
     });

test("cleanVal calls toString on an object if toHTML does not exist.",
     1,
     function () {
         ok($.tempest._test.cleanVal({}) === ({}).toString());
     });

test("cleanVal leaves all other input alone.",
     1,
     function () {
         ok($.tempest._test.cleanVal("hello") === "hello");
     });

test("jQueryToString works correctly",
     1,
     function () {
         ok($.tempest._test.jQueryToString($("<p>Hello</p>")) === "<p>Hello</p>");
     });

test("makeObj creates a new element, but they share the same attributes",
     1,
     function () {
         var o = { t: true };
         var made = $.tempest._test.makeObj(o);
         ok(o !== made && o.t === made.t);
     });

// TODO: storedTemplates

test("chooseTemplate recognizes stored templates",
     1,
     function () {
         ok($.tempest._test.chooseTemplate("if-template") ===
             "<li>hello {% if t %}world{% endif %}{% if foo.bar %}!{% endif %}</li>");
     });

test("chooseTemplate returns unrecognized template keys as one-time-use templates.",
     1,
     function () {
         ok($.tempest._test.chooseTemplate("<li> ONE TIME USE </li>") ===
             "<li> ONE TIME USE </li>");
     });

test("isArray recognizes arrays.",
     1,
     function () {
         ok($.tempest._test.isArray([1,3,5,6]) === true);
     });

test("isArray isn't fooled by look-a-like objects.",
     1,
     function () {
         ok($.tempest._test.isArray({length: 2, 0:1, 1:2}) === false);
     });

// TODO: renderEach

test("tokenize splits a template in to the proper amount of chunks.",
     1,
     function () {
         ok($.tempest._test.tokenize("<li>{% if t %}{{ var }}{% endif %} word</li>").length === 5);
     });

test("tokenize splits the first token from the template string correctly.",
     1,
     function () {
         ok($.tempest._test.tokenize("<li>{% if t %}{{ var }}{% endif %} word</li>")[0] === "<li>");
     });

test("cdr returns an array of length one shorter than the original.",
     1,
     function () {
         ok($.tempest._test.cdr([1,2,3]).length === 2);
     });

test("cdr returns the proper values for the array of everything but the first item.",
     1,
     function () {
         var rest = $.tempest._test.cdr([1,2,3]);
         ok(rest[0] === 2 && rest[1] === 3);
     });

test("append returns a new array with the item appended.",
     1,
     function () {
         var arr = $.tempest._test.append(4, [1,2,3]);
         ok($.tempest._test.isArray(arr) && arr.length === 4 && arr[3] === 4);
     });

test("makeVarNode creates an object with the proper name and a render function",
     1,
     function () {
         var node = $.tempest._test.makeVarNode("{{ var }}");
         ok(node.name === "var" && typeof(node.render) === "function");
     });

test("nodes made with makeVarNode render properly.",
     1,
     function () {
         var node = $.tempest._test.makeVarNode("{{ var }}");
         ok(node.render({ "var": "hello" }) === "hello" && node.render({}) === "");
     });

test("makeTextNode creates an object with a text attribute and a render function",
     1,
     function () {
         var node = $.tempest._test.makeTextNode("Hello World");
         ok(node.text === "Hello World" && typeof(node.render) === "function");
     });

test("nodes made with makeTextNode render properly",
     1,
     function () {
         var node = $.tempest._test.makeTextNode("Hello World");
         ok(node.render({}) === "Hello World");
     });

test("makeNodes creates the proper types of nodes from the bits",
     1,
     function () {
         var results = $.tempest._test.makeNodes(["Hello World", "{{ var }}", "woo haa"]);
         var nodes = results[0];
         ok(typeof(nodes[0].text) === "string" &&
            typeof(nodes[1].name) === "string" &&
            typeof(nodes[2].text) === "string");
     });

test("makeNodes returns no more tokens in its results when no",
     1,
     function () {
         var results = $.tempest._test.makeNodes(["Hello World", "{{ var }}", "woo haa"]);
         var tokens = results[1];
         ok(tokens.length === 0 && results[2] === true);
     });

test("makeNodes returns the rest of the tokens when an endblock is located.",
     1,
     function () {
         var results = $.tempest._test.makeNodes(["{% endif %}", "Hello World", "{{ var }}"]);
         var nodes = results[0];
         var tokens = results[1];
         ok(tokens.length === 2 && nodes.length === 0);
     });

test("makeBits creates the proper array of bits from a block tag.",
     1,
     function () {
         var bits = $.tempest._test.makeBits("{% if var %}");
         ok(bits[0] === "if" && bits[1] === "var" && bits.length === 2);
     });

// TODO: makeBlockNode
// TODO: renderToJQ

test("strip removes whitespace from front and back",
     1,
     function () {
         ok($.tempest._test.strip("  hello world   ") === "hello world");
     });

module("Regression Tests");

test("Issue #12",
     function () {
         var data = {
             "email": "contact@roelkramer.nl",
             "name": "Roel Kramer",
             "subject": "blaat",
             "footer": "footer blah blah",
             "paragraphs": [{
                 "title": "test paragraph title 1",
                 "body": "test paragraph body 1",
                 "images": [
                     {"src": "http 1", "alt": "img alt"},
                     {"src": "http 2", "alt": "img alt"},
                     {"src": "http 3", "alt": "img alt"}
                 ]
             }, {
                 "title": "test paragraph title 2",
                 "body": "test paragraph body 2",
                 "images": [
                     {"src": "http 1", "alt": "img alt"},
                     {"src": "http 2", "alt": "img alt"}
                 ]
             }, {
                 "title": "test paragraph title 3",
                 "body": "test paragraph body 3",
                 "images": [
                     {"src": "http 1", "alt": "img alt"},
                     {"src": "http 2", "alt": "img alt"}
                 ]
             }]
         };
         var result = $.tempest("issue-12", data);
         ok(result !== "", result);
     });

module("Speed tests");

asyncTest("Profile rendering speed.",
          6,
          function () {
              var deltas = [];
              var count = 0;

              var calcSpeedStats = function () {
                  console.profileEnd();

                  // Mean average.
                  var total = 0;
                  for (var i = 0; i < deltas.length; i++) {
                      total += deltas[i];
                  }
                  var mean = total / deltas.length;

                  // Median
                  var sortedDeltas = deltas.slice(0).sort(function (a,b) {
                      if (a > b)      return 1;
                      else if (a < b) return -1;
                      else            return 0;
                  });
                  var median = sortedDeltas[ Math.floor( sortedDeltas.length/2 ) ];

                  // Mode
                  var counts = {};
                  for (i = 0; i < deltas.length; i++) {
                      counts[deltas[i]] = counts[deltas[i]] === undefined ?
                          1 :
                          counts[deltas[i]] + 1;
                  }
                  var mode = deltas[0];
                  for (var time in counts)
                      if (counts.hasOwnProperty(time) && counts[time] > counts[mode])
                          mode = time;

                  // Standard deviation.
                  var diffs = [];
                  for (i = 0; i < deltas.length; i++) {
                      diffs[i] = (deltas[i] - mean) * (deltas[i] - mean);
                  }
                  var stdDevTotal = 0;
                  for (i = 0; i < diffs.length; i++) {
                      stdDevTotal += diffs[i];
                  }
                  var stdDev = Math.sqrt(stdDevTotal / diffs.length);

                  var max = Math.max.apply(Math, deltas);
                  var min = Math.min.apply(Math, deltas);

                  ok(true, "Mean: " + mean + " ms");
                  ok(true, "Median: " + median + " ms");
                  ok(true, "Mode: " + mode + " ms");
                  ok(true, "Standard deviation: " + stdDev + " ms");
                  ok(true, "Max: " + max + " ms");
                  ok(true, "Min: " + min + " ms");

                  start();
              };

              console.profile();

              setTimeout(function () {
                  var start, end;
                  if (count < 500) {
                      start = +new Date;
                      $.tempest("<li>{% for i in arr %}<em>Whoah a one time use {% if t %}{{ thing }}{% endif %}!</em>{% endfor %}</li>", {
                          thing: "test",
                          t: true,
                          arr: [0,1,2,3,4,5,6,7,8,9]
                      });
                      end = +new Date;
                      deltas.push(end - start);

                      count++;
                      return setTimeout(arguments.callee, 1);
                  } else {
                      return calcSpeedStats();
                  }
              }, 15);
          });
