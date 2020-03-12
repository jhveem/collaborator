$.put = function(url, data){
  return $.ajax({
		url: url,
		data: data,
    type: 'PUT'
  });
}

$.delete= function(url, data){
  return $.ajax({
		url: url,
		data: data,
    type: 'DELETE'
  });
}

//SET UP THE PAGE
let canvasbody = $("#application");
//Look at doing an html import using https://www.w3schools.com/howto/howto_html_include.asp
//This could be useful once it's life and it's no longer more convenient to have auto updates from tampermonkey
//OR once it's all hosted on my site and on github, then updates will be instant as well
canvasbody.after('<div id="canvas-collaborator-container"></div>');
$('#left-side').append("<a id='canvas-collaborator-toggler' class='btn'>Collaborator</a>")
$("#canvas-collaborator-toggler").click(function() {
APP.toggleWindow();
});
$("#canvas-collaborator-container").hide();
$("#canvas-collaborator-container").append(vueString);

//IMPORT EVERYTHING
//Look into moving all of the libraries local that are hosted elsewhere
$.getScript("https://cdn.jsdelivr.net/npm/vue").done(function() {
  $.getScript("https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js").done(function() {
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js/select2.min.js").done(function() {
      $.getScript("https://jhveem.xyz/collaborator/libraries/APIFunctions.js").done(function() {
        $.getScript("https://jhveem.xyz/collaborator/libraries/SettingsFunctions.js").done(function() {
          $.getScript("https://jhveem.xyz/collaborator/components/MenuItem.js").done(function() {
            $.getScript("https://jhveem.xyz/collaborator/components/Modals.js").done(function() {
              $.getScript("https://jhveem.xyz/collaborator/components/ChosenSelect.js").done(function() {
                $.getScript("https://jhveem.xyz/collaborator/vue.js").done(function() {
                });
              });
            });
          });
        });
      });
    });
  });
});