
const getOuterWidth = (parentElement, defaultWidth) => {
    const clientWidth = parentElement.clientWidth;
    const outerWidth = (clientWidth === 0) ? defaultWidth : clientWidth;
    return outerWidth
};

const getInnerWidth = (outerWidth, margin) => {
    const innerWidth = outerWidth - margin.left - margin.right;
    return innerWidth
}

const getOuterHeight = (parentElement, defaultHeight) => {
    const clientHeight = parentElement.clientHeight;
    const outerHeight = (clientHeight === 0) ? defaultHeight : clientHeight;
    return outerHeight
};

const getInnerHeight = (outerHeight, margin) => {
    const innerHeight = outerHeight - margin.top - margin.bottom;
    return innerHeight
}

const addSvgElement = (parentElement, outerHeight, outerWidth, margin, titleId, descriptionId) => {
    const svg = d3.select(parentElement)
        .append("svg")
        .attr("viewBox", [0, 0, outerWidth, outerHeight])
        .attr("height", outerHeight)
        .attr("width", outerWidth)
        .attr("role", "group")
        .attr("aria-labelledby", titleId)
        .attr("aria-describedby", descriptionId)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"
        );
    return svg
}

const getNodeX = (node, width, offset) => { return (width / 2) + ((width / 2) * node) + offset };
const getNodeY = (node, height, offset) => { return (height / 2) + ((height / 2) * node) + offset };

const linkTooltip = (d) => {
    return `Indicator ${d["from_node"]} has a ${d["correlation"].toLowerCase()} affect on Indcator ${d["to_node"]}`
}

const summaryTooltip = (d, totalCount) => {
    let assessment = "";
    switch (d["assessment"]) {
        case "Improvement":
            assessment = "showed an improvement in";
            break;
        case "Little or no change":
            assessment = "showed little or no change in";
            break;
        case "Deterioration":
            assessment = "showed a deterioration in";
            break;
        case "Not assessed":
            assessment = "were not assessed for";
            break;
    }
    return `${d[1] - d[0]} out of ${totalCount} components, ${d3.format(".0%")((d[1] - d[0]) / totalCount)}, ${assessment} the ${d.data["Time period"].toLowerCase()}`
}

const strokeColour = (edge) => {
    if (edge.correlation === "Positive") {
        return "#12436D"
    } else {
        return "#801650"
    }
}

