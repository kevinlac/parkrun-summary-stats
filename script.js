function timestampToInt(timestamp) {
    let split = timestamp.split(':');
    if (split.length === 3) {
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
    // TODO: axis labels
    let oldMax = arrayOfNumbers[0] - arrayOfNumbers[0] % (binSize * 60); // nearest minute in seconds of fastest person
    let currMax = oldMax + binSize * 60; // next interval
    let groupCount = 0;
    let groups = []; // all the data groups [count, start value (seconds), end value (seconds)]
    let max = 0; // highest num of runners in a single bin
    
    // number of runners in each bin
    for (let i = 0; i < arrayOfNumbers.length; i++) {
        if (arrayOfNumbers[i] > currMax) { // mvoe to next group
            if (groupCount > max) {
                max = groupCount;
            }
            groups.push([groupCount, oldMax, currMax - 1]);
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
        groups.push([groupCount, oldMax, currMax - 1]);
    }

    var svgWidth = document.getElementById("newHist").clientWidth, svgHeight = 500, barPadding = 1;
    
    var yAxisHeight = svgHeight - 65;
    var xAxisWidth = svgWidth - 65;
    var graphXOffset = 55;
    var graphYOffset = 25;
    
    var barWidth = (xAxisWidth / groups.length);

    // clear old histogram
    var svg = d3.select('#newHist');
    svg.selectAll("*").remove();

    // gridlines and y axis
    var yAxisScale = d3.scaleLinear()
    .domain([0, max])
    .range([yAxisHeight, 0]);

    var y_axis = d3.axisLeft().scale(yAxisScale);

    // create y axis
    svg.append("g")
    .attr("transform", "translate(" + graphXOffset + ", " + graphYOffset + ")")
    .call(y_axis);

    // create gridlines
    svg.selectAll("line.horizontal-grid")
    .data(yAxisScale.ticks())
    .enter()
    .append("line")
    .attr("class", "horizontal-grid")
    .attr("y1", function (d) { return yAxisScale(d) + graphYOffset; })
    .attr("x1", 0 + graphXOffset)
    .attr("y2", function (d) { return yAxisScale(d) + graphYOffset; })
    .attr("x2", xAxisWidth + graphXOffset)
    .style("stroke", "gray")
    .style("stroke-width", 0.5);

    // custom ticks for x axis by minutes
    var xTicks = [];

    for (let i = 0; i < groups.length; i++) {
        xTicks.push(groups[i][1]);
    }
    xTicks.push(groups[groups.length - 1][2] + 1); // last tick

    // create x axis
    var xAxisScale = d3.scaleLinear()
    .domain([xTicks[0], xTicks[xTicks.length - 1]])
    .range([0, xAxisWidth]);

    var x_axis = d3.axisBottom().scale(xAxisScale).tickValues(xTicks).tickFormat(function(d,i) {
        if (i < groups.length) {
            if (binSize != 1) {
                return intToTimestamp(groups[i][1]);
            }
            return groups[i][1] / 60;
        }
        return "";
    });

    svg.append("g")
    .attr("transform", "translate(" + graphXOffset + ", " + (yAxisHeight + graphYOffset) + ")")
    .call(x_axis);

    // axes labels
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight - 6)
    .style("font-size", "10pt")
    .text("Time ran");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("x", - svgHeight / 2 + 60)
    .attr("transform", "rotate(-90)")
    .style("font-size", "10pt")
    .text("Number of runners");

    var offsetFromBelow = svgHeight - yAxisHeight;

    // histogram bars
    var yScale = d3.scaleLinear()
        .domain([0, max])
        .range([0, yAxisHeight]);
    
    var barChart = svg.selectAll("rect")
        .data(groups)
        .enter()
        .append("rect")
        .style("fill", "skyblue")
        .attr("y", function(d) {
            return svgHeight - yScale(d[0]); 
        })
        .attr("height", function(d) { 
            return yScale(d[0]); 
        })
        .attr("width", barWidth - barPadding)
        .attr("transform", function (d, i) {
            var translate = [barWidth * i + graphXOffset, graphYOffset - offsetFromBelow]; 
            return "translate("+ translate +")";
        })
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('200')
                 .style("fill", "#73BAD7")
            d3.select("#histDescription").html(i[0] + (i[0] === 1 ? " person" : " people") + " ran from " + intToTimestamp(i[1]) + " - " + intToTimestamp(i[2]));
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('200')
                 .style("fill", "skyblue")
            d3.select("#histDescription").html("Hover over a column for more details...");
        });
}

