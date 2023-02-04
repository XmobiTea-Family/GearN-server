
window.onload = (event) => {
    init();
};

var myLineChart;

function init() {
    Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#292b2c';

    refreshData();
    updateCCUChart();
}

function setAnalyticsStats(tsDate, returnData) {
    let tempMaxValue = 4;
    let maxValue = Math.max(...myLineChart.data.datasets[0].data);
    {
        while (tempMaxValue <= maxValue) {
            tempMaxValue *= 2;
        }
    }

    if (tsDate == "current") {
        myLineChart.data.labels.push("now");
    }
    else {
        let date = new Date(tsDate);
        myLineChart.data.labels.push(date.getHours() + ":" + date.getMinutes());
    }

    myLineChart.data.datasets.forEach((dataset) => {
        dataset.data.push(returnData.CCU | 0);
    });
    myLineChart.options.scales.yAxes[0].ticks.max = tempMaxValue;
    myLineChart.update();
}

function refreshData() {
    refreshCCUChart(null, (returnData) => {
        setAnalyticsStats("current", returnData);

        let dauSpan = document.getElementById("DAUSpan");
        dauSpan.innerText = returnData.DAU;

        let mauSpan = document.getElementById("MAUSpan");
        mauSpan.innerText = returnData.MAU;

        let ccuSpan = document.getElementById("CCUSpan");
        ccuSpan.innerText = returnData.CCU;

        let newUserSpan = document.getElementById("newUserSpan");
        newUserSpan.innerText = returnData.DNU;

        // {"CCU":0,"DAU":1,"DAUSince0h":1,"DNU":1,"DNUSince0h":1,"DRT":0,"DRTSince0h":0,"MAU":6,"MAUSince0h1":6,"MNU":6,"MNUSince0h1":6,"MRT":0,"MRTSince0h1":0}

        let tempMaxValue = 4;
        let dataArr = [returnData["CCU"], returnData["DAU"], returnData["DAUSince0h"], returnData["DNU"], returnData["DNUSince0h"], returnData["DRT"], returnData["DRTSince0h"], returnData["MAU"], returnData["MAUSince0h1"], returnData["MNU"], returnData["MNUSince0h1"], returnData["MRT"], returnData["MRTSince0h1"]];
        let maxValue = Math.max(...dataArr);
        {
            while (tempMaxValue <= maxValue) {
                tempMaxValue *= 2;
            }
        }

        let ctx = document.getElementById("barcharttotal");
        let myLineChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["CCU", "DAU", "DAUSince0h", "DNU", "DNUSince0h", "DRT", "DRTSince0h", "MAU", "MAUSince0h1", "MNU", "MNUSince0h1", "MRT", "MRTSince0h1"],
                datasets: [{
                    label: "Total",
                    backgroundColor: "rgba(2,117,216,1)",
                    borderColor: "rgba(2,117,216,1)",
                    data: dataArr,
                }],
            },
            options: {
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 13
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: tempMaxValue,
                            maxTicksLimit: 10
                        },
                        gridLines: {
                            display: true
                        }
                    }],
                },
                legend: {
                    display: false
                }
            }
        });
    });
}

function updateCCUChart() {
    let ctx = document.getElementById("areachartccu");
    myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "CCU",
                lineTension: 0.3,
                backgroundColor: "rgba(2,117,216,0.2)",
                borderColor: "rgba(2,117,216,1)",
                pointRadius: 5,
                pointBackgroundColor: "rgba(2,117,216,1)",
                pointBorderColor: "rgba(255,255,255,0.8)",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(2,117,216,1)",
                pointHitRadius: 50,
                pointBorderWidth: 2,
                data: [],
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 5
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 4,
                        maxTicksLimit: 7
                    },
                    gridLines: {
                        color: "rgba(0, 0, 0, .125)",
                    }
                }],
            },
            legend: {
                display: false
            }
        }
    });

    let currentDate = new Date();
    currentDate.setMinutes(Math.floor((currentDate.getMinutes() / 15) + 1) * 15);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    for (let i = 0; i < 9; i++) {
        currentDate.setMinutes(currentDate.getMinutes() - 15);

        let tsDate = currentDate.getTime();
        refreshCCUChart(tsDate, (returnData) => {
            setAnalyticsStats(tsDate, returnData);
        });
    }
}

function refreshCCUChart(tsDate, callbackData) {
    let xhr = new XMLHttpRequest();
    xhr.open("get", tsDate == null ? ("/admin/get-analytics") : ("/admin/get-analytics?tsDate=" + tsDate), true);
    xhr.onload = () => {
        if (xhr.status == 200) {
            if (!xhr.responseText) {
                callbackData({});
            }
            else {
                let returnData = JSON.parse(xhr.responseText);
                callbackData(returnData);
            }
        }
        else {
            callbackData({});
        }
    };

    xhr.send();
}
