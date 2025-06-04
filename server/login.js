const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('./UserDetails');
const User = mongoose.model("UserInfo");
const JWT_SECRET = "cbdkhbfehvfhjvehj()w2u43734gy33f48[][uy34843tfogfruyg3487";

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).collation({ locale: 'en', strength: 2 });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({
        status: "ok",
        user: {
            _id: user._id,
            email: user.email,
            city: user.city,
            gender: user.gender,
            name: user.name,  
            age: user.age,
        }
    });
});


module.exports = router;