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
DOWNLOAD_URL="https://github.com/FrozenProductions/Comet/releases/download/v1.0.0/Comet_1.0.0_universal.dmg"

if ! curl -L -o "$TEMP_DMG" "$DOWNLOAD_URL" 2>/dev/null; then
    echo -e "${RED}Error: Failed to download Comet${NC}"
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

echo -e "${BLUE}Installing Comet...${NC}"

# Mount the DMG
hdiutil attach -nobrowse -noautoopen "$TEMP_DMG" > /dev/null
MOUNT_POINT="/Volumes/Comet"

if [ ! -d "$MOUNT_POINT" ]; then
    echo -e "${RED}Error: Failed to mount disk image${NC}"
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

if [ ! -d "$MOUNT_POINT/Comet.app" ]; then
    echo -e "${RED}Error: Could not find Comet.app in the mounted image${NC}"
    hdiutil detach "$MOUNT_POINT" >/dev/null 2>&1
    rm -f "$TEMP_DMG" 2>/dev/null
    exit 1
fi

if pgrep -f "Comet" > /dev/null; then
    echo -e "${YELLOW}Closing Comet...${NC}"
    osascript -e 'quit app "Comet"' 2>/dev/null
    sleep 2
fi

if [ -d "/Applications/Comet.app" ]; then
    sudo rm -rf "/Applications/Comet.app"
fi

if sudo /usr/bin/ditto -rsrc "$MOUNT_POINT/Comet.app" "/Applications/Comet.app"; then
    sudo chown -R root:wheel "/Applications/Comet.app"
    sudo chmod -R 755 "/Applications/Comet.app"
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Comet.app
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