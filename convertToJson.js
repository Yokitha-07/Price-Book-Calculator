import XLSX from "xlsx";
import fs from "fs";

// Read Excel file
const workbook = XLSX.readFile("Teceze Global Pricebook v0.1.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Read sheet as array of arrays
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const rows176 = rows.slice(0, 176);

// Combine first 3 rows as header
const headers = [];
for (let col = 0; col < rows176[0].length; col++) {
    let combinedHeader = [];
    for (let row = 0; row < 3; row++) {
        if (rows[row][col] !== "") {
            combinedHeader.push(rows176[row][col]);
        }
    }
    headers.push(combinedHeader.join(" | ")); 
}

// Get the rest of the rows as data (skip first 3 rows)
const dataRows = rows176.slice(3);

// Convert to array of objects
const finalData = dataRows.map(row => {
    const obj = {};
    row.forEach((cell, index) => {
        obj[headers[index]] = cell;
    });
    return obj;
});

// Transform flatData into nested JSON
function transformData(finalData) {
    const structured = {};

    finalData.forEach(item => {
        const region = item["Region"];
        const country = item["Country"];

        if (!region || !country) return;

        if (!structured[region]) structured[region] = {};
        if (!structured[region][country]) structured[region][country] = {};


        const entry = structured[region][country];

        function setLevel(level, mapping) {
            entry[level] = mapping;
        } 

        // Map L1 – L5
        setLevel("L1", {
            withBackfill: item["L1  | Basic troubleshooting(Network connectivity troubleshooting  on End user devices like Laptop, Desktop, Printer), Resetting password,  equipment installation, and testing.\r\nExperience : Minimum 6 months relevant experience |  With Backfill Yearly Rate"],
            withoutBackfill: item["L1 | Basic troubleshooting(Network connectivity troubleshooting  on End user devices like Laptop, Desktop, Printer), Resetting password,  equipment installation, and testing.\r\nExperience : Minimum 6 months relevant experience |  Without Backfill Yearly Rate"],
            fullDayRate: item["L1 | Full Day Visit (8hrs) \r\n(Excluding travel time) | Daily rates"],
            halfDayRate: item["L1 | 1/2 Day Visit (4hrs) \r\n(Excluding travel time) | Daily rates"],
            Project: {
                "Short Term": item["L1 | Short Term Project ( Up to 3 months) | Monthly"],
                "Long Term": item["L1 | Long Term Project (more then 3 month) | Monthly"]
            }
        });

        setLevel("L2", {
            withBackfill: item["L2 | Advanced troubleshooting(Analyze network logs) , system configuration(like Routers, Switches, Hardware Firewall, Access points), and upgrades. Configuring VLANs Experience: Minimum 18 months relevant experience |  With Backfill Yearly Rate"],
            withoutBackfill: item["L2 | Advanced troubleshooting(Analyze network logs) , system configuration(like Routers, Switches, Hardware Firewall, Access points), and upgrades. Configuring VLANs Experience: Minimum 18 months relevant experience |  Without Backfill Yearly Rate"],
            fullDayRate: item["L2 | Full Day Visit (8hrs) \r\n(Excluding travel time) | Daily rates"],
            halfDayRate: item["L2 | 1/2 Day Visit (4hrs) \r\n(Excluding travel time) | Daily rates"],
            Project: {
                "Short Term": item["L2 | Short Term Project ( Up to 3 months) | Monthly"],
                "Long Term": item["L2 | Long Term Project (more then 3 month) | Monthly"]
            }
        });

        setLevel("L3", {
            withBackfill: item["L3 | Complex issue resolution (by using diagnostic tools, and conduct packet captures to identify problems), network design(Implementation and deploy network solutions), and Network optimization. Experience: Minimum 2 Years relevant experience |  With Backfill Yearly Rate"],
            withoutBackfill: item["L3 | Complex issue resolution (by using diagnostic tools, and conduct packet captures to identify problems), network design(Implementation and deploy network solutions), and Network optimization. Experience: Minimum 2 Years relevant experience |  Without Backfill Yearly Rate"],
            fullDayRate: item["L3 | Full Day Visit (8hrs) \r\n(Excluding travel time) | Daily rates"],
            halfDayRate: item["L3 | 1/2 Day Visit (4hrs) \r\n(Excluding travel time) | Daily rates"],
            Project: {
                "ShortTerm": item["L3 | Short Term Project ( Up to 3 months) | Monthly"],
                "Long Term": item["L3 | Long Term Project (more then 3 month) | Monthly"]
            }
        });

        setLevel("L4", {
            withBackfill: item["L4 | Network Infrastructure Management, Performance Monitoring and Optimization, Network Security Management, Vendor and Stakeholders Management: 3-5 years overall and  relevant experience |  With Backfill Yearly Rate"],
            withoutBackfill: item["L4 | Network Infrastructure Management, Performance Monitoring and Optimization, Network Security Management, Vendor and Stakeholders Management: 3-5 years overall and  relevant experience |  Without Backfill Yearly Rate"],
            Project: {
                "Short Term": item["L4 | Short Term Project ( Up to 3 months) | Monthly"],
                "Long Term": item["L4 | Long Term Project (more then 3 month) | Monthly"]
            }
        });

        setLevel("L5", {
            withBackfill: item["L5 | Architecture Design and Planning, Provide support for most complex ad critical network and hardware issues. Optimize network performance and capacity planning. Lead and manage complex network projects. |  Backfill Yearly Rate"],
            withoutBackfill: item["L5 | Architecture Design and Planning, Provide support for most complex ad critical network and hardware issues. Optimize network performance and capacity planning. Lead and manage complex network projects. | Without Backfill Yearly Rate"],
            Project: {
                "Short Term": item["L5 | Short Term Project ( Up to 3 months) | Monthly"],
                "Long Term": item["L5 | Long Term Project (more then 3 month) | Monthly"]
            }
        });

        entry["dispatchRates"] = {
            "Dispatch Ticket (Incident - including Service Management Fee)": {
                "9x5x4 Incident Response": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour |  9x5x4 Incident Response"],
                "24x7x4 Response to site": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | 24x7x4 Response to site"],
                "SBD Business Day Resolution to site": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | SBD Business Day Resolution to site"],
                "NBD Resolution to site": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | NBD Resolution to site"],
                "2BD Resolution to site": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | 2BD Resolution to site"],
                "3BD Resolution to site": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | 3BD Resolution to site"],
                "Additional Hour Rate": item["Dispatch  Rates | Dispatch Ticket (Incident - including Service Management Fee)\r\nPer hour | Additional Hour Rate"]
            },
            "Dispatch Pricing (IMAC including Service Management Fee)":{
                "2 BD Resolution to site": item["Dispatch  Rates | Dispatch Pricing (IMAC including Service Management Fee) | 2 BD Resolution to site"],
                "3 BD Resolution to site": item["Dispatch  Rates | Dispatch Pricing (IMAC including Service Management Fee) | 3 BD Resolution to site"],
                "4 BD Resolution to site": item["Dispatch  Rates | Dispatch Pricing (IMAC including Service Management Fee) | 4 BD Resolution to site"]
            }
        };
    });
    return structured;
}



const nestedData = transformData(finalData);

// Save JSON
fs.writeFileSync("output.json", JSON.stringify(nestedData, null, 4));

console.log("Excel converted to JSON successfully with 3-row headers!");


