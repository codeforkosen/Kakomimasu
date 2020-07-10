import express from 'express';
import util from './util.js';
import bodyParser from 'body-parser';
require('dotenv').config();

const PORT = process.env.PORT || 8005

const app = express()

app.post('/', multer({ dest: 'tmp/' }).single('file'), (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/json; charset=utf-8')
  try {
      const data = fs.readFileSync(req.file.path)
    //console.log(req.file.path)
    //console.log(req)
    let fn = req.body.filename
    fn = fn.replace(/\.\./g, "__")
    //const fn = 'data/' + id + "-" + util.getYMDHMSM() + "-" + encodeIP(getIP(req)) + ".wav"
    util.writeFileSync('data/' + fn, data)
    console.log('uploaded: ' + 'data/' + fn)

    const id = getID()
    res.send(JSON.stringify({ res: 'ok', id: id }))

    fs.appendFileSync('data/log.txt', util.getYMDHMSM() + "," + id + "," + getIP(req) + "," + fn + "\n", "utf-8")
  } catch (e) {
    res.send(JSON.stringify({ res: 'err' }))
  }
})
app.get('/*', (req, res) => {
  let url = req.url
  if (url == '/' || url.indexOf('..') >= 0) {
    url = '/index.html'
  }
  let ctype = 'text/plain'
  if (url.endsWith('.html')) {
    ctype = 'text/html; charset=utf-8'
  } else if (url.endsWith('.js')) {
    ctype = 'application/javascript'
  } else if (url.endsWith('.mjs')) {
    ctype = 'application/javascript'
  } else if (url.endsWith('.css')) {
    ctype = 'text/css'
  }
  let data = null
  try {
    data = fs.readFileSync('static' + url)
  } catch (e) {
  }
  res.header('Content-Type', ctype)
  res.send(data)
})

app.listen(PORT, () => {
  console.log(`to access the top`)
  console.log(`http://localhost:${PORT}/`)
  console.log()
  console.log(`to download voice files uploaded`)
  console.log(`http://localhost:${PORT}${SECPATH}`)
  console.log()
  console.log(`edit .env if you want to change`)
  console.log()
  console.log('https://github.com/code4sabae/coughgathering/')
})
