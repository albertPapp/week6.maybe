import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const input = document.getElementById("input-area");
const button = document.getElementById("submit-data");
const addButton = document.getElementById("add-data");
let counter = 0;

let jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const getData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });

  if (!res) {
    return;
  }

  const data = await res.json();

  // console.log(data);

  return data;
};

const buildChart = async () => {
  const areaUrl =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const areaRes = await fetch(areaUrl);
  const areaData = await areaRes.json();
  const codes = areaData.variables[1].values;
  const names = areaData.variables[1].valueTexts;

  const inputName = input.value;

  if (names.indexOf(inputName) !== -1) {
    counter = 0;
    let index = names.indexOf(inputName);

    jsonQuery.query[1].selection.values = [codes[index]];
  }

  const data = await getData();
  console.log(data);

  const labels = Object.values(data.dimension.Vuosi.category.label);
  const municipalities = Object.values(data.dimension.Alue.category.label);
  const values = data.value;

  municipalities.forEach((municipality, index) => {
    let population = [];
    for (let i = 0; i < 22; i++) {
      population.push(values[i * municipalities.length + index]);
    }
    municipalities[index] = {
      name: municipality,
      values: population
    };
  });

  const chartData = {
    labels: labels,
    datasets: municipalities
  };

  const chart = new Chart("#chart", {
    title: "My Awesome Chart",
    data: chartData,
    type: "line", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 450,
    colors: ["#eb5146"]
  });
};

const buildChartWithEstimate = async () => {
  counter++;
  const data = await getData();
  console.log(data);

  const labels = Object.values(data.dimension.Vuosi.category.label);
  const municipalities = Object.values(data.dimension.Alue.category.label);
  const values = data.value;

  for (let i = 1; i <= counter; i++) {
    labels.push(Number(labels.slice(-1)) + Number(1));
    let prediction =
      (-Number(values[0]) + Number(values.slice(-1))) / (values.length - 1) +
      Number(values.slice(-1));
    values.push(prediction);
  }

  municipalities.forEach((municipality, index) => {
    let population = [];
    for (let i = 0; i < labels.length; i++) {
      population.push(values[i * municipalities.length + index]);
    }
    municipalities[index] = {
      name: municipality,
      values: population
    };
  });

  const chartData = {
    labels: labels,
    datasets: municipalities
  };

  const chart = new Chart("#chart", {
    title: "My Awesome Chart",
    data: chartData,
    type: "line", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 450,
    colors: ["#eb5146"]
  });
};

button.addEventListener("click", buildChart);
addButton.addEventListener("click", buildChartWithEstimate);
buildChart();
