var expect = chai.expect;
var jsonData = {
    "name": null,
    "age": "",
    "seller": "1000",
    "orderNo": "20161118945026",
    "totalmoney": "51.00",
    "methodType": [1, 3, 5, 7],
    "payMethod": {
        "detail": {
            "money": "47.20",
            "count": null,
            "name": "cash"
        },
        "method": {
            "name": "card"
        }
    },
    "goods": [
        {
            "id": 1,
            "name": "固定套餐",
            "price": "12.00",
            "count": 2,
            "money": "24.00",
            "items": [
                {
                    "name": "薯片",
                    "count": 2
                },
                {
                    "name": "雪碧",
                    "count": 2
                }
            ]
        },
        {
            "id": 4,
            "name": "薯片套餐",
            "price": "8.00",
            "count": 1,
            "money": "8.00",
            "items": [
                {
                    "name": "可乐",
                    "count": 1,
                    "price": 1.5
                }
            ]
        }
    ]
};

describe('js/jsonpicker.js - transform', function () {
    var jt = function jt(picker, data) {
        return function jtInner(tpl) {
            try {
                return picker.transform(data, tpl);
            } catch(e) {
                console.error('jsonPicker.transform exception: ' + e);
            }
        };
    };

    before(function () {
        jt = jt(jsonPicker, jsonData);
    });

    it('should give an exception when use invalid parameter', function() {
        expect(jsonPicker.transform).to.throw(TypeError, /parameter type error/);
        var invalidDataTest = function () {
            jsonPicker.transform(null, 'name');
        };
        var nullTplTest = function () {
            jsonPicker.transform({});
        };
        var invalidTplTest = function () {
            jsonPicker.transform({}, 123456);
        };
        var validTestObjData = function () {
            jsonPicker.transform({}, {});
        };
        var validTestArrData = function () {
            jsonPicker.transform([], []);
        };
        
        expect(invalidDataTest).to.throw(TypeError, /parameter type error/);
        expect(nullTplTest).to.throw(TypeError, /parameter type error/);
        expect(invalidTplTest).to.throw(TypeError, /parameter type error/);
        expect(validTestObjData).not.to.throw(TypeError, /parameter type error/);
        expect(validTestArrData).not.to.throw(TypeError, /parameter type error/); 
    });

    it('only transform formated data', function() {
        expect(jt({name: "abc"})).to.be.a('object')
            .that.have.property('name', 'abc');
        expect(jt({age: 123})).to.be.a('object')
            .that.have.property('age', 123);
        expect(jt({likes: [1, 2, 3, 4]})).to.be.a('object')
            .with.property('likes')
            .that.deep.equals([1, 2, 3, 4]);
        expect(jt({"detail": "{{ payMethod.detail }}"})).to.be.a('object')
            .with.property('detail')
                .with.property('detail')
                    .with.all.keys('money', 'count', 'name');      
    });

    it('should support array data', function() {
        expect(jsonPicker.transform(jsonData.goods, {ids: "{{*id}}"})).to.be.an('object')
            .with.property('ids')
                .have.lengthOf(2)
                .with.deep.property('[0]')
                .have.property('id')
                    .that.equals(1);
        
        // result is same to the previous example, the first example used * in tpl
        expect(jsonPicker.transform(jsonData.goods, {ids: "{{id}}"})).to.be.an('object')
            .with.property('ids')
                .have.lengthOf(2)
                .with.deep.property('[0]')
                .have.property('id')
                    .that.equals(1);
    });

    it('should support array tpl', function() {
        expect(jt([{seller: "{{orderNo}}"}, {name: "{{*name}}"}])).to.be.an('array')
            .that.have.lengthOf(2)
            .with.deep.property('[0]')
                .with.property('seller')
                    .with.property('orderNo')
                    .that.equals('20161118945026');

        expect(jt([{seller: "{{orderNo}}"}, {name: "{{*name}}"}])).to.be.an('array')
            .that.have.lengthOf(2)
            .with.deep.property('[1]')
                .with.property('name')
                .to.be.null;
    });

    it('should return inner data which have the same key to the outer data when use * in {{ }}', function() {
        expect(jt({"method": "{{ *payMethod.method }}"})).to.be.a('object')
            .with.property('method')
                .with.all.keys('name');
        expect(jt({"detailInner": "{{ *payMethod.(detail=detailInner) }}"})).to.be.a('object')
            .with.property('detailInner')
                .with.all.keys('money', 'count', 'name');
    });

});

