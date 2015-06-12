/**
 * Pebble JS watch app that retrieves weather data
 * Reads and outputs data using a menu.
 */

var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

//show splash screen while waiting for data
var splashWindow = new UI.Window();
//text element to inform user
var text = new UI.Text({
  position: new Vector2(0,0),
  size: new Vector2(144,168),
  text:'Downloading weather data...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow: 'wrap',
  textAlign:'center',
  backgroundColor:'white'
});

//add to splashwindow and show
splashWindow.add(text);
splashWindow.show();

var parseFeed = function(data,quantity){
  var items = [];
  for(var i=0; i < quantity; i++){
    //uppercase desc string
    var title = data.list[i].weather[0].main;
    title = title.charAt(0).toUpperCase() + title.substring(1);
    
    //get date time substring
    var time = data.list[i].dt_txt;
    time = time.substring(time.indexOf('-') + 1, time.indexOf(':') + 3);
    
    //add to menu items array
    items.push({
      title: title,
      subtitle: time
    });
  }
  
  //return array
  return items;
};
//make request to weather data
ajax(
  {
    url: 'http://api.openweathermap.org/data/2.5/forecast?q=London',
    type: 'json'
  },
  function(data){
    var menuItems = parseFeed(data,10);
    
    //check the items are extracted OK
    for(var i=0; i< menuItems.length;i++){
      console.log(menuItems[i].title + ' | ' + menuItems[i].subtitle);
    }
    
    //construct menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Forecast',
        items: menuItems
      }]
    });
    
    
    // Add an action for SELECT
    resultsMenu.on('select', function(e) {
     //get that forecast
     var forecast = data.list[e.itemIndex];
      //assemble the body string
      var content = data.list[e.itemIndex].weather[0].description;
      
      //capitalize first letter
      content = content.charAt(0).toUpperCase() + content.substring(1);
      
      // Add temperature, pressure etc
  content += '\nTemperature: ' + Math.round(forecast.main.temp - 273.15) + '°C' 
  + '\nPressure: ' + Math.round(forecast.main.pressure) + ' mbar' +
    '\nWind: ' + Math.round(forecast.wind.speed) + ' mph, ' + 
    Math.round(forecast.wind.deg) + '°';
      
      var detailCard = new UI.Card({
        title:'Details',
        subtitle:e.item.subtitle,
        body: content
      });
      
      detailCard.show();
    });
    
    //show the menu, hide the splash
    resultsMenu.show();
    //register for 'tap' events/ shake events
    resultsMenu.on('accelTap', function(e){
      //make another request to openweathermap.org
      ajax(
        {
          url: 'http://api.openweathermap.org/data/2.5/forecast?q=London',
          type: 'json'
        },
        function(data){
          //create an array of Menu items
          var newItems = parseFeed(data,10);
          
          //update the menu's first section
          resultsMenu.items(0, newItems);
          
          //notify the user
          Vibe.vibrate('short');
        },
        function(error){
          console.log('Download failed: ' + error)
        }
      );
    });
    splashWindow.hide();
  },
  function(error){
    console.log('Download failed: '+ error);
  }
);
//prepare the accelerometer
Accel.init();