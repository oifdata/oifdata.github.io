function deselectTabs() {
    Array.from(document.getElementsByClassName("nav-item")).forEach(tab => {
        tab.classList.remove("active");
        tab.setAttribute('aria-selected', 'false');
    })
}

function selectTab(selectedTab) {
    selectedTab.classList.add("active");
    selectedTab.setAttribute('aria-selected', 'true');
}

const focusableElements = "a, area, audio controls, button, iframe, input, select, summary, textarea, video controls";

function hideFocusableDescendents(parent) {
    let focusables = parent.querySelectorAll(focusableElements);
    focusables.forEach(focusable => focusable.setAttribute("tabindex", "-1"))
}

function unhideFocusableDescendents(parent) {
    let focusables = parent.querySelectorAll(focusableElements);
    focusables.forEach(focusable => focusable.removeAttribute("tabindex"))
}


function deselectPanels() {
    Array.from(document.getElementsByClassName("tab-pane")).forEach(panel => {
        panel.classList.remove("active");
        panel.setAttribute('aria-hidden', 'true');
        hideFocusableDescendents(panel);
    })
}

function selectPanel(selectedPanel) {
    selectedPanel.classList.add("active");
    selectedPanel.setAttribute('aria-hidden', 'false');
    unhideFocusableDescendents(selectedPanel);
}

function tabHandler(e) {
    if(e.type === 'keypress' && e.keyCode !== 13) {
        return;
    }
    deselectTabs();
    deselectPanels();
    let selectedTab = e.target;
    selectTab(selectedTab);
    let selectedPanel = document.getElementById(selectedTab.dataset.associatedPanelId);
    selectPanel(selectedPanel);
};

function setTabHandler(tab) {
  tab.addEventListener('click', tabHandler);
  tab.addEventListener('keypress', tabHandler);
};

export { setTabHandler, hideFocusableDescendents };