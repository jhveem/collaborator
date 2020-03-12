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

$.getScript("https://cdn.jsdelivr.net/npm/vue").done(function() {
  $.getScript("https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js").done(function() {
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js/select2.min.js").done(function() {
      $.getScript("https://jhveem.xyz/collaborator/api-functions.js").done(function() {
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