import { liteClient as algoliasearch } from 'algoliasearch/lite'

const { VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_API_KEY } = import.meta.env

export const searchClient = algoliasearch(VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_API_KEY)

/**
 *
 *                                     {"name":"Colleen Gray","description":"Corporis sit expedi","state":"Fuga Ipsum ut et co","customerName":"Beau Peters","stimates":"Autem tempor tempor ","city":"Odit tempore mollit","uid":"xuRfOIcXNkQcHP8Q9bMQNxF4W663","company":{"phoneNumber":"+1 (722) 622-3345","logoUrl":"https://firebasestorage.googleapis.com/v0/b/invoice-generator-9549e.firebasestorage.app/o/logos%2F1749854899862_1%20libra%20es%20m%C3%ADa.PNG?alt=media&token=696d8866-f4df-4fbc-8b8f-55470652b1c2","zipcode":"1234","signature":"Eos eos non eligendi","zicode":"55264","address":"Atque qui provident","id":"TqYDUEVQ6TkJF108gmWH","tags":["Sequi asperiores fac","test","tes3","ed2"],"name":"Berger and Collier Inc","terms":"Consectetur est omni","uuid":"xuRfOIcXNkQcHP8Q9bMQNxF4W663","createdAt":1749860273591},"phone":"+1 (133) 597-1283","materials":false,"zip":"57539","total":"Culpa quis asperiore","customerAddres":"Ut ut aliquip obcaec","services":["test","tes3"],"path":"invoices/dHUh1apvNiVMvky0kt7W","lastmodified":{"_operation":"IncrementSet","value":1749863933155},"objectID":"dHUh1apvNiVMvky0kt7W","_highlightResult":{"name":{"value":"Colleen Gray","matchLevel":"none","matchedWords":[]},"description":{"value":"Corporis sit expedi","matchLevel":"none","matchedWords":[]},"state":{"value":"Fuga Ipsum ut et co","matchLevel":"none","matchedWords":[]},"customerName":{"value":"Beau Peters","matchLevel":"none","matchedWords":[]},"stimates":{"value":"Autem tempor tempor ","matchLevel":"none","matchedWords":[]},"city":{"value":"Odit tempore mollit","matchLevel":"none","matchedWords":[]},"uid":{"value":"xuRfOIcXNkQcHP8Q9bMQNxF4W663","matchLevel":"none","matchedWords":[]},"company":{"phoneNumber":{"value":"+1 (722) 622-3345","matchLevel":"none","matchedWords":[]},"logoUrl":{"value":"https://firebasestorage.googleapis.com/v0/b/invoice-generator-9549e.firebasestorage.app/o/logos%2F1749854899862_1%20libra%20es%20m%C3%ADa.PNG?alt=media&amp;token=696d8866-f4df-4fbc-8b8f-55470652b1c2","matchLevel":"none","matchedWords":[]},"zipcode":{"value":"1234","matchLevel":"none","matchedWords":[]},"signature":{"value":"Eos eos non eligendi","matchLevel":"none","matchedWords":[]},"zicode":{"value":"55264","matchLevel":"none","matchedWords":[]},"address":{"value":"Atque qui provident","matchLevel":"none","matchedWords":[]},"id":{"value":"TqYDUEVQ6TkJF108gmWH","matchLevel":"none","matchedWords":[]},"tags":[{"value":"Sequi asperiores fac","matchLevel":"none","matchedWords":[]},{"value":"test","matchLevel":"none","matchedWords":[]},{"value":"tes3","matchLevel":"none","matchedWords":[]},{"value":"ed2","matchLevel":"none","matchedWords":[]}],"name":{"value":"Berger and Collier Inc","matchLevel":"none","matchedWords":[]},"terms":{"value":"Consectetur est omni","matchLevel":"none","matchedWords":[]},"uuid":{"value":"xuRfOIcXNkQcHP8Q9bMQNxF4W663","matchLevel":"none","matchedWords":[]},"createdAt":{"value":"1749860273591","matchLevel":"none","matchedWords":[]}},"phone":{"value":"+1 (133) 597-1283","matchLevel":"none","matchedWords":[]},"zip":{"value":"57539","matchLevel":"none","matchedWords":[]},"total":{"value":"Culpa quis asperiore","matchLevel":"none","matchedWords":[]},"customerAddres":{"value":"Ut ut aliquip obcaec","matchLevel":"none","matchedWords":[]},"services":[{"value":"test","matchLevel":"none","matchedWords":[]},{"value":"tes3","matchLevel":"none","matchedWords":[]}],"path":{"value":"invoices/dHUh1apvNiVMvky0kt7W","matchLevel":"none","matchedWords":[]},"lastmodified":{"_operation":{"value":"IncrementSet","matchLevel":"none","matchedWords":[]},"value":{"value":"1749863933155","matchLevel":"none","matchedWords":[]}}},"__position":16}
"uid": "xuRfOIcXNkQcHP8Q9bMQNxF4W663",
    "customerName": "Kimberley Houston",
    "phone": "+1 (573) 629-4729",
    "state": "Placeat iure et ear",
    "customerAddres": "Nihil sequi irure mo",
    "services": [
        "Sequi asperiores fac",
        "test"
    ],
    "stimates": "Omnis in corporis vo",
    "company": {
        "tags": [
            "Sequi asperiores fac",
            "test",
            "tes3",
            "ed2"
        ],
        "phoneNumber": "+1 (722) 622-3345",
        "createdAt": 1749860273591,
        "name": "Berger and Collier Inc",
        "signature": "Eos eos non eligendi",
        "logoUrl": "https://firebasestorage.googleapis.com/v0/b/invoice-generator-9549e.firebasestorage.app/o/logos%2F1749854899862_1%20libra%20es%20m%C3%ADa.PNG?alt=media&token=696d8866-f4df-4fbc-8b8f-55470652b1c2",
        "terms": "Consectetur est omni",
        "zicode": "55264",
        "zipcode": "1234",
        "id": "TqYDUEVQ6TkJF108gmWH",
        "address": "Atque qui provident",
        "uuid": "xuRfOIcXNkQcHP8Q9bMQNxF4W663"
    },
    "city": "Aliquid et consequat",
    "description": "Voluptas aut est qu",
    "total": "Sed assumenda mollit",
    "zip": "92375",
    "name": "Jamalia Dejesus",
    "materials": true,
    "path": "invoices/xfzjumYHrooP81ILlWzg",
    "lastmodified": {
        "_operation": "IncrementSet",
        "value": 1749863933155
    },
    "objectID": "xfzjumYHrooP81ILlWzg",
    "_highlightResult": {
        "uid": {
            "value": "xuRfOIcXNkQcHP8Q9bMQNxF4W663",
            "matchLevel": "none",
            "matchedWords": []
        },
        "customerName": {
            "value": "Kimberley Houston",
            "matchLevel": "none",
            "matchedWords": []
        },
        "phone": {
            "value": "+1 (573) 629-4729",
            "matchLevel": "none",
            "matchedWords": []
        },
        "state": {
            "value": "Placeat iure et ear",
            "matchLevel": "none",
            "matchedWords": []
        },
        "customerAddres": {
            "value": "Nihil sequi irure mo",
            "matchLevel": "none",
            "matchedWords": []
        },
        "services": [
            {
                "value": "Sequi asperiores fac",
                "matchLevel": "none",
                "matchedWords": []
            },
            {
                "value": "test",
                "matchLevel": "none",
                "matchedWords": []
            }
        ],
        "stimates": {
            "value": "Omnis in corporis vo",
            "matchLevel": "none",
            "matchedWords": []
        },
        "company": {
            "tags": [
                {
                    "value": "Sequi asperiores fac",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                {
                    "value": "test",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                {
                    "value": "tes3",
                    "matchLevel": "none",
                    "matchedWords": []
                },
                {
                    "value": "ed2",
                    "matchLevel": "none",
                    "matchedWords": []
                }
            ],
            "phoneNumber": {
                "value": "+1 (722) 622-3345",
                "matchLevel": "none",
                "matchedWords": []
            },
            "createdAt": {
                "value": "1749860273591",
                "matchLevel": "none",
                "matchedWords": []
            },
            "name": {
                "value": "Berger and Collier Inc",
                "matchLevel": "none",
                "matchedWords": []
            },
            "signature": {
                "value": "Eos eos non eligendi",
                "matchLevel": "none",
                "matchedWords": []
            },
            "logoUrl": {
                "value": "https://firebasestorage.googleapis.com/v0/b/invoice-generator-9549e.firebasestorage.app/o/logos%2F1749854899862_1%20libra%20es%20m%C3%ADa.PNG?alt=media&amp;token=696d8866-f4df-4fbc-8b8f-55470652b1c2",
                "matchLevel": "none",
                "matchedWords": []
            },
            "terms": {
                "value": "Consectetur est omni",
                "matchLevel": "none",
                "matchedWords": []
            },
            "zicode": {
                "value": "55264",
                "matchLevel": "none",
                "matchedWords": []
            },
            "zipcode": {
                "value": "1234",
                "matchLevel": "none",
                "matchedWords": []
            },
            "id": {
                "value": "TqYDUEVQ6TkJF108gmWH",
                "matchLevel": "none",
                "matchedWords": []
            },
            "address": {
                "value": "Atque qui provident",
                "matchLevel": "none",
                "matchedWords": []
            },
            "uuid": {
                "value": "xuRfOIcXNkQcHP8Q9bMQNxF4W663",
                "matchLevel": "none",
                "matchedWords": []
            }
        },
        "city": {
            "value": "Aliquid et consequat",
            "matchLevel": "none",
            "matchedWords": []
        },
        "description": {
            "value": "Voluptas aut est qu",
            "matchLevel": "none",
            "matchedWords": []
        },
        "total": {
            "value": "Sed assumenda mollit",
            "matchLevel": "none",
            "matchedWords": []
        },
        "zip": {
            "value": "92375",
            "matchLevel": "none",
            "matchedWords": []
        },
        "name": {
            "value": "Jamalia Dejesus",
            "matchLevel": "none",
            "matchedWords": []
        },
        "path": {
            "value": "invoices/xfzjumYHrooP81ILlWzg",
            "matchLevel": "none",
            "matchedWords": []
        },
        "lastmodified": {
            "_operation": {
                "value": "IncrementSet",
                "matchLevel": "none",
                "matchedWords": []
            },
            "value": {
                "value": "1749863933155",
                "matchLevel": "none",
                "matchedWords": []
            }
        }
    },
    "__position": 1
}
 */
