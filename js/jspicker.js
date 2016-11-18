(function (root, factory) {
    if (typeof define === 'function' && define.amd) {

        // AMD
        define(['utils'], factory);
    } else if (typeof exports === 'object') {

        // Node, CommonJS之类的
        module.exports = factory(require('utils'));
    } else {

        // 浏览器全局变量(root 即 window)
        root.jsPicker = factory(root.Utils);
    }
}(this, function (Utils) {
    var thisUtils = Utils;
    var jsPicker = {
        pick: function pick(data, pathStr) {
            var path = thisUtils.trim(pathStr, '.');
            var pathArray = path.split('.');
            function innerPick(data, pathArray) {
                var hasSubPath = !!pathArray.length;
                if (thisUtils.isPlainObject(data)) {
                    var tmp = {};
                    var curPathName = pathArray.shift();
                    hasSubPath = !!pathArray.length;
                    var parenthesisRegExp = /\(([^\)]*)\)/;
                    var matched = parenthesisRegExp.exec(curPathName);
                    if(matched){
                        var arr = matched[1].split('|');
                        while(arr.length) {
                            var subPathName = arr.shift();
                            var subPathValue = null;
                            if (hasSubPath){
                                subPathValue = innerPick(data[subPathName], pathArray.slice());
                                subPathValue && (tmp[subPathName] = subPathValue);
                            } else {
                                tmp[subPathName] = data[subPathName];
                            }
                        }
                        return Object.keys(tmp).length ? tmp : null;
                    } else {
                        if (data[curPathName]) {
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
                } else if (thisUtils.isArray(data)) {
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
    return jsPicker;
}));