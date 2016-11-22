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
        startsWith: function startsWith(str, prefix) {
            if (!this.isString(str)) {
                return false;
            }
            if (!this.isString(str)) {
                return false;
            }
            if (str.startsWith) {
                return str.startsWith(prefix);
            }
            return str[0] === prefix;
        },
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
        _cache: {},
        clearCache: function () {
            this._cache = {};
        },
        transform: function (data, dataTpl) {
            if (!utils.isPlainObject(data) && !utils.isArray(data)) {
                throw new TypeError('parameter type error: transform data should be a plain object or array!');
            }

            if (!utils.isPlainObject(dataTpl) && !utils.isArray(dataTpl)) {
                throw new TypeError('parameter type error: transform dataTpl should be a plain object or array!');
            }

            var thisJsonPicker = this;
            var pathFormat = /{{(\s*([*|\S]+)*\s*)}}/;

            function pickData(key, value) {
                var path = '';
                var pickedData = null;
                var canEvalValue = false;
                var searchPathResult = pathFormat.exec(value);
                if (searchPathResult) {
                    path = searchPathResult[2];
                    if (utils.startsWith(path, '*')) {
                        canEvalValue = true;
                        path = path.substring(1);
                    }
                    pickedData = thisJsonPicker.pick(data, path);
                    if (canEvalValue && pickedData && utils.isPlainObject(pickedData) && key in pickedData) {
                        return pickedData[key];
                    }
                    return pickedData;
                }
                return value;
            }

            function innerTransform(tData) {
                if (utils.isPlainObject(tData)) {
                    var innerData = {};
                    for (var key in tData) {
                        if (tData.hasOwnProperty(key)) {
                            var value = tData[key];
                            if (utils.isString(value)) {
                                innerData[key] = pickData(key, value);
                            } else {
                                innerData[key] = innerTransform(value);
                            }
                        }
                    }
                    return innerData;
                } else if(utils.isArray(tData)) {
                    var innerArray = [];
                    tData.forEach(function forEach(item) {
                        innerArray.push(innerTransform(item));
                    });
                    return innerArray;
                } else {
                    return tData;
                }
            }

            return innerTransform(dataTpl);
        },
        pick: function pick(data, pathStr) {
            if (!utils.isPlainObject(data) && !utils.isArray(data)) {
                throw new TypeError('parameter type error: pick data should be a plain object or array!');
            }
            if (!utils.isString(pathStr)) {
                throw new TypeError('parameter type error: pick path must be a string type!');
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
                        var subNameValueReg = /\|?([_0-9a-zA-Z-]+)\s*=?\s*([_0-9a-zA-Z-]*)/g;
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