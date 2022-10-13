
var express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const FormData = require('form-data');
const WebflowCMS = require('webflow-cms');
const urlencode = require('urlencode');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

var router = express.Router();
const getToken = async (fullUrl, headers, httpsAgent)=>{
    const response = await fetch(`https://service.mopin.co.kr/api/webflow/token/?site_url=${fullUrl}&format=json`, {headers: headers, agent: httpsAgent, method: 'GET'});
    const responseData = await response.json();
    return responseData[0];
}

/* GET home page. */
router.get('/sites', async function (req, res, next) {
    // const url = req.path.slice(1);
    const headers = req.headers;
    try {
        const fullUrl = req.query.url;

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
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

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
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

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
        headers["content-type"] = "application/json";
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);
        const collections = await webflowCMS.getCollections(req.query.siteId);
        let ret = collections;

        if(req.query.collectionName){
            ret = await webflowCMS.getCollectionByName(collections, urlencode.decode(req.query.collectionName));
            if(req.query.itemName){
                ret = await webflowCMS.getItemByName(ret,urlencode.decode(req.query.itemName));
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

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
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

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
        headers["content-type"] = "application/json";
        delete headers['content-length'];
        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        const webflowCMS = new WebflowCMS.default(tokenInfo.token);


        let body = JSON.parse(JSON.stringify(req.body));
        let ret={};
        ret = await webflowCMS.createItem(urlencode.decode(req.query.collectionId),body);
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

        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
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
