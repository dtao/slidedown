(function() {

  var Slidedown = {

    fromElements: function fromElements(elements) {
      var target = document.body;

      var destination = function() {
        if (typeof target === 'string') {
          return document.querySelector(target);
        }
        return target;
      };

      whenReady(function() {
        eachSlide(elements, function(slide, number) {
          var element = document.createElement('DIV');
          element.id = 'slide-' + number;
          element.className = 'slide';
          element.setAttribute('data-layout', slide.layout);
          element.innerHTML = slide.html;
          destination().appendChild(element);
        });

        // Attach left/right keyboard shortcuts
        handleKey(39, nextSlide);
        handleKey(37, prevSlide);

        // Focus on the target slide (or first, by default)
        focusTargetSlide();
        window.addEventListener('hashchange', focusTargetSlide);
      });

      return {
        to: function(newTarget) {
          target = newTarget;
        }
      };
    },

    fromHTML: function fromHTML(html) {
      var elements = parseHTML(html);
      return Slidedown.fromElements(elements);
    },

    fromMarkdown: function fromMarkdown(markdown) {
      marked.setOptions({
        renderer: new CustomRenderer()
      });

      var html = marked(markdown);
      return Slidedown.fromHTML(html);
    },

    fromXHR: function fromXHR(title) {
      var format = inferFormat(title),
          target = document.body;

      var request = new XMLHttpRequest();
      request.open('GET', title);

      request.addEventListener('load', function() {
        Slidedown['from' + format](request.responseText).to(target);
      });

      request.send();

      return {
        to: function(newTarget) {
          target = newTarget;
        }
      };
    }

  };

  function whenReady(callback) {
    if (document.readyState === "complete") {
      setTimeout(callback, 0);
      return;
    }

    window.addEventListener('load', callback);
  }

  function inferFormat(title) {
    var extension = title.split('.').pop();

    switch (extension) {
      case 'htm':
      case 'html':
        return 'HTML';

      case 'md':
      case 'markdown':
      default:
        return 'Markdown';
    }
  }

  function parseHTML(html) {
    var wrapper = document.createElement('DIV');
    wrapper.innerHTML = html;
    return wrapper.children;
  }

  function eachSlide(doc, callback) {
    var parts   = [],
        counter = 1;

    forEach(doc, function(element) {
      if (element.tagName === 'HR') {
        callback(createSlide(parts), counter++);
        parts = [];
        return;
      }

      parts.push(element);
    });

    if (parts.length > 0) {
      callback(createSlide(parts), counter++);
    }
  }

  function forEach(collection, callback) {
    return Array.prototype.forEach.call(collection, callback);
  }

  function createSlide(parts) {
    return {
      layout: getSlideLayout(parts),
      html: parts.map(function(part) { return part.outerHTML; }).join('')
    };
  }

  function getSlideLayout(parts) {
    var key = parts.map(function(part) { return part.tagName; }).join(',');

    switch (key) {
      case 'H1':
        return 'title-only';

      case 'H1,H2':
        return 'title-subtitle';

      default:
        return 'default';
    }
  }

  function removeClass(element, className) {
    element.classList.remove(className);
  }

  function addClass(element, className) {
    element.classList.add(className);
  }

  function handleKey(keyCode, callback) {
    document.addEventListener('keydown', function(e) {
      if (e.keyCode === keyCode) {
        callback();
      }
    });
  }

  function nextSlide() {
    var current = document.querySelector('.slide.current'),
        next    = current.nextElementSibling;

    if (next) {
      removeClass(current, 'current');
      addClass(next, 'current');
      setSlideId(next.id);
    }
  }

  function prevSlide() {
    var current = document.querySelector('.slide.current'),
        prev    = current.previousElementSibling;

    if (prev) {
      removeClass(current, 'current');
      addClass(prev, 'current');
      setSlideId(prev.id);
    }
  }

  function setSlideId(id) {
    window.history.pushState({}, '', '#' + id);
  }

  function focusTargetSlide() {
    var current = document.querySelector('.slide.current');

    if (current) {
      removeClass(current, 'current');
    }

    var targetSlide = document.querySelector(window.location.hash || '.slide:first-child');
    addClass(targetSlide, 'current');
  }

  function CustomRenderer() {}

  CustomRenderer.prototype = new marked.Renderer();

  CustomRenderer.prototype.code = function code(code, lang) {
    if (!lang) {
      return marked.Renderer.prototype.code.call(this, code, lang);
    }

    var html = hljs.highlight(lang, code).value;
    return '<pre class="' + lang + '">' + html + '</pre>';
  };

  this.Slidedown = Slidedown;

}).call(this);
