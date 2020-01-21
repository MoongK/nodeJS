var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){

  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var title = queryData.id;
  var description = "0";

    const urlInfo = url.parse(_url, true);
    const pathname = urlInfo.pathname;

    if(pathname === '/'){
      const filepath = './data';
      fs.readdir(filepath, function(err, filelist){
        if(queryData.id === undefined){
          title = "Welcome";
          description = "Hello Node.js";
        }
        else{
          description = fs.readFileSync(`${filepath}/${queryData.id}`, 'utf8');
        }
          getTemplete(response, filelist, title, description);
      });
    }
    else{
      response.writeHead(404);
      response.end('Not found'); 
    }
});
app.listen(3000); // 포트번호 3000에서 접속받음

function getTemplete(response, filelist, title, description){

  let list = '<ul>';
  let i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i += 1;
  }
  list += '</ul>';
  var templete = `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
      ${list}
    </ul>
    <h2>${title}</h2>
    <p>${description}</p>
  </body>
  </html>
  `;
  response.writeHead(200);
  response.end(`${templete}`);
}