const express = require('express');
const app = express();

app.set('json spaces', 2);

app.use('/', (req, res) => { res.json({
    protocol: req.protocol,
    baseUrl: req.baseUrl,
    subdomains: req.subdomains,
    hostname: req.hostname
}); });

app.listen(80, () => { console.log('Server up'); });
