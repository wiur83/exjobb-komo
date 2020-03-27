const sqlite3 = require('sqlite3').verbose();

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

module.exports = {
    doSomethingAsync: async function() {
        return new Promise(resolve => {
            // setTimeout(() => resolve('I did something'), 3000)
            let arrayWords = [];
            db.all("SELECT * FROM words", async (err, row) => {
                if (err) {
                      console.log(err);
                }
                  // console.log("här");

                  row.forEach(element => arrayWords.push(element["words"]));
                  // console.log(arrayWords);
                  // console.log("här");
                  global.words = arrayWords;
                  console.log("hej");
                  resolve({arrayWords});
            });


        })
    },
    doSomething: async function() {
        console.log(await doSomethingAsync())
    }
}


// module.exports = {
//     method: async function() {
//         console.log("test1");
//     },
//     otherMethod: async function() {
//         //Get words and return
//         let arrayWords = [];
//         db.all("SELECT * FROM words", (err, row) => {
//             if (err) {
//                   console.log(err);
//             }
//               // console.log("här");
//
//               row.forEach(element => arrayWords.push(element["words"]));
//               // console.log(arrayWords);
//               // console.log("här");
//               global.words = arrayWords;
//         });
//         return arrayWords;
//     }
// }
