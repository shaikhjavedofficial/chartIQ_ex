import { CIQ } from "https://jsfiddle.chartiq.com/chart/js/advanced.js";

// Create your QuoteFeed object.
var myQuoteFeed = {};

myQuoteFeed.url = "https://jsfiddle.chartiq.com/sample_json.js";

// The chart uses a few different methods attached to your quotefeed to get data.
// This is where the action is, in these methods. params will tell you what the chart needs (symbol, interval, date ranges)
// Use that data to construct your query. Use our ajax, jquery, or any other method to fetch the data
// Make sure it's in the right format and return it in the callback like below.  Always use cb() to return data from fetch methods!  Even errors. 

// This method is called by the chart to fetch initial data
myQuoteFeed.fetchInitialData = function(symbol, startDate, endDate, params, cb) {
  console.log("params=", params);

  var query = this.url +
    "?symbol=" + symbol +
    "&interval=" + params.interval +
    "&startDate=" + CIQ.yyyymmddhhmm(startDate) +
    "&endDate=" + CIQ.yyyymmddhhmm(endDate);

  CIQ.postAjax(query, null, function(status, response) {
    if (status == 200) {
      cb({
        quotes: JSON.parse(response),
        moreAvailable: false
      });
    } else {
      cb({
        error: (response ? response : status)
      });
    }
  });

  // This sample assumes the response returns only the data and in the right format.
  // Put your code here to format the response according to the specs 
  // and return it in the callback.
  // Example code to iterate trough the reformatted responses and load them one at a time:
  //	var quotes=formatQuotes(response);  // your function to creates a properly formated array.
  //	var newQuotes=[];
  //	for(var i=0;i<quotes.length;i++){
  //		newQuotes[i]={};
  //		newQuotes[i].Date=quotes[i][0]; // Or set newQuotes[i].DT if you have a JS Date
  //		newQuotes[i].Open=quotes[i][1];
  //		newQuotes[i].High=quotes[i][2];
  //		newQuotes[i].Low=quotes[i][3];
  //		newQuotes[i].Close=quotes[i][4];
  //		newQuotes[i].Volume=quotes[i][5];
  //		newQuotes[i].Adj_Close=quotes[i][6];
  //	}

  // Set 'moreAvailable' to 'true' if you know that more, older, 
  // data is available for when the user scrolls back in time.
  // Your feed should send back an indicator you can use to determine if more data is available.
  // Our sample does not have more data, so we set to 'false'.
};

myQuoteFeed.fetchUpdateData = function(symbol, startDate, params, cb) {
  // in this particular case, nothing to do here
  // since refreshInterval was set to 0.
  // chart updates handled by updateChartData().
}

myQuoteFeed.fetchPaginationData = function(symbol, startDate, endDate, params, cb) {
  console.log("more data requested");
  // to see this, set moreAvailable to true and scroll back to the end of the data on the chart


  // The chart gives you a hint in params.ticks to tell you how many bars are needed to fill the chart.
  // This should be the *minimum* to load. We recommend loading twice this much so that the chart
  // can be scrolled and so that studies have enough back data to compile.

  var query = this.url +
    "&endDate=" + CIQ.yyyymmddhhmm(params.endDate) +
    "&records=" + (params.ticks * 2); // suggested number of data points to fetch.

  // Your ajax call would go here.  Since we don't have any older data, we're not
  // going to put one here, but it's the same idea as in 
  // fetchInitialData().  
  return;
}
console.log(myQuoteFeed)
// Declare a CIQ.ChartEngine object. This is the main object for drawing charts.
var stx = CIQ.ChartEngine({
  div:document.getElementsByClassName(".chartContainer")});

stx.attachQuoteFeed(myQuoteFeed,{refreshInterval: 0}); // Attach your QuoteFeed

// run the chart for the symbol of your choice and start streaming.
stx.setPeriodicity(1, "day");
stx.loadChart("SPY", null, function() {
  // Use the loadChart callback to start streaming your data 
  // once the chart is loaded with the historical data.
  startStreaming();
});


/******************* Trade simulation for demo purposes only ************************/
/************************************************************************************/
/************************************************************************************/
/************************************************************************************/
// The following function is just a simulation (using randomly generated data) to 
// illustrate how to asynchronously stream data into the chart using updateChartData
// to first fill in any missing ticks from the original historical load and then start streaming real time ticks 
// from a trade feed that only returns the last price.
// Your code should call your own function when triggered by your streaming interface.

function startStreaming() {
  var price = 200;
  var lastDate = new Date();

  // if there is something in the dataSet use the last element as the basis for our random seed
  if (stx.chart.dataSet.length) {
    price = stx.chart.dataSet[stx.chart.dataSet.length - 1].Close;
    lastDate = new Date(stx.chart.dataSet[stx.chart.dataSet.length - 1].DT);
  }

  var change = (price * .02) * Math.random() - (price * .01); // random between +/-1% of current price
  price = price + parseFloat(change.toFixed(2));
  var volume = (1000 * Math.random()).toFixed(0); // Volume between 1 and 1000 shares

  if (lastDate < new Date()) {
    // simulate a new tick for next day if we have a gap.
    // we are simulating daily ticks since our original data is also daily.
    // when appending to a dataSet, always match the existing data's periodicity.
    // You should never mix periodicity in the same dataSet.
    lastDate.setDate(lastDate.getDate() + 1);

    var newData = [];
    newData[0] = {};
    //newData[0].DT = new Date(lastDate.getTime());    // either DT or Date can be used
    newData[0].Date = CIQ.yyyymmddhhmm(lastDate);
    newData[0].Open = price - .5;
    newData[0].High = price + 1.5;
    newData[0].Low = price - 1;
    newData[0].Close = price;
    newData[0].Volume = volume;

		stx.updateChartData(newData);
    console.log('using updateChartData to replace/ add the entire candle');
  } else {
  	stx.updateChartData({Last:price,Volume:volume},null,{fillGaps: true});
    console.log('using updateChartData to stream the last price');
  }
  console.log(lastDate);

  setTimeout(startStreaming, 250);
}
console.log(myQuoteFeed)
export default myQuoteFeed;