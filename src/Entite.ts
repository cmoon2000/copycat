import IMath from "./Ease";
import Effet from "./Effet";
import IClef from "./interface/IClef";
import IImage from "./interface/IImage";
import Monde from "./Monde";
import Sprite from "./Sprite";

interface ICoordonne { x: number; y: number; }

export default class Entite {
  public pos: { x: number; y: number; };
  public validation: boolean;
  private tuileCible: IClef;
  private depart: { x: number; y: number; };
  private collision: boolean;
  private peutBouger: boolean;
  private derniereDirection: string;
  private transition: { etat: boolean; temps: null | Date | number; duration: number; style: string; };
  private sprite: Sprite;
  private cible: { x: number; y: number; };
  private taille: number;
  private ctx: CanvasRenderingContext2D;
  private limite: { x: number; y: number; };
  private monde: Monde;

  constructor(monde: Monde, x: number, y: number, sprite: IImage) {
    this.monde = monde;
    this.limite = monde.limite;
    this.ctx = monde.ctx;
    this.pos = {x, y};
    this.taille = monde.taille;
    this.cible = {
      x: this.pos.x * this.taille,
      y: this.pos.y * this.taille,
    };
    this.depart = {
      x: this.pos.x * this.taille,
      y: this.pos.y * this.taille,
    };
    this.sprite = new Sprite(this.monde, this, sprite);
    this.transition = {
      etat: false,
      temps: null,
      duration: 200,
      style: "marche"
    };
    this.derniereDirection = "none";
    this.peutBouger = true;
    this.collision = false;
    this.validation = false;
    this.monde.sons.apparition.url.play();
    this.monde.effets.push(new Effet(this.monde, this.depart.x, this.depart.y, this.monde.ressources.explosion));
  }

  public make() {
    this.sprite.make();
    this.translate();
    this.control();
  }

  private control() {
    if (!this.transition.etat && this.peutBouger) {
      if (this.monde.touches[38])
        this.steer("haut");
      if (this.monde.touches[39])
        this.steer("droite");
      if (this.monde.touches[37])
        this.steer("gauche");
      if (this.monde.touches[40])
        this.steer("bas");
    }
  }

  private steer(direction: string) {
    let mouvement: ICoordonne = {} as any;
    switch (direction) {
      case "gauche":
        mouvement = {
          x: this.pos.x - 1,
          y: this.pos.y
        };
        break;
      case "droite":
        mouvement = {
          x: this.pos.x + 1,
          y: this.pos.y
        };
        break;
      case "bas":
        mouvement = {
          x: this.pos.x,
          y: this.pos.y + 1
        };
        break;
      case "haut":
        mouvement = {
          x: this.pos.x,
          y: this.pos.y - 1
        };
        break;
    }
    this.deplacer(mouvement, direction); 
  }

  private deplacer(coordonne: {x: number, y: number}, direction: string) {
    if (!this.transition.etat) {
      this.tuileCible = this.monde.infoClef(coordonne.x, coordonne.y) as IClef;
      if (!this.tuileCible.collision) {
        if (this.tuileCible.action === "glace") {
          this.transition.style = "glace";
          this.transition.duration = 80;
        } else {
          this.transition.style = "marche";
          this.transition.duration = 200;
        }
        this.collision = false;
        this.validation = false;
        this.transition.etat = true;
        this.derniereDirection = direction;
        this.transition.temps = new Date();
        this.pos.x = coordonne.x;
        this.pos.y = coordonne.y;
        this.cible.x = this.pos.x * this.taille;
        this.cible.y = this.pos.y * this.taille;
      } else {
        this.collision = true;
      }
    }
  
  }

  private translate() {
    if (this.transition.etat) {
      const time = +new Date() - +(this.transition.temps as Date);
      if (time < this.transition.duration) {
        if (this.transition.style === "marche") {
          this.sprite.pos.x = (Math as IMath).easeInOutQuart(time, this.depart.x, this.cible.x - this.depart.x
            , this.transition.duration);
          this.sprite.pos.y = (Math as IMath).easeInOutQuart(time, this.depart.y, this.cible.y - this.depart.y
            , this.transition.duration);
        } else {
          this.sprite.pos.x = (Math as IMath).linearTween(time, this.depart.x, this.cible.x - this.depart.x
            , this.transition.duration);
          this.sprite.pos.y = (Math as IMath).linearTween(time, this.depart.y, this.cible.y - this.depart.y
            , this.transition.duration);
        }
      } else {
        this.transition.etat = false;
        this.sprite.pos.x = this.cible.x;
        this.sprite.pos.y = this.cible.y;
        this.depart.x = this.cible.x;
        this.depart.y = this.cible.y;
        // en fonction du type de sol
        switch (this.tuileCible.action) {
          case "glace":
            this.steer(this.derniereDirection);
            if (!this.collision) {
              this.peutBouger = false;
            } else {
              this.peutBouger = true;
            }
            break;
          case "gauche":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.steer("gauche");
            break;
          case "haut":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.steer("haut");
            break;
          case "bas":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.steer("bas");
            break;
          case "droite":
            this.monde.sons.validation.url.play();
            this.peutBouger = false;
            this.steer("droite");
            break;
          case "piege":
            this.monde.sons.eboulement.url.play();
            this.monde.effets.push(new Effet(this.monde, this.pos.x * this.taille
              , this.pos.y * this.taille, this.monde.ressources.poussiere));
            this.monde.terrain.geometrie[this.pos.y][this.pos.x] = 7;
            this.peutBouger = true;
            break;
          case "suivant":
            this.validation = true;
            this.peutBouger = true;
            this.monde.action("suivant");
            break;
          default:
            this.monde.sons.mouvement.url.play();
            this.peutBouger = true;
            this.validation = false;
            // sol normal
        }
      }
    }
  }
}
