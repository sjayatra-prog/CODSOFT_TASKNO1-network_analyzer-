# NetAnalyzer 🌐

A beautiful, real-time web-based network packet analyzer built for my internship project. It captures network traffic directly from your network interface and streams the parsed packet data to a modern, dynamic web dashboard.

## ✨ Features

- **Real-Time Capture**: Captures and parses packets on-the-fly using `scapy` running in a background thread.
- **Live Streaming**: Pushes packet data directly to the web UI with zero latency using WebSockets (`Flask-SocketIO`).
- **Premium Dashboard**: A sleek, dark-mode glassmorphism interface with custom protocol color-coding (TCP, UDP, ICMP).
- **Instant Filtering**: Search by Source/Destination IP, Port, or Protocol in real-time right from the browser.
- **Live Statistics**: Auto-updating counters for total packets and specific protocol breakdowns.
- **Memory Safe**: Automatically manages the DOM to prevent browser crashes under heavy network loads.

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask, Flask-SocketIO
- **Packet Sniffing**: Scapy
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism design), Vanilla JavaScript
- **Communication**: WebSockets (socket.io)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:
1. **Python 3.8+**
2. **Npcap (Windows Only)**: Since Windows does not natively support Layer 2 packet sniffing, you **must** install the Npcap driver. 
   - Download it from [npcap.com](https://npcap.com/#download).
   - *Important:* During installation, ensure you check the box for **"Install Npcap in WinPcap API-compatible Mode"**.

## 🚀 Installation & Setup

1. **Clone/Navigate to the directory**:
   Open your terminal and navigate to the project folder.

2. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Network Interface (If necessary)**:
   By default, the application targets the `WiFi` interface. If you are on an Ethernet connection or a different adapter, run the application once to see the printed list of available interfaces, then update Line 60 in `app.py`:
   ```python
   # Change "WiFi" to your active interface name
   sniff(iface="WiFi", prn=process_packet, store=False, stop_filter=lambda x: not sniffing)
   ```

## 💻 Usage

> **⚠️ Administrator Privileges Required**
> Capturing raw network packets requires elevated privileges. You **must** run your terminal as an Administrator.

1. Open PowerShell or Command Prompt **as Administrator**.
2. Run the application:
   ```bash
   python app.py
   ```
3. Open your web browser and navigate to:
   [http://localhost:5000](http://localhost:5000)
4. Browse the web or ping a server to watch the packets stream in real-time!

## 📸 Interface

The dashboard features a live-updating table displaying:
- Timestamp
- Source IP & Port
- Destination IP & Port
- Protocol Type (Color-coded badges)
- Packet Length
- Hexadecimal Payload Summary

## 📄 License
This project was created for an internship assignment. Feel free to use and modify!
