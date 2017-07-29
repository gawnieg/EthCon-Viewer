Array.prototype.diff = function(a){
  return this.filter(function(i){
    return a.indexOf(i)<0;
  });
};
var have = [1,2,3];
var need = [1,2,3,4,5];

var need_to_get_blocks = need.diff(have);
need_to_get_blocks.forEach(function(e){
  console.log(e)
})
