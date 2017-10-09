export default class Util {
  /**
   * Morceler un tableau de plusieurs lignes
   */
  public static morceler(tableau: number[], largeur: number) : number[][] {
    const resultat: number[][] = [];
    for (let i = 0; i < tableau.length; i += largeur)
      resultat.push(tableau.slice(i, i + largeur));
    return resultat;
  }

  /**
   * Return True is u is between (min, max)
   */
  public static isBetween(u, min, max) : boolean {
    return (u - min) * (u - max) < 0;
  }

  /**
   * Return a random decimal number betwwen (min, max)
   */
  public static random(min: number, max: number) : number {
    return min + Math.random() * (max - min);
  }

  /**
   * Break up an array of numbers into a new 2d array
   */
  public static breakup(table: number[], width: number) : number[][] {
    const result: number[][] = [];
    for (let i = 0; i < table.length; i += width)
      result.push(table.slice(i, i + width));
    return result;
  }
}
