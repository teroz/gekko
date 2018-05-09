// This is a basic example strategy for Gekko.
// For more information on everything please refer
// to this document:
//
// https://gekko.wizb.it/docs/strategies/creating_a_strategy.html
//
// The example below is pretty bad investment advice: on every new candle there is
// a 10% chance it will recommend to change your position (to either
// long or short).
const sqlite3 = require('sqlite3').verbose();

var log = require('../core/log');

// Let's create our own strat
var strat = {};

// Prepare everything our method needs
strat.init = function() {
  this.input = 'candle';
  this.currentTrend = 'long';
  this.requiredHistory = 0;
}

// What happens on every new candle?
strat.update = function(candle) {

    //   open the database
    let db = new sqlite3.Database('../BitcoinForecast/data.db', sqlite3.OPEN_READ, (err) => {
      if (err) {
        console.error("db error :",err.message);
      }
      //console.log('Connected to the chinook database.');
    });
 
    db.serialize(() => {
      var p_row;
      db.each(`SELECT * from predict order by rowid desc limit 2`, (err, row) => {
        if (err) {
          console.error("error found", err.message);
        }
        else
        {
           if (p_row){
              if(p_row.slope < -20 && p_row.slope < row.slope) // up we go we buy
              {
                  this.currentTrend = "long";
                  this.toUpdate = true;
                  console.log("Update: Advise is to long")
              }
              else if(p_row.slope > 20 && p_row.slope > row.slope) //down we go we sell
              {
                  this.currentTrend = "short";
                  this.toUpdate = true;
                  console.log("Update: Advise is to short")
              }
              else
                this.toUpdate = null;

           }
           else
              p_row = row;
        }
        
        console.log(row);
      });
    });
 
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      //console.log('Close the database connection.');
    });


 }

// For debugging purposes.
strat.log = function() {
  //log.debug('calculated random number:');
  //log.debug('\t', this.randomNumber.toFixed(3));
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function() {

  // Only continue if we have a new update.
  if(!this.toUpdate)
    return;

  if(this.currentTrend === 'long') {

    // If it was long, set it to short
    this.currentTrend = 'short';
    this.advice('short');

  } else {

    // If it was short, set it to long
    this.currentTrend = 'long';
    this.advice('long');

  }
}

module.exports = strat;
