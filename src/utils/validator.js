const validator = require('validator');

const validate = (data)=>{
    const mandatoryFields = ['firstName', 'emailId', 'password'];

    const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if(!isAllowed){
        throw new Error("Some fields are missing");
    }
    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid Email ID");
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error("Password entered is weak");
    }
}

modules.exports = validate;