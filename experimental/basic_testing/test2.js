Array.prototype.diff = function(a){
  return this.filter(function(i){
    return a.indexOf(i)<0;
  });
};
var a = [1,2,3];
var b = [2,4,5];

var need_to_get_blocks = a.diff(b);
console.log(need_to_get_blocks)
