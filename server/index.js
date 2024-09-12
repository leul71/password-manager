const express = require('express');
const mongoose = require('mongoose');
const env = require('dotenv');
const app = express();
const cors = require('cors');
const {encrypt, decrypt} = require('./encryptionHandler');

app.use(cors());
env.config();
app.use(express.json());


const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.URI)
.then(() => {
    console.log('Succesfylly Connected to MongoDB');
}).catch((err) => {
    console.log('Error:', err);
});

const passwordSchema = new mongoose.Schema({
    password: String,
    title: String,
    iv: String,
});

const Password = mongoose.model('Password', passwordSchema);

app.post('/addPassword', async (req, res) => {
    console.log('Received Request Body:', req.body);
    const { password, title } = req.body;
    const hashedPassword = encrypt(password);

    try {
    const newPassword = new Password({password: hashedPassword.password, title, iv: hashedPassword.iv});
    await newPassword.save();
    res.send("passowrd added successfully");
    } catch (err) {
        console.log('Error adding password:', err);
    }
});

app.get('/showPasswords', async(req, res) => {
    try{
        const passwords = await Password.find();
        res.json(passwords);
    } catch (err) {
        console.log('Error fetching passwords:', err);
    }
});

app.post('/decryptPassword', (req, res) => {
    res.send(decrypt(req.body));

});


app.use ('/all', (req, res) =>{
    Password.find({}, (err, result) => {
        if (err) {
            console.log('Error:', err);
            res.status(500).send('Error getting values');
        } else {
            res.send(result);
        }
    });
})

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);

});
