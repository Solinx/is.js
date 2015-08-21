// is.js 0.7.4
// Author: Aras Atasaygin

// AMD with global, Node, or global
;(function(root, factory) {
    if(typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['is'], function(is) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.is = factory(is));
        });
    } else if(typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('is_js'));
    } else {
        // Browser globals (root is window)
        root.is = factory(root.is);
    }
} (this, function(is) {

    // Baseline
    /* -------------------------------------------------------------------------- */

    var root = this || global;
    var previousIs = root.is;

    // define 'is' object and current version
    is = {};
    is.VERSION = '0.7.4';

    // define interfaces
    is.not = {};
    is.all = {};
    is.any = {};

    // cache some methods to call later on
    var toString = Object.prototype.toString;
    var arraySlice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    // helper function which reverses the sense of predicate result
    function not(func) {
        return function() {
            return !func.apply(null, arraySlice.call(arguments));
        };
    }

    // helper function which call predicate function per parameter and return true if all pass
    function all(func) {
        return function() {
            var parameters = arraySlice.call(arguments);
            var length = parameters.length;
            if(length === 1 && is.array(parameters[0])) {    // support array
                parameters = parameters[0];
                length = parameters.length;
            }
            for (var i = 0; i < length; i++) {
                if (!func.call(null, parameters[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // helper function which call predicate function per parameter and return true if any pass
    function any(func) {
        return function() {
            var parameters = arraySlice.call(arguments);
            var length = parameters.length;
            if(length === 1 && is.array(parameters[0])) {    // support array
                parameters = parameters[0];
                length = parameters.length;
            }
            for (var i = 0; i < length; i++) {
                if (func.call(null, parameters[i])) {
                    return true;
                }
            }
            return false;
        };
    }

    // Type checks
    /* -------------------------------------------------------------------------- */

    // is a given value Arguments?
    is.arguments = function(value) {    // fallback check is for IE
        return is.not.null(value) && (toString.call(value) === '[object Arguments]' || (typeof value === 'object' && 'callee' in value));
    };

    // is a given value Array?
    is.array = Array.isArray || function(value) {    // check native isArray first
        return toString.call(value) === '[object Array]';
    };

    // is a given value Boolean?
    is.boolean = function(value) {
        return value === true || value === false || toString.call(value) === '[object Boolean]';
    };

    // is a given value Date Object?
    is.date = function(value) {
        return toString.call(value) === '[object Date]';
    };

    // is a given value Error object?
    is.error = function(value) {
        return toString.call(value) === '[object Error]';
    };

    // is a given value function?
    is.function = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Function]' || typeof value === 'function';
    };

    // is a given value NaN?
    is.nan = function(value) {    // NaN is number :) Also it is the only value which does not equal itself
        return value !== value;
    };

    // is a given value null?
    is.null = function(value) {
        return value === null;
    };

    // is a given value number?
    is.number = function(value) {
        return is.not.nan(value) && toString.call(value) === '[object Number]';
    };

    // is a given value object?
    is.object = function(value) {
        var type = typeof value;
        return type === 'function' || type === 'object' && !!value;
    };

    // is given value a pure JSON object?
    is.json = function(value) {
        return toString.call(value) === '[object Object]';
    };

    // is a given value RegExp?
    is.regexp = function(value) {
        return toString.call(value) === '[object RegExp]';
    };

    // are given values same type?
    // prevent NaN, Number same type check
    is.sameType = function(value1, value2) {
        if(is.nan(value1) || is.nan(value2)) {
            return is.nan(value1) === is.nan(value2);
        }
        return toString.call(value1) === toString.call(value2);
    };
    // sameType method does not support 'all' and 'any' interfaces
    is.sameType.api = ['not'];

    // is a given value String?
    is.string = function(value) {
        return toString.call(value) === '[object String]';
    };

    // is a given value Char?
    is.char = function(value) {
        return is.string(value) && value.length === 1;
    };

    // is a given value undefined?
    is.undefined = function(value) {
        return value === void 0;
    };

    // Presence checks
    /* -------------------------------------------------------------------------- */

    //is a given value empty? Objects, arrays, strings
    is.empty = function(value) {
        if(is.object(value)){
            var num = Object.getOwnPropertyNames(value).length;
            if(num === 0 || (num === 1 && is.array(value)) || (num === 2 && is.arguments(value))){
                return true;
            }
            return false;
        } else {
            return value === '';
        }
    };

    // is a given value existy?
    is.existy = function(value) {
        return value !== null && value !== undefined;
    };

    // is a given value truthy?
    is.truthy = function(value) {
        return is.existy(value) && value !== false && is.not.nan(value) && value !== "" && value !== 0;
    };

    // is a given value falsy?
    is.falsy = not(is.truthy);

    // is a given value space?
    // horizantal tab: 9, line feed: 10, vertical tab: 11, form feed: 12, carriage return: 13, space: 32
    is.space =  function(value) {
        if(is.char(value)) {
            var characterCode = value.charCodeAt(0);
            return (characterCode >  8 && characterCode < 14) || characterCode === 32;
        } else {
            return false;
        }
    };

    // Arithmetic checks
    /* -------------------------------------------------------------------------- */

    // are given values equal? supports numbers, strings, regexps, booleans
    // TODO: Add object and array support
    is.equal = function(value1, value2) {
        // check 0 and -0 equity with Infinity and -Infinity
        if(is.all.number(value1, value2)) {
            return value1 === value2 && 1 / value1 === 1 / value2;
        }
        // check regexps as strings too
        if(is.all.string(value1, value2) || is.all.regexp(value1, value2)) {
            return '' + value1 === '' + value2;
        }
        if(is.all.boolean(value1, value2)) {
            return value1 === value2;
        }
        return false;
    };
    // equal method does not support 'all' and 'any' interfaces
    is.equal.api = ['not'];

    // is a given number even?
    is.even = function(numb) {
        return is.number(numb) && numb % 2 === 0;
    };

    // is a given number odd?
    is.odd = function(numb) {
        return is.number(numb) && numb % 2 !== 0;
    };

    // is a given number positive?
    is.positive = function(numb) {
        return is.number(numb) && numb > 0;
    };

    // is a given number negative?
    is.negative = function(numb) {
        return is.number(numb) && numb < 0;
    };

    // is a given number above minimum parameter?
    is.above = function(numb, min) {
        return is.all.number(numb, min) && numb > min;
    };
    // above method does not support 'all' and 'any' interfaces
    is.above.api = ['not'];

    // is a given number above maximum parameter?
    is.under = function(numb, max) {
        return is.all.number(numb, max) && numb < max;
    };
    // least method does not support 'all' and 'any' interfaces
    is.under.api = ['not'];

    // is a given number within minimum and maximum parameters?
    is.within = function(numb, min, max) {
        return is.all.number(numb, min, max) && numb > min && numb < max;
    };
    // within method does not support 'all' and 'any' interfaces
    is.within.api = ['not'];

    // is a given number decimal?
    is.decimal = function(numb) {
        return is.number(numb) && numb % 1 !== 0;
    };

    // is a given number integer?
    is.integer = function(numb) {
        return is.number(numb) && numb % 1 === 0;
    };

    // is a given number finite?
    is.finite = isFinite || function(numb) {
        return numb !== Infinity && numb !== -Infinity && is.not.nan(numb);
    };

    // is a given number infinite?
    is.infinite = not(is.finite);

    // Regexp checks
    /* -------------------------------------------------------------------------- */
    // Steven Levithan, Jan Goyvaerts: Regular Expressions Cookbook
    // Scott Gonzalez: Email address validation

    // eppPhone match extensible provisioning protocol format
    // nanpPhone match north american number plan format
    // dateString match m/d/yy and mm/dd/yyyy, allowing any combination of one or two digits for the day and month, and two or four digits for the year
    // time match hours, minutes, and seconds, 24-hour clock
    var regexps = {
        alphaNumeric: /^[A-Za-z0-9]+$/,
        timeString: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
        dateString: /^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/,
        affirmative: /^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/,
    };

    // create regexp checks methods from 'regexp' object
    for(var regexp in regexps) {
        if(regexps.hasOwnProperty(regexp)) {
            regexpCheck(regexp, regexps);
        }
    }

    function regexpCheck(regexp, regexps) {
        is[regexp] = function(value) {
            return regexps[regexp].test(value);
        };
    }

    // String checks
    /* -------------------------------------------------------------------------- */

    // is a given string include parameter substring?
    is.include = function(str, substr) {
        return str.indexOf(substr) > -1;
    };
    // include method does not support 'all' and 'any' interfaces
    is.include.api = ['not'];

    // is a given string all uppercase?
    is.upperCase = function(str) {
        return is.string(str) && str === str.toUpperCase();
    };

    // is a given string all lowercase?
    is.lowerCase = function(str) {
        return is.string(str) && str === str.toLowerCase();
    };

    // is string start with a given startWith parameter?
    is.startWith = function(str, startWith) {
        return is.string(str) && str.indexOf(startWith) === 0;
    };
    // startWith method does not support 'all' and 'any' interfaces
    is.startWith.api = ['not'];

    // is string end with a given endWith parameter?
    is.endWith = function(str, endWith) {
        return is.string(str) && str.indexOf(endWith) > -1 && str.indexOf(endWith) === str.length -  endWith.length;
    };
    // endWith method does not support 'all' and 'any' interfaces
    is.endWith.api = ['not'];

    // is a given string or sentence capitalized?
    is.capitalized = function(str) {
        if(is.not.string(str)) {
            return false;
        }
        var words = str.split(' ');
        var capitalized = [];
        for(var i = 0; i < words.length; i++) {
            capitalized.push(words[i][0] === words[i][0].toUpperCase());
        }
        return is.all.truthy.apply(null, capitalized);
    };

    // is a given string palindrome?
    is.palindrome = function(str) {
        return is.string(str) && str == str.split('').reverse().join('');
    };


    // Object checks
    /* -------------------------------------------------------------------------- */

    // has a given object got parameterized count property?
    is.propertyCount = function(obj, count) {
        if(!is.object(obj) || !is.number(count)) {
            return false;
        }
        if(Object.keys) {
            return Object.keys(obj).length === count;
        }
        var properties = [],
            property;
        for(property in obj) {
            if (hasOwnProperty.call(obj, property)) {
                properties.push(property);
            }
        }
        return properties.length === count;
    };
    // propertyCount method does not support 'all' and 'any' interfaces
    is.propertyCount.api = ['not'];

    // is given object has parameterized property?
    is.propertyDefined = function(obj, property) {
        return is.object(obj) && is.string(property) && property in obj;
    };
    // propertyDefined method does not support 'all' and 'any' interfaces
    is.propertyDefined.api = ['not'];

    // is a given object window?
    // setInterval method is only available for window object
    is.windowObject = function(obj) {
        return typeof obj === 'object' && 'setInterval' in obj;
    };

    // is a given object a DOM node?
    is.domNode = function(obj) {
        return is.object(obj) && obj.nodeType > 0;
    };

    // Array checks
    /* -------------------------------------------------------------------------- */

    // is a given item in an array?
    is.inArray = function(val, arr){
        if(is.not.array(arr)) {
            return false;
        }
        for(var i = 0; i < arr.length; i++) {
            if (arr[i] === val) return true;
        }
        return false;
    };
    // inArray method does not support 'all' and 'any' interfaces
    is.inArray.api = ['not'];

    // is a given array sorted?
    is.sorted = function(arr) {
        if(is.not.array(arr)) {
            return false;
        }
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] > arr[i + 1]) return false;
        }
        return true;
    };

    // API
    // Set 'not', 'all' and 'any' interfaces to methods based on their api property
    /* -------------------------------------------------------------------------- */

    function setInterfaces() {
        var options = is;
        for(var option in options) {
            if(hasOwnProperty.call(options, option) && is.function(options[option])) {
                var interfaces = options[option].api || ['not', 'all', 'any'];
                for (var i = 0; i < interfaces.length; i++) {
                    if(interfaces[i] === 'not') {
                        is.not[option] = not(is[option]);
                    }
                    if(interfaces[i] === 'all') {
                        is.all[option] = all(is[option]);
                    }
                    if(interfaces[i] === 'any') {
                        is.any[option] = any(is[option]);
                    }
                }
            }
        }
    }
    setInterfaces();

    // Configuration methods
    // Intentionally added after setInterfaces function
    /* -------------------------------------------------------------------------- */

    // set optional regexps to methods if you think they suck
    is.setRegexp = function(regexp, regexpName) {
        for(var r in regexps) {
            if(hasOwnProperty.call(regexps, r) && (regexpName === r)) {
                regexps[r] = regexp;
            }
        }
    };

    // change namespace of library to prevent name collisions
    // var preferredName = is.setNamespace();
    // preferredName.odd(3);
    // => true
    is.setNamespace = function() {
        root.is = previousIs;
        return this;
    };

    return is;
}));
