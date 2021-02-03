const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const imgModel = require('./models/model');
require('dotenv/config');

const app = express();
const PORT = process.env.PORT || 4200;

mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},
    err => {
        console.log('Connected to DB!');
    });

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set('view engine', "ejs");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/blogs')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

var upload = multer({ storage: storage, fileFilter: fileFilter });

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

app.post('/', upload.single('image'), (req, res, next) => {

    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/blogs/' + req.file.filename))
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
});

app.listen(PORT, () => {
    console.log("Server is running at port ",+PORT);
});