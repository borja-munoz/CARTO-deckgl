import {CartoSQLLayer, setDefaultCredentials} from '@deck.gl/carto';
import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';


const INITIAL_VIEW_STATE = {
    latitude: 32,
    longitude: -103,
    zoom: 4,
    pitch: 60,
    bearing: 0
};

setDefaultCredentials({
    username: 'bmunoz',
    apiKey: 'default_public'
});

// Styles for continent selector
const selectStyles = {
    position: 'absolute',
    zIndex: 1
};

// Continents to filter by
const continents = ['All', 'Africa', 'Asia', 'South America', 'North America', 'Europe', 'Oceania'];
const options = continents.map(c => (
    <option key={c} value={c}>
    {c}
    </option>
));

// Build SQL where condition for the selected continent
function getContinentCondition(continent) {
    return continent !== 'All' ? `WHERE continent_name='${continent}'` : '';
}

export default function App() {
    const [continent, setContinent] = useState('All');

    /*
    const layer = new CartoSQLLayer({
    data: `SELECT * FROM world_population_2015 ${getContinentCondition(continent)}`,
    pointRadiusMinPixels: 6,
    getLineColor: [0, 0, 0, 0.75],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
    });
    */

    // Color breaks
    const POLYGON_COLORS = 
    {
        DEMOCRAT: [0, 0, 225],
        REPUBLICAN: [225, 0, 0],
        GREEN: [0, 225, 0],
        NA: [120, 120, 120],
    };

    const sqlCounties = `SELECT a.cartodb_id, a.the_geom_webmercator, 
                                a.year, a.state, a.county, a.candidate, 
                                a.party, a.candidatevotes
                           FROM countypres_2000_2016 a INNER JOIN
                                (SELECT year, state, county, 
                                        max(candidatevotes) AS max_candidate_votes
                                   FROM countypres_2000_2016
                                  GROUP BY year, state, county) b ON 
                                a.year = b.year AND 
                                a.state = b.state AND 
                                a.county = b.county AND 
                                a.candidatevotes = b.max_candidate_votes`;

   const layer = new CartoSQLLayer({
        id: "us_elections_by_county",
        data: sqlCounties + " WHERE a.year = 2016",
        getFillColor: (object) => {
            if (object.properties.party == "democrat") 
            {
                return POLYGON_COLORS.DEMOCRAT;
            } 
            else if (object.properties.party == "republican") 
            {
                return POLYGON_COLORS.REPUBLICAN;
            } 
            else if (object.properties.party == "green") 
            {
                return POLYGON_COLORS.GREEN;
            } 
            else if (object.properties.party == "NA") 
            {
                return POLYGON_COLORS.NA;
            } 
        },
        //getLineColor: [0, 0, 0, 100],
        //lineWidthMinPixels: 0.5,
        pickable: true,
        extruded: true,
        //wireframe: true,
        getElevation: (f) => 
        {
            return f.properties.candidatevotes ? f.properties.candidatevotes * 0.25 : 0
        },
        /*
        transitions: {
            getElevation: {
            duration: 1000,
            enter: value => [0]
            }
        }*/
    });

    return (
        <div>
            <select style={selectStyles} onChange={e => setContinent(e.currentTarget.value)}>
                {options}
            </select>

            <DeckGL
                width="100%"
                height="100%"
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={[layer]}
            >
                <StaticMap
                reuseMaps
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                preventStyleDiffing
                />
            </DeckGL>
        </div>
  );
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
