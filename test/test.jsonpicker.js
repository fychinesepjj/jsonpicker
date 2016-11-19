var expect = chai.expect;

describe('js/jsonpicker.js', function () {
    var jsonData = {
        "name": null,
        "seller": "1000",
        "orderNo": "20161118945026",
        "totalmoney": "51.00",
        "methodType": [1, 3, 5, 7],
        "payMethod": {
            detail: {
                "money": "47.20",
                "count": 0,
                "name": "cash",
                "other": ""
            }
        },
        "goods": [
            {
                "id": 1,
                "name": "固定套餐1",
                "price": "12.00",
                "count": 2,
                "money": "24.00",
                "pac": [
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
                "name": "薯片",
                "price": "8.00",
                "count": 1,
                "money": "8.00"
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

    it('should return a object when key exist', function() {
        expect(jp('name')).to.be.a('object');
        expect(jp('seller')).to.be.a('object');
        expect(jp('methodType')).to.be.a('object');
        expect(jp('payMethod')).to.be.a('object');
        expect(jp('payMethod.detail')).to.be.a('object');
        expect(jp('payMethod.detail.name')).to.be.a('object');
    });

    it('should return null when key do not exist', function() {
        expect(jp('fakeName')).to.be.a('null');
        expect(jp('payMethod.fakeName')).to.be.a('null');
        expect(jp('goods.fakeName')).to.be.a('null');
    });
});