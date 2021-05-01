
import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {toLonLat,fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';

// import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
// import OpenLayers from 'ol/OpenLayers';
// import Map from 'ol/Map';
import Point from 'ol/geom/Point';
// import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style';
import {OSM, Vector as VectorSource} from 'ol/source';
import { Vector as VectorLayer} from 'ol/layer';

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

var key = 'WcQwVKLzewPlTubQyWML';
var attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

/**
 * Create the map.
 */

var view = new View({
  center: [0, 0],
  zoom: 2,
});
var map = new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
        tileSize: 512,
      }),
    }) ],
  overlays: [overlay],
  target: 'map',
  view:view,
});

/**
 * Add a click handler to the map to render the popup.
 */
// map.on('singleclick', function (evt) {
//   var coordinate = evt.coordinate;

//   var hdms = toStringHDMS(toLonLat(coordinate));

//   content.innerHTML = '<p>Ambulance here:</p><code>' + hdms + '</code>';
//   overlay.setPosition(coordinate);
// });

function addMarker(ambulance) {
  coordinate = [ambulance["longitude"],ambulance["latitude"]]
console.log(coordinate)
  var hdms = toStringHDMS(coordinate);
console.log(ambulance)
  content.innerHTML =
  '<p>date:'+ambulance["date"]+'</p>'+
  '<p>latitude:'+ambulance["latitude"]+'</p>'+
  '<p>longitude:'+ambulance["longitude"]+'</p>'+
  '<p>satellitesnumber:'+ambulance["satellitesnumber"]+'</p>'+
  '<p>time:'+ambulance["time"]+'</p>'+
  '<p>Ambulance here:</p><code>' + hdms + '</code>';
  overlay.setPosition(fromLonLat(coordinate));
 
}



// var map = new Map({
//   layers: [
//     new TileLayer({
//       source: new OSM(),
//     }) ],
//   target: 'map',
//   view: view,
// });

var geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});

// update the HTML page when the position changes.
geolocation.on('change', function () {
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

// handle geolocation error.
geolocation.on('error', function (error) {
  var info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

var accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

var positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);
geolocation.on('change:position', function () {
  var coordinates = geolocation.getPosition();
  map.getView().setCenter(coordinates);
  map.getView().setZoom(16);
  console.log(toLonLat(coordinates))
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  // addMarker([76.28617520817103,9.964410951281424]);
  var my = toLonLat(coordinates)
  var amb = [ambulance["longitude"],ambulance["latitude"]]
  if(eucDistance(amb,my)<=0.033)
    notice();
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
  
});


const preObject = document.getElementById('object');
const dbRefObject = firebase.database().ref().child('Test/Stream/firstAmbulance');
dbRefObject.on('value',(snap) =>{ 
  ambulance=snap.val()
  addMarker(ambulance);
});
function notice(){
  alert("Ambulance");
}
function eucDistance(a, b) {
    return a
        .map((x, i) => Math.abs( x - b[i] ) ** 2) // square the difference
        .reduce((sum, now) => sum + now) // sum
        ** (1/2)
}