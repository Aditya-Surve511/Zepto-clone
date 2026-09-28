const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const registerUserController = async (req,res) => {
    try{
        const {email,userName,phone,password} = req.body;

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message : "User already exists"});
        }

        const newUser = new userModel({
            email,
            userName,
            phone,
            password
        });

        await newUser.save();

        return res.status(201).json({message : "User registered successfully"});

    }catch(error){
        return res.status(500).json({message : "Something went wrong"});
    }
}

const loginUserController = async (req,res) => {
    try{
        const {email,password} = req.body;

        const existingUser = await userModel.findOne({email});
        if(!existingUser){
            return res.status(404).json({message : "User not found"});
        }

        const isPasswordCorrect = await existingUser.comparePassword(password);
        if(!isPasswordCorrect){
            return res.status(400).json({message : "Invalid credentials"});
        }

        const token = jwt.sign({id : existingUser._id},process.env.JWT_SECRET,{expiresIn : "1h"});

        const user = existingUser.toObject();
        delete user.password;

        return res.status(200).json({result : user,token});

    }catch(error){
      return res.status(500).json({message : "Something went wrong"});
    }
}


module.exports = {registerUserController, loginUserController};