function updateMilestones(milestonesDictionary, milestones) {
    // sort by number, junior 10 stays first
    milestones.sort(function(x, y) {
        if (typeof(x) == "string") {
            x = 10;
        }
        if (typeof(y) == "string") {
            y = 10;
        }
        return x - y;
    });

    let milestonesText = document.getElementById("milestonesText");
    milestonesText.innerHTML = "";
    let totalMilestones = 0;
    for (let i = 0; i < milestones.length; i++) {
        // for some reason, if you do innerText instead of innerHTML, the last space doesnt show up
        if (milestones[i] in milestonesDictionary) {
            for (const value of milestonesDictionary[milestones[i]]) {
                totalMilestones++;
                let achiever = (value + " (" + String(milestones[i]) + "), ");
                milestonesText.innerHTML += achiever;
            }
        }
    }

    if (totalMilestones > 0) {
        milestonesText.innerHTML = milestonesText.innerHTML.slice(0, -2);
    } else {
        milestonesText.innerHTML = "No milestones this week!";
    }

}

function main() {
    // if not on a results page
    if (document.getElementsByClassName("js-ResultsTbody").length === 0) {
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
        "Junior 10": []
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
        if (rows[i].cells[5].textContent === "\xa0" || rows[i].cells[2].childNodes[0].innerText === "\xa0" || rows[i].cells[3].childNodes[0].innerText === "") {
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
            if (!(numberOfRuns in milestonesDictionary)) {
                milestonesDictionary[numberOfRuns] = [];
            }
            // junior
            for (let i = 0; i < juniorAges.length; i++) {
                if (numberOfRuns === 10 && agegroup.indexOf(juniorAges[i]) !== -1) {
                    milestonesDictionary["Junior 10"].push(name);
                }
            }
            if (numberOfRuns === 1) {
                countFirstEver++;
            }

            milestonesDictionary[numberOfRuns].push(name);

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
    milestonesText.id = "milestonesText";
    let milestones = ["Junior 10", 25, 50, 100, 250, 500, 1000];
    // let milestones = [72, 53];
    
    milestonesText.style.margin = "5px";
    newContent.appendChild(milestonesText);

    // custom milestones
    let customMilestones = document.createElement("div");
    customMilestones.style = "display: flex; flex-direction: row; flex-wrap: wrap; padding: 5px";

    let customMilestonesText = document.createElement("text");
    customMilestonesText.innerHTML = "<b>Create a custom milestone: </b>";
    customMilestonesText.style.margin = "5px";
    customMilestones.appendChild(customMilestonesText);

    let newMilestone = document.createElement("input");
    newMilestone.type = "number";
    newMilestone.id = "newMilestoneValue";
    newMilestone.min = "1";
    newMilestone.style.margin = "5px";
    newMilestone.placeholder = "Enter a number of runs...";
    customMilestones.appendChild(newMilestone);

    let milestonesButton = document.createElement("button");
    milestonesButton.style = "outline: none;";
    milestonesButton.innerText = "Add custom milestone";
    milestonesButton.style.margin = "5px";
    milestonesButton.id = "addNewMilestone";
    customMilestones.appendChild(milestonesButton);
    newContent.appendChild(customMilestones);

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

    // add new content
    let referenceElement = document.getElementsByClassName("Results-header")[0]; // adding stuff to the page
    referenceElement.parentNode.insertBefore(newContent, referenceElement.nextSibling);

    // update milestones
    updateMilestones(milestonesDictionary, milestones);
    let updateAddMilestone = document.getElementById("addNewMilestone");
    updateAddMilestone.addEventListener("click", function(){
        let toAdd = Number(document.getElementById("newMilestoneValue").value)
        if (!milestones.includes(toAdd)) {
            milestones.push(toAdd);
        }
        updateMilestones(milestonesDictionary, milestones);
    })

    // update the group selector for summary statistics
    let updateOnclick = document.getElementById("groupSelector");
    updateOnclick.addEventListener("change", function(){updateSummary(updateOnclick.value, groupsDictionary)});

    // Adding in histogram
    var bodySelection = d3.select("#newContent");

    var svgSelection = bodySelection.append("svg")
    .attr("width", "100%")
    .attr("height", "500px")
    .attr("id", "newHist")
    .style("background-color", "white");
    
    createHistogram(groupsDictionary["All"], 5);

    // update histogram group selector
    let updateHistGroup = document.getElementById("histGroupSelector");
    let updateHistBin = document.getElementById("histIntervalSelector");
    updateHistGroup.addEventListener("change", function(){createHistogram(groupsDictionary[updateHistGroup.value], Number(updateHistBin.value))});
    updateHistBin.addEventListener("change", function(){createHistogram(groupsDictionary[updateHistGroup.value], Number(updateHistBin.value))});
}

main();
