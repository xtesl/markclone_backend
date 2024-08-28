// const DbServices = require('../config/db');
// const dbServices = DbServices.getDbServiceInstance();
// const asyncHandler = require('express-async-handler');


// class RefreshToken{

//     constructor(token, user_id){
//          this.token = token;
//          this.user_id = user_id;
//     }
//     save = asyncHandler(async()=>{
          
//         const sqlStatements = ` 
//           INSERT INTO refreshtokens (token, user_id, expiresAt)
//           VALUES(?, ?, NOW());
//         `
//         const result = await dbServices.save([this.token, this.user_id], sqlStatements).then((result) => {
//             return result;
//           }).catch((err) => {
//               throw new Error(err);
//           });

//           return result;
//     });

//      static findTokenByUserId = asyncHandler(async(user_id)=>{
//       const [result] = await dbServices.getTokenByUserId(user_id).then((result) => {
//            return result;
//       }).catch((err) => {
//         throw new Error(err);
//       });
//       return result;
//   });

//   static updateTokenByUserId = asyncHandler(async(token, user_id)=>{
//     const data = [token, user_id];
//     const sqlStatements = `
//       UPDATE refreshtokens set
//       token = ?,
//       expiresAt = NOW()
//       WHERE user_id = ?
//     `
//     const [result] = await dbServices.update(data, sqlStatements).then((result) => {
//          return result;
//     }).catch((err) => {
//       throw new Error(err);
//     });
//     return result;
// });

// }


// module.exports = RefreshToken;