function timestampToInt(timestamp) {
    let split = timestamp.split(':');
    if (split.length == 3) {
        return Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2]);
    } else {
        return Number(split[0]) * 60 + Number(split[1]);
    }
}

function intToTimestamp(time) {
    hours = Math.floor(time / 3600);
    time = time % 3600;
    minutes = Math.floor(time / 60);
    time = time % 60;
    seconds = time;
    timestamp = "";
    if (hours > 0) timestamp += String(hours) + ":";
    if (minutes >= 10) {
        timestamp += String(minutes) + ":";
    } else {
        timestamp += "0" + String(minutes) + ":";
    }
    if (seconds >= 10) {
        timestamp += String(seconds);
    } else {
        timestamp += "0" + String(seconds);
    }
    return timestamp;
}

function createHeader(text, type) {
    let newHeader = document.createElement(type);
    newHeader.innerText = text;
    newHeader.style.margin = "5px";
    return newHeader;
}

function createSummaryTable(headers, valueRows, id) {
    let summaryTable = document.createElement("table");
    summaryTable.id = id;
    summaryTable.style = "width:100%";
    let columnWidth = 100 / headers.length;
    // add header
    let header = document.createElement("tr");
    for (let i = 0; i < headers.length; i++) {
        let headerItem = document.createElement("th");
        headerItem.style = "width:" + String(columnWidth) + "%; text-align: center";
        headerItem.innerText = headers[i];
        header.appendChild(headerItem);
    }
    summaryTable.appendChild(header);
    // add rows
    for (let i = 0; i < valueRows.length; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < valueRows[i].length; j++) {
            let rowItem = document.createElement("td");
            rowItem.style = "width:" + String(columnWidth) + "%; text-align: center";
            rowItem.innerHTML = valueRows[i][j];
            row.appendChild(rowItem);
        }
        summaryTable.appendChild(row);
    }
    return summaryTable;
}

function meanOfArray(arrayOfNumbers) {
    let sum = 0;
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        sum += arrayOfNumbers[i];
    }
    return Math.ceil(sum / arrayOfNumbers.length);
}

function getGroupSummary(arrayOfNumbers) {
    let len = arrayOfNumbers.length;
    let minimum = intToTimestamp(arrayOfNumbers[0]);
    let twentyfive = intToTimestamp(arrayOfNumbers[Math.floor(0.25 * len)]);
    let mean = intToTimestamp(meanOfArray(arrayOfNumbers));
    let median = intToTimestamp(arrayOfNumbers[Math.floor(0.50 * len)]);
    let seventyfive = intToTimestamp(arrayOfNumbers[Math.floor(0.75 * len)]);
    let maximum = intToTimestamp(arrayOfNumbers[len - 1]);
    return [len ,maximum, seventyfive, median, mean, twentyfive, minimum];
}

function updateSummary(id, groupsDictionary) {
    let toChange = document.getElementById("groupSummaries").childNodes[4]; // table row
    while (toChange.childNodes.length > 1) {
        toChange.removeChild(toChange.lastChild);
    }
    if (id != "default") {
        let summary = getGroupSummary(groupsDictionary[id]);
        let columnWidth = 100 / (summary.length + 1);
        for (let i = 0; i < summary.length; i++) {
            let rowItem = document.createElement("td");
            rowItem.style = "width:" + String(columnWidth) + "%; text-align: center";
            rowItem.innerHTML = summary[i];
            toChange.appendChild(rowItem);
        }
    }
}

function createSelect(options, optionsText, defaultOption, defaultValue, id) {
    let selector = document.createElement("select");
    selector.id = id;
    selector.style = "outline: none; border: none";
    let defaultOptionHTML = document.createElement("option");
    defaultOptionHTML.innerText = defaultOption;
    defaultOptionHTML.selected = "true";
    defaultOptionHTML.value = defaultValue;
    selector.appendChild(defaultOptionHTML);
    for (let i = 0; i < options.length; i++) {
        let option = document.createElement("option");
        option.innerText = optionsText[i];
        option.value = options[i];
        selector.appendChild(option);
    }
    return selector;
}

