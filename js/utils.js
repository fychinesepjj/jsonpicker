(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        
        // AMD
        define([], factory);

    } else if (typeof exports === 'object') {

        // Node, CommonJS之类的
        module.exports = factory();

    } else {

        // 浏览器全局变量(root 即 window)
        root.Utils = factory();
    }

}(this, function () {
    var Utils = {
        trimRight: function trimRight(innerStr, keyWord) {
            var replaceWord = keyWord.replace('.', '\\.').replace('/', '\\/');
            var reg = new RegExp(replaceWord + '\\s*$');
            return innerStr.replace(reg, '');
        },
        trimLeft: function trimLeft(innerStr, keyWord) {
            var replaceWord = keyWord.replace('.', '\\.').replace('/', '\\/');
            var reg = new RegExp('^\\s*' + replaceWord);
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
        assign: function assign() {
            if (Object.assign) {
                return Object.assign.apply(Object, arguments);
            }
            var extend,
                _extend,
                _isObject;
            _isObject = function(o){
                return Object.prototype.toString.call(o) === '[object Object]';
            }

            _extend = function self(destination, source){
                for (var property in source) {
                    if (source.hasOwnProperty(property)) {

                        // 若sourc[property]是对象，则递归
                        if (_isObject(source[property])) {

                            // 若destination没有property，赋值空对象
                            if (!destination.hasOwnProperty(property)) {
                                destination[property] = {};
                            };

                            // 对destination[property]不是对象，赋值空对象
                            if (!_isObject(destination[property])) {
                                destination[property] = {};
                            };

                            // 递归
                            self(destination[property], source[property]);
                        } else {
                            destination[property] = source[property];
                        };
                    }
                }
            }
            var arr = arguments,
                result = {},
                i;

            if (!arr.length) return {};

            for (i = 0; i < arr.length; i++) {
                if (_isObject(arr[i])) {
                    _extend(result, arr[i])
                };
            }

            arr[0] = result;
            return result;
        }
    };
    return Utils;
}));