var app = require("../").app;
var server = require("../").server;
var chai = require('chai');
const {User} = require('../accounts/models');
const should = chai.should();
const defaultUser = { email: "test@techbrij.com", password: "testfgfgf" };

const createUser = async () => {
  const UserModel = new User(defaultUser);
  await UserModel.save();
};

const getDefaultUser = async () => {
  let user = await User.where({ email : defaultUser.email }).fetch();
  if (!user) {
    await createUser();
    return getDefaultUser();
  } else {
    return user.attributes;
  }
};


// const loginWithDefaultUser = async () => {
//   let user = await getDefaultUser();
//   chai.request(server)
//       .post('/login')
//       .send({ email: user.email, password: user.password })
//       .end(function(err,res){
//         res.should.have.status(200);
//       });
// };
// const cleanExceptDefaultUser = async (item) => {
//   let user = await getDefaultUser();
//
//   await
//
// };

// module.exports = { cleanExceptDefaultUser}
