(function() {

  function Slidedown() {
    this.target = 'body';
  }

  Slidedown.prototype = {

    to: function to(target) {
      this.target = target;
    },

    append: function append(element) {
      var destination = typeof this.target === 'string' ?
        document.querySelector(this.target) : this.target;
      destination.appendChild(element);
    },

    fromElements: function fromElements(elements) {
      var slidedown = this;

      whenReady(function() {
        eachSlide(elements, function(slide, number) {
          var element = document.createElement('DIV');
          element.id = 'slide-' + number;
          element.className = 'slide';
          element.setAttribute('data-layout', slide.layout);
          element.innerHTML = slide.html;
          slidedown.append(element);
        });

        // Attach left/right keyboard shortcuts
        handleKey(39, nextSlide);
        handleKey(37, prevSlide);
        handleClick('x > 90%', nextSlide);
        handleClick('x < 10%', prevSlide);

        // Focus on the target slide (or first, by default)
        focusTargetSlide();
        window.addEventListener('hashchange', focusTargetSlide);
      });

      return slidedown;
    },

    fromHTML: function fromHTML(html) {
      var elements = parseHTML(html);
      return this.fromElements(elements);
    },

    fromMarkdown: function fromMarkdown(markdown) {
      marked.setOptions({
        renderer: new CustomRenderer()
      });

      var html = marked(markdown);
      return this.fromHTML(html);
    },

    fromXHR: function fromXHR(title) {
      var slidedown = this,
          format    = inferFormat(title);

      var request = new XMLHttpRequest();
      request.open('GET', title);

      request.addEventListener('load', function() {
        slidedown['from' + format](request.responseText);
      });

      request.send();

      return this;
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

  function handleClick(conditions, callback) {
    conditions = parseConditions(conditions);

    document.addEventListener('click', function(e) {
      if (conditions(e)) {
        callback();
      }
    });
  }

  function parseConditions(conditions) {
    conditions = conditions.split(/\s+/);

    var property  = conditions[0],
        operator  = conditions[1],
        threshold = conditions[2];

    if (threshold.charAt(threshold.length - 1) === '%') {
      threshold = Number(threshold.substring(0, threshold.length - 1));
      threshold /= 100;
    } else {
      threshold = Number(threshold);
    }

    var comparisonProperty;
    switch (property) {
      case 'x':
        property = 'clientX';
        comparisonProperty = 'innerWidth';
        break;

      case 'y':
        property = 'clientY';
        comparisonProperty = 'innerHeight';
        break;

      default:
        throw "Unrecognized property: '" + property + '"';
    }

    switch (operator) {
      case '<':
        return function(e) {
          return e[property] < (window[comparisonProperty] * threshold);
        };

      case '>':
        return function(e) {
          return e[property] > (window[comparisonProperty] * threshold);
        };

      default:
        throw "Unrecognized operator: '" + operator + '"';
    }
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

  function staticize(constructor, properties) {
    var staticized = {};

    forEach(properties, function(property) {
      staticized[property] = function() {
        var instance = new constructor();
        return instance[property].apply(instance, arguments);
      };
    });

    return staticized;
  }

  this.Slidedown = staticize(Slidedown, [
    'fromElements',
    'fromHTML',
    'fromMarkdown',
    'fromXHR'
  ]);

}).call(this);
