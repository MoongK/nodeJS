const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

var app = http.createServer(function(request,response){
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const urlInfo = url.parse(_url, true);
  const pathname = urlInfo.pathname;
  console.log(`pathname : ${pathname}`);
  
  const filepath = './data';
  let title = queryData.id;
  let description = "0";
  let control = "";

    if(pathname === '/'){
      fs.readdir(filepath, 'utf8', function(err, filelist){
        if(title === undefined){
          title = "Welcome";
          description = "Hello Node.js";
          control = `<a href='/create'>create</a>`;
        }
        else{
          description = fs.readFileSync(`${filepath}/${title}`, 'utf8');
          control = `<a href='/create'>create</a> <a href='/update?id=${title}'>update</a>
          <form style="display:inline-block" action="delete_process" method="post" onsubmit="return confirm('really?')">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
          </form>
          `;
        }
        templetes.html(response, filelist, title, description, control);
      });
    }
    else if(pathname === "/create"){
      fs.readdir(filepath, function(err, filelist){
          title = "create";
          description = templetes.form("", "", "create");
          control = ``;
          templetes.html(response, filelist, title, description, control);
      });
    }
    else if(pathname === "/create_process"){
      let body = '';

      request.on('data', function(data){ // request로 데이터가 들어올때 호출되는 콜백
        body += data;
        console.log(`data : ${data}`);
      });
      request.on('end', function(){ // request의 데이터 수신이 끝났을 때 호출되는 콜백
        let post = qs.parse(body);
        const d_title = post.title;
        const d_description = post.description;
        console.log(`title : ${d_title}, des : ${d_description}`);

        fs.writeFile(`data/${d_title}`, d_description, 'utf8', function(err){
          // 302 : 페이지를 리다이렉션
          response.writeHead(302, {Location: `/?id=${qs.escape(d_title)}`});
          response.end(); 
        });
      });
    }
    else if(pathname === "/update"){
      fs.readdir(filepath, 'utf8', function(err, filelist){
        if(title === undefined){
          title = "Welcome";
          description = "Hello Node.js";
          control = `<a href='/create'>create</a>`;
        }
        else{
          const getContent = fs.readFileSync(`${filepath}/${title}`, 'utf8');
          description = templetes.form(title, getContent , "update");
          control = ``;
          templetes.html(response, filelist, title, description, control);
        }
      });
    }
    else if(pathname === "/update_process"){
      let body = '';

      request.on('data', function(data){ // request로 데이터가 들어올때 호출되는 콜백
        body += data;
        console.log(`data : ${data}`);
      });
      request.on('end', function(){ // request의 데이터 수신이 끝났을 때 호출되는 콜백
        let post = qs.parse(body);
        const d_id = post.id;
        const d_title = post.title;
        const d_description = post.description;
        console.log(`id : ${d_id}, title : ${d_title}, des : ${d_description}`);
        console.log(post);
        fs.rename(`${filepath}/${d_id}`, `${filepath}/${d_title}`, function(error){
          fs.writeFile(`${filepath}/${d_title}`, d_description, 'utf8', function(err){
            // 302 : 페이지를 리다이렉션
            response.writeHead(302, {Location: `/?id=${qs.escape(d_title)}`});
            response.end(); 
          });
        });
      });
    }
    else if(pathname === "/delete_process"){
      let body = '';

      request.on('data', function(data){ // request로 데이터가 들어올때 호출되는 콜백
        body += data;
        console.log(`data : ${data}`);
      });
      request.on('end', function(){ // request의 데이터 수신이 끝났을 때 호출되는 콜백
        let post = qs.parse(body);
        const d_id = (post.id !== undefined ? post.id : ``);
        console.log(`filepath : ${filepath}`);
        console.log(`post.id : ${post.id}`);
        console.log(`d_id : ${d_id}`);

        fs.unlink(`${filepath}/${d_id}` , function(){
          response.writeHead(302, {Location: `/`});
          response.end();
        });
      });
    }
    else{
      response.writeHead(404);
      response.end('Not found'); 
    }
});
app.listen(3000); // 포트번호 3000에서 접속받음

var templetes = {
  html:function(response, filelist, title, description, control){

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
        ${control}
      <h2>${title}</h2>
      <p>${description}</p>
    </body>
    </html>
    `;
    response.writeHead(200);
    response.end(`${templete}`);
  },
  form:function(_title, _description, _req){

    const innerTitle = (_title !== "" ? _title : ``);
    const innerDes = (_description !== "" ? _description : ``);
    let order = '';
  
    if(_req === `create`){
      order = `create_process`;
    }
    else if(_req === `update`){
      order = `update_process`;
    }
  
    const str = `<form action="http://localhost:3000/${order}" method="post">
    <input type="hidden" name="id" value="${innerTitle}">
    <p><input type="text" name="title" placeholder="제목" value='${innerTitle}'></p>
    <p>
      <textarea name="description" placeholder="내용을 입력해주세요..">${innerDes}</textarea>
      </p>
    <p><input type="submit"></p>
  </form>
  `
    return str;
  }
}