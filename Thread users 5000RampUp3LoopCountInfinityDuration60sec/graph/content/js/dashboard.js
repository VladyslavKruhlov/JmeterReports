/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.30461677642207, "KoPercent": 1.6953832235779283};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9589254348605097, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, ""], "isController": false}, {"data": [0.8664043744998666, 500, 1500, "GetAllCharacters"], "isController": false}, {"data": [0.9897066860994717, 500, 1500, "ChangeChagacter"], "isController": false}, {"data": [0.9783653128823372, 500, 1500, "CreateCharacter"], "isController": false}, {"data": [0.9969987443726457, 500, 1500, "DeleteById"], "isController": false}, {"data": [0.997068116910737, 500, 1500, "GetById"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 170227, 2886, 1.6953832235779283, 2174.3664518554633, 0, 220871, 204.0, 68353.0, 68718.95, 113729.3700000001, 767.9990976765171, 9585.925405869331, 159.23552317138507], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 725, 725, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 16.6597729675077, 24.07857811710097, 0.0], "isController": false}, {"data": ["GetAllCharacters", 37490, 1550, 4.134435849559883, 8743.173753000818, 0, 220871, 184.0, 68353.0, 68718.95, 113729.3700000001, 169.14053688247236, 9425.05427158527, 29.29423147417099], "isController": false}, {"data": ["ChangeChagacter", 32934, 192, 0.5829841501184186, 293.8491832149159, 2, 68104, 168.0, 200.0, 207.0, 377.9900000000016, 380.77510058733753, 102.071127242982, 92.8200797291946], "isController": false}, {"data": ["CreateCharacter", 33511, 264, 0.787801020560413, 659.3856047268062, 1, 68118, 170.0, 202.0, 212.0, 35876.990000000005, 387.41488340905676, 106.39953207551532, 92.7196186877883], "isController": false}, {"data": ["DeleteById", 32653, 59, 0.18068783878969774, 186.01185189722244, 2, 42675, 167.0, 199.0, 205.0, 247.0, 453.3124167036873, 111.97918926223763, 92.97537411757969], "isController": false}, {"data": ["GetById", 32914, 96, 0.29166919851734824, 136.90675700310004, 1, 505, 167.0, 199.0, 206.0, 313.0, 540.300075511343, 139.7183316610033, 99.41128276433074], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 230, 7.969507969507969, 0.13511370111674412], "isController": false}, {"data": ["500/Internal Server Error", 87, 3.0145530145530146, 0.05110822607459451], "isController": false}, {"data": ["Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: bound must be greater than origin", 725, 25.121275121275122, 0.42590188395495426], "isController": false}, {"data": ["Response was null", 96, 3.3264033264033266, 0.05639528394438015], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1748, 60.56826056826057, 1.0268641284872553], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 170227, 2886, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1748, "Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: bound must be greater than origin", 725, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 230, "Response was null", 96, "500/Internal Server Error", 87], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 725, 725, "Non HTTP response code: java.lang.IllegalArgumentException/Non HTTP response message: bound must be greater than origin", 725, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetAllCharacters", 37490, 1550, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1547, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["ChangeChagacter", 32934, 192, "500/Internal Server Error", 87, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 59, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 46, "", "", "", ""], "isController": false}, {"data": ["CreateCharacter", 33511, 264, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 137, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 127, "", "", "", "", "", ""], "isController": false}, {"data": ["DeleteById", 32653, 59, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 41, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 18, "", "", "", "", "", ""], "isController": false}, {"data": ["GetById", 32914, 96, "Response was null", 96, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
