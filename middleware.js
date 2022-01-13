const InstituteAdmin = require('./models/InstituteAdmin')
const User = require('./models/User')

module.exports.isLoggedIn = (req, res, next) => {
    if (!(req.session.user || req.session.institute || req.session.admin)) {
        // req.session.returnTo = req.originalUrl
        return res.status(200).send({ message: 'You need to be Logged in first'})
    }
    next();
}


module.exports.isApproved = async (req, res, next) =>{
    const { id } = req.params
    const institute = await InstituteAdmin.findById({_id: id})
    if(institute.status === 'Not Approved'){
        res.status(200).send({ message: 'Your Institute will not approved by super admin'})
    }
    next()
}
