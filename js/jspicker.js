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
                if (thisUtils.isPlainObject(data)) {
                    var dotName = pathArray.shift();
                    var reg = /\(([^\)]*)\)/g;
                    var matched = reg.exec(dotName);
                    if(matched){
                        var arr = matched[1].split('|');
                        var t = {};
                        while(arr.length) {
                            var k = arr.shift();
                            var v = null;
                            if (pathArray.length){
                                v = innerPick(data[k], pathArray);
                            } else {
                                v = data[k];
                            }
                            if (v) {
                                t[k] = v;
                            }
                        }
                        return Object.keys(t).length ? t : null;
                    } else {
                        if (data[dotName]) {
                            if (pathArray.length) {
                                return innerPick(data[dotName], pathArray);
                            } else {
                                var ret  = {};
                                ret[dotName] = data[dotName];
                                return ret;
                            }
                        } else {
                            return null;
                        }
                    }
                } else if (thisUtils.isArray(data)) {
                    var items = [];
                    data.forEach(function (item) {
                        var result = innerPick(item, pathArray.slice());
                        if(result != null) {
                            items.push(result);
                        }
                    });
                    return items.length ? items : null;
                } else {
                    if(pathArray.length){
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