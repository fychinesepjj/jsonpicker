var expect = chai.expect;

describe('js/jsonpicker.js', function () {
    var jsonData = {
        "name": null,
        "age": "",
        "seller": "1000",
        "orderNo": "20161118945026",
        "totalmoney": "51.00",
        "methodType": [1, 3, 5, 7],
        "payMethod": {
            detail: {
                "money": "47.20",
                "count": 0,
                "name": "cash"
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
                        "count": 1
                    }
                ]
            }
        ]
    };

    var jp = function jp(picker, data) {
        return function jpInner(path) {
            try {
                return picker.pick(data, path);
            } catch(e) {
                console.error('jsonPicker exception: ' + e);
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
        var validTest = function () {
            jsonPicker.pick({}, '');
        };
        expect(invalidDataTest).to.throw(TypeError, /parameter type error/);
        expect(nullPathTest).to.throw(TypeError, /parameter type error/);
        expect(invalidPathTest).to.throw(TypeError, /parameter type error/);
        expect(validTest).not.to.throw(TypeError, /parameter type error/);
    });

    it('should return null when path do not exist', function() {
        expect(jp('fakeName')).to.be.a('null');
        expect(jp('payMethod.fakeName')).to.be.a('null');
        expect(jp('goods.fakeName')).to.be.a('null');
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

    it('should return last matched object when use search path', function() {
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
            .that.deep.equals({"money": "47.20", "count": 0, "name": "cash"});

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
});