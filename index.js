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


app.get('/:id', async (req, res) => {
  let token = await getToken();
  let linkInfo = await getLinkInfo(token, req.params.id);
  console.log('Redirect to: ' + linkInfo.fields.Link);
  res.redirect(link)
})

app.get('/qr/:shortlink', async (req, res) => {
  let token = await getToken();
  let linkInfo = await getLinkInfo(token, req.params.shortlink);
  res.render("qr", { title: linkInfo.fields.Title, message: linkInfo.fields.Link });
})

app.listen(port, () => {
  console.log(`This app is listening at http://localhost:${port}`)
})

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
  return await axios.get(MS_GRAPH_ENDPOINT + "sites/" + SITE_ID + "/lists/" + LIST_ID + "/items?expand=fields(select=Title,Link)&$filter=startswith(fields/Title, '"+ query +"')&$select=id,fields", {
      headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then((response) => {
    return response.data.value[0];
  })
  .catch((error) => {
    console.log(error);
  })
}