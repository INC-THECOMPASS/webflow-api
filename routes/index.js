
var express = require('express');
const https = require('https');
const FormData = require('form-data');
const urlencode = require('urlencode');
const Webflow = require("webflow-api");
const fetch = require('node-fetch');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

var router = express.Router();
const getToken = async (fullUrl, headers, httpsAgent)=>{
    const response = await fetch(`https://service.ucut.in/api/webflow/token/?site_url=${fullUrl}&format=json`, {headers: headers, agent: httpsAgent, method: 'GET'});
    const responseData = await response.json();
    return responseData[0];
}

class WebflowCMS {
    constructor(token) {
        this.webflow = new Webflow({
            token: token
        })
        this.token = token
    }

    async getSites() {
        return (await this.webflow.info()).sites;
    }

    async getCollections(siteId) {
        return await this.webflow.collections({siteId: siteId});
    }

    async getCollectionByName(collections, name) {
        return collections.find((collection) => {
            return collection.name == name
        })
    }

    async getItems(collection) {
        let offset = 0;
        let count = 100;
        let ret = []
        while (count == 100) {
            const temp = await collection.items({offset:offset})
            offset += temp.count
            count = temp.count
            ret = ret.concat(temp.items)
        }
        return ret
    }

    async getItemByName(collection, name) {
        return (await this.getItems(collection)).find((item) => {
            return item.name == name
        })
    }

    async updateItem(itemId, collectionId, data) {
        return await this.webflow.updateItem({
            itemId: itemId,
            collectionId: collectionId,
            fields: data
        }, {live: true});
    }

    async createItem(collectionId, data) {
        return await this.webflow.createItem({
            collectionId: collectionId,
            fields: data
        }, {live: true})
    }
}



/* GET home page. */
router.get('/sites', async function (req, res, next) {
    // const url = req.path.slice(1);
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";

        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);
        const sites = await webflowCMS.getSites();

        res.set("content-type","application/json");
        res.json(sites);
    } catch (e) {
        res.status(404).send(e.stack);
    }
});

router.get('/collection', async function (req, res, next) {
    // const url = req.path.slice(1);
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";

        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);
        const collections = await webflowCMS.getCollections(req.query.siteId);
        let ret = collections;
        if(req.query.collectionName){
            ret = await webflowCMS.getCollectionByName(collections, urlencode.decode(req.query.collectionName));
        }

        res.set("content-type","application/json");
        res.json(ret);
    } catch (e) {
        res.status(400).send(e.stack);
    }
});

router.get('/item', async function (req, res, next) {
    // const url = req.path.slice(1);
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);
        const collections = await webflowCMS.getCollections(req.query.siteId);
        let ret = collections;
        console.log(req.query)
        if(req.query.collectionName){
            ret = await webflowCMS.getCollectionByName(collections, urlencode.decode(req.query.collectionName));
            if(req.query.itemName){
                ret = await webflowCMS.getItemByName(ret,urlencode.decode(req.query.itemName));
                console.log(ret,urlencode.decode(req.query.itemName))
            }
            else{
                ret = await webflowCMS.getItems(ret);
            }
        }

        res.set("content-type","application/json");
        res.json(ret);
    } catch (e) {
        res.status(400).send(e.stack);
    }
});

function getFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}

function jsonToQueryString(json) {
    return Object.keys(json).map(function (key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(json[key]);
    }).join('&');
}
router.put('/item', async function (req, res, next) {
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";
        delete headers['content-length'];
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);


        let body = JSON.parse(JSON.stringify(req.body));
        let ret={};
        ret = await webflowCMS.updateItem(urlencode.decode(req.query.itemId), urlencode.decode(req.query.collectionId),body);
        res.set("content-type","application/json");
        res.json(ret);
    } catch (e) {
        res.status(400).send(e.stack);
    }
});
router.post('/item', async function (req, res, next) {
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";
        delete headers['content-length'];
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);


        let body = JSON.parse(JSON.stringify(req.body));
        let ret={};
        //TODO: body 찍어보기
        ret = await webflowCMS.createItem(urlencode.decode(req.query.collectionId), body);
        res.set("content-type","application/json");
        res.json(ret);
    } catch (e) {
        res.status(400).send(e.stack);
    }
});/*
router.delete('/item', async function (req, res, next) {
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.ucut.in").origin;
        headers["host"] = new URL("https://service.ucut.in").host;
        headers["content-type"] = "application/json";
        delete headers['content-length'];
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);


        let body = JSON.parse(JSON.stringify(req.body));
        let ret={};
        ret = await webflowCMS.updateItem(urlencode.decode(req.query.itemId), urlencode.decode(req.query.collectionId),body);
        res.set("content-type","application/json");
        res.json(ret);
    } catch (e) {
        res.status(400).send(e.stack);
    }
});*/
module.exports = router;
