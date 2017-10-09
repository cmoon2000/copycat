import Monde from "./Monde";

interface IChoice {
  name: string;
  link: string;
}

export class Menu {
  private texteMax: number;
  private touches: never[];
  private curseur: any;
  private max: number;
  private selection: number;
  private actif: boolean;
  private pos: { x: number; y: number; };
  private choix: IChoice[];
  private ctx: CanvasRenderingContext2D;
  private parent: Monde;

  constructor(parent: Monde, x: number, y: number, choix: IChoice[]) {
    this.parent = parent;
    this.ctx = parent.ctx;
    this.choix = choix;
    this.pos = {x, y};
    this.actif = false;
    this.selection = 0;
    this.max = this.choix.length - 1;
    this.curseur = this.parent.ressources.curseur;
    this.touches = [];
    const valeur: number[] = [];
    for (const c of this.choix) {
      valeur.push(c.name.length);
    }
    this.texteMax = Math.max(...valeur) * 6 + 60;
  }

  public make() {
    this.ctx.fillStyle = "#fff1e8";
    // dessiner le cadre 
    this.parent.boite(this.pos.x - this.texteMax / 2, this.pos.y - 10, this.texteMax, 26 * this.choix.length);
    // on affiche le titre
    for (let i = 0; i < this.choix.length; i++) {
      this.parent.ecrire(this.choix[i].name, this.pos.x, this.pos.y + 25 * i);
    }
    // on affiche la selection
    this.ctx.drawImage(this.curseur.img, 48, 0, 16, 16,
      this.pos.x - this.texteMax / 2 + 8, this.pos.y + 25 * (this.selection) - 4, 16, 16);
  }

  public changement(keycode: number) {
    if (keycode === 38 && this.selection > 0) {
      // haut
      this.parent.sons.selection.url.play();
      this.selection -= 1;
      this.make();
    } else if (keycode === 40 && this.selection < this.max) {
      // bas
      this.parent.sons.selection.url.play();
      this.selection += 1;
      this.make();
    } else if (keycode === 88) {
      // action
      this.parent.sons.validation.url.play();
      this.actif = false;
      this.parent.phase(this.choix[this.selection].link);
    }
  }
}
