//import React from 'react';
//import logo from './logo.svg';
import './App.css';

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

import {CartoSQLLayer, setDefaultCredentials} from '@deck.gl/carto';
import React, {useState} from 'react';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';

import TypoGraphy from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Slider from '@material-ui/core/Slider';

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

export default function App() {

    const [year, setYear] = useState(2016);
    const [tooltip, setTooltip] = useState({});

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
        data: sqlCounties + " WHERE a.year = " + year,
        getFillColor: (object) => {
            if (object.properties.party === "democrat") 
            {
                return POLYGON_COLORS.DEMOCRAT;
            } 
            else if (object.properties.party === "republican") 
            {
                return POLYGON_COLORS.REPUBLICAN;
            } 
            else if (object.properties.party === "green") 
            {
                return POLYGON_COLORS.GREEN;
            } 
            else if (object.properties.party === "NA") 
            {
                return POLYGON_COLORS.NA;
            } 
        },
        //getLineColor: [0, 0, 0, 100],
        //lineWidthMinPixels: 0.5,
        pickable: true,
        onHover: info => setTooltip(info),

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
        <div style={{display: 'flex'}}>

            <Drawer
                variant="permanent"
                anchor="left"
                open={true}>

                <TypoGraphy variant="h5" color="inherit" style={{margin: '20px'}}>
                    Popular Vote by County
                </TypoGraphy>   

                <TypoGraphy variant="caption" color="inherit" style={{marginLeft: '20px'}}>
                    Year
                </TypoGraphy>   
                <Slider
                    onChange={ (e, val) => setYear(val) }
                    style={{width: '200px', margin: '20px'}}
                    defaultValue={2016}
                    valueLabelDisplay="on"
                    step={null}
                    marks={[{value: 2000, label: "2000"}, 
                            {value: 2004, label: "2004"},
                            {value: 2008, label: "2008"},
                            {value: 2012, label: "2012"},
                            {value: 2016, label: "2016"}]}
                    min={2000}
                    max={2016}
                />

            </Drawer>

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

                {tooltip.object && (
                    <div style={{position: 'absolute', 
                                 zIndex: 1, 
                                 pointerEvents: 'none', 
                                 backgroundColor: '#FFFFFF',
                                 padding: '10px',
                                 left: tooltip.x, top: tooltip.y}}>
                        <strong>State</strong>: {tooltip.object.properties.state}<br/>
                        <strong>County</strong>: {tooltip.object.properties.county}<br/>
                        <strong>Party</strong>: {tooltip.object.properties.party}<br/>
                        <strong>Votes</strong>: {tooltip.object.properties.candidatevotes}
                    </div>
                )}

            </DeckGL>


        </div>
  );
}


