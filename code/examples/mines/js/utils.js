var utils = {
  camelize: function (str) {
    return str.replace(/[- ]+(\w)/g, function(match, v) { return v.toUpperCase(); } );
  }
};
