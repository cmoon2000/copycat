import IImage from "./IImage";

export default interface IClef {
  type: string;
  nom: string;
  id: number;
  collision: boolean;
  apparence: string | number;
  ligne?: number;
  allure?: number;
  action?: string;
  frame?: number;
  sprite?: IImage;
  memoireBoucle?: boolean;
  peutAnimer?: boolean;
  boucle?: boolean;
}