describe('js/jsonpicker.js - pick', function () {
    var jp = function jp(picker, data) {
        return function jpInner(path) {
            try {
                return picker.pick(data, path);
            } catch(e) {
                console.error('jsonPicker.pick exception: ' + e);
            }
        };
    };

    before(function () {
        jp = jp(jsonPicker, jsonData);
    });

    it('should give an exception when use invalid parameter', function() {
        expect(jsonPicker.pick).to.throw(TypeError, /parameter type error/);
        var invalidDataTest = function () {
            jsonPicker.pick(null, 'name');
        };
        var nullPathTest = function () {
            jsonPicker.pick({});
        };
        var invalidPathTest = function () {
            jsonPicker.pick({}, 123456);
        };
        var validTestObjData = function () {
            jsonPicker.pick({}, '');
        };
        var validTestArrData = function () {
            jsonPicker.pick([], '');
        };
        expect(invalidDataTest).to.throw(TypeError, /parameter type error/);
        expect(nullPathTest).to.throw(TypeError, /parameter type error/);
        expect(invalidPathTest).to.throw(TypeError, /parameter type error/);
        expect(validTestObjData).not.to.throw(TypeError, /parameter type error/);
        expect(validTestArrData).not.to.throw(TypeError, /parameter type error/);
    });

    it('should return null when path do not exist', function() {
        expect(jp('fakeName')).to.be.a('null');
        expect(jp('payMethod.fakeName')).to.be.a('null');
        expect(jp('goods.fakeName')).to.be.a('null');
        // key is data[goods.fakeName] not data[fakeName]
        expect(jp('(goods.fakeName)')).to.be.a('null');
    });

    it('should return a object when path exist', function() {
        expect(jp('name')).to.be.a('object');
        expect(jp('age')).to.be.a('object');
        expect(jp('seller')).to.be.a('object');
        expect(jp('methodType')).to.be.a('object');
        expect(jp('payMethod')).to.be.a('object');
        expect(jp('payMethod.detail')).to.be.a('object');
        expect(jp('payMethod.detail.name')).to.be.a('object');
    });

    it('should return the last path object when use search path', function() {
        expect(jp('orderNo')).to.have.property('orderNo', '20161118945026');

        expect(jp('methodType')).to.have.property('methodType')
            .that.is.an('array')
            .that.have.lengthOf(4)
            .with.deep.property('[0]')
                .that.equals(1);

        expect(jp('payMethod')).to.have.property('payMethod')
            .that.is.an('object')
            .with.property('detail')
                .that.is.an('object');

        expect(jp('payMethod.detail')).to.have.property('detail')
            .that.is.an('object')
            .that.deep.equals({"money": "47.20", "count": null, "name": "cash"});

        expect(jp('goods')).to.have.property('goods')
            .that.is.an('array')
            .that.have.lengthOf(2)
            .with.deep.property('[1].id')
                .that.equals(4);

        expect(jp('goods.name')).to.be.a('array')
            .that.have.lengthOf(2)
            .with.deep.property('[0]')
                .with.property('name');

        expect(jp('goods.items')).to.be.a('array')
            .that.have.lengthOf(2)
            .with.deep.property('[0]')
                .that.is.an('object')
                .with.property('items')
                    .that.is.an('array')
                    .that.have.lengthOf(2);

        expect(jp('goods.items.name')).to.be.a('array')
            .that.have.lengthOf(2)
            .with.deep.property('[0]')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[0]')
                    .that.is.an('object')
                    .with.property('name');
    });

    it('should return the matched object when use parentheses', function() {
        // the same to jp('name')
        expect(jp('(name)')).to.be.a('object')
            .with.property('name');
            
        // the same to jp('payMethod.detail')
        expect(jp('payMethod.(detail)')).to.be.a('object')
            .with.property('detail');

        // the same to jp('payMethod.detail.name')
        expect(jp('payMethod.detail.(name)')).to.be.a('object')
            .with.property('name');
        
        // {"detail": {"name": "cash"}}
        expect(jp('payMethod.(detail).(name)')).to.be.a('object')
            .with.property('detail')
                .that.is.an('object')
                .with.property('name');
        
        // {"detail":{"name":"cash"},"method":{"name":"card"}}
        expect(jp('payMethod.(detail|method).name')).to.be.a('object')
            .with.all.keys('detail', 'method')
            .with.property('detail')
                .that.is.an('object')
                .with.property('name');
        
        // {"detail":{"name":"cash"},"method":{"name":"card"}}
        expect(jp('payMethod.(detail|method).name')).to.be.a('object')
            .with.all.keys('detail', 'method')
            .with.property('method')
                .that.is.an('object')
                .with.property('name');

        // {"detail":{"name":"cash", "count": 0},"method":{"name":"card"}}
        expect(jp('payMethod.(detail|method).(name|count)')).to.be.a('object')
            .with.all.keys('detail', 'method')
            .with.property('method')
                .that.is.an('object')
                .that.not.include.keys('count');
        
        // the same to jp('goods')
        expect(jp('(goods)')).to.be.a('object')
            .with.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2);

        // {"goods":[{"name":"固定套餐","items":[{"name":"薯片","count":2},{"name":"雪碧","count":2}]},{"name":"薯片套餐","items":[{"name":"可乐","count":1}]}]}
        expect(jp('(goods).(name|items)')).to.be.a('object')
            .with.deep.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[0]')
                .with.all.keys('name', 'items')
                .with.property('items')
                    .that.is.an('array');

        // {"goods":[{"items":[{"name":"薯片"},{"name":"雪碧"}]},{"items":[{"name":"可乐","price":1.5}]}]}
        expect(jp('(goods).(name|items).(name|price)')).to.be.a('object')
            .with.deep.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[0]')
                .with.all.keys('items')
                .with.property('items')
                    .that.is.an('array')
                    .that.have.lengthOf(2)
                    .with.deep.property('[0]')
                        .with.all.keys('name');
        
        expect(jp('(goods).(name|items).(name|price)')).to.be.a('object')
            .with.deep.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[1]')
                .with.all.keys('items')
                .with.property('items')
                    .that.is.an('array')
                    .that.have.lengthOf(1)
                    .with.deep.property('[0]')
                        .with.all.keys('name', 'price');
    });

    it('should rename the matched object when use equals sign', function() {
        expect(jp('(seller=anotherSeller)')).to.be.a('object').with.all.keys('anotherSeller');
        expect(jp('(seller= anotherSeller)')).to.be.a('object').with.all.keys('anotherSeller');
        expect(jp('(seller = anotherSeller)')).to.be.a('object').with.all.keys('anotherSeller');
        expect(jp('( seller = anotherSeller )')).to.be.a('object').with.all.keys('anotherSeller');
        expect(jp('payMethod.(detail=newDetail)')).to.be.a('object').with.all.keys('newDetail');
        expect(jp('payMethod.detail.(name=newName)')).to.be.a('object').with.all.keys('newName');

        expect(jp('payMethod.(detail=newDetail|method=newMethod).name')).to.be.a('object')
            .with.all.keys('newDetail', 'newMethod')
            .with.property('newMethod')
                .that.is.an('object')
                .with.all.keys('name');

        expect(jp('payMethod.(detail=newDetail|method=newMethod).(name=newName)')).to.be.a('object')
            .with.all.keys('newDetail', 'newMethod')
            .with.property('newMethod')
                .that.is.an('object')
                .with.all.keys('newName');
        
        expect(jp('(goods).(items=newItems).(name=newName|price=newPrice)')).to.be.a('object')
            .with.deep.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[0]')
                .with.all.keys('newItems')
                .with.property('newItems')
                    .that.is.an('array')
                    .that.have.lengthOf(2)
                    .with.deep.property('[0]')
                        .with.all.keys('newName');

        expect(jp('(goods).(items=newItems).(name=newName|price=newPrice)')).to.be.a('object')
            .with.deep.property('goods')
                .that.is.an('array')
                .that.have.lengthOf(2)
                .with.deep.property('[1]')
                .with.all.keys('newItems')
                .with.property('newItems')
                    .that.is.an('array')
                    .that.have.lengthOf(1)
                    .with.deep.property('[0]')
                        .with.all.keys('newName', 'newPrice');
    });
});