const linksFigure = (parentElement, defaultHeight, defaultWidth, margin, data) => {
    // Calculate dimensions
    const outerHeight = getOuterHeight(parentElement, defaultHeight);
    const innerHeight = getInnerHeight(outerHeight, margin);

    const outerWidth = getOuterWidth(parentElement, defaultWidth);
    const innerWidth = getInnerWidth(outerWidth, margin);

    const radius = 15;

    // Clear the previous SVG elements
    d3.select(parentElement).select("svg").remove();

    // Add SVG element
    const svg = addSvgElement(parentElement, outerHeight, outerWidth, margin, "links-figure-heading", "links-figure-description");

    // Define dark blue arrow head
    svg.append("defs")
        .append("marker")
        .attr("id", "dark-blue-arrow")
        .attr("viewBox", "0 0 10 10")
        .attr('refX', 25)
        .attr('refY', 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#12436D");

    // Define dark pink arrow head
    svg.append("defs")
        .append("marker")
        .attr("id", "dark-pink-arrow")
        .attr("viewBox", "0 0 10 10")
        .attr('refX', 25)
        .attr('refY', 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style("fill", "#801650");

    // Get edges data
    const edges = data["edges"];

    // Add links
    svg.append('g')
        .attr("role", "list")
        .attr("aria-label", "links between indicators")
        .selectAll("path")
        .data(edges)
        .enter()
        .append("g")
        .attr("role", "listitem")
        .attr("aria-label", "a link between two indicators")
        .append("path")
        .attr("class", "link")
        .attr("marker-end", (edge) => {
            if (edge.correlation === "Positive") {
                return "url(#dark-blue-arrow)"
            } else {
                return "url(#dark-pink-arrow)"
            }
        })
        .attr("d", (edge) => "M" + getNodeX(edge.from_xy[0], innerWidth, 0)
            + ", " + getNodeY(edge.from_xy[1], innerHeight, 0)
            + ", " + getNodeX(edge.to_xy[0], innerWidth, 0)
            + ", " + getNodeX(edge.to_xy[1], innerHeight, 0)
        )
        .attr("stroke", edge => strokeColour(edge))
        .clone()
        .attr("class", "link-buffer")
        .attr("marker-end", undefined)
        .append("title")
        .text(d => linkTooltip(d))

    // Get nodes data
    const nodes = data["nodes"];

    // Add nodes groups
    let nodeGroups = svg.append('g')
        .attr("id", "nodes")
        .selectAll("dot")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node");

    // Add circles to nodes groups
    nodeGroups.append("circle")
        .attr("id", node => node.node)
        .attr("cx", node => getNodeX(node.x, innerWidth, 0))
        .attr("cy", node => getNodeY(node.y, innerHeight, 0))
        .attr("r", radius)

    // Add text to nodes groups
    nodeGroups.append("text")
        .attr("x", node => getNodeX(node.x, innerWidth, 0))
        .attr("y", node => getNodeY(node.y, innerHeight, 5))
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(node => node.node)
        .attr("aria-hidden", true)
}

const summaryFigure = (parentElement, defaultHeight, defaultWidth, margin, data, totalCount) => {
    const innerHeight = getInnerHeight(defaultHeight, margin);

    const outerWidth = getOuterWidth(parentElement, defaultWidth);
    const innerWidth = getInnerWidth(outerWidth, margin);

    // Clear the previous SVG elements
    d3.select(parentElement).select("svg").remove();

    // Add SVG element
    const svg = addSvgElement(parentElement, defaultHeight, outerWidth, margin, "summary-figure-heading", "summary-figure-description");

    // Define groupings
    const subgroups = ["Improvement", "Little or no change", "Deterioration", "Not assessed"];
    const groups = ["Long term", "Medium term", "Short term"];

    // Define x axis scale
    const xScale = d3.scaleLinear()
        .domain([0, totalCount])
        .rangeRound([0, innerWidth]);

    // Define x axis
    const xAxis = d3.axisBottom(xScale)
        // .tickValues(["0", "20", "40", "60", "80", "100"])
        .ticks(6)
        .tickFormat(tick => d3.format(".0%")(tick / totalCount));

    // Add x axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("aria-hidden", true)
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("font-size", 14);

    // Add label to x axis
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.top + 10);

    // Define y axis scale
    const yScale = d3.scaleBand()
        .rangeRound([innerHeight, 0])
        .domain(groups)
        .padding(0.1);

    // Define y axis
    const yAxis = d3.axisLeft(yScale)

    // Add y axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("aria-hidden", true)
        .call(yAxis)
        .selectAll("text")
        .attr("font-size", 14);

    // Define colours
    const colour = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#12436D", "#8F8F8F", "#801650", "#FFF"]);

    const colourText = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#FFF", "#000", "#FFF", "#000"]);

    // Stack the data
    let stackedData = d3.stack()
        .keys(subgroups)
        (data)

    // Add the bars
    const barComponentGroups = svg.append("g")
        .attr("role", "list")
        .attr("aria-label", "stacked bars")
        .attr("id", "bars")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .selectAll("rect")
        .data(stack => {
            stack.forEach(substack => {
                substack["assessment"] = stack["key"]
            });
            return stack
        })
        .enter()
        .append("g")
        .attr("class", "bar-component")
        .attr("aria-label", "stacked bar component")
        .attr("role", "listitem")

    barComponentGroups.append("rect")
        .attr("fill", d => colour(d["assessment"]))
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data["Time period"]))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d[1]) - xScale(d[0]))
        .attr("stroke", "#000")
        .attr("tabindex", "0")
        .append("title")
        .text(d => summaryTooltip(d, totalCount))

    barComponentGroups.append("text")
        .attr("class", "bar-component-text")
        .attr("x", d => xScale(d[0]) + xScale(totalCount * 0.01))
        .attr("y", d => yScale(d.data["Time period"]) + (yScale.bandwidth() / 2))
        .attr("fill", d => colourText(d["assessment"]))
        .text(d => {
            const count = d[1] - d[0];
            if (count > 0) {
                return count
            };
        })
        .attr("aria-hidden", true)

};

export { summaryFigure, linksFigure };