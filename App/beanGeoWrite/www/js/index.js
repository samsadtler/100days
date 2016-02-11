
/*
beanGeoWrite 
  
This example uses Don Coleman's BLE Central Plugin for Apache Cordova
to create a central server that connects and reads data from the Light Blue Bean
through ScratchData characteristics. In Conjunction with the Google Maps JS API

created 29 Mar 2015
by Maria Paula Saba

Modified 19 Apr 2015
by Sam Sadtler
Used in conjunction with the google maps js API
    
Modified Further 10 Feb 2015
Switched from BLE Central to BluetoothLE 
on account of RSSI updating feature
by Sam Sadtler

*/



/* global mainPage, deviceList, refreshButton */
/* global connectedPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
// 'use strict';
var map;
var input;
var autocomplete;
var types;
var infowindow; 
var marker = null;
var markers = [];
var firstTime = true;
var heading;
var headingHolder = null; // maintains track of heading 
// between current location and point of interest
var perviousHeadingHolder; //used to keep track of a major 
// position change based on the GPS
var switchState = false;
var perviousHeading;
var stopVibration = true;
var placeInput;
var placeHolder = null;
var deviceId;
var makerBool = true;
var deviceBool = false;
var mapDiv;
var placesDiv;
var DEVICE = 'BeanSadtler';
// var DEVICE = 'SensorTag';
var deviceAddress;
var perviousTemp = 0;

var scratchServiceUUID = 'a495ff20-c5b1-4b44-b512-1370f02d74de';

                            // A495FF10-C5B1-4B44-B512-1370F02D74DE
var writeCharacteristicUUID = 'a495ff21-c5b1-4b44-b512-1370f02d74de';
var readCharacteristicUUID = 'a495ff22-c5b1-4b44-b512-1370f02d74de';
var accelVal = false;
var app = {
    initialize: function() {
        alert("initialized");
        this.bindEvents(); //binding event listeners to DOM in the app
        connectedPage.hidden = true; //hides the HTML elements for the second page
        
       
        // type-selector.hidden = true;

    },
    bindEvents: function() {
        
        document.addEventListener('deviceready', this.onDeviceReady, false); //runs onDeviceReady function whenever the device is ready (loaded)
        // document.addEventListener('deviceready', this.mapCanvas, false);
        // document.addEventListener('deviceready', this.autoComplete, false);
        // document.addEventListener('deviceready', this.startCompassWatch, false);
//        document.addEventListener('deviceready', this.startPositionWatch, false);
        // refreshButton.addEventListener('touchstart', this.refreshDeviceList, false); //on touch of the Refresh button, runs refreshDeviceList function
        refreshButton.addEventListener('touchstart', this.bleScan, false); //on touch of the Refresh button, runs refreshDeviceList function
        servicesButton.addEventListener('touchstart', this.bleServices, false);
        charButton.addEventListener('touchstart', this.bleChar, false);
        deviceList.addEventListener('touchstart', this.connect, false); //on touch of device list, connect to device
        readButton.addEventListener('touchstart', this.bleRead, false);
        accelButton.addEventListener('touchstart', this.bleSubscribe, false);
        sendButton.addEventListener('touchstart', this.bleWrite, false);
        rssiButton.addEventListener('touchstart', this.rssiTracker, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        umbrellaButton.addEventListener('touchstart', this.getLocation, false);
        // umbrellaButton.addEventListener('touchstart', this.getLocation, false);
    },

    onDeviceReady: function() {
        mapDiv = document.getElementById('map-canvas');
        placeInput = document.getElementById("pac-input");
        app.showStartPage();
        // app.refreshDeviceList();
        app.bleInit();
       
    },

    bleInit: function(){
        console.log('bleInit')
        var params = {
            "request": true,
            "statusReceiver": false
        };
        bluetoothle.initialize(function(e){

            app.bleSuccess(e)
            app.bleScan();
        }, app.bleError, params); 
    },
    bleSuccess: function(e){
        console.log('success: ', e)
        if (e.name == DEVICE){
            deviceAddress = e.address
            console.log('device address: ', deviceAddress);
        } else {
            console.log('didnt see nothing')
        }
    },
    bleError: function(e){
        console.log('error: ', e )
    },
    bleScan: function(){
        console.log('bleScan')
        params = {
          "services": [
              ],
            }
        bluetoothle.startScan(app.onDiscoverDevice, app.bleError, params);
        var success = function(deviceList){
            console.log('device list ', deviceList)
        }
    },
    bleDiscover: function(){
        params = {'address': deviceAddress};
        bluetoothle.discover(app.onDiscoverDevice, app.onError, params);
    },
    bleServices: function(){
        params = {'address': deviceAddress};
        bluetoothle.services(app.bleServeSuccess, app.onError, params);

    },
    bleServeSuccess:function(device){
        console.log('device services success')
        console.log('device services are: ', device);
        app.bleChar();
    },
    bleChar: function(){
        console.log('find characteristics')
        params = {
          "address": deviceAddress,
          "service": scratchServiceUUID,
          "characteristics": []
        }
        bluetoothle.characteristics(app.bleCharSuccess, app.onError, params);
    },
    bleCharSuccess: function(device){
        console.log('device characteristic success')
        console.log('device characteristics are: ', device);
    },
    bleConnect: function(device){
        console.log('bleConnect: ', device)
        var params = {
          "address": device.address
        }
        deviceAddress = device.address
        console.log('connect to BLE device', device)
        bluetoothle.connect(app.onConnect, app.bleError, params);
    },
    bleReconnect: function(){
        var params = {
          "address": deviceAddress
        }
        bluetoothle.reconnect(app.onConnect, app.bleError, params);
    },
    bleRetrieveConnected: function(){
        console.log('bleRetrieveConnected')
        var params = {
          "services": [
            "180D",
            "180F",
            "2A19",
            scratchServiceUUID
          ]
        }
        bluetoothle.retrieveConnected(app.bleSuccess, app.bleError, params);
    },
    refreshDeviceList: function() {
        console.log("refreshDeviceList");
        deviceList.innerHTML = ''; // empties the list
        ble.scan([], 5, app.onDiscoverDevice, app.onError); //scans for BLE devices
        // console.log('devices available', device);
    },
    rssiProxi: function() {
        console.log('rssiProxi')
        window.setInterval(function(){
            console.log('setInterval');
            ble.isConnected(deviceId, app.disconnect, function(device){
                console.log('if not connected connect')
                app.rssiScan();
            })
        }, 500);
    },
    rssiTracker: function(){
        console.log('rssiTracker for deviceAddress: ', deviceAddress)
        var params = {
            'address': deviceAddress
        }
       
            bluetoothle.rssi(app.rssiSuccess, app.bleError, params);
            

    },
    rssiSuccess: function(e){
        console.log('rssi updated', e.rssi)
        var rssi = e.rssi;
        console.log('display rssi rssiValue: ', rssi);
        var rssiValue = document.getElementById('rssiValue');
        rssiValue.innerHTML = '<b>' + e.name + '</b><br/>' +
        'RSSI: ' + rssi + '&nbsp;|&nbsp;' + e.name;


    },
    bleRead: function(){
        var params = {
            "address":deviceAddress,
            "service": scratchServiceUUID,
            "characteristic": readCharacteristicUUID
        }
        bluetoothle.read(app.readSuccess, app.onError, params);
    },
    bleSubscribe: function(){
        params = {
            "address": deviceAddress,
            "service": scratchServiceUUID,
            "characteristic": readCharacteristicUUID,
            "isNotification" : true
        }
        bluetoothle.subscribe(app.bleSubscribeSuccess, app.onError, params);
    },
    bleSubscribeSuccess: function(data){
        console.log('new notification data:', data);
        // var receivedData = new Uint8Array(data, 0, 5); 
        var receivedData = bluetoothle.encodedStringToBytes(data.value)         
        resultDiv.innerHTML = "New Acceleration:" + receivedData[0] + "," + receivedData[1] + "," +
            receivedData[2] + '<br>' + 'Tempature: ' + receivedData[3]+ 
            '<br>' + 'Battery: ' + receivedData[4]+'%'; 
        if (receivedData[3] > perviousTemp | receivedData[3] < perviousTemp) {
            app.updateTemp(receivedData[3])
            perviousTemp = receivedData[3];
        }
    },
    bleWrite: function(r,g,b){
        var data = new Uint8Array(3);

        var r = Math.round(Math.random()*255);
        var g = Math.round(Math.random()*255);
        var b = Math.round(Math.random()*255);  

        data[0] = r;
        data[1] = g;
        data[2] = b;

        console.log('write some shit to the bean', r , g, b)
        var string = '1';
        var bytes = bluetoothle.stringToBytes(string);
        var encodedString = bluetoothle.bytesToEncodedString(bytes);

        var params = {
            "value": encodedString,    
            "service": scratchServiceUUID,
            "characteristic": writeCharacteristicUUID,
            "type":"noResponse",
            "address": deviceAddress
        }

        //Note, this example doesn't actually work since it's read only characteristic
        bluetoothle.write(app.bleSuccess, app.onError, params);
        console.log('params being sent: ', params)

    },

    onDiscoverDevice: function(device) {
        //only shows devices with the name we're looking for
        console.log('discovered devices', device);
        if(device.name === DEVICE) {
            deviceAddress = device.address
            console.log('onDiscoverDevice device with services: -----------------> ', device)
            bluetoothle.stopScan(app.bleSuccess, app.bleError);
            console.log('stop scan');
            var ul = document.getElementById('deviceList');
            ul.innerHTML = '';
            //creates a HTML element to display in the app
            var rssi = device.rssi;
            var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
            'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
            device.id;
            listItem.innerHTML = html;
            listItem.dataset.deviceId = device.id;         //save the device ID in the DOM element
            listItem.setAttribute("class", "result");      //give the element a class for css purposes
            deviceList.appendChild(listItem);  
            deviceId = device.address; 
            console.log('deviceId: ', deviceId)
            app.autoConnect(device)    
            //attach it in the HTML element called deviceList
        }
        // console.log('discovered devices: ', device )
    },
    autoConnect: function(device){
        console.log('autoConnect')
        var rssi = device.rssi
        var messages = document.getElementById('messages');
            messages.innerHTML = '';
                //save the device ID in the DOM element
            messages.setAttribute("class", "result");      //give the element a class for css purposes
            
        if (rssi > -50){
            console.log('bean is close by autoConnect');
            messages.innerHTML = '<b> Autoconnecting...</b><br/>';
            if (deviceBool){
                console.log('try to reconnect')
                app.bleReconnect()
            } else {
                console.log('try to connect')
                deviceBool = true;
                app.bleConnect(device)
            }
            // ble.connect(deviceId, app.onConnect, app.onError);
        } else {
            console.log('bean not close enough for autoConnect');
            messages.innerHTML = '<b> move BLE device closer for autoConnect</b><br/>';
            window.setTimeout(app.refreshDeviceList, 3000);

        }
    },
    connect: function(e) {
        //get the device ID from the DOM element
        console.log('e.target.dataset', e.target.dataset);
        deviceId = e.target.dataset.deviceId;
        console.log("deviceId --> ", deviceId);
        //connect functions asks for the device id, a callback function for when succeeds and one error functions for when it fails
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(success) {
            console.log("Connected: ", success);         
            // app.showMapPage();
            app.showConnectPage();
            app.bleRetrieveConnected();
    },

    // works as a switch to turn on an off the bean
    fooData: function(){
        console.log('switch it, foo')
        // ble.read(deviceId, '1804', '2A07', function(success){console.log('read: ', success);}, app.onError)
        if (!switchState) {
            var data = 1
            app.sendData(data,data,data);
            console.log("turn on")
            switchState = true;
        }
        else if (switchState) {
            app.sendData(data,data,data);
            // app.sendData(254)
            console.log("turn off")
            switchState = false;
        }

    },
    sendData: function(r,g,b) { 
        // console.log('data to send:', sweat);
        // var r = Math.random()*255;
        // var g = Math.random()*255;
        // var b = Math.random()*255;  

        var data = new Uint8Array(3);

        data[0] = r;
        data[1] = g;
        data[2] = b;

        var heading = new Uint8Array(1);
        heading[0] = Math.round(data);
    
        var success = function(){
            console.log("Data written: ", data);
        };
        
        ble.write(deviceId, scratchServiceUUID, writeCharacteristicUUID, data.buffer, success, app.onError);
    },
    getAccel: function(){
        if (accelVal){
            accelVal = false; 
            console.log('getAccel, true');
            app.stopNotification()
        }
        else {
            accelVal = true; 
            app.readNotification()
            console.log('getAccel, true');
        }
    },
    checkAccel: function(){
        console.log('checkAccel');
        if (accelVal){
           app.readNotification()
        } else {
            app.stopNotification();
        }
     //data received from the bean
    },
    readData: function(){
        
        ble.read(deviceId, scratchServiceUUID, readCharacteristicUUID, app.readSuccess, app.onError);

    },
    readSuccess: function(data){
            console.log("read data: ", data )
            var receivedData = bluetoothle.encodedStringToBytes(data.value)
            //change to a unit8Array, length of 4.
            // var receivedData = new Uint8Array(data, 0, 4);          
            resultDiv.innerHTML = "Acceleration:" + receivedData[0] + "," + receivedData[1] + "," +
                receivedData[2] + '<br>' + 'Tempature: ' + receivedData[3]; 
            if (receivedData[3] > perviousTemp | receivedData[3] < perviousTemp) {
                app.updateTemp(receivedData[3])
                perviousTemp = receivedData[3];
            }
    },
    readNotification: function(){
        var success = function(data){
            console.log('new notification data:', data);
            var receivedData = new Uint8Array(data, 0, 5);          
            resultDiv.innerHTML = "New Acceleration:" + receivedData[0] + "," + receivedData[1] + "," +
                receivedData[2] + '<br>' + 'Tempature: ' + receivedData[3]+ 
                '<br>' + 'Battery: ' + receivedData[4]+'%'; 
            if (receivedData[3] > perviousTemp | receivedData[3] < perviousTemp) {
                app.updateTemp(receivedData[3])
                perviousTemp = receivedData[3];
            }
        }
        ble.startNotification(deviceId, scratchServiceUUID, readCharacteristicUUID, success, app.onError);
    },
    stopNotification: function(){       
        var success =function(data){
            console.log('notification stopped');
        }
        ble.startNotification(deviceId, scratchServiceUUID, readCharacteristicUUID, success, app.onError);
    
    },

    updateTemp: function(tempature) {
        console.log('updateTemp')
        var red = Math.round(app.map(tempature, 0 , 50 , 0 , 255));
        var blue = Math.round(app.map(tempature, 0 , 50 , 255 , 0));
        console.log('red: ', red , 'blue:',blue);
        $("body").css("background-color","rgb("+red+", 0," +blue+")");
        
    },
    map: function ( x,  in_min,  in_max,  out_min,  out_max){
          return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },
    disconnect: function(event) {
        // alert("Disconnected");
        console.log('disconnect')
        //gets device ID from disconnect button
        var messages = document.getElementById('messages');
        messages.innerHTML = '';
        app.stopNotification();
        params = {
            "address": deviceAddress,
            "service": scratchServiceUUID,
            "characteristic": readCharacteristicUUID
        }
        bluetoothle.unsubscribe(app.bleSuccess, app.bleError, params);
        bluetoothle.disconnect(app.bleSuccess, app.bleError, params);
        ble.disconnect(deviceId, app.showStartPage, app.onError);
    },
    showStartPage: function() {
        appDiv.hidden = false;
        startPage.hidden = false;
        connectedPage.hidden = true;
        mapDiv.hidden = true;
        placeInput.setAttribute("type","hidden");
        // placesDiv.hidden = true;
    },
    showConnectPage: function() {
        startPage.hidden = true;
        connectedPage.hidden = false;
    },
    showMapPage: function(){
        appDiv.hidden = true;
        startPage.hidden = true;
        connectedPage.hidden = true;
        mapDiv.hidden = false;
        placeInput.setAttribute("type","text");
        // placesDiv.hidden = false;
        console.log("shows map and start watching position and heading")
        // document.addEventListener('deviceready', this.startPositionWatch, false);
        // document.addEventListener('deviceready', this.startCompassWatch, false);
    },
    
    startCompassWatch: function(){
        var watchID = null;
        var options = { frequency: 100 };
        watchID = navigator.compass.watchHeading(app.onDirectionSuccess, app.onError, options);     

    },
// 
    startPositionWatch: function(){
        var watchID = null;
        var options = { timeout: 3000, enableHighAccuracy: true, maximumAge:100000};
        watchID = navigator.geolocation.watchPosition(app.mapPosition, app.onError, options);
        console.log("Start Watching with "+options.timeout/1000+"s timeout");
    },
    mapCanvas: function(position){
        var mapOptions = {
            zoom: 13,
            center: position
          };
          map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);
          
    },
    getLocation: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                console.log('detected position is --> ' + position);
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                console.log(lat + ' ' + lon);
                app.getTheWeatherAPI("Current Location", lat, lon);
                // geoCodeIt();
            });
        } else {
            return alert("Geolocation is not supported by this browser.");
        }
    },

    geoCodeIt: function (location){
        console.log("geoCodeIt");
        var apiKey = 'AIzaSyCIxywgknotMlV6Kjqn-HbJgQBkSAMPOlU';

        // make a request to geocode the location
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key='+apiKey,
            type: 'GET',
            failure: function(err){
                return alert ("Could not find that location");
            },
            success: function(response) {
              console.log('the geocode response is -- >');
              console.log(response);
              
              if(response.status=="ZERO_RESULTS") return alert ("Could not find that location");

              // now that we have the lat/lon details, can get the weather
              var lat = response.results[0].geometry.location.lat;
              var lon = response.results[0].geometry.location.lng;
              return app.getTheWeatherAPI(location, lat, lon);
            }
        });
    },

    getTheWeatherAPI: function(location, lat, lon){
        console.log('get weather');
        //forecast apiKey
        var apiKey = "a345a0f8bba13003d1bb79fa4fad60d6";

        // make a request to get the current weather details for the lat/lon
        $.ajax({
            url: 'https://api.forecast.io/forecast/'+apiKey+'/'+lat+','+lon,
            type: 'GET',
            dataType: "jsonp", // need to specify this
            success: function(response) {
              console.log('the weather response is -- >');
              console.log(response);
              // now that we have the weather details, we can build the card
              var status = response.currently.summary;
              var temp = Math.round(response.currently.temperature);
              // var icon = response.currently.icon;
              var chance = response.daily.data[0].precipProbability;

              // reset the input value
              // document.getElementById("theInput").value = '';
              console.log("Got the chance " + chance);
              // add the card
              return app.doINeedAnUmbrella(location, status, temp, chance);
            }
        });

    },
    doINeedAnUmbrella: function(location, status, temp, chance){
        var icon;
        var shortAnswer;
        var longAnswer;
        var outcome;
        var answerArray;
        $.ajax({
            url: './data/answers.json',
            type: 'GET',
            failure: function(err){
                return console.log ("There was an issue getting the data");
            },
            success: function(response) {
                console.log('the response from answers.json is -- >');
                console.log(response);
                var r = 0;
                var g = 0;
                var b = 0;
                if (chance <= .20) {
                    g = 255;
                } 
                if (chance > .20 && chance <= .40) {
                    g = 255;
                }
                if (chance > .40 && chance <= .60) {
                    b = 255;
                }
                if (chance > .60 && chance <= .80) {
                    g = 255;
                    b = 255;
                }
                if (chance > .80) {
                    b = 255;     
                }
                // answerArray = outcome.response;
                // icon = outcome.icon;
                // shortAnswer = answerArray[0];
                // longAnswer = answerArray[getRandomInt(1, answerArray.length)]
                // console.log("random value = " + getRandomInt(1, answerArray.length) + " and Array length " + answerArray.length + " and answerArray[0] = " + answerArray[0]);
                return app.sendData(r,g,b);
                }
        }); 
    },

    addCard: function(location, status, temp, icon, shortAnswer, longAnswer){


        $('.short-answer').text(shortAnswer);
        var chevronToAppend = 
            '<ul class="down-arrow col-sx- centered">'+
              '<li>'+
                  '<i class=" fa fa-chevron-down" >'+'</i>'+
              '</li>'+
            '</ul>';
        $('.arrow').append(chevronToAppend);   
        var htmlToAppend = 
        '<div class="card-container col-sx- centered">'+
            '<div class="card">'+
                    '<img src="img/'+icon+'">'+
                '<h1>'+longAnswer+'</h1>'+
          '</div>'+
        '</div>';
        $('.card-holder').append(htmlToAppend);
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    // on page load, let's get the user's location from the browser
 
    mapPosition: function(position){
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if (firstTime){
            app.mapCanvas(pos);
            app.autoComplete(pos);
            firstTime = false;
        }
        console.log("Lat Long: " + position.coords.latitude      + '<br />' +
        'Longitude: ' + position.coords.longitude     +
        'Heading: '   + position.coords.heading       +
        'Heading: '   + position.coords.accuracy );
        if (marker === null){
            app.mapMarker(pos);
        }

    },
    mapMarker: function(pos) {
        console.log("mapMarker Position: "+pos);
       
            if (marker !== null){
                marker.setMap(null);
                infowindow.setMap(null);
                }
            infowindow = new google.maps.InfoWindow({
                map: map,
                position: pos,
                content: 'Where You At'
                });
            
            google.maps.event.addListenerOnce(map, 'idle', function(){
                console.log("setCenter");                 
                map.setCenter(pos);
                
            });  
            google.maps.event.trigger(map, "resize");
           // This centers the map on the current position of the phone
            marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });

    },
    autoComplete: function(pos){
        input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
        types = document.getElementById('type-selector');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

        autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
            app.mapMarker(place.geometry.location);
            infowindow.close(); //commented out because it was returning an error
            marker.setVisible(false);

            if (!place.geometry) {
                return;
            }   

        // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
        marker.setPosition(place.geometry.location);
        placeHolder = place.geometry.location;
        app.placeHeading(pos, placeHolder);

        console.log(" placeHolder: " + placeHolder);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
        }),

        // Sets a listener on a radio button to change the filter type on Places
        // Autocomplete.
        setupClickListener = function(id, types) {
            var radioButton = document.getElementById(id);
            google.maps.event.addDomListener(radioButton, 'click', function() {
            autocomplete.setTypes(types);
            });
         //Place has been selected in text entry box


        }
        //    if(placeHolder !== null){
        //     console.log("placeHolder Not Null. PlaceHolder = " + placeHolder);
            
        // }
        // setupClickListener('changetype-all', []);
        // setupClickListener('changetype-address', ['address']);
        // setupClickListener('changetype-establishment', ['establishment']);
        // setupClickListener('changetype-geocode', ['geocode']);

    },

    placeHeading: function(current, place){
        //calculates the heading between to GPS coordinants
        perviousHeadingHolder = headingHolder;
        // headingHolder = null;
        headingHolder = google.maps.geometry.spherical.computeHeading(current, place);
        headingHolder = headingHolder + 180;
        console.log("headingHolder: "+ headingHolder);
        // deltaHeading = headingHolder - heading;
        var headingChange = Math.abs(perviousHeadingHolder - headingHolder); //based of gps
        if (headingChange > 5){
            app.mapMarker(current);

        }

    },
    onDirectionSuccess: function(heading){
        //calculates the heading based on the phones compass
        //if a destination has been set then calculate the offset
        //send offset to the bean
        console.log("Compass Heading: " + heading.magneticHeading);
        heading = heading.magneticHeading;
        if(headingHolder !== null){
            if (Math.abs(heading - headingHolder) < 90){
            
                console.log("Heading Delta:" + Math.abs(heading - headingHolder))
                deltaHeading = Math.abs(heading - headingHolder);
                app.sendData(deltaHeading);
                stopVibration = true;
            } else {
                if(stopVibration){
                    app.sendData(-1);
                    stopVibration = false;
                    console.log("motor should be off");
                    // app.sendData(-1); //try adding 
                    app.sendData(-1);
                } else {
                    console.log("no data sent");

                }

            }
        }
    },
    onPositionSuccess:  function(position){
        console.log("onSuccess: should be printing out Lat Long info = " + position.coords.latitude +
        'Longitude: ' + position.coords.longitude     +
        'Heading: '   + position.coords.heading       +
        'Heading: '   + position.coords.accuracy );
   
    },
    onError: function(reason) {
        console.log("ERROR: ", reason); // real apps should use notification.alert
        if (reason === "Disconnected"){
            app.showStartPage();
        }
    }
};



// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}


