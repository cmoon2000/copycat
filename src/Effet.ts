import IImage from "./interface/IImage";
import Monde from "./Monde";
import Sprite from "./Sprite";

interface Iffet {
  rendu() : void;
}

export default class Effet {
  private allure: number;
  private animation: boolean;
  private selectLigne: number;
  private frame: number;
  private longueur: number;
  private pos: { x: number; y: number; };
  private h: number;
  private l: number;
  private taille: number;
  private sprite: IImage;
  private ctx: CanvasRenderingContext2D;
  private monde: Monde;

  constructor(monde: Monde, x: number, y: number, sprite: IImage) {
    this.monde = monde;
    this.ctx = monde.ctx;
    this.sprite = sprite;
    this.taille = monde.taille;
    this.l = Math.round(this.sprite.img.width / this.sprite.sep!);
    this.h = this.sprite.img.height / this.sprite.ligne!;
    this.pos = {x, y};
    this.longueur = this.sprite.sep!;
    this.frame = 0;
    this.taille = monde.taille;
    this.selectLigne = 0;
    this.animation = true;
    this.allure = 0.4;
  }

  public rendu() {
    if (this.animation) {
      this.frame += this.allure;
      if (this.frame >= this.longueur)
        this.monde.effets.splice(this.monde.effets.indexOf(this), 1);
    }
    this.ctx.drawImage(this.sprite.img, Math.floor(this.frame) * this.l,
      this.selectLigne, this.l, this.h, this.pos.x - this.l / 4,
      this.pos.y - this.l / 4, this.l, this.h);
  }
}
