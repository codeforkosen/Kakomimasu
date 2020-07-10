import http from "http";

const api = (url) => {
  const res = {
    test: url,
  };
  return res;
};

const server = http.createServer()
server.on('request', function(req, res) {
  console.log(req);
  res.on('data', (chunk) => {
    console.log('BODY: ' + chunk);
  });
  const json = api(req.url);
  res.writeHead(200, { 'Content-Type' : 'application/json; charset=utf-8' })
  res.write(JSON.stringify(json))
  res.end()
})
server.listen(8880);
