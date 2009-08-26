Tempest jQuery Templating Plugin
================================

Copyright (c) 2009 Nick Fitzgerald - http://fitzgeraldnick.com/ - MIT licensed

Note: All releases are minified, to get the latest development version grab a clone from http://github.com/fitzgen/tempest/tree/master

PHILOSOPHY
==========

I was not satisfied with the other templating plugins available, so I wrote my own. This templating system is very simple and enforces the seperation of form and function, or HTML and JS. This provides a great abstraction layer so that you can write a template ad then promptly remove the mental overhead of rendering js objects to HTML.

Other templating languages just build and execute function blocks with strings. Any type of js logic you could want is included and evaluated. For some people, this may be the freedom that they want.

On the other hand, Tempest will only fill in values and iterate over arrays for you. This forces you to remove any programming logic from the templates and separate form from function. This type of templating philosophy can also be seen in the Django templating language.

The other big thing, for me, is that iteration is handled seamlessly. Just pass an array of objects to tempest instead of a single object and it will return a jquery element array.

API
===

Note: The API is for the most current release only, there may be slight differences in older releases.

Saving & retrieving templates to and from $.tempest
---------------------------------------------------

Setter:

    $.tempest("post", "<li><a href='{{url}}'>{{title}}</a></li>");
    // returns string: "<li><a href='{{url}}'>{{title}}</a></li>"

Getter:

    $.tempest("post");
    // returns string: "<li><a href='{{url}}'>{{title}}</a></li>"


$.tempest will also find all textareas with the class "tempest-template" and save them with their "title" attribute as the key they are indexed by once the $(document).ready() event fires.

For example, assuming this is in the html when $(document).ready() fires:

    <textarea title="new-post" class="tempest-template" style="display:none">
        <li class='new'><a href='{{url}}'>{{title}}</a></li>
    </textarea>

Then you could access that template just as you would access any other template that you manually created:

    $.tempest("new-post");
    // returns string: "<li class='new'><a href='{{url}}'>{{title}}</a></li>"

Note: $.tempest will remove the textarea from the DOM after storing the contents in the template cache.

Get all templates Tempest has stored by passing no arguments:

    $.tempest();
    // returns array of pairs: [ 
    //                           [ 
    //                             "post", 
    //                             "<li><a href='{{url}}'>{{title}}</a></li>" 
    //                           ], [ 
    //                             "new-post", 
    //                             "<li class='new'><a href='{{url}}'>{{title}}</a></li>" 
    //                           ] 
    //                         ]

Rendering objects to templates
------------------------------

Render an object to an existing template:

    $.tempest("post", { 
        title: "My Blog",
        url: "http://fitzgeraldnick.com/weblog/",
    });
    // returns jQuery: [ <li><a href='http://fitzgeraldnick.com/weblog/'>My Blog</a></li> ]

Render an array of objects to an existing template

    var arr = [{ title: "My Blog", url: "http://fitzgeraldnick.com/weblog/" },
               { title: "Google", url: "http://google.com/" },
               { title: "Hacker News", url: "http://news.ycombinator.com/" }];
    $.tempest("post", arr);
    // returns jQuery: [ <li>, <li>, <li> ]

Render an object (or array of objects) to a one-time-use template:

    var one-time-template = "<span>{{title}}: {{content}}</span>";
    $.tempest(one-time-template, {
        "title": "Example", 
        "content": "Hello World!",
    });
    // returns jQuery: [ <span>Example: Hello World!</span> ]

Misc.
-----

Access an object's attributes with the dot notation:

    var one-time-template = "<p>My name is <em>{{ me.full_name }}</em></p>";
    $.tempest(one-time-template, {
        "me": {
            "full_name": "Nick Fitzgerald"
        }

    });
    // returns jQuery: [ <p>My name is <em>Nick Fitzgerald</em></p> ]
