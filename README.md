# jsonpicker usage

## Instruction
1. Basic method
2. Examples
3. Others

## Basic method
### jsonPicker.pick(data, path)
    data: [object, array] 
    path: [string]
    return: [array, object]
`pick` method is used to quick extract values of the data through the given path, 
instead of the old ways: `data[name]` or `data.name`

#### Path syntax
1. `name` === `{"name": data['name']}`
2. `(name|age)` === `{"name": data['name'], "age": data['age']}`
3. `(name=newName|age=newAge)` === `{"newName": data['name'], "newAge": data['age']}`

*notification*:

* `(payMethod).(detail|method).name` is different from `payMethod.(detail|method).name`
* `(payMethod)` is same to `payMethod`
* `payMethod.(detail|method).name` is same to `payMethod.(detail|method).(name)`


### jsonPicker.transform(data, dataTpl)
    data: [object, array]
    dataTpl: [object, array]
    return: [array, object]
`transform` method is a function that pick values from data by traversing the data template that contains the path, compared to the `pick`
method it's more convenient.

#### Transform tpl syntax
* `{{ name }}`
* `{{ *name }}`
* `{{ *(name=newName) }}`

`*` is used to evaluate the return object, and have only effect on the object that have the same key to return value

What 's the difference?

* `{"name": "{{ name }}"}` return `{"name": {"name": "xxx"}}`
* `{"name": "{{ *name }}"}` : return `{"name": "xxx"}`
* `{"name2": "{{ *name }}"}` :  return `{"name2": {"name": "xxxx"}}`,  do not have the same key, so `*` have no effect
* `{"name2": "{{ *(name=name2)}}"}`: return `{"name2": "xxxx"}`

## Examples
```javascript
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
```
## jsonPicker.pick

`jsonPicker.pick(jsonData, 'seller')`
```javascript
{"seller": "1000"}
```

`jsonPicker.pick(jsonData, 'payMethod.detail')`
```javascript
{"detail":{"money":"47.20","count":null,"name":"cash"}}
```

`jsonPicker.pick(jsonData, 'payMethod.(detail|method).name')`
```javascript
{"detail":{"name":"cash"},"method":{"name":"card"}}
```

`jsonPicker.pick(jsonData, '(goods).(name|items).(name|price)')`
```javascript
{"goods":[{"items":[{"name":"薯片"},{"name":"雪碧"}]},{"items":[{"name":"可乐","price":1.5}]}]}
```

`jsonPicker.pick(jsonData, '(seller=newSeller)')`
```javascript
{"newSeller": "1000"}
```

`jsonPicker.pick(jsonData, 'payMethod.(detail=newDetail|method=newMethod).(name=newName)')`
```javascript
{"newDetail":{"newName":"cash"},"newMethod":{"newName":"card"}}
```

## jsonPicker.transform
```javascript
var jsonTpl = {
    "name": "abc",
    "age": 12,
    "likes": [1, 2, 3, 4],
    "detail": "{{ payMethod.detail }}",
    "detail2": "{{ *payMethod.method }}",
    "method": "{{ *payMethod.method }}",
    "detailInner": "{{ *payMethod.(detail=detailInner) }}"
};
```

`jsonPicker.transform(jsonData, jsonTpl)`
```javascript
{
    "name": "abc",
    "age": 12,
    "likes": [
        1,
        2,
        3,
        4
    ],
    "detail": {
        "detail": {
            "money": "47.20",
            "count": null,
            "name": "cash"
        }
    },
    "detail2": {
        "method": {
            "name": "card"
        }
    },
    "method": {
        "name": "card"
    },
    "detailInner": {
        "money": "47.20",
        "count": null,
        "name": "cash"
    }
}
```

## Others
How to test result?

1. Run the demo.html page
2. Open chrome's dev tool
3. run code `jsonPicker.pick(jsonData, 'name')...`

or run test cases /test/index.html 