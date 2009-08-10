Tempest jQuery Templating Plugin
================================

Copyright (c) 2009 Nick Fitzgerald - http://fitzgeraldnick.com/
Read the LICENSE for more info.

API
===

    // --- saving templates to the $.tempest object ---

    // setter:
    $.tempest("post", "<li><a href='%(url)%'>%(title)%</a></li>");
    // returns string: "<li><a href='%(url)%'>%(title)%</a></li>"

    // getter:
    $.tempest("post");
    // returns string: "<li><a href='%(url)%'>%(title)%</a></li>"

    // tempest will also find all textareas with the class tempest-template
    // and save them with their id as the key on the $(document).ready() event
    // note: these textareas are removed from the DOM after storing the template

    // in the html when $(document).ready() fires:
    // <textarea id="post" class="tempest-template" style="display:none"><li><a href='%(url)%'>%(title)%</a></li></textarea>
    $.tempest("post");
    // returns string: "<li><a href='%(url)%'>%(title)%</a></li>"

    // --- rendering objects to templates ---

    // render an object to an existing template:
    $.tempest("post", { title: "My Blog", url: "http://fitzgeraldnick.com/weblog/" });
    // returns jQuery: [ <li><a href='http://fitzgeraldnick.com/weblog/'>My Blog</a></li> ]

    // render an array of objects to an existing template
    var arr = [{ title: "My Blog", url: "http://fitzgeraldnick.com/weblog/" },
               { title: "Google", url: "http://google.com/" },
               { title: "Hacker News", url: "http://news.ycombinator.com/" }];
    $.tempest("post", arr);
    // returns jQuery: [ <li>, <li>, <li> ]

    // render an object (or array of objects) to a one-time-use template:
    var tmpl = "<span>%(title)%: %(content)%</span>";
    $.tempest(tmpl, { title: "Example", "content": "Hello World!" });
    // returns jQuery: [ <span>Example: Hello World!</span> ]

PHILOSOPHY
==========

I was not satisifed with the other templating plugins available, so I wrote my own. 
This templating system is very simple and enforces the seperation of form and 
function, or HTML and JS. This provides a great abstraction layer so that you can 
write a template ad then promptly remove the mental overhead of rendering js objects 
to HTML.

Other templating languages just build and execute function blocks with strings. Any 
type of js logic you could want is included and evaluated. For some people, this may 
be the freedom that they want.

On the other hand, Tempest will only fill in values and iterate over arrays for you. 
This forces you to remove any programming logic from the templates and seperate form 
from function. This type of templating philosophy can also be seen in the Django 
templating language.

The big thing, for me, is that iteration is handled seemlessly. Just pass an array 
of objects to tempest instead of a single object and it will return a jquery element 
array.