/*!
 * spur-template - An admin template based on Bootstrap 4
 * Version v1.1.0
 * Copyright 2016 - 2019 Alexander Rechsteiner
 * https://hackerthemes.com
 */

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup')
var content = document.getElementById('popup-content')
var closer = document.getElementById('popup-closer')

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250,
	},
})

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

//https://stackoverflow.com/questions/26544865/getting-features-from-clusters-in-openlayers
function isCluster(feature) {
	if (!feature || !feature.get('features')) { 
		return false; 
	}
	return feature.get('features').length > 1;
}

window.onload = function() {
	var count = 50;
	var features = new Array(count);
	var e = 10500000;
	for (var i = 0; i < count; ++i) {
		var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e]
		features[i] = new ol.Feature({
			geometry: new ol.geom.Point(coordinates),
			name: 'Mark' + i
		});
	}
	
	features[0].on('singleclick', function(evt) {
		console.log("Posición clikeada")
	})

	var source = new ol.source.Vector({
		features: features,
	});

	var clusterSource = new ol.source.Cluster({
		distance: 150,
		source: source,
	});

	var styleCache = {};
	var clusters = new ol.layer.Vector({
		source: clusterSource,
		style: function (feature) {
		var size = feature.get('features').length;
		var style = styleCache[size];
		if (!style) {
			style = new ol.style.Style({
			image: new ol.style.Icon({ scale: 0.6, src: '../img/pin_drop.png' }),
			text: new ol.style.Text({
				text: size.toString(),
				fill: new ol.style.Fill({
				color: '#ff2',
				}),
			}),
			});
			styleCache[size] = style;
		}
		return style;
		},
	});

	var raster = new ol.layer.Tile({
		source: new ol.source.OSM()
	})
	var map = new ol.Map({
		maxResolution: "auto",
		target: 'map',
		overlays: [overlay],
		layers: [ raster, clusters ],
		view: new ol.View({
			center: ol.proj.fromLonLat([-76.87112, -11.2301]),
			zoom: 3
		})
	});
	map.on('singleclick', function (evt) {
		let feature = map.forEachFeatureAtPixel(evt.pixel, 
			function(feature) {
				return feature; 
			}
		);
		//~ console.log("Fatures es:", features)
		if(feature == undefined) {
			return
		}
		var features = feature.get('features');
		if(isCluster(feature)) {
			// is a cluster, so loop through all the underlying features
			console.log("is cluster")
			//~ for(var i = 0; i < features.length; i++) {
				// here you'll have access to your normal attributes:
				//~ console.log(features[i].get('name'));
			//~ }
		}
		else {
			// not a cluster
			let marcador = feature.get('features')[0]
			var coordinate = marcador.get('geometry').getCoordinates()
			//~ console.log(marcador.get('geometry').getCoordinates() )
			var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
			//~ console.log("HDMS", hdms)

			content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code><p>' + marcador.get('name') + '</p>';
			overlay.setPosition( coordinate );
			//~ console.log("last feature")
			//~ console.log(feature.get('features')[0].get('name'));
		}
	});
	
	//~ console.log("ejecutado.")
}
