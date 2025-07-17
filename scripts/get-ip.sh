#!/bin/bash

echo "🔍 Finding your MacBook's IP address for mobile testing..."
echo ""

# Get the primary network interface IP
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Could not find your IP address. Make sure you're connected to WiFi."
    exit 1
fi

echo "✅ Your MacBook's IP address is: $IP_ADDRESS"
echo ""
echo "📱 To test on mobile:"
echo "   1. Connect your mobile device to the same WiFi network"
echo "   2. Open your browser and go to: http://$IP_ADDRESS:4200"
echo ""
echo "🖥️  Local development server: http://localhost:4200"
echo ""
echo "💡 Tip: Use 'npm run mobilestart' to start the server with network access" 