function createHistogram(arrayOfNumbers, binSize) {
    let hist = document.createElement("div");
    // "background: linear-gradient(green 40%, red 60%) no-repeat; height: 350px"
    hist.style = "background-color: white; border:5px; padding-co; height: 400px; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap";
    let oldMax = arrayOfNumbers[0] - arrayOfNumbers[0] % (binSize * 60);
    let currMax = oldMax + binSize * 60;
    let groupCount = 0;
    let groups = [];
    let max = 0; // highest num of runners in a single bin
    // number of runners in each bin
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        while (arrayOfNumbers[i] > currMax) {
            if (groupCount > max) {
                max = groupCount;
            }
            if (binSize === 1) {
                groups.push([String(oldMax / 60), groupCount, oldMax, currMax - 1]);
            } else {
                groups.push([intToTimestamp(oldMax) + " - " + intToTimestamp(currMax - 1), groupCount, oldMax, currMax - 1]);
            }
            oldMax = currMax;
            currMax += binSize * 60;
            groupCount = 0;
        }
        groupCount++;
    }
    // last bin
    if (groupCount > 0) {
        if (groupCount > max) {
            max = groupCount;
        }
        if (binSize === 1) {
            groups.push([String(oldMax / 60), groupCount, oldMax, currMax - 1]);
        } else {
            groups.push([intToTimestamp(oldMax) + " - " + intToTimestamp(currMax - 1), groupCount, oldMax, currMax - 1]);
        }
    }
    // creating columns
    for (let i = 0; i < groups.length; i++) {
        let height = (groups[i][1]/max) * 100;
        let histColumn = document.createElement("div");
        histColumn.className = "histColumn";
        histColumn.style = "height: 100%; width: " + String(100/groups.length) + "%; display:flex; align-items: flex-end";
        histColumn.style.background = "linear-gradient(0deg, #AAA " + String(height) + "%, #FFF 0%)";
        histColumn.numberOfRunners = groups[i][1];
        histColumn.start = groups[i][2];
        histColumn.end = groups[i][3];
        histColumn.appendChild(createHeader(groups[i][0], "h6"));
        hist.appendChild(histColumn);
    }
    return hist;
}

function updateHistogram(arrayOfNumbers, binSize, histogram) {
    let newHistogram = createHistogram(arrayOfNumbers, binSize);
    newHistogram.id = "histogram";
    histogram.replaceWith(newHistogram);
    updateHistResponse();
}

function mouseHoverColumn(column) {
    let toChange = column.style.background;
    column.style.background = toChange.replace("rgb(170, 170, 170)", "#777");
    let updateDescription = document.getElementById("histDescription");
    updateDescription.innerText = column.numberOfRunners + " runners ran from " + intToTimestamp(column.start) + " - " + intToTimestamp(column.end);
}

function mouseLeaveColumn(column) {
    let toChange = column.style.background;
    column.style.background = toChange.replace("rgb(119, 119, 119)", "#AAA");
    let updateDescription = document.getElementById("histDescription");
    updateDescription.innerText = "Hover over a column for more details...";
}

function updateHistResponse() {
    let histColumns = document.getElementsByClassName("histColumn");
    for (let i = 0; i < histColumns.length; i++) {
        histColumns[i].addEventListener("mouseover", function() {mouseHoverColumn(histColumns[i])});
        histColumns[i].addEventListener("mouseout", function() {mouseLeaveColumn(histColumns[i])});
    }
}

