

const handelLogin = (req,res,db,bcrypt)=>{
    const {email , password, selectedOption} = req.body;
    if(!email || !password || !selectedOption){
        db.select('Fname').from('nurses_registration').where('id','=',1).then(data =>{console.log(typeof(data[0].Fname))});
        return res.status(400).json('incorrect form submission');
   }
//    'admin_id','full_name','email'
   if(selectedOption === 'Admin'){
    db.select('email','password').from('admins')
    .where('email','=',email).
    then(data =>{
        const isValid = password === data[0].password;
        if(isValid){
            return db.select('*').from('admins')
            .where('email','=',email)
            .then(user =>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }else{
            res.status(400).json('wrong credentials');
        }       
    })
    .catch(err => res.status(400).json('wrong credentials'))
   }
   else if(selectedOption === 'Patient'){
    db.select('EmailId','password').from('patients_registration')
    .where('EmailId','=',email).
    then(data =>{
        const isValid = password === data[0].password;
        if(isValid){
            return db.select('*').from('patients_registration')
            .where('EmailId','=',email)
            .then(user =>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }else{
            res.status(400).json('wrong credentials');
        }       
    })
    .catch(err => res.status(400).json('wrong credentials'))
   }
   else if(selectedOption === 'Doctor'){
    db.select('EmailId','password').from('doctors_registration')
    .where('EmailId','=',email).
    then(data =>{
        const isValid = password === data[0].password;
        if(isValid){
            return db.select('*').from('doctors_registration')
            .where('EmailId','=',email)
            .then(user =>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }else{
            res.status(400).json('wrong credentials');
        }       
    })
    .catch(err => res.status(400).json('wrong credentials'))
   }
   else{
    db.select('Email_Id','password').from('hospital_admin')
    .where('Email_Id','=',email).
    then(data =>{
        const isValid = password === data[0].password;
        if(isValid){
            return db.select('*').from('hospital_admin')
            .where('Email_Id','=',email)
            .then(user =>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }else{
            res.status(400).json('wrong credentials');
        }       
    })
    .catch(err => res.status(400).json('wrong credentials'))
   }
    // db.select('email','hash').from('login')
    // .where('email','=',email)
    // .then(data =>{
    //     const isValid = bcrypt.compareSync(password,data[0].hash);
    //     if(isValid){
    //         return db.select('*').from('users')
    //         .where('email','=',email)
    //         .then(user =>{
    //             res.json(user[0])
    //         })
    //         .catch(err => res.status(400).json('unable to get user'))
    //     }else{
    //         res.status(400).json('wrong credentials');
    //     }
    // })
    // .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handelLogin
}