window.addEventListener('load', function() {
  var title = this.title;

  var request = new XMLHttpRequest();
  request.open('GET', title + '.markdown');

  request.addEventListener('load', function() {
    var html = marked(request.responseText);
    document.body.innerHTML = html;
  });

  request.send();
});
