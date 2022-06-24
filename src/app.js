import express from 'express';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import videosRoutes from './routes/videos.route.js'

const app = express();

var urlEncodedParser = bodyParser.urlencoded({ extended: true });

app.use(express.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

app.post('/', urlEncodedParser, (req, res) => {
    console.log('Got body:', req.body);
    // res.sendStatus(200);
    res.json(req.body);
});

app.use(videosRoutes);

app.use(express.static('public'));

export default app;