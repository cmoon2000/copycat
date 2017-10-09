/**
 * t: current time
 * b: start value
 * c: change in value
 * d: duration
 * http://easings.net/
 * http://gizma.com/easing/
 */
export default interface IMath extends Math {
  /**
   * Simple linear tweening - no easing, no acceleration
   */
  linearTween(t: number, b: number, c: number, d: number) : number;
  /**
   * Quadratic easing in/out - acceleration until halfway, then deceleration
   */
  easeInOutQuad(t: number, b: number, c: number, d: number) : number;
  /**
   * Quartic easing in/out - acceleration until halfway, then deceleration
   */
  easeInOutQuart(t: number, b: number, c: number, d: number) : number;

  outElastic(t: number, b: number, c: number, d: number) : number;
  inElastic(t: number, b: number, c: number, d: number) : number;
}

(Math as IMath).linearTween = (t, b, c, d) => {
  return c * t / d + b;
};

(Math as IMath).easeInOutQuad = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

(Math as IMath).easeInOutQuart = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t * t + b;
  t -= 2;
  return -c / 2 * (t * t * t *  t - 2) + b;
};

(Math as IMath).outElastic = (t, b, c, d) => {
  const ts = (t /= d) * t;
  const tc = ts * t;
  return b + c * (29.445 * tc * ts + -98.0825 * ts * ts + 113.88 * tc + -53.69 * ts + 9.4475 * t);
};

(Math as IMath).inElastic = (t, b, c, d) => {
  const ts = (t /= d) * t;
  const tc = ts * t;
  return b + c * (-5.3475 * tc * ts + 12.6475 * ts * ts + -10 * tc + 2.6 * ts + 1.1 * t);
};
