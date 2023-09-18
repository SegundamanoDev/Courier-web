const moment = require("moment");
require("moment-timezone");
const axios = require("axios");

const Chalk = require("./Chalk/Chalk");

class ZTime {

  /**
   * @typedef {moment.Moment | String} time
   */

  static dayOfWeekDis = {
    EN: {
      OneLetter: ["S", "M", "T", "W", "T", "F", "S"],
      Short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      Full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    TC: {
      OneLetter: ["日", "一", "二", "三", "四", "五", "六"],
      Short: ["日", "一", "二", "三", "四", "五", "六"],
      Full: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    },
    SC: {
      OneLetter: ["日", "一", "二", "三", "四", "五", "六"],
      Short: ["日", "一", "二", "三", "四", "五", "六"],
      Full: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    },
    JP: {
      OneLetter: ["日", "月", "火", "水", "木", "金", "土"],
      Short: ["日", "月", "火", "水", "木", "金", "土"],
      Full: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    },
    KO: {
      OneLetter: ["일", "월", "화", "수", "목", "금", "토"],
      Short: ["일", "월", "화", "수", "목", "금", "토"],
      Full: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    }
  };

  static monthDis = {
    EN: {
      Short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      Full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    TC: {
      Short: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
      Full: ["一月",  "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    SC: {
      Short: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
      Full: ["一月",  "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    JP: {
      Short: ["いち", "に", "さん", "し", "ご", "ろく", "しち", "はち", "く", "じゅう", "じゅういち", "じゅうに"],
      Full: ["いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ", "しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ"]
    },
    JPO: {
      Short: ["むつき", "きさらぎ", "やよい", "うづき", "さつき", "みなづき", "ふみづき", "はづき", "ながつき", "かんなづき", "しもつき", "しわす"],
      Full: ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"]
    },
    KO: {
      Short: ["일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십", "십일", "십이"],
      Full: ["일월", "이월", "삼월", "사월", "오월", "육월", "칠월", "팔월", "구월", "십월", "십일월", "십이월"]
    }
  };

  /**
   *  Return time difference
   * @param {time} from 
   * @param {time} to 
   * @param {moment.unitOfTime.Diff} unit 
   */
  static Difference(from, to, unit){
    let momentFrom = this.Moment(from);
    let momentTo = this.Moment(to);
    return momentTo.diff(momentFrom, unit);
  }

  /**
   * Check if two time range overlap
   * @param {time} from1
   * @param {time} to1 
   * @param {time} from2 
   * @param {time} to2 
   * @param {"[)" | "[]" | "(]" | "()"} inclusivity 
   */
  static IsOverlap(from1, to1, from2, to2, inclusivity = "[]"){
    let _from1 = this.Moment(from1);
    let _to1 = this.Moment(to1);
    let _from2 = this.Moment(from2);
    let _to2 = this.Moment(to2);
    switch(inclusivity){
      case "()":
        return _from2.isBefore(_to1) && _to2.isAfter(_from1);
      case "(]":
        return _from2.isBefore(_to1) && _to2.isSameOrAfter(_from1);
      case "[)":
        return _from2.isSameOrBefore(_to1) && _to2.isAfter(_from1);
      case "[]": default:
        return _from2.isSameOrBefore(_to1) && _to2.isSameOrAfter(_from1);
    }
  }

  /**
   * Get Current ZTime Moment
   * @returns {moment.Moment}
   */
  static Now(){
    return new moment();
  }

  /**
   * 
   * @param {*} obj 
   */
  static IsMoment(obj){
    return moment.isMoment(obj);
  }

  /**
   * 
   * @param {String} str 
   * @param {String} format 
   */
  static Parse(str, format){
    return moment(str, format);
  }

  /**
   * 
   * @param {time} momentO 
   * @param {Number} amount 
   * @param {moment.unitOfTime.DurationConstructor} unit
   * @param {Number} utcOffset 
   * @returns 
   */
  static Add(momentO = this.Now(), amount, unit = "days", utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).add(amount, unit);
  }

  /**
   * Get Start Of Year
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static StartOfYear(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).startOf("year");
  }

  /**
   * Get End of Year
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static EndOfYear(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).endOf("year");
  }

  /**
   * Get Start of Month
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static StartOfMonth(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).startOf("month");
  }

  /**
   * Get End of Month
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static EndOfMonth(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).endOf("month");
  }

  /**
   * Get Start of Week
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static StartOfWeek(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).startOf("week");
  }

  /**
   * Get End of Week
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static EndOfWeek(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).endOf("week");
  }

  /**
   * Get Start of Day
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static StartOfDay(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).startOf("day");
  }

  /**
   * Get End of Day
   * @param {time} momentO 
   * @param {Number} utcOffset 
   */
  static EndOfDay(momentO = this.Now(), utcOffset = 8){
    let m = this.Moment(momentO);
    if(!m) return null;
    return m.utcOffset(utcOffset).endOf("day");
  }

  /**
   * Check if the date is between a and b
   * @param {time} momentO 
   * @param {time} a 
   * @param {time} b 
   * @param {"[)" | "[]" | "(]" | "()"} inclusivity 
   * @param {String} unit 
   */
  static IsBetween(momentO, a, b, inclusivity = "[)", unit = null){
    let m = this.Moment(momentO);
    if(!m) return false;
    let ma = this.Moment(a);
    if(!ma) return false;
    let mb = this.Moment(b);
    if(!mb) return false;
    return m.isBetween(ma, mb, unit, inclusivity);
  }

  /**
   * 
   * @param {time} compareA 
   * @param {time} compareB 
   */
  static IsBefore(compareA, compareB){
    let a = this.Moment(compareA);
    let b = this.Moment(compareB);
    return a.isBefore(b);
  }

  /**
   * Check now if it is before
   * @param {time} compare 
   */
  static NowIsBefore(compare){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().isBefore(c);
  }

  /**
   * 
   * @param {time} compareA 
   * @param {time} compareB 
   */
  static IsAfter(compareA, compareB){
    let a = this.Moment(compareA);
    let b = this.Moment(compareB);
    return a.isAfter(b);
  }

  /**
   * Check now if it is after
   * @param {time} compare 
   */
  static NowIsAfter(compare){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().isAfter(c);
  }

  /**
   * 
   * @param {time} compareA 
   * @param {time} compareB 
   */
  static IsSameOrBefore(compareA, compareB){
    let a = this.Moment(compareA);
    let b = this.Moment(compareB);
    return a.isSameOrBefore(b);
  }

  /**
   * Check now if it is before or same as
   * @param {time} compare 
   */
  static NowIsSameOrBefore(compare){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().isSameOrBefore(c);
  }

  /**
   * 
   * @param {time} compareA 
   * @param {time} compareB 
   */
  static IsSameOrAfter(compareA, compareB){
    let a = this.Moment(compareA);
    let b = this.Moment(compareB);
    return a.isSameOrAfter(b);
  }

  /**
   * Check now if it is after or same as
   * @param {time} compare 
   */
  static NowIsSameOrAfter(compare){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().isSameOrAfter(c);
  }

  /**
   * Check now if it is between
   * @param {time} compare 
   */
  static NowIsBetween(compareA, compareB){
    let ca = this.Moment(compareA);
    if(!ca) return false;
    let cb = this.Moment(compareB);
    if(!cb) return false;
    return moment().isBetween(ca, cb);
  } 

  /**
   * 
   * @param {time} compareA 
   * @param {time} compareB 
   */
  static IsSame(compareA, compareB){
    let a = this.Moment(compareA);
    let b = this.Moment(compareB);
    return a.isSame(b);
  }

  /**
   * Check now if it is same as
   * @param {time} compare 
   */
  static NowIsSame(compare){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().isSame(c);
  } 

  /**
   * 
   * @param {time} timeStr 
   */
  static Moment(timeStr){
    if(!moment.isMoment(timeStr)){
      try{
        return moment(timeStr);
      }catch(e){
        console.error(Chalk.Log("[x] ZTime :: Moment Converting Error (" + timeStr + "): "), e);
        return null;
      }
    }
    return timeStr;
  }

  /**
   * Return lapsed time
   * @param {time} compare 
   * @param {String} unit
   * @param {Boolean} precise
   */
  static Lapse(compare, unit = "seconds", precise = true, fixed = 3){
    let c = this.Moment(compare);
    if(!c) return false;
    return moment().diff(c, unit, precise).toFixed(fixed);
  }

  /**
   * Output locale month
   * @param {time} momentO 
   * @param {String} lang 
   * @param {Boolean} full 
   */
  static Month(momentO = this.Now(), lang = "EN", full = false){
    let translate = this.monthDis;

    let m = this.Moment(momentO);
    if(!m) return "";

    let month = m.month();
    if(full){
      return translate[lang].Full[month];
    }else{
      return translate[lang].Short[month];
    }

  }

  /**
   * Output locale day of week
   * @param {time} momentO 
   * @param {String} lang 
   * @param {Boolean} full 
   */
  static DayOfWeek(momentO = this.Now(), lang = "EN", full = false){
    let translate = this.dayOfWeekDis;

    let m = this.Moment(momentO);
    if(!m) return "";

    let day = m.day();

    if(full){
      return translate[lang].Full[day];
    }else{
      return translate[lang].Short[day];
    }
  }

  /**
   * Extract Only hour
   * @param {time} momentO 
   */
   static Hour(momentO = this.Now()){
    let m = this.Moment(momentO);
    if(!m) return "";
    return m.format("H");
  }
  
  /**
   * Extract Only time
   * @param {time} momentO 
   */
  static Time(momentO = this.Now()){
    let m = this.Moment(momentO);
    if(!m) return "";
    return m.format("HH:mm");
  }

  /**
   * Extract Only date
   * @param {time} momentO 
   */
  static Date(momentO = this.Now()){
    let m = this.Moment(momentO);
    if(!m) return "";
    return m.format("YYYY-MM-DD");
  }

  /**
   * Check if it is a holiday
   * @param {String[]} phList 
   * @param {time} momentO 
   */
  static IsPublicHoliday(phList, momentO = this.Now()){
    let m = this.Moment(momentO);
    if(!m) return false;
    let date = this.Date(m);
    return phList.includes(date);
  }

  /**
   * Get Public Holiday List from government source
   */
  static async GetPublicHolidayList(){
    try{
      let res = await axios.get("http://www.1823.gov.hk/common/ical/en.ics");
      let data = res.data;
      const regex = /DTSTART;VALUE=DATE:(\d*)/g;
      let phList = [];

      let result;
      regex.lastIndex = 0;
      while ((result = regex.exec(data)) != null) {
        phList.push(moment(result[1], "YYYYMMDD").format("YYYY-MM-DD"));
      }
      return phList;
    }catch(e){
      console.log(Chalk.Log("[!] Cannot Get Holiday Information."));
      return [];
    }
  }

  /**
   * 
   * @param {time} momentO 
   * @returns 
   */
  static ToHKT(momentO = this.Now()){
    let m = this.Moment(momentO);
    let hkt = m.tz("Asia/Hong_Kong");
    return hkt;
  }

  /**
   * 
   * @param {time} momentO 
   * @param {Number} dayOfWeek 
   */
  static GetFirstDayOfWeekInMonth(momentO = this.Now(), dayOfWeek = 0){
    let StartOfMonth = this.StartOfMonth(momentO);
    let curDay = StartOfMonth;
    let curDayOfWeek = curDay.day();
    while(curDayOfWeek !== dayOfWeek){
      curDay = this.Add(curDay, 1, "days");
      curDayOfWeek = curDay.day();
    }
    return curDay;
  }

  /**
   * 
   * @param {time} momentO 
   * @returns 
   */
  static DescriptiveFromNowLocale(momentO){
    let m = this.Moment(momentO);
    if(!m) return "";
    let now = this.Now();
    let sec = this.Difference(m, now, "seconds");
    if(sec < 60){
      return {
        EN: "Just now",
        TC: "剛剛"
      };
    }
    let min = this.Difference(m, now, "minutes");
    if(min < 60){
      return {
        EN: min + (min === 1? " minute" : " minutes") + " ago",
        TC: min + " 分鐘之前"
      };
    }
    let hrs = this.Difference(m, now, "hours");
    if(hrs < 24){
      return {
        EN: hrs + (hrs === 1? " hour" : " hours") + " ago",
        TC: hrs + " 小時之前"
      };
    }
    let days = this.Difference(m, now, "days");
    if(days < 30){
      return {
        EN: days + (days === 1? " day" : " days") + " ago",
        TC: days + " 日之前"
      };
    }
    let mths = this.Difference(m, now, "months");
    if(mths < 30){
      return {
        EN: mths + (mths === 1? " month" : " months") + "  ago",
        TC: mths + " 月之前"
      };
    }
    return {
      EN: "long time ago",
      TC: "很久之前"
    };
  }

  /**
   * 
   * @param {time} momentO 
   * @param {moment.MomentFormatSpecification} format
   * @param {String} lang
   * @returns 
   */
  static Locale(momentO, format = "LLL (ddd)", lang = "TC"){
    let m = this.Moment(momentO);
    if(!m) return "";
    if(lang === "TC") 
      moment.locale("zh-hk");
    else 
      moment.locale("en-gb");

    let str = m.format(format);
    return str;
  }

}

module.exports = ZTime;