// FGG LJ Ziga - Custom layers configuration
// Plain JS version for external hosting (GitHub, etc.)
// No ES6 modules - uses global objects from map4

(function() {
  'use strict';
  
  // Check if OpenLayers classes are available
  if (!window.olVectorLayer) {
    console.error('OpenLayers classes not found in window. Make sure map4.js loads first.');
    return;
  }
  
  // Get OpenLayers classes from window (exposed by map4.js)
  const {
    olVectorLayer,
    olVectorImage,
    olVectorSource,
    olStyle,
    olCircle,
    olFill,
    olStroke,
    olText,
    olGeoJSON,
    olTransformExtent,
    olBbox
  } = window;
  
  // Get projections and app context from window
  const { d96proj, osmproj } = window;
  const { appContext } = window;
  
  // Check required dependencies
  if (!d96proj || !appContext) {
    console.error('Required dependencies (d96proj, appContext) not found in window');
    return;
  }
  
  //-------------------------------------------------
  // sxid_geo_nacrt
  //-------------------------------------------------
  const ly_sxid_geo_nacrt_style_cache = new Map();
  
  const ly_sxid_geo_nacrt_style = function (feature) {
    const geomType = feature.getGeometry().getType();
    
    if (geomType === "Point") {
      const cacheKey = "point:red";
      
      if (!ly_sxid_geo_nacrt_style_cache.has(cacheKey)) {
        ly_sxid_geo_nacrt_style_cache.set(cacheKey, new olStyle({
          image: new olCircle({
            radius: 9,
            fill: new olFill({ color: "blue" }),
            stroke: new olStroke({ color: "white", width: 3 }),
          }),
        }));
      }
      
      return ly_sxid_geo_nacrt_style_cache.get(cacheKey);
      
    } else {
      const cacheKey = "stroke:red";
      
      if (!ly_sxid_geo_nacrt_style_cache.has(cacheKey)) {
        ly_sxid_geo_nacrt_style_cache.set(cacheKey, new olStyle({
          stroke: new olStroke({
            color: "blue",
            width: 9,
          }),
          fill: new olFill({
            color: "rgba(255,0,0,0.1)"
          }),
        }));
      }
      
      return ly_sxid_geo_nacrt_style_cache.get(cacheKey);
    }
  };
  
  const ly_sxid_geo_nacrt = new olVectorLayer({
    id: "lyid_sxid_geo_nacrt",
    name: "GEO Nacrt",
    source: new olVectorSource({
      url: function (extent) {
        let ext2 = olTransformExtent(extent, appContext.mapproj, d96proj);
        let u="_sx1/sxtables/sxid_geo_nacrt/data/.json?select=geometry,gsx_id&bbox=" + ext2.join(",");
        return u;
      },
      format: new olGeoJSON({
        dataProjection: d96proj,
        featureProjection: appContext.mapproj,
      }),
      strategy: olBbox,
    }),
    maxResolution: 20,
    style: ly_sxid_geo_nacrt_style,
    visible: true,
  });
  
  //-------------------------------------------------
  // cloudfile
  //-------------------------------------------------
  const ly_cloudfiles_style_cache = new Map();
  
  function ly_cloudfiles_style_func(feature) {
    const task = feature.get('TASK');
    const color = (task === 'Opravilo') ? 'red' : 'blue';
    
    const cacheKey = 'circle:' + color;
    
    if (!ly_cloudfiles_style_cache.has(cacheKey)) {
      const style = new olStyle({
        image: new olCircle({
          radius: 10,
          fill: new olFill({ color: color }),
          stroke: new olStroke({ color: 'white', width: 2 }),
        }),
      });
      ly_cloudfiles_style_cache.set(cacheKey, style);
    }
    
    return ly_cloudfiles_style_cache.get(cacheKey);
  }
  
  const ly_cloudfiles = new olVectorLayer({
    id: "lyid_cloudfiles",
    name: "Slike",
    source: new olVectorSource({
      url: function (extent) {
        let ext2 = olTransformExtent(extent, appContext.mapproj, d96proj);
        let u="_sx1/cloudfiles/sxid_cloudfiles/list/.json?select=geometry,gsx_id,fname,dname,task,date_modified,owner_firstname&bbox=" + ext2.join(",");          
        return u;
      },
      format: new olGeoJSON({
        dataProjection: d96proj,
        featureProjection: appContext.mapproj,
      }),
      strategy: olBbox,
    }),
    maxResolution: 20,
    style: ly_cloudfiles_style_func,
  });
  
  //-------------------------------------------------
  // mg parcele
  //-------------------------------------------------
  const ly_mg_parcele_style_cache = new Map();
  
  const ly_mg_parcele_style_func = function (feature, resolution) {
    const pv = feature.get("PRIDOB_VSE");
    const slu = feature.get("SLUZNOST");
    const sog = feature.get("SOGLASJE");
    const mn = feature.get("MNENJA");
    const label = feature.get("ST_PARCELE");
    const showLabel = resolution < 0.5;
    const fontSize = Math.round(Math.max(10, 4.25 / resolution));
    
    // Determine stroke and fill colors
    let strokeColor = "rgb(255,0,0)";
    let fillColor = null;
    
    if (pv === 1) {
      strokeColor = "rgb(0,165,0)";
      fillColor = "rgba(0,165,0,0.3)";
    } else if (slu === 1 || sog === 1) {
      strokeColor = "rgb(255,255,0)";
      fillColor = "rgba(255,255,0,0.3)";
    } else if (mn === 1) {
      strokeColor = "rgb(0,63,255)";
      fillColor = "rgba(0,63,255,0.3)";
    }
    
    const textLabel = showLabel ? label : '';
    const cacheKey = strokeColor + ':' + (fillColor || 'none') + ':' + textLabel + ':' + fontSize;
    
    if (!ly_mg_parcele_style_cache.has(cacheKey)) {
      const style = new olStyle({
        fill: fillColor ? new olFill({ color: fillColor }) : null,
        stroke: new olStroke({
          color: strokeColor,
          width: 2.5,
        }),
        text: new olText({
          text: textLabel,
          font: fontSize + 'px Montserrat Medium',
          placement: "point",
          fill: new olFill({ color: "#323232" }),
        }),
      });
      
      ly_mg_parcele_style_cache.set(cacheKey, style);
    }
    
    return ly_mg_parcele_style_cache.get(cacheKey);
  };
  
  const ly_mg_parcele = new olVectorImage({
    id: "lyid_mg_parcele",
    name: "Moje parcele",
    className : "class_mg_parcele",
    source: new olVectorSource({
      url: function (extent) {
        let ext2 = olTransformExtent(extent, appContext.mapproj, d96proj);
        return "_sx1/sxtables/sxid_proj_pogoji_parcele_view/data/.json?select=gsx_id,geometry,eid_parcela,ko_id,st_parcele,jd,imeko,last1_ime,povrsina,namenska_raba,upravni_status,sluznost,soglasje,mnenja,pridob_vse,datum_sluznost_soglasje_gradnja,datum_mnenja,sluznost_dn,soglasje_dn,mnenja_dn&bbox=" + ext2.join(",");
      },
      format: new olGeoJSON({
        dataProjection: d96proj,
        featureProjection: appContext.mapproj,
      }),
      strategy: olBbox,
    }),
    maxResolution: 3.75,
    style: ly_mg_parcele_style_func,
    visible: false
  });
  
  //-------------------------------------------------
  // web serial
  //-------------------------------------------------
  const serialSource = new olVectorSource();
  
  const ly_webserial = new olVectorLayer({
    id: "lyid_webserial",
    name: "Web Serial",
    source: serialSource,
    style: new olStyle({
      image: new olCircle({
        radius: 6,
        fill: new olFill({ color: 'red' }),
        stroke: new olStroke({ color: 'white', width: 2 })
      })
    })
  });
  
  // Store serial source in appContext for serial module to use
  if (appContext.serial) {
    appContext.serial.source = serialSource;
  }
  
  // Export everything to window.KingMapLayers
  window.KingMapLayers = {
    // Layer objects
    myLayers: {
      lyid_sxid_geo_nacrt: ly_sxid_geo_nacrt,
      lyid_cloudfiles: ly_cloudfiles,
      lyid_mg_parcele: ly_mg_parcele,
      lyid_webserial: ly_webserial
    },
    
    // Sidebar items configuration
    sidebarItems: [
      {
        type: "layer",
        layerId: ly_sxid_geo_nacrt.get("id"),
        label: "GEO Nacrt",
        toggleId: "tgl_geo_nacrt",
        zoomTextId: "geo_nacrt_zoom",
        icon: "/_root2/assets/box.svg",
        maxResolution: 20
      },
      {
        type: "layer",
        layerId: ly_cloudfiles.get("id"),
        label: "Slike",
        toggleId: "tgl_cloudfiles",
        zoomTextId: "cloudfiles_zoom",
        icon: "/_root2/assets/box.svg",
        maxResolution: 20
      },
      {
        type: "layer",
        layerId: ly_mg_parcele.get("id"),
        label: "Moje parcele",
        toggleId: "tgl_mg_parcele",
        zoomTextId: "mg_parcele_zoom",
        icon: "/_root2/assets/box.svg",
        maxResolution: 3.75
      },
      {
        type: "layer",
        layerId: ly_webserial.get("id"),
        label: "Web Serial",
        toggleId: "tgl_webserial",
        zoomTextId: "webserial_zoom",
        icon: "/_root2/assets/box.svg",
        maxResolution: 100
      }
    ],
    
    // Feature describer function
    describeFeature: function(feature, layer) {
      const layerId = layer.get('id');
      
      if (layerId === 'lyid_sxid_geo_nacrt') {
        const gsx_id = feature.get('gsx_id');
        return {
          table: [
            ['ID', gsx_id || 'N/A']
          ]
        };
      }
      
      if (layerId === 'lyid_cloudfiles') {
        const fname = feature.get('fname');
        const dname = feature.get('dname');
        const task = feature.get('task');
        const date = feature.get('date_modified');
        const owner = feature.get('owner_firstname');
        
        return {
          table: [
            ['Datoteka', fname || 'N/A'],
            ['Mapa', dname || 'N/A'],
            ['Opravilo', task || 'N/A'],
            ['Datum', date || 'N/A'],
            ['Lastnik', owner || 'N/A']
          ]
        };
      }
      
      if (layerId === 'lyid_mg_parcele') {
        const parcela = feature.get('st_parcele');
        const ko = feature.get('imeko');
        const lastnik = feature.get('last1_ime');
        const povrsina = feature.get('povrsina');
        const raba = feature.get('namenska_raba');
        const sluznost = feature.get('sluznost');
        const soglasje = feature.get('soglasje');
        const mnenja = feature.get('mnenja');
        
        return {
          table: [
            ['Št. parcele', parcela || 'N/A'],
            ['K.O.', ko || 'N/A'],
            ['Lastnik', lastnik || 'N/A'],
            ['Površina', povrsina ? povrsina + ' m²' : 'N/A'],
            ['Namenska raba', raba || 'N/A'],
            ['Služnost', sluznost === 1 ? 'Da' : 'Ne'],
            ['Soglasje', soglasje === 1 ? 'Da' : 'Ne'],
            ['Mnenja', mnenja === 1 ? 'Da' : 'Ne']
          ]
        };
      }
      
      // Default describer
      return {
        table: [
          ['Layer', layerId],
          ['Feature ID', (feature.getId && feature.getId()) || feature.get('gsx_id') || 'N/A']
        ]
      };
    },
    
    // Also expose individual layers for backwards compatibility
    layers: {
      ly_webserial: ly_webserial,
      ly_mg_parcele: ly_mg_parcele,
      ly_sxid_geo_nacrt: ly_sxid_geo_nacrt,
      ly_cloudfiles: ly_cloudfiles,
      serialSource: serialSource
    }
  };
  
})();
