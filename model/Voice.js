const sqlite3 = require('sqlite3').verbose();

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

module.exports = {
    //Vid register
    getWords: async function() {
        return new Promise(resolve => {
            let arrayWords = [];
            db.all("SELECT * FROM words", async (err, row) => {
                if (err) {
                    console.log(err);
                } else {
                    row.forEach(element => arrayWords.push(element["word"]));
                    global.words = arrayWords;
                    resolve(arrayWords);
                }
            });
        })
    },
    //Innan start
    getUserWords: async function() {
        return new Promise(resolve => {
            db.all("SELECT * FROM data WHERE user_id = ?",
            global.userBackupId, async (err, row) => {
                if (err) {
                    console.log(err);
                    resolve(err);
                } else {
                    let Obj = {};
                    // var obj = {key1: ["val1", "val2", "val3"], key2: "value2"};
                    for (let i = 0; i < row.length; i++) {
                        if (!(row[i]["word"] in Obj)) {
                            Obj[row[i]["word"]] = [row[i]["res_word"]];
                        } else {
                            Obj[row[i]["word"]].push(row[i]["res_word"]);
                        }

                    }
                    resolve(Obj);
                }

            });


        })
    },
    //Innan start
    setUserWords: async function() {
        return new Promise(resolve => {
            let wordsList = global.words;
            for (let i = 0; i < wordsList.length; i++) {
                db.get("SELECT COUNT(*) AS total FROM data WHERE word LIKE ?",
                wordsList[i],(err, row) => {
                    if (err) {
                        resolve(err);
                    } else {
                        if (row.total == 0) {
                            //ord finns inte
                            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                                global.userBackupId, wordsList[i], wordsList[i], 1, (err) => {
                                if (err) {
                                    resolve(err);
                                }
                            });
                        }
                    }
                });
                resolve("success");
            }
        })
    },
    //Innan start
    getCounterWords: async function() {
        return new Promise(resolve => {
            let count = 0;
            for (var c in global.userWords) {
                count = count + 1;
            }
            resolve(count);
        })
    },
    //Innan startglobal.currentWord
    addToNrOfTries: async function() {
        return new Promise(resolve => {
            db.get("SELECT nr_of_tries FROM data WHERE user_id = ? AND res_word = ?",
            global.userBackupId,global.subWord,(err, row) => {
                if (err) {
                    resolve(err);
                } else {
                    let newNumberOfTries = row.nr_of_tries + 1;
                    db.run("UPDATE data SET nr_of_tries = ? WHERE user_id = ? AND res_word = ?",
                        newNumberOfTries, global.userBackupId, global.subWord, (err) => {
                        if (err) {
                            resolve(err);
                        }
                    });
                    resolve("success");
                }
            });
        })
    },
    //addResWord
    addResWord: async function() {
        return new Promise(resolve => {
            //Gör saler global.currentWord
            db.run("INSERT INTO data (user_id, word, res_word, nr_of_tries) VALUES (?, ?, ?, ?)",
                global.userBackupId, global.currentWord, global.subWord, 1, (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Sucess");
        })
    },
    //addResWord
    addToStatistics: async function() {
        return new Promise(resolve => {
            //Gör saler global.currentWord
            db.run("INSERT INTO statistics (user_id, score, total_score) VALUES (?, ?, ?)",
                global.userBackupId, global.score, global.counterWords, (err) => {
                if (err) {
                    resolve(err);
                }
            });
            resolve("Sucess");
        })
    }

}
