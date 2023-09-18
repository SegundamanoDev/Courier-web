const _ = require("lodash");

class Accessor {

  /**
   * 
   * @param {*} obj 
   * @param {String} accessor 
   * @returns 
   */
  static Has(obj, accessor){
    return !(this.Get(obj, accessor, undefined) === undefined);
  }

  /**
   * Get content by "xxx.xxx.xxx" instead of o[xxx][xxx][xxx]
   * @param {*} obj 
   * @param {String} accessor 
   */
  static Get(obj, accessor, nullValue = undefined){
    if(accessor === "") return obj;
    if(!accessor || !obj) 
      return nullValue;
    
    let fields = accessor.split(".");
    let rtn = obj;

    for(let i=0; i<fields.length; i++){
      if(rtn === null || rtn === undefined) return nullValue;
      rtn = rtn[fields[i]];
    }

    return rtn;
  }

  /**
   * Set content by "xxx.xxx.xxx" instead of o[xxx][xxx][xxx]
   * @param {*} obj 
   * @param {String} accessor 
   * @param {*} value 
   */
  static Set(obj, accessor, value){
    if (typeof accessor === "string"){
      return this.Set(obj, accessor.split("."), value);
    }else if (accessor.length === 1){
      if(value === undefined){
        if(obj[accessor[0]]){
          delete obj[accessor[0]];
        }
      }else{
        obj[accessor[0]] = value;
        return obj;
      }
    }else if (accessor.length === 0){
      return obj;
    }else{
      if(!obj[accessor[0]]) {
        if(accessor.length > 1 && accessor[1] === "0"){
          obj[accessor[0]] = [];
        }else{
          obj[accessor[0]] = {};
        }
      }
      return this.Set(obj[accessor[0]], accessor.slice(1), value);
    }
  }

  /**
   * Delete the field
   * @param {*} obj 
   * @param {String} accessor 
   */
  static Delete(obj, accessor){
    this.Set(obj, accessor, undefined);
  }

  /**
   * 
   * @param {*} obj1 
   * @param {*} obj2 
   * @param {String[]} fields
   */
  static IsIdentical(obj1, obj2, fields = null){
    if(fields && fields.length){
      for(var i=0; i<fields.length; i++){
        let v1 = this.Get(obj1, fields[i]);
        let v2 = this.Get(obj2, fields[i]);
        if(!_.isEqual(v1, v2) && !(_.isEmpty(v1) && _.isEmpty(v2))){
          return false;
        } 
      }
      return true;
    }

    return _.isEqual(obj1, obj2);
  }

  /**
   * Compare using Key Value Pairs Transform
   * @param {*} obj1 
   * @param {*} obj2 
   * @returns 
   */
  static IsIdenticalQUICK(obj1, obj2){
    let keyvaluepairsObj1 = this.NestedToKeyValuePairs(obj1, false);
    let keyvaluepairsObj2 = this.NestedToKeyValuePairs(obj2, false);
    let keysObj1 = _.map(keyvaluepairsObj1, (o, i) => i);
    let keysObj2 = _.map(keyvaluepairsObj2, (o, i) => i);
    let allKeys = _.uniq([...keysObj1, ...keysObj2]);

    for(let i=0; i < allKeys.length; i++){
      let o = allKeys[i];
      let v1 = keyvaluepairsObj1[o];
      let v2 = keyvaluepairsObj2[o];
      if(!_.isEqual(v1, v2)){
        return false;
      }
    }
    return true;
  }

  /**
   * 
   * @param {*} obj 
   * @param {String[]} exclude 
   * @returns 
   */
  static Exclude(obj, exclude){
    let filtered = Object.keys(obj)
      .filter(o => !exclude.includes(o))
      .reduce((o, i) => {
        let value = Accessor.Get(obj, i);
        Accessor.Set(o, i, value);
        return o;
      }, {});

    return filtered;
  }

  /**
   * @param {*} obj 
   * @param {String[]} include 
   * @returns 
   */
  static Remain(obj, include){
    let filtered = Object.keys(obj)
      .filter(o => include.includes(o))
      .reduce((o, i) => {
        let value = Accessor.Get(obj, i);
        Accessor.Set(o, i, value);
        return o;
      }, {});

    return filtered;
  }

