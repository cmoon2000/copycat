import Entite from "./Entite";
import IImage from "./interface/IImage";
import Monde from "./Monde";

export default class Sprite {
  public pos: { x: number; y: number; };
  private allure: number;
  private animation: boolean;
  private selectLigne: number;
  private frame: number;
  private length: number;
  private ctx: CanvasRenderingContext2D;
  private l: number;
  private h: number;
  private sprite: IImage;
  private size: number;

  constructor(monde: Monde, parent: Entite, sprite: IImage) {
    this.ctx = monde.ctx;
    this.sprite = sprite;
    this.size = monde.taille;
    this.l = Math.round(this.sprite.img.width / this.sprite.sep!);
    this.h = this.sprite.img.height / this.sprite.ligne!;
    this.pos = {
      x: parent.pos.x * this.size,
      y: parent.pos.y * this.size
    };
    this.length = this.sprite.sep!;
    this.frame = 0;
    this.size = monde.taille;
    this.selectLigne = 0;
    this.animation = true;
    this.allure = 0.2;
  }
  
  public make() {
    this.animate();
    this.draw();
  }

  private draw() {
    this.ctx.drawImage(this.sprite.img, Math.floor(this.frame) * this.l,
      this.selectLigne, this.l, this.h, this.pos.x, this.pos.y, this.l, this.h);
  }

  private animate() {
    if (this.animation) {
      this.frame += this.allure;
      if (this.frame >= this.length)
        this.frame = 0;
    }
  }
}
