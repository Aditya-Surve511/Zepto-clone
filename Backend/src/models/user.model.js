const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userModel = new mongoose.Schema({

email :{
    type : String,
    required : [true , 'Email is required'],
    unique : true,
    trim : true,
    lowercase : true,
    match : /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    index : true
},

userName : {
    type : String,
    required : [true , "Username is required"],
    minlength : 2,
    maxlength : 30

},
phone :{
    type : String,
    required : [true , "Phone number is required"],
    unique : true,
    match : [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],

} ,
password :
{
    type : String,
    maxlength : 30,
    minlength : 6,


}



},{timestamps : true})


userModel.pre('save', async function(){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
})

userModel.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model('User',userModel);

module.exports = User;