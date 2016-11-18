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
        }
    };
    return Utils;
}));