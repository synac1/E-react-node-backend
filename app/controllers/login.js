

const handelLogin = (req,res,db,bcrypt)=>{
    const {email , password, selectedOption} = req.body;
    if(!email || !password){
        db.select('Fname').from('nurses_registration').where('id','=',1).then(data =>{console.log(typeof(data[0].Fname))});
        return res.status(400).json('incorrect form submission');
   }

   if(selectedOption === 'Admin'){
    db.select('email').from('admins').where('email','=',email).then(da)
   }
    db.select('email','hash').from('login')
    .where('email','=',email)
    .then(data =>{
        const isValid = bcrypt.compareSync(password,data[0].hash);
        if(isValid){
            return db.select('*').from('users')
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

module.exports = {
    handelLogin
}