# Slidedown
## Markdown slide decks

***

# The basic idea

Write your presentations in a text editor.

```markdown
# Slide title
## Subtitle

***

# Slide 1

***

# Slide 2
```

***

# How it works

Slidedown parses Markdown, then splits up the HTML into slides by splitting at
every `<HR>` tag (which you get w/ `***` in Markdown).

You can then navigate left/right through the slides using the keyboard.

***

# How to use it

```javascript
Slide.down('name of markdown file');
```

That's it!
