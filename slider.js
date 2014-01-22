window.addEventListener('load', function() {
  var title = this.title;

  marked.setOptions({
    highlight: function(code, lang) {
      return hljs.highlight(lang, code).value;
    }
  });

  var request = new XMLHttpRequest();
  request.open('GET', title + '.markdown');

  request.addEventListener('load', function() {
    var html = marked(request.responseText),
        doc  = parseHTML(html);

    eachSlide(doc, function(slide) {
      var element = document.createElement('DIV');
      element.className = 'slide';
      element.setAttribute('data-layout', slide.layout);
      element.innerHTML = slide.html;
      document.body.appendChild(element);
    });

    document.querySelector('.slide:first-child').className += ' current';

    // Attach left/right keyboard shortcuts
    Mousetrap.bind('right', nextSlide);
    Mousetrap.bind('left', prevSlide);

    // For some reason highlight.js doesn't seem to assign the expected 'hljs'
    // class to <code> blocks?
    forEach(document.querySelectorAll('pre > code'), function(code) {
      code.className += ' hljs';
    });
  });

  request.send();

  function parseHTML(html) {
    var wrapper = document.createElement('DIV');
    wrapper.innerHTML = html;
    return wrapper.children;
  }

  function eachSlide(doc, callback) {
    var parts = [];

    forEach(doc, function(element) {
      if (element.tagName === 'HR') {
        callback(createSlide(parts));
        parts = [];
        return;
      }

      parts.push(element);
    });

    if (parts.length > 0) {
      callback(createSlide(parts));
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

  function nextSlide() {
    var current = document.querySelector('.slide.current'),
        next    = current.nextElementSibling;

    if (next) {
      removeClass(current, 'current');
      addClass(next, 'current');
    }
  }

  function prevSlide() {
    var current = document.querySelector('.slide.current'),
        prev    = current.previousElementSibling;

    if (prev) {
      removeClass(current, 'current');
      addClass(prev, 'current');
    }
  }
});
