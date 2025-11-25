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

async function moveActiveTabToNextWindow() {
  try {
    const activeTabs = await ext.tabs.query({ active: true, currentWindow: true });
    const activeTab = activeTabs && activeTabs.length > 0 ? activeTabs[0] : null;
    if (!activeTab) {
      return;
    }

    const currentWindow = await ext.windows.getCurrent();
    const allWindows = await ext.windows.getAll();

    // If only one window exists, do nothing
    if (allWindows.length < 2) {
      return;
    }

    // Find the current window index
    const currentWindowIndex = allWindows.findIndex(w => w.id === currentWindow.id);
    
    // Get the next window in the cycle (wrap around if at the end)
    const nextWindowIndex = (currentWindowIndex + 1) % allWindows.length;
    const nextWindow = allWindows[nextWindowIndex];

    // Get the active tab in the destination window
    const destinationActiveTabs = await ext.tabs.query({ active: true, windowId: nextWindow.id });
    const destinationActiveTab = destinationActiveTabs && destinationActiveTabs.length > 0 ? destinationActiveTabs[0] : null;
    
    // Determine the index: place above the active tab, or at the end if no active tab
    const targetIndex = destinationActiveTab ? destinationActiveTab.index : -1;

    // Move the tab to the next window, positioned above the active tab
    await ext.tabs.move(activeTab.id, {
      windowId: nextWindow.id,
      index: targetIndex
    });

    // Activate the moved tab and focus the window
    await ext.tabs.update(activeTab.id, { active: true });
    await ext.windows.update(nextWindow.id, { focused: true });
  } catch (error) {
    console.error('Move Tab to Next Window: failed to move tab', error);
  }
}

ext.commands.onCommand.addListener((command) => {
  if (command === 'move-tab-to-new-window') {
    moveActiveTabToNewWindow();
  } else if (command === 'duplicate-tab') {
    duplicateCurrentTab();
  } else if (command === 'move-tab-to-next-window') {
    moveActiveTabToNextWindow();
  }
});

// Optional: clicking the toolbar button also moves the tab
const actionApi = ext.action || ext.browserAction;
if (actionApi && typeof actionApi.onClicked?.addListener === 'function') {
  actionApi.onClicked.addListener(() => {
    moveActiveTabToNewWindow();
  });
}
