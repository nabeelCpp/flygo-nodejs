let arr = [
    {
        "city": "Lagos",
        "lat":37.1000,
        "lon":-8.6667,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Albufeira",
        "lat":37.0889,
        "lon":-8.2511,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Faro",
        "lat":37.0161,
        "lon":-7.9350,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Tavira",
        "lat":37.1309,
        "lon":-7.6506,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Portimão",
        "lat":37.1333,
        "lon":-8.5333,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Carvoeiro",
        "lat":37.1000,
        "lon":-8.4667,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Olhão",
        "lat":37.0278,
        "lon":-7.8389,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Aljezur",
        "lat":37.3178,
        "lon":-8.8000,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Armação de Pêra",
        "lat":37.1000,
        "lon":-8.3667,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Silves",
        "lat":37.1833,
        "lon":-8.4333,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Vila Real de Santo António",
        "lat":37.2000,
        "lon":-7.4167,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Monchique",
        "lat":37.3167,
        "lon":-8.6000,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Loulé",
        "lat":37.1440,
        "lon":-8.0235,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Castro Marim",
        "lat":37.2167,
        "lon":-7.4500,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "Lagoa",
        "lat":37.1347,
        "lon":-8.4528,
        "country": "Portugal",
        "iso2": "PT"
    },
    {
        "city": "São Brás de Alportel",
        "lat":37.1500,
        "lon":-7.8833,
        "country": "Portugal",
        "iso2": "PT"
    }
]
let sql = `INSERT INTO city (city, lat, lon, country, iso2) VALUES ${arr.map(d =>  `('${d.city}', '${d.lat}', '${d.lon}', '${d.country}', '${d.iso2}')`)}`;
console.log(sql)