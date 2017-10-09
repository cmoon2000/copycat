import IMath from "./Ease";
import Effet from "./Effet";
import Entite from "./Entite";
import IClef from "./interface/IClef";
import IImage from "./interface/IImage";
import ISon from "./interface/Ison";
import { Menu } from "./Menu";
import {INiveaux, niveaux as _niveaux} from "./niveaux";
import {IParametres, parametres as _parametres} from "./parametres";
import Utl from "./Util";

interface IDictImages {
  [key: string]: IImage;
}

interface IDictSons {
  [key: string]: ISon;
}

interface IDictClefs {
  [key: string]: IClef;
}

interface IMenuNiveaux {
  monde: Monde;
  ctx: CanvasRenderingContext2D;
  nombre: number;
  selection: number;
  rendu() : void;
  changement(this: IMenuNiveaux, keyCode: number) : void;
}

export default class Monde {
  public ctx: CanvasRenderingContext2D;
  public effets: Effet[];
  public limite: { x: number; y: number; };
  public ressources: IDictImages;
  public sons: IDictSons;
  public taille: number;
  public touches: boolean[];
  public terrain: {
    geometrie: number[][],
    dimension: {x: number, y: number},
    apparence: number[] | number[][]
  };
  private arret: boolean;
  private animation: number | null;
  private nettoyer: boolean[];
  private transition: { duration: number, temps?: Date; };
  private menuNiveaux: IMenuNiveaux;
  private cat: Entite[];
  private niveauMax: number;
  private niveauActuel: number;
  private niveaux: INiveaux[];
  private clefs: IDictClefs;
  private menu: Menu;
  private H: number;
  private L: number;
  private toile: HTMLCanvasElement;
  private volumePrincipal: number;
  private prop: { compte: number; nombreImg: number; };
  private fps: number;
  private etat: string;
  private remplissage: boolean;
  private zoom: number;
  private alphabet: string;

  constructor(parametres: IParametres, niveaux: INiveaux[]) {
    this.alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ?!():'";
    this.taille = parametres.taille;
    this.touches = [];
    this.zoom = parametres.zoom || 2;
    this.remplissage = false;
    this.etat = "menu";
    this.fps = 60;
    this.prop = {
      compte: 0,
      nombreImg: parametres.stockImages.length + parametres.stockSon.length
    };
    this.ressources = {};
    
    this.volumePrincipal = 0.05;
    this.creerContexte();

    const {stockImages, stockSon, clefs} = parametres;
    if (this.prop) {
      this.traitement(stockImages, stockSon, clefs);
    }
    // Levels
    this.niveaux = niveaux;
    this.niveauActuel = 0;
    
    if (localStorage.copycat) {
      console.info("mémoire récupéré");
    } else {
      // s'il n'y a rien on genere une mémoire
      localStorage.setItem("copycat", JSON.stringify(5));
    }
    this.niveauMax = JSON.parse(localStorage.copycat);

    this.cat = [];

    const self = this;
    this.menuNiveaux = {
      monde: self,
      ctx: self.ctx,
      nombre: self.niveaux.length,
      selection: 0,
      rendu(this: IMenuNiveaux) {
        this.ctx.fillStyle = "#fff1e8";
        this.monde.boite(10, 10, this.monde.L - 20, 200 - 20);
        this.monde.ecrire("select level", this.monde.L / 2, 25);
        for (let i = 0; i < this.nombre; i++) {
          const numero = i + 1;
          if (i > this.monde.niveauMax - 1) {
            this.ctx.globalAlpha = 0.6;
            this.monde.ctx.drawImage(this.monde.ressources.lock.img,
              (32 + Math.floor(i % 7) * 32) - this.monde.ressources.lock.img.width / 2,
              (64 + Math.floor(i / 7) * 32) + 10);
          }
          this.monde.ecrire(numero.toString(), 32 + Math.floor(i % 7) * 32, 64 + Math.floor(i / 7) * 32);
          this.ctx.globalAlpha = 1;
        }
        this.monde.ctx.drawImage(this.monde.ressources.curseur.img, 0, 16, 32, 32,
          16 + Math.floor(this.selection % 7) * 32, 51 + Math.floor(this.selection / 7) * 32, 32, 32);
      },
      changement(keyCode) {
        if (keyCode === 38 && this.selection - 6 > 0) {
          // haut
          this.monde.sons.selection.url.play();
          this.selection -= 7;
          this.rendu();
        }
        if (keyCode === 40 && this.selection + 7 < this.monde.niveauMax) {
          // bas
          this.monde.sons.selection.url.play();
          this.selection += 7;
          this.rendu();
        }
        if (keyCode === 37 && this.selection > 0) {
          // gauche
          this.monde.sons.selection.url.play();
          this.selection -= 1;
          this.rendu();
        }
        if (keyCode === 39 && this.selection + 1 < this.monde.niveauMax) {
          // droit
          this.monde.sons.selection.url.play();
          this.selection += 1;
          this.rendu();
        }
      }
    }; // end Monde.menuNiveaux

    this.transition = { duration: 800 };
    this.effets = [];
  }
  
