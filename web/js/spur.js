var features

var identidadDeMarcador = null

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
	identidadDeMarcador = null
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
	var count = puntos.ciudades.length;
	features = new Array(count);
	var e = 10500000;
	for (var i = 0; i < count; ++i) {
		//~ var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e]
		let punto = puntos.ciudades[i]
		features[i] = new ol.Feature({
			geometry: new ol.geom.Point( ol.proj.fromLonLat( [punto.lng, punto.lat] ) ),
			name: punto.name + " [" + i + "]",
			id: punto.id
		});
	}

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
	
	var view = new ol.View({
		center: ol.proj.fromLonLat([-76.87112, -11.2301]),
		zoom: 3
	})

	var map = new ol.Map({
		maxResolution: "auto",
		target: 'map',
		overlays: [overlay],
		layers: [ raster, clusters ],
		view: view
	});
	map.on('singleclick', function (evt) {
		let feature = map.forEachFeatureAtPixel(evt.pixel, 
			function(feature) {
				return feature 
			}
		);
		//~ console.log("Fatures es:", feature)
		if(feature == undefined) {
			return
		}
		var features = feature.get('features');
		if(isCluster(feature)) {
			// is a cluster, so loop through all the underlying features
			console.log("is cluster")
			//~ view.setZoom( view.getZoom() + 1  )
			view.animate( {
				zoom: view.getZoom() + 1,
				center: evt.coordinate
			} )
			//~ for(var i = 0; i < features.length; i++) {
				// here you'll have access to your normal attributes:
				//~ console.log(features[i].get('name'));
			//~ }
		}
		else {
			// not a cluster, sino el marcador final
			//~ identidadDeMarcador
			let marcador = feature.get('features')[0]
			
			//~ console.log( "ID: ", marcador.get('id') )
			if( marcador.get('id') == identidadDeMarcador ) {
				console.log("Feature ya seleccionado")
				return
			}
			identidadDeMarcador = marcador.get("id")
			
			var coordinate = marcador.get('geometry').getCoordinates()
			//~ console.log(marcador.get('geometry').getCoordinates() )
			var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
			//~ console.log("HDMS", hdms)
			
			content.innerHTML = '<p>Posición de ' + marcador.get('name') + ':</p><code>' + hdms + '</code>';
			overlay.setPosition( coordinate );
			//~ console.log("last feature")
			//~ console.log(feature.get('features')[0].get('name'));
		}
	});
	
	//~ console.log("ejecutado.")
}

function moverMarcador(indice, longitud, latitud) {
	//~ features[indice].setGeometry( ol.proj.fromLonLat( [longitud, latitud] ) )
	let coordenadasNuevas = ol.proj.fromLonLat( [longitud, latitud] )
	features[indice].setGeometry( new ol.geom.Point( coordenadasNuevas  ) )
	if (identidadDeMarcador != null && features[indice].get("id") == identidadDeMarcador) {
		overlay.setPosition( coordenadasNuevas );
	}
}

var i = 0
var delay = 275

var temporizador

function robandoMarcador(indice, lng, lat) {
	temporizador = setTimeout(function(){
		moverMarcador(indice,lng+(i/100000),lat-(i/100000));
		//~ conn.send(indice + "," + (lat -(i/100000)) + "," + (lng +(i/100000) ) )
		i++;
		if(i < 10000) { 
			robandoMarcador(indice, lng, lat);
		}
	},delay)
}
