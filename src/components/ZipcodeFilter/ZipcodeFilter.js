import React, { useState, useEffect } from 'react';
import InsetGoogleMap from '../GoogleMap/BarrelInsetGoogleMap';
import './ZipcodeFilter.css';

const ZipcodeFilter = ({ barrelLocations, state, setBarrelMap, mapRef }) => {
  const [filteredZipcodes, setFilteredZipcodes] = useState([]);
  const [zipcodeSearch, setZipcodeSearch] = useState(null);

  const filterLocations = async (zipcodeInput) => {
    const nearestMatches = [];
    let zipDictionary = {};

    const filteredZips = barrelLocations.filter((location) => {
      zipDictionary[location.zipcode] = true
      const zipReg = new RegExp('^' + zipcodeInput + '$');
      
      return String(location.zipcode).match(zipReg) && location.status && location.public;
    });

    try {
      await fetch(`/api/barrel-zips/${zipcodeInput}`)
        .then((res) => {
          return res.json();
        })
        .then((postalCodes) => {
          if(Object.keys(postalCodes).length === 0) {
            setFilteredZipcodes(filteredZips);
            return;
          }
          postalCodes = postalCodes.sort((a, b) =>
            a.distance > b.distance ? 1 : -1
          );
          let results = [];

          while (postalCodes) {
            let currentZip = postalCodes.shift().zip_code;

            if (zipDictionary[currentZip]) {
              let filteredResults = barrelLocations.filter((location) => {
                const zipReg = new RegExp('^' + currentZip + '$');

                return String(location.zipcode).match(zipReg) && location.status && location.public;
              });

              results = results.concat(filteredResults);

              if (results.length >= 3) {
                setFilteredZipcodes(results);
                return;
              }
            }
          }
          setFilteredZipcodes([]);
        });

    } catch (e) {
      console.log('ZIPCODE API ERROR: ', e);
        if(filteredZips.length > 0) {
          setFilteredZipcodes(filteredZips);
        }
      setFilteredZipcodes([]);
    }
  };

  return (
    <div className='zip-filtered-container'>
      <label className='zip-label' htmlFor='zipcode'>
        Search By Zipcode
      </label>
      <input
        name='zipcode'
        id='zipcode'
        className='filtered-zip-input'
        type='text'
        onChange={(e) => {
          if (e.target.value.length === 5) {
            filterLocations(e.target.value);
          }
        }}
      />
      {filteredZipcodes[0] && (
        <h3 className='results-header'>
          {'Donation barrel locations closest to zipcode'}
        </h3>
      )}

      <ul className='filtered-locations-by-zip'>
        {filteredZipcodes.map((location) => {
          return (
            <li key={location.hosts} className='filtered-list-item'>
              <p className='location-host'>{location.hosts}</p>
              <p className='location-street'>{location.street}</p>
              <p className='location-street'>
                {location.city + ' ' + location.zipcode}
              </p>
              <a
                style={{ cursor: 'pointer', fontSize: '.80em' }}
                onClick={() => {
                  setBarrelMap(location);
                  mapRef.current.scrollIntoView({behavior: 'smooth'});
                }}
              >
                SHOW ON MAP BELOW
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ZipcodeFilter;