  public action(action: string) {
    switch (action) {
      case "suivant":
        const tab: boolean[] = [];
        for (const i of this.cat) {
          tab.push(i.validation);
        }
        const confirmation = tab.every(vrai => vrai === true);
        if (confirmation) {
          this.niveauActuel += 1;
          if (this.niveauMax < this.niveauActuel) {
            this.niveauMax = this.niveauActuel;
            localStorage.setItem("copycat", JSON.stringify(this.niveauActuel));
          }
          this.outro();
          this.sons.bravo.url.play();
        }

        break;
      case "autre":
        break;
      default:
        console.log("aucune action reconnue");
    }
  }

  public ecrire(texte: string, x: number, y: number) {
    const largeur = 6;
    const hauteur = 9;
    const centre = (texte.length * largeur) / 2;
    for (let i = 0; i < texte.length; i++) {
      const index = this.alphabet.indexOf(texte.charAt(i));
      const clipX = largeur * index;
      const posX = (x - centre) + (i * largeur);
      this.ctx.drawImage(this.ressources.pixelFont.img, clipX, 0, largeur, hauteur, posX, y, largeur, hauteur);
    }
  }

  public boite(x: number, y: number, l: number, h: number) {
    this.ctx.fillStyle = "#fff1e8";
    // dessiner le fond
    this.ctx.fillRect(x + 1, y + 1, l - 2, h - 2);
    // dessiner les bords
    // haut Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16, 16, 16, x, y, 16, 16);
    // haut Droit
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16, 16, 16, x + l - 16, y, 16, 16);
    // bas Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 8, 16, 16, x, y + h - 16, 16, 16);
    // bas Gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 8, 16, 16, x + l - 16, y + h - 16, 16, 16);
    // haut
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16, 16, 16, x + 16, y, l - 32, 16);
    // bas
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16 + 8, 16, 16, x + 16, y + h - 16, l - 32, 16);
    // gauche
    this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 4, 16, 16, x, y + 16, 16, h - 32);
    // droit
    this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 4, 16, 16, x + l - 16, y + 16, 16, h - 32);
  }

  public infoClef(x: number, y: number) {
    if (x > -1
      && x < this.terrain.dimension.x 
      && y > -1 
      && y < this.terrain.dimension.y) {
      return this.clefs[this.terrain.geometrie[y][x]];
    }
    return false;
  }

  public phase(phase: string) {
    this.etat = phase;
    cancelAnimationFrame(this.animation as number);
    this.animation = null;
    this.ctx.fillStyle = "#fff1e8";
    this.ctx.fillRect(0, 0, this.L, this.H);
    switch (phase) {
      case "menu":
        // affiche le menu du jeu

        const pat = this.ctx.createPattern(this.ressources.pattern.img, "repeat");
        this.ctx.fillStyle = pat;
        this.ctx.fillRect(0, 0, this.L, this.H);

        this.ctx.drawImage(this.ressources.titre.img, 0, 0);
        this.menu.make();
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
        break;
      case "start":
        this.intro();
        break;
      case "fin":
        // affiche le tableau de mort du joueur
        this.ecrire("thanks for playing :) !", this.L / 2, 15);
        this.ecrire("if you have something to tell me about", this.L / 2, 40);
        this.ecrire("this pen please do so", this.L / 2, 55);
        this.ecrire("in the comment section.", this.L / 2, 70);
        this.ecrire("any feedback is appreciated", this.L / 2, 85);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "regles":
        // affiche les regles
        this.ecrire("game control : ", this.L / 2, 15);
        this.ecrire("arrow keys to move", this.L / 2, 60);
        this.ecrire("'f' to toggle fullscreen", this.L / 2, 80);
        this.ecrire("'r' if you're stuck", this.L / 2, 100);
        this.ecrire("'e' to exit the game", this.L / 2, 120);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "info":
        // Affiche les infos
        this.ecrire("about : ", this.L / 2, 15);
        this.ecrire("made with html5 canvas", this.L / 2, 40);
        this.ecrire("by gtibo on codepen", this.L / 2, 55);
        this.ecrire("credits:", this.L / 2, 80);
        this.ecrire("sound effect : noiseforfun.com", this.L / 2, 100);
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 18);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 30);
        break;
      case "niveaux":
        // Afficher menu niveaux
        this.menuNiveaux.rendu();
        this.ctx.fillStyle = "#83769c";
        this.ctx.fillRect(0, this.H - 35, this.L, 28);
        this.ecrire("arrow keys to select 'x' to confirm", this.L / 2, this.H - 30);
        this.ecrire("press 'c' to return to menu", this.L / 2, this.H - 20);
        break;
      default:
        console.log("aucune action reconnue");
    }
  }

  private creerContexte() : void {
    this.toile = document.createElement("canvas");
    this.ctx = this.toile.getContext("2d")!;
    this.L = this.toile.width = 16 * 16;
    this.H = this.toile.height = 16 * 16;
    this.limite = {
      x: this.L,
      y: this.H
    };
    this.toile.style.width = this.L * this.zoom + "px";
    this.toile.style.height = this.H * this.zoom + "px";
    (this.ctx as any).msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    document.body.appendChild(this.toile);
    console.log("%c Monde créé ", "padding:2px; border-left:2px solid green; background: lightgreen; color: #000");
  }
  private chargement() {
    this.prop.compte += 1;
    if (this.prop.compte === this.prop.nombreImg) {
      console.log("%c les ressources sont chargées " + this.prop.nombreImg + " / " + this.prop.nombreImg,
      "padding:2px; border-left:2px solid green; background: lightgreen; color: #000");
      // menu
      const bouttons = [{
        name: "start game",
        link: "start"
      }, {
        name: "levels",
        link: "niveaux"
      }, {
        name: "how to play",
        link: "regles"
      }, {
        name: "about",
        link: "info"
      }, ];
      this.menu = new Menu(this, this.L / 2, 110, bouttons);
      // Fin de chargement
      this.phase("menu");
      document.addEventListener("keydown", event => this.touchePresse(event), false);
      document.addEventListener("keyup", event => this.toucheLache(event), false);
    } else {
      // écran de chargement
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.L, this.H);
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(0, (this.H / 2) - 1, (this.prop.compte * this.L) / this.prop.nombreImg, 2);
    }
  }

  private chargerImages(url: string) {
    const img = new Image();
    const self = this;
    img.onload = () => {
      self.chargement();
    };
    img.src = url;
    return img;
  }

  private chargerSon(url: string) {
    const audio = new Audio(url);
    audio.addEventListener("canplaythrough", this.chargement() as any, false);
    audio.volume = this.volumePrincipal;
    return audio;
  }

  private traitement(stockImages: IImage[], stockSon: ISon[], clefs: IClef[]) {
    // traitement images
    const IM: IDictImages = {};
    for (const i of stockImages) {
      const nom = i.nom;
      i.img = this.chargerImages(i.img as any);
      IM[nom] = i as any;
    }
    this.ressources = IM;
    // traitement images
    const IS: IDictSons = {};
    for (const i of stockSon) {
      const nom = i.nom;
      i.url = this.chargerSon(i.url as any);
      IS[nom] = i;
    }
    this.sons = IS;
    //  traitement clefs
    this.nettoyer = new Array(clefs.length).fill(false);
    const CM: IDictClefs = {};
    for (const i of clefs) {
      const nom = i.id;
      if (i.type === "sprite") {
        i.frame = 0;
        i.sprite = this.ressources[i.apparence];
        i.memoireBoucle = false;
        i.peutAnimer = true;
        i.boucle = true;
      }
      CM[nom] = i;
    }
    this.clefs = CM;
  }

  private touchePresse(event: KeyboardEvent) {
    this.touches[event.keyCode] = true;
    if (this.touches[70]) {
      this.activeRemplissage();
    }
    switch (this.etat) {
      case "menu":
        this.menu.changement(event.keyCode);
        break;
      case "start":
        if (this.touches[69] && this.animation) {
          this.sons.validation.url.play();
          this.phase("menu");
        }
        if (this.touches[82] && this.animation) {
          this.sons.validation.url.play();
          cancelAnimationFrame(this.animation);
          this.animation = null;
          this.arret = true;
          this.outro();
        }
        break;
      case "fin":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu");
        }
        break;
      case "regles":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu");
        }
        break;
      case "info":
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu");
        }
        break;
      case "niveaux":
        this.menuNiveaux.changement(event.keyCode);
        if (this.touches[67]) {
          this.sons.validation.url.play();
          this.phase("menu");
        }
        if (this.touches[88]) {
          this.niveauActuel = this.menuNiveaux.selection;
          this.phase("start");
        }
        break;
      default:
        console.log("aucune touche reconnue");
    }
  }

  private toucheLache(event: KeyboardEvent) {
    this.touches[event.keyCode] = false;
  }

  private activeRemplissage() {
    if (!this.remplissage) {
      this.toile.webkitRequestFullScreen();
      this.remplissage = true;
      this.toile.style.width = "100vmin";
      this.toile.style.height = "100vmin";
    } else {
      document.webkitCancelFullScreen();
      this.remplissage = false;
      this.toile.style.width = this.L * this.zoom + "px";
      this.toile.style.height = this.H * this.zoom + "px";
    }
  }

  private chercheClef(recherche: string) {
    // tslint:disable-next-line:interface-over-type-literal
    type br = {
      pos: { x: number; y: number }
    };
    const blockRecherche: br[] = [];
    for (let j = 0; j < this.terrain.dimension.y; j++) {
      for (let i = 0; i < this.terrain.dimension.x; i++) {
        const id = this.terrain.geometrie[j][i];
        if (this.clefs[id].nom === recherche) {
          const info = {
            pos: {x: i, y: j}
          };
          blockRecherche.push(info);
        }
      }
    }
    return blockRecherche;
  }

  private bitMasking() {
    const tuileBitMask = [];
    let compte = 0;
    this.terrain.apparence = [];
    for (let j = 0; j < this.terrain.dimension.y; j++) {
      for (let i = 0; i < this.terrain.dimension.x; i++) {
        let id = this.terrain.geometrie[j][i];
        // haut gauche droit bas
        const voisine = [0, 0, 0, 0];
        compte += 1;
        if (j - 1 > -1) {
          if (id === this.terrain.geometrie[j - 1][i])
            voisine[0] = 1;   // haut
        } else {
          voisine[0] = 1;
        }
        if (i - 1 > -1) {
          if (id === this.terrain.geometrie[j][i - 1])
            voisine[1] = 1;   // gauche
        } else {
          voisine[1] = 1;
        }
        if (i + 1 < this.terrain.dimension.x) {
          if (id === this.terrain.geometrie[j][i + 1])
            voisine[2] = 1;   // droite
        } else {
          voisine[2] = 1;
        }
        if (j + 1 < this.terrain.dimension.y) {
          if (id === this.terrain.geometrie[j + 1][i])
            voisine[3] = 1;   // bas
        } else {
          voisine[3] = 1;
        }
        id = 1 * voisine[0] + 2 * voisine[1] + 4 * voisine[2] + 8 * voisine[3];
        (this.terrain.apparence as number[]).push(id);
      }
    }
    this.terrain.apparence = Utl.morceler(this.terrain.apparence as number[], this.terrain.dimension.x);
  }

  private renduTerrain() {
    for (let j = 0; j < this.terrain.dimension.y; j++) {
      for (let i = 0; i < this.terrain.dimension.x; i++) {
        const id = this.terrain.geometrie[j][i];
        if (this.clefs[id].apparence === "auto") {
          const sourceX = Math.floor(this.terrain.apparence[j][i]) * this.taille;
          const sourceY = Math.floor(this.terrain.apparence[j][i]) * this.taille;
          this.ctx.drawImage(this.ressources.feuille.img, sourceX,
            this.clefs[id].ligne! * this.taille, this.taille, this.taille,
            i * this.taille, j * this.taille, this.taille, this.taille);
        } else if (this.clefs[id].type === "sprite") {
          if (!this.clefs[id].memoireBoucle) {
            if (this.clefs[id].peutAnimer) {
              this.clefs[id].frame! += this.clefs[id].allure!;
            }
            if (this.clefs[id].frame! >= this.clefs[id].sprite!.sep!) {
              if (!this.clefs[id].boucle) {
                this.clefs[id].peutAnimer = false;
              }
              this.clefs[id].frame = 0;
            }
            this.clefs[id].memoireBoucle = true;
            // on sait quel id est déjà passé :^)
            this.nettoyer[id] = true;
          }
          this.ctx.drawImage(this.clefs[id].sprite!.img, Math.floor(this.clefs[id]!.frame!) * this.taille,
          0, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
        } else {
          const sourceX = Math.floor(this.clefs[id].apparence as number % 16) * this.taille;
          const sourceY = Math.floor(this.clefs[id].apparence as number / 16) * this.taille;
          this.ctx.drawImage(this.ressources.feuille.img, sourceX, sourceY, this.taille,
            this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
        }
      }
    }
    for (let i = 0; i < this.nettoyer.length; i++) {
      if (this.nettoyer[i]) {
        this.clefs[i].memoireBoucle = false;
      }
    }
    if (this.niveaux[this.niveauActuel].indice) {
      this.boite(0, this.H - 32, this.L, 32);
      this.ecrire(this.niveaux[this.niveauActuel].indice!, this.L / 2, this.H - 20);
    }
  }

  private initialiserMap() {
    this.terrain = {} as any;
    this.arret = false;
    this.terrain.geometrie = JSON.parse(JSON.stringify(this.niveaux[this.niveauActuel].geometrie));
    this.terrain.dimension = {
      x: this.terrain.geometrie[0].length,
      y: this.terrain.geometrie.length
    };
    this.terrain.apparence = [];
    this.bitMasking();
  }

  private initJoueur() {
    this.effets = [];
    this.cat = [];
    const posCat = this.chercheClef("joueur");
    for (const i of posCat)
      this.cat.push(new Entite(this, i.pos.x, i.pos.y, this.ressources.joueurSprite));
  }

  private rendu() {
    this.renduTerrain();
    for (const i of this.cat)
      i.make();

    for (let i = this.effets.length - 1; i >= 0; i--)
      this.effets[i].rendu();
    // afficher indice
  }

  private boucle() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.L, this.H);
    this.rendu();
    if (!this.arret)
      this.animation = requestAnimationFrame(() => this.boucle());
  }

  private outro() {  
    cancelAnimationFrame(this.animation!);
    this.animation = null;
    this.arret = true;

    this.ctx.fillStyle = "black";
    let x = 0;
    const cibleX = this.H / 2;
    const departX = 0;
    const monde = this;
    this.transition.temps = new Date();
    boucle();

    function boucle() {
      const time = +new Date() - +(monde.transition.temps as Date);
      if (time < monde.transition.duration) {
        monde.ctx.fillRect(0, 0, monde.L, x);
        monde.ctx.fillRect(0, monde.H, monde.L, x * -1);
        x = (Math as IMath).easeInOutQuart(time, departX, cibleX - departX, monde.transition.duration);
        requestAnimationFrame(boucle);
      } else {
        if (monde.niveauActuel < monde.niveaux.length) {
          monde.phase("start");
          cancelAnimationFrame(boucle as any);
        } else {
          // fin du jeu
          monde.arret = true;
          monde.phase("fin");
          monde.niveauActuel = 0;
        }
      }
    }
  }

  private intro() {
    this.initialiserMap();
    let x = this.H / 2;
    const cibleX = 0;
    const departX = this.H / 2;
    const monde = this;
    this.transition.temps = new Date();
    boucle();

    function boucle() {
      const time = +new Date() - +(monde.transition.temps as Date);
      if (time < monde.transition.duration) {
        monde.renduTerrain();
        monde.ctx.fillStyle = "black";
        monde.ctx.fillRect(0, 0, monde.L, x);
        monde.ctx.fillRect(0, monde.H, monde.L, x * -1);
        x = (Math as IMath).easeInOutQuart(time, departX, cibleX - departX, monde.transition.duration);
        requestAnimationFrame(boucle);
      } else {

        monde.initJoueur();

        monde.boucle();
        cancelAnimationFrame(boucle as any);
      }
    }
  }
}
