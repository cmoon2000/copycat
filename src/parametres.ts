import IClef from "./interface/IClef";
import IImage from "./interface/IImage";
import ISon from "./interface/Ison";

export interface IParametres {
  stockImages: IImage[];
  stockSon: ISon[];
  clefs: IClef[];
  [key: string]: any;
}
export let parametres = {
  taille: 16,
  zoom: 2,
  stockImages: [
    {
      img: "https://image.ibb.co/mHNuWF/font.png",
      nom: "pixelFont"
    }, {
      img: "https://image.ibb.co/hzo1BF/curseur.png",
      nom: "curseur"
    }, {
      img: "https://image.ibb.co/j1Zmdv/titre.png",
      nom: "titre"
    }, {
      img: "https://image.ibb.co/hKwMBF/joueur.png",
      nom: "joueurSprite",
      sep: 12,
      ligne: 1
    }, {
      img: "https://image.ibb.co/h2Ns1F/explosion.png",
      nom: "explosion",
      sep: 9,
      ligne: 1
    }, {
      img: "https://image.ibb.co/b7aegF/feuille.png",
      nom: "feuille"
    }, {
      img: "https://image.ibb.co/mwXuWF/sortie.png",
      nom: "sortie",
      sep: 10
    }, {
      img: "https://image.ibb.co/k95ZFa/poussiere.png",
      nom: "poussiere",
      sep: 9,
      ligne: 1
    }, {
      img: "https://image.ibb.co/j7aZFa/pattern.png",
      nom: "pattern"
    }, {
      img: "https://image.ibb.co/gAGzyv/lock.png",
      nom: "lock"
    }],
  stockSon: [
    {
      url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-select-04.wav",
      nom: "mouvement"
    }, {
      url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-select.wav",
      nom: "selection"
    }, {
      url: "http://www.noiseforfun.com/waves/musical-and-jingles/NFF-bravo.wav",
      nom: "bravo"
    }, {
      url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-click-switch.wav",
      nom: "validation"
    }, {
      url: "http://www.noiseforfun.com/waves/interface-and-media/NFF-bubble-input.wav",
      nom: "apparition"
    }, {
      url: "http://www.noiseforfun.com/waves/action-and-game/NFF-moving-block.wav",
      nom: "eboulement"
    }],
  clefs: [
    {
      type: "tuile",
      nom: "eau",
      id: 0,
      collision: true,
      apparence: "auto",
      ligne: 3
    }, {
      type: "tuile",
      nom: "herbe",
      id: 1,
      collision: false,
      apparence: 1
    }, {
      type: "tuile",
      nom: "mur",
      id: 2,
      collision: true,
      apparence: "auto",
      ligne: 1
    }, {
      type: "tuile",
      nom: "glace",
      action: "glace",
      id: 3,
      collision: false,
      apparence: "auto",
      ligne: 2
    }, {
      type: "sprite",
      nom: "suivant",
      id: 4,
      collision: false,
      action: "suivant",
      apparence: "sortie",
      ligne: 2,
      allure: 0.3
    }, {
      type: "tuile",
      nom: "joueur",
      id: 5,
      collision: false,
      apparence: 5
    }, {
      type: "tuile",
      nom: "piege",
      action: "piege",
      id: 6,
      collision: false,
      apparence: 6
    }, {
      type: "tuile",
      nom: "trou",
      id: 7,
      collision: true,
      apparence: 7
    }, {
      type: "tuile",
      nom: "barriere",
      id: 8,
      collision: true,
      apparence: "auto",
      ligne: 4
    }, {
      type: "tuile",
      nom: "flecheGauche",
      action: "gauche",
      id: 9,
      collision: false,
      apparence: 9
    }, {
      type: "tuile",
      nom: "flecheHaut",
      action: "haut",
      id: 10,
      collision: false,
      apparence: 10
    }, {
      type: "tuile",
      nom: "flecheDroite",
      action: "droite",
      id: 11,
      collision: false,
      apparence: 11
    }, {
      type: "tuile",
      nom: "flecheBas",
      action: "bas",
      id: 12,
      collision: false,
      apparence: 12
    }]
};
