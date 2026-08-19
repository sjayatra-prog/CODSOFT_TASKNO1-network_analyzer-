const socket = io();
const tbody = document.getElementById('packet-tbody');
const filterInput = document.getElementById('filter-input');
const toggleCaptureBtn = document.getElementById('toggle-capture');
const clearBtn = document.getElementById('clear-table');
const errorBanner = document.getElementById('error-banner');

const counts = { total: 0, tcp: 0, udp: 0, icmp: 0 };
const countElements = {
    total: document.getElementById('total-count'),
    tcp: document.getElementById('tcp-count'),
    udp: document.getElementById('udp-count'),
    icmp: document.getElementById('icmp-count')
};

let isCapturing = true;
let allPackets = []; 
const MAX_PACKETS = 500; // Keep DOM limit reasonable for performance

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('sniff_error', (data) => {
    errorBanner.textContent = data.msg;
    errorBanner.classList.remove('hidden');
    isCapturing = false;
    toggleCaptureBtn.textContent = 'Capture Failed';
    toggleCaptureBtn.classList.remove('active');
    toggleCaptureBtn.style.borderColor = 'var(--proto-icmp)';
    toggleCaptureBtn.style.color = 'var(--proto-icmp)';
});

socket.on('new_packet', (packet) => {
    if (!isCapturing) return;

    allPackets.push(packet);
    if (allPackets.length > MAX_PACKETS) {
        allPackets.shift(); 
    }

    updateStats(packet.protocol);

    if (matchesFilter(packet, filterInput.value.toLowerCase())) {
        const row = createRow(packet);
        tbody.insertBefore(row, tbody.firstChild);
        
        if(tbody.children.length > MAX_PACKETS) {
            tbody.removeChild(tbody.lastChild);
        }
    }
});

function createRow(packet) {
    const tr = document.createElement('tr');
    
    let protoClass = 'proto-other';
    if (packet.protocol === 'TCP') protoClass = 'proto-tcp';
    if (packet.protocol === 'UDP') protoClass = 'proto-udp';
    if (packet.protocol === 'ICMP') protoClass = 'proto-icmp';

    tr.innerHTML = `
        <td>${packet.timestamp}</td>
        <td>${packet.src_ip}</td>
        <td>${packet.src_port}</td>
        <td>${packet.dst_ip}</td>
        <td>${packet.dst_port}</td>
        <td><span class="proto-badge ${protoClass}">${packet.protocol}</span></td>
        <td>${packet.length}</td>
        <td class="payload" title="${packet.payload_summary}">${packet.payload_summary || '-'}</td>
    `;
    return tr;
}

function updateStats(protocol) {
    counts.total++;
    countElements.total.textContent = counts.total;
    
    if (protocol === 'TCP') {
        counts.tcp++;
        countElements.tcp.textContent = counts.tcp;
    } else if (protocol === 'UDP') {
        counts.udp++;
        countElements.udp.textContent = counts.udp;
    } else if (protocol === 'ICMP') {
        counts.icmp++;
        countElements.icmp.textContent = counts.icmp;
    }
}

function matchesFilter(packet, term) {
    if (!term) return true;
    return (
        packet.src_ip.includes(term) ||
        packet.dst_ip.includes(term) ||
        packet.protocol.toLowerCase().includes(term) ||
        (packet.src_port && packet.src_port.toString().includes(term)) ||
        (packet.dst_port && packet.dst_port.toString().includes(term))
    );
}

filterInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    tbody.innerHTML = '';
    
    let renderCount = 0;
    // Iterate backward to show most recent first
    for (let i = allPackets.length - 1; i >= 0; i--) {
        if (matchesFilter(allPackets[i], term)) {
            tbody.appendChild(createRow(allPackets[i]));
            renderCount++;
        }
        if (renderCount >= MAX_PACKETS) break;
    }
});

toggleCaptureBtn.addEventListener('click', () => {
    if (toggleCaptureBtn.textContent === 'Capture Failed') return;
    
    isCapturing = !isCapturing;
    if (isCapturing) {
        toggleCaptureBtn.textContent = 'Capturing';
        toggleCaptureBtn.classList.add('active');
    } else {
        toggleCaptureBtn.textContent = 'Paused';
        toggleCaptureBtn.classList.remove('active');
    }
});

clearBtn.addEventListener('click', () => {
    tbody.innerHTML = '';
    allPackets = [];
    counts.total = 0; counts.tcp = 0; counts.udp = 0; counts.icmp = 0;
    countElements.total.textContent = '0';
    countElements.tcp.textContent = '0';
    countElements.udp.textContent = '0';
    countElements.icmp.textContent = '0';
});
