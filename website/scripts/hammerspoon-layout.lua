-- Hammerspoon script to create a window layout with Chrome on left and Zed Dev on right

-- Configuration
local EDGE_PADDING = 200
local MIDDLE_GAP = 200

-- Function to arrange windows
local function arrangeWindows()
    -- Get the main screen
    local screen = hs.screen.mainScreen()
    local screenFrame = screen:frame()
    
    -- Calculate window dimensions
    local availableWidth = screenFrame.w - (2 * EDGE_PADDING) - MIDDLE_GAP
    local windowWidth = availableWidth / 2
    local windowHeight = screenFrame.h - (2 * EDGE_PADDING)
    
    -- Calculate positions
    local leftWindowX = screenFrame.x + EDGE_PADDING
    local rightWindowX = leftWindowX + windowWidth + MIDDLE_GAP
    local windowY = screenFrame.y + EDGE_PADDING
    
    -- Find Chrome window
    local chromeApp = hs.application.find("Google Chrome")
    if chromeApp then
        local chromeWindow = chromeApp:mainWindow()
        if chromeWindow then
            chromeWindow:setFrame({
                x = leftWindowX,
                y = windowY,
                w = windowWidth,
                h = windowHeight
            })
        else
            hs.alert.show("Chrome window not found")
        end
    else
        hs.alert.show("Chrome not running")
    end
    
    -- Find Zed Dev window
    local zedApp = hs.application.find("Zed Dev")
    if zedApp then
        local zedWindow = zedApp:mainWindow()
        if zedWindow then
            zedWindow:setFrame({
                x = rightWindowX,
                y = windowY,
                w = windowWidth,
                h = windowHeight
            })
        else
            hs.alert.show("Zed Dev window not found")
        end
    else
        hs.alert.show("Zed Dev not running")
    end
    
    hs.alert.show("Window layout applied")
end

-- Create menu bar item
local menubar = hs.menubar.new()

-- Function to update menu
local function updateMenu()
    local menuItems = {
        {
            title = "Chrome Left | Zed Right",
            fn = arrangeWindows
        },
        {
            title = "-"
        },
        {
            title = "Quit",
            fn = function() 
                menubar:delete()
                hs.alert.show("Layout menu removed")
            end
        }
    }
    
    menubar:setMenu(menuItems)
end

-- Initialize menu bar
if menubar then
    menubar:setTitle("📐")
    menubar:setTooltip("Window Layout")
    updateMenu()
end

-- Hotkey binding (optional)
-- Press Cmd+Ctrl+L to trigger the layout
hs.hotkey.bind({"cmd", "ctrl"}, "L", function()
    arrangeWindows()
end)

hs.alert.show("Window layout menu loaded")