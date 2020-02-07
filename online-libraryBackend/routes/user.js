const express = require('express');
const router = express.Router();
const User = require("../model/User");
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');

router.post('/singUp',
    [
        check("Fname","Fname is required").isEmpty(),
        check("Lname","Lname is required").isEmpty(),
        check("nic","NIC is required").isEmpty(),
        check("email","Please include a valid email").isEmail(),
        check("password","password with 6 or more character").isLength({min:6})
    ], async (req,res) =>{
    try {
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const userExist = await User.findOne({email:req.body.email});
        if(userExist){

            return res.status(400).json({error: "email is already exist"});
        }


        const user = new User(
            req.body
        )
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password,salt);

        await user.save();
        res.json("success");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
        
    }
})

router.post('/singIn',async (req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(400).json({error:"You are not Register"});
        }
        const isMatchPassword = await bcrypt.compare(req.body.password,user.password);
        if(!isMatchPassword){
            return res.status(400).json({error:"Your password is not Match"});
        }
        res.status(200).json("success");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
    
    
})

module.exports = router;