import { hideFocusableDescendents } from "./tabs.js"
import { summaryFigure, linksFigure } from "./d3-charts.js"

const count = (data, timePeriod) => {
    let returnObject = ({
        "Time period": timePeriod,
        "Improvement": 0,
        "Little or no change": 0,
        "Deterioration": 0,
        "Not assessed": 0
    })
    const aggregateArray = d3.flatRollup(data, v => v.length, d => d[timePeriod]);
    aggregateArray.forEach(([key, value]) => {
        returnObject[key] = value;
    })
    return returnObject
};

const unpivotData = (data) => {
    const updatedData = data.filter(object => {
        const values = Object.values(object);
        const index = values.findIndex(value => value.startsWith("Change"))
        if (index != -1) {
            return false
        } else {
            return true
        }
    });
    return ["Short term", "Medium term", "Long term"].map(timePeriod => {
        return count(updatedData, timePeriod);
    });
};

const summaryMargin = { top: 50, right: 20, bottom: 30, left: 100 };
const linksMargin = { top: 20, right: 20, bottom: 20, left: 20 };

const generateAssessmentVisulisations = (siteDomain, pagePath, goal_short_name) => {
    const dirPath = pagePath.substring(0, pagePath.lastIndexOf("/"))
    const baseUrl = `${siteDomain}${dirPath}`
    if (goal_short_name !== "environmental-hazards") {
        let summaryFigurePlotContainer = document.getElementById("summary-figure-plot-container");
        fetch(`${baseUrl}/${goal_short_name}-assessment-summary-table.json`)
            .then(reponse => reponse.json())
            .then(data => {
                let summaryTable = new simpleDatatables.DataTable("#summary-table")
                summaryTable.import({
                    type: "json",
                    data: JSON.stringify(data),
                })
                const parent = document.getElementById("summary-table-panel")
                summaryTable.on('datatable.init', () => hideFocusableDescendents(parent));

                let downloadSummaryTableButton = document.getElementById("summary-table-download-button")
                downloadSummaryTableButton.addEventListener("click", () => {
                    summaryTable.export({
                        type: "csv",
                        filename: `${goal_short_name}-assessment-summary-table`
                    })
                })

                let unpivotedData = unpivotData(data);

                summaryFigure(summaryFigurePlotContainer, 500, 1100, summaryMargin, unpivotedData, data.length);

                d3.select(window).on("resize", () => {
                    summaryFigure(summaryFigurePlotContainer, 500, 1100, summaryMargin, unpivotedData, data.length);
                });
            });
            
    }

    let linksFigurePlotContainer = document.getElementById("links-figure-plot-container");
    fetch(`${baseUrl}/${goal_short_name}-assessment-links-data.json`)
        .then(reponse => reponse.json())
        .then(data => {
            linksFigure(linksFigurePlotContainer, 500, 500, linksMargin, data);

            const edges = data["edges"]
            const selected_edges = edges.map(edge => {
                return ({
                    "From Indicator": edge.from_node_long,
                    "To Indicator": edge.to_node_long,
                    "Correlation": edge.correlation,
                    "Rationale": edge.rationale
                })
            })

            let linksTable = new simpleDatatables.DataTable("#links-table")
            linksTable.import({
                type: "json",
                data: JSON.stringify(selected_edges),
            })

            const parent = document.getElementById("links-table-panel")
            linksTable.on('datatable.init', () => hideFocusableDescendents(parent));

            let downloadLinksTableButton = document.getElementById("links-table-download-button")
            downloadLinksTableButton.addEventListener("click", () => {
                linksTable.export({
                    type: "csv",
                    filename: `${goal_short_name}-assessment-links-table`
                })
            })
    });
}

export { generateAssessmentVisulisations };