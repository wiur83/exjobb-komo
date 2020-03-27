const sqlite3 = require('sqlite3').verbose();

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

class Voice {

  constructor(counter = 0) {
      this.counter = counter;
  }

  getCounter() {
      console.log(this.counter);
  }

  async getWordsDb() {
      //Get words and return
      let arrayWords = [];
      db.all("SELECT * FROM words", async (err, row) => {
          if (err) {
                console.log(err);
          } else {
                console.log("här");

                await row.forEach(element => arrayWords.push(element["words"]));
                console.log(arrayWords);
                console.log("här");
                global.words = arrayWords;
          }

      });


  }














}

module.exports = Voice;
