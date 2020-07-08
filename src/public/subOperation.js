//减法运算
function accSub(a, b) {
  let c, d, m;
  try {
    c = a.toString().split(".")[1].length;
  } catch (e) {
    c = 0;
  }
  try {
    d = b.toString().split(".")[1].length;
  } catch (e) {
    d = 0;
  }
  m = Math.pow(10, Math.max(c, d));
  return (a * m - b * m) / m;
}

export default {
  accSub: accSub
};