  /**
   * 
   * @param {*} obj 
   * @returns 
   */
  static isDeepEmpty(obj){
    if(_.isObject(obj)) {
      if(Object.keys(obj).length === 0) return true;
      return _.every(_.map(obj, v => this.isDeepEmpty(v)));
    } else if(_.isString(obj)) {
      return !obj.length;
    }
    return false;
  }

  /**
   * Parse a nested object to one-level { [path]: value, ... } path-value object 
   * @param {*} obj original object
   * @param {Boolean} skipArray stop parsing array, keep the array as value
   * @param {String} stopFieldName stop parsing, keep the object as value
   * @param {String} iname  runtime 
   * @param {*} kvPairs runtime 
   * @returns 
   */
  static NestedToKeyValuePairs(obj, skipArray = true, stopFieldName = "", iname = "", kvPairs = {}){
    if(_.isArray(obj)){
      if(skipArray){
        kvPairs[iname] = obj;
      }else{
        _.map(obj, (o, i) => {
          let key = (iname === ""? "" : iname + ".") + i;
          this.NestedToKeyValuePairs(o, skipArray, stopFieldName, key, kvPairs);
        });
      }
    }else if(_.isObject(obj)){
      _.map(Object.keys(obj), (o, i) => {
        if(!_.isEmpty(stopFieldName) && stopFieldName === o){
          let layerO = this.Get(obj, o);
          let key = (iname === ""? "" : iname + ".") + o;
          kvPairs[key] = layerO;
        }else{
          let layerO = this.Get(obj, o);
          let key = (iname === ""? "" : iname + ".") + o;
          this.NestedToKeyValuePairs(layerO, skipArray, stopFieldName, key, kvPairs);
        }
      });
    }else{
      kvPairs[iname] = obj;
    }
    return kvPairs;
  }

  /**
   * Parse a key-value pairs object to nested object
   * @param {Object.<string, *>} kvPairs 
   * @returns 
   */
  static KeyValuePairsToNested(kvPairs){
    let rtn = {};
    _.map(kvPairs, (o, i) => {
      this.Set(rtn, i, o);
    });
    return rtn;
  }

  /**
   * replacing object 
   * @template T
   * @param {T} oldO 
   * @param {T} newO 
   * @param {Boolean} skipArray 
   */
  static DeepReplace(oldO, newO, skipArray = true){
    let kvPairs = this.NestedToKeyValuePairs(newO, skipArray);
    _.map(kvPairs, (o, i) => {
      this.Set(oldO, i, o);
    });
    return oldO;
  }

  /**
   * Merge only to template format, keep if field exists
   * @param {*} existing 
   * @param {*} template 
   * @param {Boolean} skipArray 
   */
  static FormatMerge(existing, template, skipArray = true){
    let kvPairs = this.NestedToKeyValuePairs(template, skipArray);
    let obj = _.cloneDeep(template);
    _.map(kvPairs, (o, i) => {
      let existingValue = this.Get(existing, i, o);
      if(existingValue){
        this.Set(obj, i, existingValue);
      }
    });
    return obj;
  }

  /**
   * Extract all the path that contains the field with fieldName 
   * Use with CAUTION!!! It will get ALL the field with the SAME fieldName no matter which level.
   * It is for dynamic structural objects.
   * If you have a clear schema on the object, use Accessor.Get is already very enough.
   * @param {*} obj 
   * @param {String} fieldName 
   * @returns 
   */
  static ExtractSpecificFieldName(obj, fieldName){
    let rtn = [];
    let keypairs = this.NestedToKeyValuePairs(obj, false, fieldName);
    _.map(keypairs, (o, i) => {
      let fields = i.split(".");
      if(fields.includes(fieldName)){
        rtn.push(i);
      }
    });
    return rtn;
  }

  /**
   * Check if all values is defined
   * @param  {...any} values 
   */
  static NoUndefined(...values){
    for(const o in values){
      if(_.isUndefined(o)) 
        return false;
    }
    return true;
  }

}

module.exports = Accessor;