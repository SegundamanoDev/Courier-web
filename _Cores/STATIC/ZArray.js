const Accessor = require("./Accessor");
const _ = require("lodash");

class ZArray {

  /**
   * Return true if the array has duplicated elements
   * @template T
   * @param {T[]} array 
   * @param {String} accessor 
   */
   static HaveDuplicatedElements(array, accessor){
    return new Set(array.map(o => Accessor.Get(o, accessor))).size != array.length;
  }

  /**
   * Filter all elements having the same value accessor after second appearance
   * @template T
   * @param {T[]} array 
   * @param {String} accessor 
   * @param {Boolean} caseSensitive 
   * @returns {T[]}
   */
  static Unique(array, accessor, caseSensitive = true){
    let rtn = [];
    let checked = [];
    _.map(array, (o, i) => {
      let value = Accessor.Get(o, accessor);
      if(!caseSensitive) value = typeof(value) == "string" ? value.toLowerCase() : value;
      if(!checked.includes(value)){
        checked.push(value);
        rtn.push(o);
      }
    });
    return rtn;
  }

  /**
   * Filter if the field has empty value
   * @template T
   * @param {T[]} array 
   * @param {String} accessor 
   * @returns {T[]}
   */
  static FilterEmpty(array, accessor){
    let rtn = [];
    _.map(array, (o, i) => {
      let value = Accessor.Get(o, accessor);
      if(typeof(value) != "number" && !_.isEmpty(value)){
        rtn.push(o);
      }
    });
    return rtn;
  }

  /**
   * Ensure it is an array
   * @template T
   * @param {T | T[]} item 
   * @returns {T[]}
   */
  static Ensure(item){
    if(_.isUndefined(item) || _.isNull(item)) return [];
    if(!_.isArray(item)){
      return [item];
    }else{
      return item;
    }
  }

  /**
   * Ensure the array contains no null / undefined elements
   * @template T
   * @param {T | T[]} item 
   * @returns {T[]}
   */
  static NoNullOrUndefinedElements(item){
    item = this.Ensure(item);
    return _.filter(item, o => o);
  }

  /**
   * array contains all values provided
   * @template T
   * @param {T[]} array 
   * @param {T | T[]} allValues 
   * @returns 
   */
   static IncludesAll(array, allValues){
    allValues = this.Ensure(allValues);
    return _.every(allValues, o => array.includes(o));
  }

  /**
   * array contains at least one of value provided
   * @template T
   * @param {T[]} array 
   * @param {T | T[]} allValues 
   * @returns 
   */
  static IncludesEither(array, allValues){
    allValues = this.Ensure(allValues);
    return _.some(allValues, o => array.includes(o));
  }

  /**
   * array missing all values provided
   * @template T
   * @param {T[]} array 
   * @param {T | T[]} allValues 
   * @returns 
   */
  static MissingAll(array, allValues){
    allValues = this.Ensure(allValues);
    return _.every(allValues, o => !array.includes(o));
  }

  /**
   * array missing some of the values provided
   * @template T
   * @param {T[]} array 
   * @param {T | T[]} allValues 
   * @returns 
   */
  static MissingEither(array, allValues){
    allValues = this.Ensure(allValues);
    return _.some(allValues, o => !array.includes(o));
  }

  /**
   * @template T
   * @param {T} newArray 
   * @param {T} oldArray 
   * @param {String} accessor 
   * @param {{
   *  Added: *[],
   *  Removed: *[]
   * }}
   */
  static GetDifference(newArray, oldArray, accessor = ""){
    let newIDs = _.map(newArray, o => _.isEmpty(accessor)? o : Accessor.Get(o, accessor));
    let oldIDs = _.map(oldArray, o => _.isEmpty(accessor)? o : Accessor.Get(o, accessor));

    let Added = [];
    let Removed = [];

    _.map(newIDs, (o, i) => {
      if(!oldIDs.includes(o)){
        Added.push(o);
      }
    });
  
    _.map(oldIDs, (o, i) => {
      if(!newIDs.includes(o)){
        Removed.push(o);
      }
    });

    return {
      Added,
      Removed
    };
  }

  /**
   * 
   * @param {*[]} arr 
   * @param {Number} oldIndex 
   * @param {Number} newIndex 
   * @returns 
   */
   static Move(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  }

}

module.exports = ZArray;