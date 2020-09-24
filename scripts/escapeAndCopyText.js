const process = require('process')
const fs = require('fs')
const clipboardy = require('clipboardy')

if(process.argv.length > 2) {
  const path = process.argv[2]
  fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
    if(err) {
      console.log(err)
    } else {
      clipboardy.writeSync(JSON.stringify(data))
      console.log('copied')
    }
  })
} else {
  console.log('Missing file arg')
}