
var express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const FormData = require('form-data');
const WebflowCMS = require('webflow-cms');
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
router.get('/*', async function (req, res, next) {
    // const url = req.path.slice(1);
    const headers = req.headers;
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    try {
        headers["origin"] = new URL("https://service.mopin.co.kr").origin;
        headers["host"] = new URL("https://service.mopin.co.kr").host;
        headers["content-type"] = "application/json";

        const tokenInfo = await getToken(fullUrl,headers,httpsAgent);
        console.log(tokenInfo);

        res.set("content-type","application/json");
        res.json("");
    } catch (e) {
        res.status(404).send(e.stack);
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

router.post('/*', async function (req, res, next) {
    const url = req.path.slice(1);
    const headers = req.headers;
    try {
        headers["origin"] = new URL(url).origin;
        headers["host"] = new URL(url).host;

        let body = JSON.parse(JSON.stringify(req.body));

        for (key in body.extraHeaders) {
            headers[key] = body.extraHeaders[key];
            if (body.extraHeaders[key] == "null") {
                delete headers[key]
            }
        }
        delete body.extraHeaders
        //TODO: contentType 별로 body 바꿀 것!
        if (headers['content-type'] == 'application/x-www-form-urlencoded') {
            body = jsonToQueryString(body);
        } else if (headers['content-type'] == 'application/json') {
            body = JSON.stringify(body);
        } else if (headers['content-type'] == 'multipart/form-data') {
            body = getFormData(body);
        }
        const response = await fetch(url, {
            headers: headers,
            agent: httpsAgent,
            method: 'POST',
            body: body,
        });

        const responseHeaders = JSON.parse(JSON.stringify(response.headers.raw()));
        const responseData = await response.text();
        for (key in responseHeaders) {
            if (key != "content-encoding") {
                res.set(key, responseHeaders[key].join(";"));
            }
        }
        // res.set("content-type","application/json");
        const result = {data: responseData, headers: responseHeaders};
        res.json(result);
    } catch (e) {
        res.status(404).send(e.stack);
    }
});
module.exports = router;
