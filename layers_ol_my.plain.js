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
    olIcon,
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
  // Globalna preslikava: code → sifra
  //-------------------------------------------------
  const codeToSifra = {
    TGT: "110010", TGTE: "110020", IGT: "110030", IGTE: "110040", PG: "110050",
    FR: "120010", R: "120020", AGT: "130010", RGT: "130020", MZD: "210040",
    MZ: "220010", KOZ: "312070", STOP: "313050", CERK: "312090", DIM: "313060",
    NSSP: "313080", NSSO: "313090", J: "313110", JO: "321010", JP: "321020",
    JVO: "322010", JVP: "322020", Z: "322030", NH: "322040", PH: "322050",
    JKO: "323010", JKP: "323020", JEO: "324010", JEP: "324020", DELVN: "324030",
    ELK: "324040", DELVV: "324060", ELOM: "324150", JTO: "325010", JTP: "325020",
    DT: "325030", ZP: "326010", JJRO: "328010", JJRP: "328020", S: "328030",
    PROP: "330060", SEM: "330210", POK: "330220", POG: "330230", PCR: "330240",
    PP: "330250", OGZ: "351010", OGK: "351020", ZM: "351030", OG: "351040",
    OPZT: "351050", OPZ: "351060", OPZL: "351070", OPZZ: "351080", VERK: "352010", 
    OSAMG: "352020", SPOM: "352030", D: "353010", ST: "353020", STOLP: "353030", 
    MZS: "354090", MZPK: "354100", MZK: "354110", IZV: "410140", PIZV: "410150", 
    CIS: "410210", VODN: "410220", VODM: "410230", PONOR: "410240", PIPA: "410250",
    IZL: "410260", SLAP: "410270", ODBV: "410290", OS: "420060", CER: "420070",
    LD: "431010", ID: "431020", ZNACID: "431030", ZANCLD: "431040", GRM: "431050",
    OB: "311010", MOST: "330010", ORI: "110040", C: "330120"
  };

  // Obratna preslikava: sifra → code
  const sifraToCode = Object.fromEntries(
    Object.entries(codeToSifra).map(([k, v]) => [v, k])
  );

  const imeToSifra = {
    "temeljna geodetska tocka": "110010", "temeljna geodetska tocka z dolocenimi etrs koordinatami": "110020",
    "izmeritvena geodetska tocka": "110030", "izmeritvena geodetska tocka z dolocenimi etrs koordinatami": "110040",
    "permanentna GNSS postaja": "110050", "fundamentalni reper": "120010", "reper": "120020",
    "absolutna gravimetricna tocka": "130010", "relativna gravimetricna tocka": "130020",
    "mejno znamenjene na drzavni meji": "210040", "mejno znamenje": "220010", "kozolec": "312070",
    "stopnice": "313050", "cerkev": "312090", "dimnik": "313060", "nosilni steber stavbe s pravokotnim prerezom": "313080",
    "nosilni steber stavbe s okroglim prerezom": "313090", "jasek za svetl., kurjavo, tov. dvigalo, zracnik": "313110",
    "jasek komunalnih vodov okrogel": "321010", "jasek komunalnih vodov pravokoten": "321020",
    "vodovodni jasek okrogel": "322010", "vodovodni jasek pravokoten": "322020", "zapirac": "322030", 
    "nadzemni hidrant": "322040", "podzemni hidrant": "322050", "kanalski jasek okrogel": "323010",
    "kanalski jasek pravokoten": "323020", "elektricni jasek okrogel": "324010", "elektricni jasek pravokoten": "324020",
    "drog za elektricni vod nizke napetosti": "324030", "elektricna konzola": "324040", 
    "drog za elektricni vod visoke napetosti": "324060", "elektricna omarica": "324150",
    "telefonski jasek okrogel": "325010", "telefonski jasek pravokoten": "325020", "telefonski drog": "325030",
    "plinski zapirac": "326010", "jasek javne razsvetljave okrogel": "328010", 
    "jasek javne razsvetljave pravokoten": "328020", "svetilka na drogu": "328030", "propust": "330060",
    "semafor": "330210", "poziralnik okrogel": "330220", "poziralnik oglat": "330230", 
    "poziralnik cestni pod robnikom": "330240", "peskolov jasek poziralnika": "330250", "zidana ograja": "351010",
    "ograja iz zlozenega kamenja": "351020", "ziva meja": "351030", "ograja": "351040",
    "oporni in podporni zid s trikotnikom na koncu": "351050", "oporni in podporni zid brez trikotnikov na koncu": "351060",
    "oporni zid trikotnik na koncu linije": "351070", "oporni zid s trikotnikom na zacetku": "351080",
    "versko znamenje kapelica": "352010", "osamljen grob": "352020", "spomenik": "352030", "drog": "353010",
    "steber": "353020", "stolp": "353030", "manjsa zgradba, straznica": "354090", "manjsa zgradba, prometna kabina": "354100",
    "manjsa zgradba, kiosk": "354110", "izvir": "410140", "presihajoc izvir": "410150", "cisterna z vodo kapnica": "410210",
    "vodnjak": "410220", "vodomet, okrasni vodnjak": "410230", "ponor": "410240", "javni iztok vode, pipa/vodnjak": "410250",
    "izliv zajezene vode": "410260", "slap": "410270", "odbijac vode": "410290", "osamljena skala": "420060",
    "cer": "420070", "listnato drevo": "431010", "iglasto drevo": "431020", "znacilno iglasto drevo": "431030",
    "znacilno listnato drevo": "431040", "grm": "431050", "objekt": "311010", "most": "330010", "orientacija": "110040",
    "cesta": "330120"
  }
  
  //-------------------------------------------------
  // sxid_geo_nacrt
  //-------------------------------------------------
  const ly_sxid_geo_nacrt_style_cache = new Map();
  const svgExistsCache = new Map(); // Cache za preverjanje obstoja SVG-jev
  
  // Funkcija za preverjanje, če SVG obstaja
  function checkSvgExists(url) {
    if (svgExistsCache.has(url)) {
      return Promise.resolve(svgExistsCache.get(url));
    }
  
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        svgExistsCache.set(url, true);
        resolve(true);
      };
      img.onerror = () => {
        svgExistsCache.set(url, false);
        resolve(false);
      };
      img.src = url;
    });
  }

  // Funkcija za pridobitev šifre iz oznake
  function oznakaToSifra(oznaka) {
    if (!oznaka) return "";
  
    if (/^\d{6}$/.test(oznaka)) return oznaka;
  
    const code = oznaka.match(/^[A-Z]+/i)?.[0];
    if (code && codeToSifra[code]) return codeToSifra[code];
  
    const ime = oznaka.toLowerCase();
    return imeToSifra[ime] || "";
  }
  
  // Funkcija za pridobitev kode iz oznake
  function oznakaToCode(oznaka) {
    if (!oznaka) return "X";
  
    if (/^\d{6}$/.test(oznaka)) return sifraToCode[oznaka] || "X";
  
    const code = oznaka.match(/^[A-Z]+/i)?.[0];
    if (code && codeToSifra[code]) return code;
  
    const ime = oznaka.toLowerCase();
    const sifra = imeToSifra[ime];
    return sifra ? sifraToCode[sifra] || "X" : "X";
  }
  
  const ly_sxid_geo_nacrt_style = function (feature) {
    const geomType = feature.getGeometry().getType();
    const zoom = appContext.map.getView().getZoom();
  
    // --- Za LINE/POLYGON geometrije ---
    if (geomType !== "Point") {
      const cacheKey = "stroke:red";
      if (!ly_sxid_geo_nacrt_style_cache.has(cacheKey)) {
        ly_sxid_geo_nacrt_style_cache.set(cacheKey, new olStyle({
          stroke: new olStroke({ color: "red", width: 9 }),
          fill: new olFill({ color: "rgba(255,0,0,0.1)" }),
        }));
      }
      return ly_sxid_geo_nacrt_style_cache.get(cacheKey);
    }
  
    // --- Za POINT geometrije ---
    const oznaka = feature.get("OZNAKA") || feature.get("ST") || "";
    const code = oznakaToCode(oznaka);

    // Funkcija za pridobitev šifre iz oznake
    function oznakaToSifra(oznaka) {
      let sifra = "";
    
      if (/^\d{6}$/.test(oznaka)) {
        sifra = oznaka;
      } else {
        const code = oznaka.match(/^[A-Z]+/i)?.[0];
        if (code && codeToSifra.hasOwnProperty(code)) {
          sifra = codeToSifra[code];
        } else {
          const ime = oznaka.toLowerCase();
          if (imeToSifra.hasOwnProperty(ime)) {
            sifra = imeToSifra[ime];
          }
        }
      }
    
      return sifra;
    }

    // Funkcija za pridobitev kode (npr. "TGT") iz oznake
    function oznakaToCode(oznaka) {
      if (!oznaka) return "X";
    
      if (/^\d{6}$/.test(oznaka)) {
        // Če je oznaka šifra (npr. 110010), pridobi kodo iz sifraToCode
        return sifraToCode[oznaka] || "X";
      }
    
      const code = oznaka.match(/^[A-Z]+/i)?.[0];
      if (code && codeToSifra.hasOwnProperty(code)) {
        return code;
      }
    
      const ime = oznaka.toLowerCase();
      const sifra = imeToSifra[ime];
      return sifra ? sifraToCode[sifra] || "X" : "X";
    }
    
    const colorByCode = {
      C: "#A1632E", TGT: "#000099", TGTE: "#FF3399", IGT: "#00CC00", IGTE: "#4d4d4d",
      PG: "#666666", FR: "#808080", R: "#999999", AGT: "#b3b3b3", RGT: "#cccccc",
      MZD: "#e6e6e6", STOP: "#262626", CERK: "#404040", DIM: "#5c5c5c", NSSP: "#737373",
      NSSO: "#8c8c8c", OGZ: "#a6a6a6", OGK: "#bfbfbf", ZM: "#d9d9d9", OG: "#f2f2f2",
      OPZT: "#191919", OPZ: "#2e2e2e", OPZL: "#434343", OPZZ: "#595959", VERK: "#6e6e6e",
      OSAMG: "#838383", SPOM: "#999999", D: "#aeaeae", ST: "#c3c3c3", STOLP: "#d8d8d8",
      MZS: "#ededed", MZPK: "#141414", MZK: "#292929", OB: "#3e3e3e", MOST: "#535353",
      ORI: "#505050", SEM: "#b266ff", IZV: "#00ffff", PIZV: "#00e6e6", CIS: "#00cccc",
      VODN: "#00b3b3", VODM: "#009999", PONOR: "#008080", PIPA: "#006666", IZL: "#004d4d",
      SLAP: "#003333", ODBV: "#009900", OS: "#00b300", CER: "#00cc00", LD: "#00e600",
      ID: "#1aff1a", ZNACID: "#33ff33", ZANCLD: "#4dff4d", GRM: "#66ff66", JO: "#80ff80",
      JP: "#99ff99", JKO: "#b3ffb3", JKP: "#ccffcc", MZ: "#ff00ff", KOZ: "#ffff00",
      J: "#e6e600", ZP: "#cccc00", JVO: "#0000ff", JVP: "#1a1aff", Z: "#8B4513",
      NH: "#333333", PH: "#4d4d4d", JEO: "#ff0000", JEP: "#e60000", DELVN: "#cc0000",
      ELK: "#b30000", DELVV: "#990000", ELOM: "#800000", JTO: "#ff8000", JTP: "#e67300",
      DT: "#cc6600", JJRO: "#8000ff", JJRP: "#9933ff", S: "#b266ff", PROP: "#808080",
      POK: "#999999", POG: "#b3b3b3", PCR: "#cccccc", PP: "#e6e6e6", X: "#4A280A"
    };

    const color = colorByCode[code] || "gray";
    const svgUrl = `https://raw.githubusercontent.com/sl-king/fggljziga/main/svg/${code}.svg?v=${Date.now()}`;
  
    if (zoom >= 21) {
          const svgCacheKey = `svg:${code}`;
          const circleCacheKey = `circle:${code}`;
      
          // Če je slog že v cache, ga vrni
          if (ly_sxid_geo_nacrt_style_cache.has(svgCacheKey)) {
            return ly_sxid_geo_nacrt_style_cache.get(svgCacheKey);
          }
      
          // Poskusi pridobiti SVG asinhrono, sicer uporabi fallback
          checkSvgExists(svgUrl).then((exists) => {
            if (exists) {
              const style = new olStyle({
                image: new olIcon({
                  src: svgUrl,
                  scale: 0.3,
                  anchor: [0.5, 0.5],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  crossOrigin: 'anonymous'
                })
              });
              ly_sxid_geo_nacrt_style_cache.set(svgCacheKey, style);
              feature.setStyle(style);
            } else {
              if (!ly_sxid_geo_nacrt_style_cache.has(circleCacheKey)) {
                ly_sxid_geo_nacrt_style_cache.set(circleCacheKey, new olStyle({
                  image: new olCircle({
                    radius: 5,
                    fill: new olFill({ color }),
                    stroke: new olStroke({ color: "white", width: 1 })
                  })
                }));
              }
              feature.setStyle(ly_sxid_geo_nacrt_style_cache.get(circleCacheKey));
            }
          });
      
          return null; // Začasno nič, dokler se ne določi stil asinhrono
        }
      
        // --- Barvni krog pri manjšem zoomu ---
        const cacheKey = `circle:${code}`;
        if (!ly_sxid_geo_nacrt_style_cache.has(cacheKey)) {
          ly_sxid_geo_nacrt_style_cache.set(cacheKey, new olStyle({
            image: new olCircle({
              radius: 5,
              fill: new olFill({ color }),
              stroke: new olStroke({ color: "white", width: 1 })
            })
          }));
        }
        return ly_sxid_geo_nacrt_style_cache.get(cacheKey);
      };

    
    const ly_sxid_geo_nacrt = new olVectorLayer({
      id: "lyid_sxid_geo_nacrt",
      name: "GEO Nacrt",
      source: new olVectorSource({
        url: function (extent) {
          let ext2 = olTransformExtent(extent, appContext.mapproj, d96proj);
          let u="_sx1/sxtables/sxid_geo_nacrt/data/.json?select=geometry,gsx_id,ST,Z,OZNAKA,OPOMBA,DATUM_MERITVE,SIFRA&bbox=" + ext2.join(",");
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
      // Metadata for MapLibre compatibility
      metadata: {
        king_editable: {
          enabled: true,
          fields: [
            {
              name: 'OZNAKA',
              label: 'Oznaka',
              type: 'text',
              maxLength: 100,
              placeholder: 'Vnesite oznako',
            },
            {
              name: 'OPOMBA',
              label: 'Opomba',
              type: 'text',  // Changed from textarea to text for simpler inline editing
              maxLength: 200,
              placeholder: 'Vnesite opombo'
            }
          ],
          // No geometry editing for simplest experience
          updateEndpoint: '_sx1/sxtables/sxid_geo_nacrt/data',
          deleteEndpoint: '_sx1/sxtables/sxid_geo_nacrt/data',
          permissions: {
            edit: 'all'  // Everyone can edit
          },
          ui: {
            editMode: 'inline',  // Force inline editing for simplest experience
            allowDelete: false,  // Don't allow deletion
            editButtonIcon: '/_root2/assets/three-dots-svgrepo-com.svg'
          }
        }
      }
    });
  
  //-------------------------------------------------
  // sxid_geo_notes - WITH POPUP EDITING AND GEOMETRY
  //-------------------------------------------------
  const ly_sxid_geo_notes_style_cache = new Map();
  
  const ly_sxid_geo_notes_style = function (feature) {
    const geomType = feature.getGeometry().getType();
    
    if (geomType === "Point") {
      const cacheKey = "point:orange";
      
      if (!ly_sxid_geo_notes_style_cache.has(cacheKey)) {
        ly_sxid_geo_notes_style_cache.set(cacheKey, new olStyle({
          image: new olCircle({
            radius: 9,
            fill: new olFill({ color: "#FF8C00" }),
            stroke: new olStroke({ color: "white", width: 3 }),
          }),
        }));
      }
      
      return ly_sxid_geo_notes_style_cache.get(cacheKey);
      
    } else {
      const cacheKey = "stroke:orange";
      
      if (!ly_sxid_geo_notes_style_cache.has(cacheKey)) {
        ly_sxid_geo_notes_style_cache.set(cacheKey, new olStyle({
          stroke: new olStroke({
            color: "#FF8C00",
            width: 9,
          }),
          fill: new olFill({
            color: "rgba(255,140,0,0.1)"
          }),
        }));
      }
      
      return ly_sxid_geo_notes_style_cache.get(cacheKey);
    }
  };
  
  const ly_sxid_geo_notes = new olVectorLayer({
    id: "lyid_sxid_geo_notes",
    name: "Geo opombe",
    source: new olVectorSource({
      url: function (extent) {
        let ext2 = olTransformExtent(extent, appContext.mapproj, d96proj);
        let u="_sx1/sxtables/sxid_geo_notes/data/.json?select=geometry,gsx_id,ST,Z,OZNAKA,OPOMBA,STATUS,DATUM_MERITVE&bbox=" + ext2.join(",");
        return u;
      },
      format: new olGeoJSON({
        dataProjection: d96proj,
        featureProjection: appContext.mapproj,
      }),
      strategy: olBbox,
    }),
    maxResolution: 20,
    style: ly_sxid_geo_notes_style,
    visible: true,
    // Metadata for MapLibre compatibility - POPUP MODE WITH GEOMETRY
    metadata: {
      king_editable: {
        enabled: true,
        fields: [
          {
            name: 'ST',
            label: 'ST',
            type: 'text',
            maxLength: 20,
            placeholder: 'Vnesite St.',
            required: true
          },
          {
            name: 'OZNAKA',
            label: 'Oznaka',
            type: 'text',
            maxLength: 50,
            placeholder: 'Vnesite oznako',
            required: true
          },
          {
            name: 'OPOMBA',
            label: 'Opomba',
            type: 'textarea',
            rows: 4,
            maxLength: 500,
            placeholder: 'Vnesite podrobnejši opis'
          },
          {
            name: 'STATUS',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'active', label: 'Aktivno' },
                { value: 'resolved', label: 'Rešeno' },
                { value: 'pending', label: 'V teku' }
              ]
          }
        ],
        // Enable geometry editing
        geometry: {
          point: true,     // Allow moving points
          line: true,      // Allow editing line vertices
          polygon: true    // Allow editing polygon shapes
        },
        // Feature creation configuration
        creation: {
          enabled: true,
          geometryType: 'Point',  // Default to point, user can change in UI
          createEndpoint: '_sx1/sxtables/sxid_geo_notes/data',
          defaults: {
            STATUS: 'active',
            Z: 0
          },
          drawingStyle: {
            // This will be interpreted by map4 to create OL style
            stroke: { color: 'blue', width: 2 },
            fill: { color: 'rgba(0, 0, 255, 0.1)' }
          }
        },
        updateEndpoint: '_sx1/sxtables/sxid_geo_notes/data',
        deleteEndpoint: '_sx1/sxtables/sxid_geo_notes/data',
        permissions: {
          edit: 'all'  // Everyone can edit
        },
        ui: {
          editMode: 'inline+popup',  // Both inline editing AND popup button
          allowDelete: true,  // Allow deletion
          editButtonIcon: '/_root2/assets/three-dots-svgrepo-com.svg'
        }
      }
    }
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
      lyid_sxid_geo_notes: ly_sxid_geo_notes,
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
        layerId: ly_sxid_geo_notes.get("id"),
        label: "Geo opombe",
        toggleId: "tgl_geo_notes",
        zoomTextId: "geo_notes_zoom",
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
      },
      {
        type: "button",
        label: "Pregled slik v pogledu",
        buttonId: "btn_photos",
        onClick: function() {
          if (window.fetchVisiblePhotos) {
            window.fetchVisiblePhotos();
          }
        }
      },
      {
        type: "button",
        label: "Dodaj fotografijo",
        buttonId: "photo-upload-btn",
        onClick: function() {
          if (appContext.photoUploadModule) {
            appContext.photoUploadModule.PhotoUpload_Open();
          }
        }
      },
      {
        type: "create",
        layerId: "lyid_sxid_geo_notes",
        label: "Dodaj geo opombo",
        buttonId: "btn_create_geo_note"
      }
    ],
    
    // Feature describer function
    describeFeature: function(layer, feature) {
      const layerId = layer.get('id');
      
      if (layerId === 'lyid_sxid_geo_nacrt') {
        const gsx_id = feature.get('GSX_ID');
        const st = feature.get('ST');
        const stev = st.match(/\d+/g)?.join('') || '';
        const code = st ? st.match(/[A-Za-z]/g)?.join('') : 'X';
        const z = feature.get('Z');
        const oznaka = feature.get("OZNAKA") || '';
        const opomba = feature.get('OPOMBA');
        const datum_meritve = feature.get('DATUM_MERITVE');

       // Uporabi tvojo končno logiko za pretvorbo oznake v šifro
        let sifra = "";
        if (/^\d{6}$/.test(oznaka)) {
          sifra = oznaka;
        } else {
          const codeFromOznaka = oznaka.match(/^[A-Z]+/i)?.[0];
          if (codeFromOznaka && codeToSifra.hasOwnProperty(codeFromOznaka)) {
            sifra = codeToSifra[codeFromOznaka];
          } else {
            const ime = oznaka.toLowerCase();
            if (imeToSifra.hasOwnProperty(ime)) {
              sifra = imeToSifra[ime];
            }
          }
        }
        
        // Check if this layer is editable
        const metadata = layer.get('metadata');
        const kingEditable = metadata?.king_editable;
        const isEditable = kingEditable?.enabled;
        
        // Format epoch timestamp to readable date
        let datumText = 'N/A';
        if (datum_meritve) {
          try {
            const date = new Date(datum_meritve * 1000); // Convert from seconds to milliseconds
            datumText = date.toLocaleString('sl-SI', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch (e) {
            datumText = datum_meritve;
          }
        }
        
        // For consistency, pass empty values as empty strings instead of 'N/A'
        // This creates a cleaner display
        const response = {
          table: [
            ['ID', gsx_id || ''],
            ['Številka', stev || ''],
            ['Koda',  code || ''],
            ['Z', z || ''],
            ['Oznaka', oznaka || ''],
            ['Opomba', opomba || ''],
            ['Šifra', sifra || ''],
            ['Datum meritve', datumText === 'N/A' ? '' : datumText]
          ]
        };
        
        // Add editable configuration if enabled
        if (isEditable) {
          response.editable = true;
          response.editConfig = kingEditable;
          response.featureId = feature.get('GSX_ID');
        }
        
        return response;
      }
      
      if (layerId === 'lyid_sxid_geo_notes') {
        const gsx_id = feature.get('GSX_ID');
        const st = feature.get('ST');
        const z = feature.get('Z');
        const oznaka = feature.get('OZNAKA');
        const opomba = feature.get('OPOMBA');
        const status = feature.get('STATUS');
        const datum_meritve = feature.get('DATUM_MERITVE');
        
        // Check if this layer is editable
        const metadata = layer.get('metadata');
        const kingEditable = metadata?.king_editable;
        const isEditable = kingEditable?.enabled;
        
        // Format epoch timestamp to readable date
        let datumText = '';
        if (datum_meritve) {
          try {
            const date = new Date(datum_meritve * 1000);
            datumText = date.toLocaleString('sl-SI', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch (e) {
            datumText = datum_meritve;
          }
        }
        
        // Format status display
        let statusText = status || '';
        if (status === 'active') statusText = 'Aktivno';
        else if (status === 'resolved') statusText = 'Rešeno';
        else if (status === 'pending') statusText = 'V teku';
        
        const response = {
          table: [
            ['ID', gsx_id || ''],
            ['ST', st || ''],
            ['Z', z || ''],
            ['Oznaka', oznaka || ''],
            ['Opomba', opomba || ''],
            ['Status', statusText],
            ['Datum', datumText]
          ]
        };
        
        // Add editable configuration if enabled
        if (isEditable) {
          response.editable = true;
          response.editConfig = kingEditable;
          response.featureId = feature.get('GSX_ID');
        }
        
        return response;
      }
      
      if (layerId === 'lyid_cloudfiles') {
        var fname = feature.get('FNAME');
        var dname = feature.get('DNAME');
        var task = feature.get('TASK');
        var dateModified = feature.get('DATE_MODIFIED');
        var owner = feature.get('OWNER_FIRSTNAME');
        var gsxId = feature.get('GSX_ID');
        var worktype = feature.get('WORKTYPE') || '';
        var notes = feature.get('NOTES') || '';
        
        // Calculate relative time
        var now = new Date();
        var modifiedDate = new Date(dateModified * 1000);
        var diffInMs = now - modifiedDate;
        var diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        var diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        var diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        var dateStr;
        if (diffInMinutes < 2) {
          dateStr = 'moment ago';
        } else if (diffInMinutes < 60) {
          dateStr = diffInMinutes + ' minutes ago';
        } else if (diffInHours < 24) {
          dateStr = diffInHours + 'h ago';
        } else if (diffInDays < 14) {
          dateStr = diffInDays + 'd ago';
        } else {
          dateStr = modifiedDate.toLocaleDateString();
        }
        
        // Build HTML like in gvo_test2
        var htmltext = '';
        
        // Show directory name if different from filename
        if (dname && dname !== '' && dname !== fname) {
          htmltext += '<p><span class="popup-content-middle">' + dname + '</span></p>';
        }
        
        // Check if it's an image file
        var isImage = fname && /\.(jpg|jpeg|png)$/i.test(fname);
        
        if (isImage && gsxId) {
          // Show image directly in popup (not as thumbnail)
          htmltext += '<p><img class="" src="_sx1/cloudfiles/sxid_cloudfiles/d?id=' + gsxId + '" alt="' + fname + '" style="cursor: pointer; max-width: 100%;" onclick="if(window.popupInfo) window.popupInfo.openPhotoFullscreen(\'' + gsxId + '\', \'' + (fname || 'Photo') + '\', \'' + (owner || '') + '\', \'' + (dateStr || '') + '\', \'' + (worktype || '') + '\', \'' + (task || '') + '\')"></p>';
        } else {
          // For non-image files, show filename as link
          htmltext += '<p><span class="popup-content-middle">' + fname + '</span></p>';
        }
        
        // Add worktype, task, notes
        if (worktype) {
          htmltext += '<p><span class="">' + worktype + '</span></p>';
        }
        if (task) {
          htmltext += '<p><span class="">' + task + '</span></p>';
        }
        if (notes) {
          htmltext += '<p><span class="span2">' + notes + '</span></p>';
        }
        
        // Owner and date with edit button
        htmltext += '<p><span class="span1">' + (owner || '') + ' ' + dateStr + '</span><span class="span-right"><button class="photo-edit-btn" data-lyid="' + layerId + '" data-fid="' + gsxId + '" style="background-color: lightgray; border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;"><img src="/_root2/assets/three-dots-svgrepo-com.svg" alt="Edit" style="width: 16px; height: 16px;"></button></span></p>';
        
        return { title: "", html: htmltext };
      }
      
      if (layerId === 'lyid_mg_parcele') {
        const parcela = feature.get('ST_PARCELE');
        const ko = feature.get('IMEKO');
        const lastnik = feature.get('LAST1_IME');
        const povrsina = feature.get('POVRSINA');
        const raba = feature.get('NAMENSKA_RABA');
        const sluznost = feature.get('SLUZNOST');
        const soglasje = feature.get('SOGLASJE');
        const mnenja = feature.get('MNENJA');
        
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
          ['Feature ID', (feature.getId && feature.getId()) || feature.get('GSX_ID') || 'N/A']
        ]
      };
    },
    
    // Also expose individual layers for backwards compatibility
    layers: {
      ly_webserial: ly_webserial,
      ly_mg_parcele: ly_mg_parcele,
      ly_sxid_geo_nacrt: ly_sxid_geo_nacrt,
      ly_sxid_geo_notes: ly_sxid_geo_notes,
      ly_cloudfiles: ly_cloudfiles,
      serialSource: serialSource
    }
  };
  
})();
