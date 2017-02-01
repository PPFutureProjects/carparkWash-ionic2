export class ServiceUtils {

  /**
   * Transform object of objects into array of objects
   *
   * @param objects
   * @returns {any[]}
   */
  protected arrayFromObject(objects) {
    return Object.keys(objects ? objects : []).map(key => objects[key]);
  }

  /**
   * Merge array of arrays
   *
   * @param results
   * @returns {Array<Object>}
   */
  protected mergeResults(results: Array<Array<Object>>) {
    return results.reduce((merged, result) => merged.concat(result), []);
  }

}
