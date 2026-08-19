from flask import Flask, render_template
from flask_socketio import SocketIO
from scapy.all import sniff, IP, TCP, UDP, ICMP
import threading
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

sniffing = True

def process_packet(packet):
    try:
        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            proto = packet[IP].proto
            proto_name = "Other"
            
            if TCP in packet:
                proto_name = "TCP"
                src_port = packet[TCP].sport
                dst_port = packet[TCP].dport
            elif UDP in packet:
                proto_name = "UDP"
                src_port = packet[UDP].sport
                dst_port = packet[UDP].dport
            elif ICMP in packet:
                proto_name = "ICMP"
                src_port = "-"
                dst_port = "-"
            else:
                src_port = "-"
                dst_port = "-"
            
            timestamp = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
            
            payload_hex = ""
            if hasattr(packet, 'load'):
                payload_hex = packet.load[:50].hex()
                
            packet_info = {
                "timestamp": timestamp,
                "src_ip": src_ip,
                "src_port": src_port,
                "dst_ip": dst_ip,
                "dst_port": dst_port,
                "protocol": proto_name,
                "length": len(packet),
                "payload_summary": payload_hex
            }
            
            # Debug print to console
            print(f"[DEBUG] Captured: {proto_name} {src_ip} -> {dst_ip}")
            
            socketio.emit('new_packet', packet_info)
    except Exception as e:
        print(f"Error processing packet: {e}")

def start_sniffing():
    print("\n--- Available Network Interfaces ---")
    from scapy.interfaces import get_working_ifaces
    for iface in get_working_ifaces():
        print(f"- {iface.description} (Name: {iface.name})")
    print("------------------------------------\n")

    print("Started packet sniffing on 'WiFi' interface...")
    try:
        sniff(iface="WiFi", prn=process_packet, store=False, stop_filter=lambda x: not sniffing)
    except PermissionError:
        print("\n[!] ERROR: Permission Denied. You must run this script as an Administrator.")
        socketio.emit('sniff_error', {'msg': 'Permission Denied. Please run terminal as Administrator to capture packets.'})
    except Exception as e:
        print(f"\n[!] Sniffing error: {e}")
        socketio.emit('sniff_error', {'msg': str(e)})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    sniff_thread = threading.Thread(target=start_sniffing)
    sniff_thread.daemon = True
    sniff_thread.start()
    
    print("Starting Web Server on http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
