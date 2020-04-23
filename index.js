let countriesLayer;
let deckMap;
let numberTileLayers = 0;
  
async function initialize() 
{
    const promises = [getComarcasLayerURL(), 
                      getRailroadsLayerURL(), 
                      getAirportLayerURL()];
    Promise.all(promises).then(
        data => {
                    var layers = getLayers(data);
                    createMap(layers);
                },
        error => alert(error));
}

function getLayers(data)
{
    var layers = [];

    for (var i = 0; i < data.length; i++)
    {
        layers.push(getTileLayer('https://common-data.carto.com/api/v1/map/' + 
                                 data[i].layergroupid + 
                                 '/{z}/{x}/{y}.png'))
    }

    return(layers);
}

function createMap(layers)
{
    deckMap = new window.deck.DeckGL(
    {
        //container: 'map',
        mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        initialViewState: 
        {
            longitude: -3,
            latitude: 40,
            zoom: 5,
        },
        controller: true,
        layers: layers
    });

    //addCARTOLayer();
}

function getAirportLayerURL()
{
    cartocss = "#layer { marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-width: 10;}"
    tableName = "public.ne_10m_airports";
    return(getTileLayerURL(cartocss, tableName));
}

function getWorldBordersLayerURL()
{
    cartocss = "#layer { polygon-fill: #FFF; polygon-opacity: 0.9; }";
    tableName = "public.world_borders";
    return(getTileLayerURL(cartocss, tableName));
}

function getComarcasLayerURL()
{
    cartocss = "#layer { polygon-fill: #A0A; polygon-opacity: 0.5; ";
    cartocss = cartocss + " text-name: '[nom_comar]'; ";
    cartocss = cartocss + " text-face-name: 'Open Sans Bold';"
    cartocss = cartocss + " text-size: 10;"
    cartocss = cartocss + "}";
    tableName = "public.comarcas";
    return(getTileLayerURL(cartocss, tableName));
}

function getRailroadsLayerURL()
{
    cartocss = "#layer { line-color: #AA0; line-width: 1; line-opacity: 0.5}";
    tableName = "public.ne_10m_railroads";
    return(getTileLayerURL(cartocss, tableName));
}

function getTileLayerURL(cartocss, tableName)
{
    var mapconfig = 
    {
        "version": "1.3.1",
        "layers": [
        {
            "type": "cartodb",
            "options": 
            {
                "cartocss_version": "2.1.1",
                "cartocss": cartocss,
                "sql": "select * from " + tableName
            }
        }]
    }
      
    return Promise.resolve($.ajax(
    {
        crossOrigin: true,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: 'https://common-data.carto.com/api/v1/map',
        data: JSON.stringify(mapconfig),
        success: function(data) 
        {
            var templateUrl = 'https://common-data.carto.com/api/v1/map/' + data.layergroupid + '/{z}/{x}/{y}.png'
            console.log(templateUrl);
        }
    }));
}

function getTileLayer(url)
{
    const layer = new deck.TileLayer(
    {
        //data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        data: url,

        id: "layer" + numberTileLayers,
    
        minZoom: 0,
        maxZoom: 19,
    
        renderSubLayers: props => {
            const 
            {
                bbox: {west, south, east, north}
            } = props.tile;
    
            return new deck.BitmapLayer(props, 
            {
                data: null,
                image: props.data,
                bounds: [west, south, east, north]
            });
        }
    });
    numberTileLayers++;

    return(layer);
}

function addCARTOLayer()
{
    carto.setDefaultCredentials({ username: 'public' });
    countriesLayer = new carto.viz.Layer('ne_50m_admin_0_countries');
    countriesLayer.addTo(deckMap);
}

