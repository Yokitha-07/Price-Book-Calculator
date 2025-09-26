let priceBook = {};



fetch("output.json")
  .then(response => response.json())
  .then(data => {
    priceBook = data;
    populateRegions();
    populateServiceTypes();
  });


// DOM elements
const regionSelect = document.getElementById('regionSelect');
const countrySelect = document.getElementById('countrySelect');
const levelSelect = document.getElementById('levelSelect');
const serviceTypeSelect = document.getElementById('serviceTypeSelect');
const categorySelect = document.getElementById('categorySelect');
const quantityInput = document.getElementById('quantityInput');
const distanceInput = document.getElementById('distanceInput');
const outOfHoursCheckbox = document.getElementById('outOfHoursCheckbox');
const weekendCheckbox = document.getElementById('weekendCheckbox');
const totalDisplay = document.getElementById('totalDisplay');
const resetBtn = document.getElementById('resetBtn');

// Populate Region dropdown
function populateRegions() {
  regionSelect.innerHTML = '<option value="">Select Region</option>';
  Object.keys(priceBook).forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.text = region;
    regionSelect.add(option);
  });
  countrySelect.innerHTML = '<option value="">Select Country</option>';
  levelSelect.innerHTML = '<option value="">Select Level</option>';
}

function populateCountries() {
  countrySelect.innerHTML = '<option value="">Select Country</option>';
  const selectedRegion = regionSelect.value;
  if (!selectedRegion || !priceBook[selectedRegion]) return;

  Object.keys(priceBook[selectedRegion]).forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.text = country;
    countrySelect.add(option);
  });

  levelSelect.innerHTML = '<option value="">Select Level</option>';
}

function populateLevels() {
  levelSelect.innerHTML = '<option value="">Select Level</option>';
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  if (!selectedRegion || !selectedCountry || !priceBook[selectedRegion][selectedCountry]) return;

  Object.keys(priceBook[selectedRegion][selectedCountry])
  //.filter(key => key.startsWith("L"))
  .forEach(level => {
    const option = document.createElement('option');
    option.value = level;
    option.text = level;
    levelSelect.add(option);
  });
}

// Event listeners
regionSelect.addEventListener('change', () => {
  populateCountries();
});

countrySelect.addEventListener('change', () => {
  populateLevels();
});

// Map Levels to relevant Service Types
const levelToServiceTypes = {
  "L1": ["Yearly", "Daily", "Project"],        // assuming L1-L3 have same
  "L2": ["Yearly", "Daily", "Project"],
  "L3": ["Yearly", "Daily", "Project"],
  "L4": ["Yearly", "Project"],
  "L5": ["Yearly", "Project"],
  "Dispatch": ["Dispatch Ticket", "Dispatch Pricing"] // For dispatch rates only
};

 function populateServiceTypes() {
  serviceTypeSelect.innerHTML = '<option value="">Select Service Type</option>';
  //const types = ['Yearly', 'Daily', 'Dispatch Ticket', 'Dispatch Pricing', 'Project'];
  const selectedRegion = regionSelect.value;
  const selectedCountry = countrySelect.value;
  const selectedLevel = levelSelect.value;

  if (!selectedLevel) return;

  let types = [];

  // If it's a Dispatch level/rates
  if (selectedLevel.toLowerCase().includes("dispatch") || selectedLevel === "Dispatch") {
    types = levelToServiceTypes["Dispatch"];
  } else {
    types = levelToServiceTypes[selectedLevel] || [];
  }
  
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.text = type;
    serviceTypeSelect.add(option);
  });
  categorySelect.innerHTML = '<option value="">Select Category</option>';
}

levelSelect.addEventListener("change", populateServiceTypes);

  serviceTypeSelect.addEventListener('change', () => {
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  const serviceType = serviceTypeSelect.value;
  if (!serviceType) return;

  let categories = [];
  switch(serviceType) {
    case 'Yearly':
      categories = ['withBackfill', 'withoutBackfill'];
      break;
    case 'Daily':
      categories = ['FullDay', 'HalfDay'];
      break;
    case 'Dispatch Ticket':
      categories = ['9x5x4 Incident Response' , '24x7x4 Response to site', 'SBD Business Day Resolution to site' , 'NBD Resolution to site' , '2BD Resolution to site' , '3BD Resolution to site' , 'Additional Hour Rate']
      break;
    case 'Dispatch Pricing':
      categories = ["2 BD Resolution to site", "3 BD Resolution to site", "4 BD Resolution to site"];
      break;
    case 'Project':
      categories = ['Short Term', 'Long Term'];
      break;
  }

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.text = cat;
    categorySelect.add(option);
  });
});

document.getElementById('calculateBtn').addEventListener('click', () => {
  const region = regionSelect.value;
  const country = countrySelect.value;
  const level = levelSelect.value;
  const serviceType = serviceTypeSelect.value; // Yearly, Daily, Dispatch
  const categoryType = categorySelect.value;   // With/Without Backfill, Full/Half day
  const quantity = parseInt(quantityInput.value) || 1;
  const distance = parseFloat(distanceInput.value) || 0;
  const isOutOfHours = outOfHoursCheckbox.checked;
  const isWeekend = weekendCheckbox.checked;

  if (!region || !country || !level || !serviceType) {
    alert("Please select Region, Country, Level, and Service Type.");
    return;
  }

  if (quantity < 1) quantity = 1;
  if (distance < 0) distance = 0;

   let data;
  if (serviceType === "Dispatch Rates") {
    data = priceBook[region][country].dispatchRates || {};
  } else {
    data = priceBook[region][country][level];
  }

  //const data = priceBook[region][country][level];
  let baseRate = 0;

  // Determine baseRate based on selection
  if (serviceType === "Yearly") {
    if(categoryType==="withBackfill") baseRate = data.withBackfill || 0; // 'With Backfill' / 'Without Backfill'
    else if(categoryType==="withoutBackfill") baseRate = data.withoutBackfill || 0;
    baseRate *= quantity;
  } else if (serviceType === "Daily") {
    if (categoryType === "FullDay") baseRate = data.fullDayRate || 0;
    else if (categoryType === "HalfDay") baseRate = data.halfDayRate || 0;
    baseRate *= quantity;
  } else if (serviceType === "Dispatch Ticket") {
    baseRate = data["Dispatch Ticket (Incident - including Service Management Fee)"][categoryType] || 0;
    baseRate *= quantity;
  }else if (serviceType === "Dispatch Pricing") {
    baseRate = data["Dispatch Pricing (IMAC including Service Management Fee)"][categoryType] || 0;
    baseRate *= quantity;
  }else if (serviceType === "Project") {
    baseRate = data.Project[categoryType] || 0;
    baseRate *= quantity;
}




  let total = baseRate + baseRate * 0.05; 
  if (distance > 50) total += (distance - 50) * 0.4;
  if (isOutOfHours) total *= 1.5;
  if (isWeekend) total *= 2;

  totalDisplay.textContent = `Total Price: $${total.toLocaleString()}`;
});

// Reset button
resetBtn.addEventListener('click', () => {
  regionSelect.value = "";
  countrySelect.innerHTML = '<option value="">Select Country</option>';
  levelSelect.innerHTML = '<option value="">Select Level</option>';
  serviceTypeSelect.value = "";
  categorySelect.value = "";
  quantityInput.value = 1;
  distanceInput.value = 0;
  outOfHoursCheckbox.checked = false;
  weekendCheckbox.checked = false;
  totalDisplay.textContent = "";
});
