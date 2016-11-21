(function (root, factory) {
    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {

        // Node, CommonJS之类的
        module.exports = factory();
    } else {

        // 浏览器全局变量(root 即 window)
        root.jsonPicker = factory();
    }
}(this, function () {
    var utils = {
        trimRight: function trimRight(innerStr, keyWord) {
            var escapedWord = keyWord.replace(/([\[\]\/.()])/g, '\\$1');
            var reg = new RegExp(escapedWord + '\\s*$');
            return innerStr.replace(reg, '');
        },
        trimLeft: function trimLeft(innerStr, keyWord) {
            var escapedWord = keyWord.replace(/([\[\]\/.()])/g, '\\$1');
            var reg = new RegExp('^\\s*' + escapedWord);
            return innerStr.replace(reg, '');
        },
        trim: function trim(innerStr, keyWord) {
            var str = this.trimLeft(innerStr, keyWord);
            str = this.trimRight(str, keyWord);
            return str;
        },
        isArray: function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        isPlainObject: function isPlainObject(obj) {
            return !!obj && Object.prototype.toString.call(obj) === '[object Object]';
        },
        isString: function isPlainObject(obj) {
            return Object.prototype.toString.call(obj) === '[object String]';
        }
    };

    var jsonPicker = {
        pick: function pick(data, pathStr) {
            if (!utils.isPlainObject(data)) {
                throw new TypeError('parameter type error: search data should be a plain object!');
            }
            if (!utils.isString(pathStr)) {
                throw new TypeError('parameter type error: search path must be a string type!');
            }
            var path = utils.trim(pathStr, '.');
            var pathArray = path.split('.');
            function innerPick(data, pathArray) {
                var hasSubPath = !!pathArray.length;
                if (utils.isPlainObject(data)) {
                    var tmp = {};
                    var curPathName = pathArray.shift();
                    hasSubPath = !!pathArray.length;
                    var hasParenthesis =  /\([^\)]*\)/.test(curPathName);
                    if(hasParenthesis){
                        var arr = null;
                        var subNameValueReg = /([_0-9a-zA-Z-]+)\s*=?\s*([_0-9a-zA-Z-]*)/g;
                        arr = subNameValueReg.exec(curPathName);
                        while(arr) {
                            var pathName = arr[1];
                            var newPathName = arr[2];
                            newPathName = newPathName ? newPathName : pathName;
                            var subPathValue = null;
                            if (hasSubPath){
                                subPathValue = innerPick(data[pathName], pathArray.slice());
                                subPathValue && (tmp[newPathName] = subPathValue);
                            } else if (pathName in data) {
                                tmp[newPathName] = data[pathName];
                            }
                            arr = subNameValueReg.exec(curPathName);
                        }
                        return Object.keys(tmp).length ? tmp : null;
                    } else {
                        if (curPathName in data) {
                            if (hasSubPath) {
                                return innerPick(data[curPathName], pathArray);
                            } else {
                                tmp[curPathName] = data[curPathName];
                                return tmp;
                            }
                        } else {
                            return null;
                        }
                    }
                } else if (utils.isArray(data)) {
                    var items = [];
                    data.forEach(function forEach(item) {
                        var result = innerPick(item, pathArray.slice());
                        if(result != null) {
                            items.push(result);
                        }
                    });
                    return items.length ? items : null;
                } else {
                    if(hasSubPath){
                        return null;
                    }
                    return data;
                }
            }
            return innerPick(data, pathArray);
        }
    };
    return jsonPicker;
}));