function main() {
    // if not on a results page
    if (document.getElementsByClassName("js-ResultsTbody").length == 0) {
        return;
    }
    
    // table rows
    let rows = document.getElementsByClassName("js-ResultsTbody")[0].rows;
    // let rows = document.getElementsByTagName("table")[0].rows;

    let groupsDictionary = { // numerical data for each group
        "All": []
    };
    // add in each gender
    for (let i = 0; i < parkrunResultsData.options.gender.length; i++) {
        groupsDictionary[parkrunResultsData.options.gender[i]] = [];
    }
    // add in each agegroup
    for (let i = 0; i < parkrunResultsData.options.agegroup.length; i++) {
        groupsDictionary[parkrunResultsData.options.agegroup[i]] = [];
    }
    
    let milestonesDictionary = {
        10: [],
        25: [],
        50: [],
        100: [],
        250: [],
        500: [],
        1000: []
    }

    let countPB = 0;
    let countFirstTimer = 0;
    let countFirstEver = 0;
    let countUnknown = 0;
    let countTotal = rows.length - 1;
    let countVolunteer = document.getElementsByClassName("paddedb")[0].getElementsByTagName("a").length;
    let juniorAges = ["10", "11-14", "15-17"];
    let male = parkrunResultsData.options.gender[0];
    let female = parkrunResultsData.options.gender[1];
    let firstTimer = parkrunResultsData.options.achievement[0];
    let PB = parkrunResultsData.options.achievement[1];

    // get each data point in table
    for (let i = 0; i < rows.length; i++) {
        // if missing a time, gender, or agegroup, we do not add it to the list of data
        if (rows[i].cells[5].textContent == "\xa0" || rows[i].cells[2].childNodes[0].innerText === "\xa0" || rows[i].cells[3].childNodes[0].innerText === "") {
            countUnknown++;
        } else {
            // attributes
            let name = rows[i].cells[1].childNodes[0].textContent;
            let runText = rows[i].cells[1].childNodes[1].textContent;
            let numberOfRuns = Number(runText.slice(0, runText.indexOf("parkrun")));
            let gender = rows[i].cells[2].childNodes[0].textContent.trim();
            let agegroup = rows[i].cells[3].childNodes[0].textContent;
            let time = timestampToInt(rows[i].cells[5].childNodes[0].textContent);
            let achievement = rows[i].cells[5].childNodes[1].textContent;
            
            // add to all times
            groupsDictionary["All"].push(time);
            // add by gender
            groupsDictionary[gender].push(time);
            // add by agegroup
            groupsDictionary[agegroup].push(time);
            // add to milestones
            for (let i = 0; i < juniorAges.length; i++) {
                if (numberOfRuns === 10 && agegroup.indexOf(juniorAges[i]) !== -1) {
                    milestonesDictionary[numberOfRuns].push(name);
                }
            }
            if (numberOfRuns === 1) {
                countFirstEver++;
            }
            if ([25, 50, 100, 250, 500, 1000].includes(numberOfRuns)) {
                milestonesDictionary[numberOfRuns].push(name);
            }

            // achievements
            if (achievement === firstTimer) {
                countFirstTimer++;
            }
            if (achievement === PB) {
                countPB++;
            }
            
        }
    }

    for (const [key, value] of Object.entries(groupsDictionary)) {
        value.sort(function(a, b) {return a - b;}); // sort numerically each list of values
    }

    // table of summary statistics
    let newContent = document.createElement("div");
    newContent.id = "newContent";
    newContent.style = "display: block; background-color: #DDD; padding: 5px";

    newContent.appendChild(createHeader("Overview:", "h3"));

    // overview
    let countTableHeaders = ["Total Participants", "Unknowns", male, female, PB, firstTimer, "First Ever Parkrun", "Volunteers"];
    let countTableNumbers = [countTotal, countUnknown, groupsDictionary[male].length, groupsDictionary[female].length, countPB, countFirstTimer, countFirstEver, countVolunteer];
    newContent.appendChild(createSummaryTable(countTableHeaders, [countTableNumbers], "overviewStatistics"));

    // milestones
    newContent.appendChild(createHeader("Milestones:", "h3"))

    let milestonesText = document.createElement("p");
    let totalMilestones = 0;
    for (const[key, value] of Object.entries(milestonesDictionary)) {
        for (let i = 0; i < value.length; i++) {
            totalMilestones++;
            let achiever = value[i] + " (" + String(key) + "), ";
            milestonesText.innerText += achiever;
        }
    }
    if (totalMilestones > 0) {
        milestonesText.innerText = milestonesText.innerText.slice(0, -2);
    } else {
        milestonesText.innerText = "No milestones this week!";
    }
    milestonesText.style.margin = "5px";
    newContent.appendChild(milestonesText);

    // times by group
    newContent.appendChild(createHeader("Summary Statistics by Group:", "h3"))
    let statsSummaryHeaders = ["Group", "Count", "Max", "75th %", "Median", "Mean", "25th %", "Min"];
    
    // create summaries for each group
    let groups = [["All"], [male], [female]];
    for (let i = 0; i < groups.length; i++) {
        groups[i] = groups[i].concat(getGroupSummary(groupsDictionary[groups[i]]));
    }

    // summary stats by age group
    let byAgeGroup = [];
    for (const[key, value] of Object.entries(groupsDictionary)) {
        if (![male, female, "All"].includes(key)) {
            byAgeGroup.push(key);
        }
    }
    byAgeGroup.sort();

    let options = [];
    let optionsText = [];
    for (let i = 0; i < byAgeGroup.length; i++) {
        options.push(byAgeGroup[i]);
        optionsText.push(byAgeGroup[i]);
    }
    let groupSelectorSummary = createSelect(options, optionsText, "Select age group...", "default", "groupSelector");

    groups.push([groupSelectorSummary.outerHTML]);

    newContent.appendChild(createSummaryTable(statsSummaryHeaders, groups, "groupSummaries"));

    // histogram options
    newContent.appendChild(createHeader("Histogram:", "h3"));

    let selectors = document.createElement("div");
    selectors.style = "display: flex; flex-direction: row; flex-wrap: wrap; padding: 5px";
    
    let addOptions = [female, male];
    for (let i = 0; i < addOptions.length; i++) {
        options = [addOptions[i]].concat(options);
        optionsText = [addOptions[i]].concat(optionsText);
    }

    let groupSelectorHist = createSelect(options, optionsText, "All", "All", "histGroupSelector");
    let intervalSelectorHist = createSelect([2.5, 1], ["2 minutes 30 seconds", "1 minute"], "5 minutes", 5, "histIntervalSelector");
    selectors.appendChild(createHeader("Group: ", "p"));
    selectors.appendChild(groupSelectorHist);
    selectors.appendChild(createHeader("Bin size: ", "p"));
    selectors.appendChild(intervalSelectorHist);
    let histDescription = createHeader("Hover over a column for more details...", "h4");
    histDescription.id = "histDescription";
    selectors.appendChild(histDescription);
    newContent.appendChild(selectors);

    // histogram
    let hist = createHistogram(groupsDictionary["All"], 5);
    hist.id = "histogram";
    newContent.appendChild(hist);

    // add new content
    let referenceElement = document.getElementsByClassName("Results-header")[0]; // adding stuff to the page
    referenceElement.parentNode.insertBefore(newContent, referenceElement.nextSibling);

    // update the group selector for summary statistics
    let updateOnclick = document.getElementById("groupSelector");
    updateOnclick.addEventListener("change", function(){updateSummary(updateOnclick.value, groupsDictionary)});

    // update histogram group selector
    let updateHistGroup = document.getElementById("histGroupSelector");
    let updateHistBin = document.getElementById("histIntervalSelector");
    updateHistGroup.addEventListener("change", function(){updateHistogram(groupsDictionary[updateHistGroup.value], Number(updateHistBin.value), document.getElementById("histogram"))});
    updateHistBin.addEventListener("change", function(){updateHistogram(groupsDictionary[updateHistGroup.value], Number(updateHistBin.value), document.getElementById("histogram"))});

    // update histogram response
    updateHistResponse();
}
main();
