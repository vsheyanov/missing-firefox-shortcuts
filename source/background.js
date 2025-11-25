const ext = typeof browser !== 'undefined' ? browser : chrome;

async function moveActiveTabToNewWindow() {
  try {
    const activeTabs = await ext.tabs.query({ active: true, currentWindow: true });
    const activeTab = activeTabs && activeTabs.length > 0 ? activeTabs[0] : null;
    if (!activeTab) {
      return;
    }

    await ext.windows.create({ tabId: activeTab.id, focused: true });
  } catch (error) {
    console.error('Move Tab to New Window: failed to move tab', error);
  }
}

async function duplicateCurrentTab() {
  try {
    const activeTabs = await ext.tabs.query({ active: true, currentWindow: true });
    const activeTab = activeTabs && activeTabs.length > 0 ? activeTabs[0] : null;
    if (!activeTab) {
      return;
    }

    // Create a new tab with the same URL, positioned above the current tab
    await ext.tabs.create({
      url: activeTab.url,
      index: activeTab.index,
      active: true
    });
  } catch (error) {
    console.error('Duplicate Tab: failed to duplicate tab', error);
  }
}

ext.commands.onCommand.addListener((command) => {
  if (command === 'move-tab-to-new-window') {
    moveActiveTabToNewWindow();
  } else if (command === 'duplicate-tab') {
    duplicateCurrentTab();
  }
});

// Optional: clicking the toolbar button also moves the tab
const actionApi = ext.action || ext.browserAction;
if (actionApi && typeof actionApi.onClicked?.addListener === 'function') {
  actionApi.onClicked.addListener(() => {
    moveActiveTabToNewWindow();
  });
}
