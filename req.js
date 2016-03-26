var get = function(url, cb){
  var r = new XMLHttpRequest();
  r.overrideMimeType("application/json");
  r.open('GET', url, true);
  r.onload = function(e){
    if(this.status == 200){
      cb(JSON.parse(this.response));
    };
  };
  r.send();
}

// var post = function()
