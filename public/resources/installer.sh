#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
 ░▒▓██████▓▒░   ░▒▓██████▓▒░  ░▒▓██████████████▓▒░  ░▒▓████████▓▒░ ░▒▓████████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓██████▓▒░      ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
 ░▒▓██████▓▒░   ░▒▓██████▓▒░  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓████████▓▒░    ░▒▓█▓▒░   
EOF
echo -e "${NC}"

if [[ "$(uname)" != "Darwin" ]]; then
    echo -e "${RED}Error: This installer is only for MacOS systems${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Administrator access is required for installation${NC}"
if ! sudo -v; then
    echo -e "${RED}Error: Failed to obtain administrator privileges${NC}"
    exit 1
fi

echo -e "${BLUE}Downloading Comet...${NC}"
TEMP_DMG=$(mktemp)

LATEST_VERSION=$(curl -s https://www.comet-ui.fun/api/v1/status | grep -o '"version":"[^\"]*' | grep -o '[0-9.]*')

if [ -z "$LATEST_VERSION" ]; then
    echo -e "${RED}Error: Could not fetch latest version info${NC}"
    exit 1
fi

DOWNLOAD_URL="https://github.com/FrozenProductions/Comet/releases/download/v${LATEST_VERSION}/Hydrogen-M_1.0.0_universal.dmg"

if ! curl -L -o "$TEMP_DMG" "$DOWNLOAD_URL" 2>/dev/null; then
    echo -e "${RED}Error: Failed to download Comet${NC}"
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

echo -e "${BLUE}Installing Comet...${NC}"

if [ -d "/Applications/Hydrogen-M.app" ]; then
    sudo rm -rf "/Applications/Hydrogen-M.app"
fi

hdiutil attach -nobrowse -noautoopen "$TEMP_DMG" > /dev/null
MOUNT_POINT="/Volumes/Hydrogen"

if [ ! -d "$MOUNT_POINT" ]; then
    echo -e "${RED}Error: Failed to mount disk image${NC}"
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

if [ ! -d "$MOUNT_POINT/Hydrogen-M.app" ]; then
    echo -e "${RED}Error: Could not find Hydrogen-M.app in the mounted image${NC}"
    hdiutil detach "$MOUNT_POINT" >/dev/null 2>&1
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

if pgrep -f "Hydrogen-M" > /dev/null; then
    echo -e "${YELLOW}Closing Hydrogen-M...${NC}"
    osascript -e 'quit app "Hydrogen-M"' 2>/dev/null
    sleep 2
fi

if [ -d "/Applications/Hydrogen-M.app" ]; then
    sudo rm -rf "/Applications/Hydrogen-M.app"
fi

if sudo /usr/bin/ditto -rsrc "$MOUNT_POINT/Hydrogen-M.app" "/Applications/Hydrogen-M.app"; then
    sudo chown -R $(whoami):staff "/Applications/Hydrogen-M.app"
    sudo chmod -R 777 "/Applications/Hydrogen-M.app"
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Hydrogen-M.app
    echo -e "${GREEN}✓ Comet has been installed successfully!${NC}"
else
    echo -e "${RED}Error: Failed to install Comet${NC}"
    hdiutil detach "$MOUNT_POINT" >/dev/null 2>&1
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

hdiutil detach "$MOUNT_POINT" >/dev/null 2>&1
rm -f "$TEMP_DMG" 2>/dev/null

echo -e "${BLUE}Launching Comet...${NC}"
open -a "Comet"

echo -e "${GREEN}Installation complete! Enjoy using Comet!${NC}" 