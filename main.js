const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const path = require('path');

const templetes = require('./lib/templetes');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer(function(request,response){
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  const urlInfo = url.parse(_url, true);
  const pathname = urlInfo.pathname;
  console.log(`pathname : ${pathname}`);
  
  const filepath = './data';
  let title = (queryData.id !== undefined ? queryData.id : ``);
  console.log(`title : ${title}`);
  let filteredId = path.parse(title).base;
  let description = "0";
  let control = "";
  console.log(`filter : ${filteredId}`);
  if(pathname === '/'){
      fs.readdir(filepath, 'utf8', function(err, filelist){
        if(filteredId === ''){
          filteredId = "Welcome";
          description = "Hello Node.js";
          control = `<a href='/create'>create</a>`;
        }
        else{
          console.log(`target : ${filepath}/${filteredId}`);
          description = fs.readFileSync(`${filepath}/${filteredId}`, 'utf8');
          control = `<a href='/create'>create</a> <a href='/update?id=${filteredId}'>update</a>
          <form style="display:inline-block" action="delete_process" method="post" onsubmit="return confirm('really?')">
            <input type="hidden" name="id" value="${filteredId}">
            <input type="submit" value="delete">
          </form>
          `;
        }
        templetes.html(response, filelist, filteredId, description, control);
      });
    }
    else if(pathname === "/create"){
      fs.readdir(filepath, function(err, filelist){
        filteredId = "create";
        description = templetes.form("", "", "create");
        control = ``;
        templetes.html(response, filelist, filteredId, description, control);
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
        const d_title = sanitizeHtml(post.title);
        const d_description = sanitizeHtml(post.description);
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
        if(filteredId === ''){
          filteredId = "Welcome";
          description = "Hello Node.js";
          control = `<a href='/create'>create</a>`;
        }
        else{
          const getContent = fs.readFileSync(`${filepath}/${filteredId}`, 'utf8');
          description = templetes.form(filteredId, getContent , "update");
          control = ``;
          templetes.html(response, filelist, filteredId, description, control);
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
        const d_id = path.parse(post.id).base;
        const d_title = sanitizeHtml(path.parse(post.title).base);
        const d_description = sanitizeHtml(post.description);
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
        filteredId = path.parse(d_id).base;
        console.log(`filepath : ${filepath}`);
        console.log(`post.id : ${post.id}`);
        console.log(`d_id : ${d_id}`);

        fs.unlink(`${filepath}/${filteredId}` , function(){
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