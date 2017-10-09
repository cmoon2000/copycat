import IMath from "./Ease";
import Monde from "./Monde";
import { niveaux } from "./niveaux";
import { parametres } from "./parametres";
import Util from "./Util";

const K_LEFT = 37;
const K_UP = 38;
const K_RIGHT = 39;
const K_DOWN = 40;
const K_SPACE    = 32;
window.addEventListener("keydown", e => {
  if ([K_SPACE, K_LEFT, K_UP, K_RIGHT, K_DOWN].indexOf(e.keyCode) > -1)
    e.preventDefault();
  //
}, false);

const demo = new Monde(parametres as any, niveaux);
