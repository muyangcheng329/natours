// const getMap = document.getElementById('map');
// export const displayMap = locations => {
//   mapboxgl.accessToken =
//     'pk.eyJ1IjoieWFudGluZ2dhbmciLCJhIjoiY2xqemF5ODFtMDY0cTNwcGZwc3FnZWs0YyJ9.mQY7IEYNkQuk7dhxkx0PpQ';
//   var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/yantinggang/cljzgf3pj001x01rj610d7fz5',
//     scrollZoom: false
//   });

//   const bounds = new mapboxgl.LngLatBounds();

//   locations.forEach(loc => {
//     const el = document.createElement('div');
//     el.className = 'marker'; //定义一个新元素，样式为marker

//     new mapboxgl.Marker({
//       element: el,
//       anchor: 'bottom' //新元素最下面的点为地图点
//     })
//       .setLngLat(loc.coordinates)
//       .addTo(map); //添加到var map的里面

//     new mapboxgl.Popup({ offset: 30 })
//       .setLngLat(loc.coordinates)
//       .setHTML(`<p>Day ${loc.day}:${loc.description}>`)
//       .addTo(map);

//     //extend map bounds to include current location
//     bounds.extend(loc.coordinates);
//   });

//   map.fitBounds(bounds, {
//     padding: {
//       top: 150,
//       bottom: 150,
//       left: 50,
//       right: 500
//     }
//   });
// };

const getMap = document.getElementById('map');
if (getMap) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWFudGluZ2dhbmciLCJhIjoiY2xqemF5ODFtMDY0cTNwcGZwc3FnZWs0YyJ9.mQY7IEYNkQuk7dhxkx0PpQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yantinggang/cljzgf3pj001x01rj610d7fz5',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker'; //定义一个新元素，样式为marker

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' //新元素最下面的点为地图点
    })
      .setLngLat(loc.coordinates)
      .addTo(map); //添加到var map的里面

    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}>`)
      .addTo(map);

    //extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 150,
      left: 50,
      right: 500
    }
  });
}
