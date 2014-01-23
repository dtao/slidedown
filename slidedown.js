(function() {

  this.Slide = {

    down: function down(title) {
      whenReady(function() {
        marked.setOptions({
          renderer: new CustomRenderer()
        });

        var request = new XMLHttpRequest();
        request.open('GET', title + '.markdown');

        request.addEventListener('load', function() {
          var html = marked(request.responseText),
              doc  = parseHTML(html);

          eachSlide(doc, function(slide, number) {
            var element = document.createElement('DIV');
            element.id = 'slide-' + number;
            element.className = 'slide';
            element.setAttribute('data-layout', slide.layout);
            element.innerHTML = slide.html;
            document.body.appendChild(element);
          });

          // Attach left/right keyboard shortcuts
          handleKey(39, nextSlide);
          handleKey(37, prevSlide);

          // Focus on the target slide (or first, by default)
          focusTargetSlide();
          window.addEventListener('hashchange', focusTargetSlide);
        });

        request.send();
      });
    }

  };

  function whenReady(callback) {
    if (document.readyState === "complete") {
      setTimeout(callback, 0);
      return;
    }

    window.addEventListener('load', callback);
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

}).call(this);
