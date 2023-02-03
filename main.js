const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

function myTamplate(title, list, body, buttons){
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>web - ${title}</title>
  </head>
  <body>
    <header>
      <h1><a href='/'>WEB</a></h1>
    </header>
    <nav>
      <ul>
        ${list}
      </ul>
    </nav>
    <div>${buttons}</div>
    <article>
      <h2>${title}</h2>
      <p>${body}</p>
    </article>
    <script>
      
    </script>
  </body>
  </html>
  `
};

http.createServer((req, res)=>{
  const _url = req.url;
  const pathname = url.parse(_url, 'utf8').pathname;
  const queries = url.parse(_url, 'utf8').query;

  let title = 'Home';
  let content = 'Welcome! This is Web.';
  let list = '';
  fs.readdirSync('./topics', 'utf8').map((elmt, idx)=>{
    list = list + `<li><a href='/?id=${elmt}'>${elmt}</a></li>`
  });
  let buttons = `
  <button type="button" onclick="location.href = '/create'">Add</button>
  `;

  if (pathname === '/'){
    if (pathname === '/' & queries.id !== undefined){
      title = queries.id;
      content = fs.readFileSync(`topics/${title}`, 'utf8');
      content += `<div>
      <button type="button" onclick="location.href = '/update?id=${title}'">Edit</button>
      <button type="button" onclick="location.href = '/delete?id=${title}'">Delete</button>
      </div>`;
    };
    res.writeHead(200);
    res.write(myTamplate(title, list, content, buttons));
    res.end();
  } else if(pathname === '/create'){
    title = 'New post';
    content = `
    <form action="/post_new" method="post">
      <div><input type="text" placeholder="Title" name="title" style="margin-bottom:10px"></div>
      <div><textarea name="content" id="newContent" cols="50" rows="15" placeholder="Descriptions"></textarea></div>
      <input type="submit" value="Add">
    </form>
    `;
    buttons = '';
    res.writeHead(200);
    res.write(myTamplate(title, list, content, buttons));
    res.end();
  } else if(pathname === '/post_new') {
    let strData = '';
    req.on('data', (data)=>{
      strData += data;
    });
    req.on('end', ()=>{
      let objData = qs.parse(strData);
      console.log("=>>>>>>>>>>>>>", objData);
      title = objData.title;
      content = objData.content;
      fs.writeFile(`./topics/${title}`, content, 'utf8', err=>{
        res.writeHead(302, {Location: `./?id=${title}`});
        res.end();
      });
    });
  } else if(pathname === '/update'){
    title = queries.id;
    let description = fs.readFileSync(`./topics/${title}`, 'utf8');
    content = `
    <form action="/update_new?id=${title}" method="post">
      <div><input type="text" value=${title} name="title" style="margin-bottom:10px"></div>
      <div><textarea name="content" id="newContent" cols="50" rows="15" placeholder="Descriptions">${description}</textarea></div>
      <input type="submit" value="Update">
    </form>
    `;
    res.writeHead(200);
    res.write(myTamplate(title, list, content, buttons));
    res.end();
  } else if(pathname === '/update_new') {
    let oldTitle = queries.id;
    let strData = '';
    req.on('data', data=>{
      strData += data;
    });
    req.on('end', ()=>{
      let objData = qs.parse(strData);
      title = objData.title;
      content = objData.content;
      fs.rename(`./topics/${oldTitle}`, `./topics/${title}`, err=>{
        fs.writeFile(`./topics/${title}`, content, 'utf8', err=>{
          res.writeHead(302, {Location: `./?id=${title}`});
          res.end();
        });
      });
    });
  } else if (pathname === '/delete') {
    fs.unlink(`./topics/${queries.id}`, err=>{
      res.writeHead(302, {Location: '/'});
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end('Not found.');
  }
  
}).listen(8000);