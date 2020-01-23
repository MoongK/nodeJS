
module.exports = {
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