const express = require('express')
const app = express()
const port = process.env.PORT || 8080;
const axios = require('axios');
const qs = require('qs');
const path = require('path');

const APP_ID = process.env["APP_ID"];
const APP_SECRET = process.env["APP_SECRET"];
const TENANT_ID = process.env["TENANT_ID"];
const SITE_ID = process.env["SITE_ID"]; 
const LIST_ID = process.env["LIST_ID"]; 

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/favicon.ico', express.static('favicon.ico'));

app.get('/', (req, res) => {
  res.send('Linkshortener up and running');
})

app.get('/:id', async (req, res) => {
  let token = await getToken();
  let linkInfo = await getLinkInfo(token, req.params.id);
  if (linkInfo == undefined) {
    res.sendStatus(404);
    res.send('Dieser Link wurde nicht gefunden.')
  }
  console.log('Redirect to: ' + linkInfo.fields.Link.trim());
  res.redirect(linkInfo.fields.Link.trim())
})

app.get('/:id/qr', async (req, res) => {
  let token = await getToken();
  let linkInfo = await getLinkInfo(token, req.params.id);
  if (linkInfo == undefined) {
    res.sendStatus(404);
    res.send('Dieser Link wurde nicht gefunden.')
  }

  let qr_image_url = process.env["QR_IMAGE_URL"] || '';
  let qr_colorcode = process.env["QR_COLORCODE"] || '#000';
  let qr_backcolor = process.env["QR_BACKCOLOR"] || '#fff';

  res.render("qr", { title: linkInfo.fields.Title, link: linkInfo.fields.Shortlink, image: qr_image_url, color: qr_colorcode, backgroundColor: qr_backcolor });
})

app.listen(port, () => {
  console.log(`This app is listening at http://localhost:${port}`)
  if (isConfig()) {
    console.log(`Configuration Complete!`)
  }
})
/**
 * Check if Config is complete
 * @returns boolen
 */
let isConfig = () => {
  if (!APP_ID || !APP_SECRET || !TENANT_ID || !LIST_ID || !SITE_ID) {
    console.log('Configuration incomplete')
    process.exit();
  }
  return true;
}
/**
 * Get Token for MS Graph
 */
let getToken = async () => {
  const postData = {
      client_id: APP_ID,
      scope: MS_GRAPH_SCOPE,
      client_secret: APP_SECRET,
      grant_type: 'client_credentials'
  };

  return await axios.post(TOKEN_ENDPOINT, qs.stringify(postData))
      .then(response => {
          return response.data.access_token;
      })
      .catch(error => {
          console.log(error);
      });
}

/**
 * 
 * @param token 
 * @param query short name
 * @returns Full destination Link
 */
let getLinkInfo = async (token, query) => {
  return await axios.get(MS_GRAPH_ENDPOINT + "sites/" + SITE_ID + "/lists/" + LIST_ID + "/items?expand=fields(select=Title,Link,Shortlink)&$filter=startswith(fields/Title, '"+ query +"')&$select=id,fields", {
      headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => {
    if (response.data.value.length > 0 && response.data.value != undefined) {
      return response.data.value[0];
    } else {
      console.log('query: ', query)
      console.log('response: ', response)
      throw new Error('Link nicht gefunden')
    }
  })
  .catch((error) => {
    console.log(error);
  })
}