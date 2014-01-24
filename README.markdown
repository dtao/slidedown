# Slidedown
## Markdown [slide decks](http://danieltao.com/slidedown)

***

# The basic idea

Write your presentations in a text editor.

Separate slides with `***`.

For example, this is what this slide (before this sentence) looks like:

```markdown
***

# The basic idea

Write your presentations in a text editor.

Separate slides with `***`.

***
```

***

# How it works

Slidedown parses Markdown, then splits up the HTML into slides by splitting at
every `<HR>` tag (which you get w/ `***` in Markdown).

You can then navigate left/right through the slides using the keyboard.

***

# How to use it

```javascript
// Fetch the source Markdown using an AJAX request
Slidedown.fromXHR('path/to/slides.markdown');

// Or if you have the Markdown in a string already
Slidedown.fromMarkdown('markdown source');

// Or if you actually have HTML rendered from Markdown already
Slidedown.fromHTML('html source');
```

That's it!
