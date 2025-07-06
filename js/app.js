let lotteryAnalysis = new LotteryAnalysis();
let lotteryData = [];
let currentChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFileUpload();
    initializeStatistics();
    initializeHistory();
    loadSampleData();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            sections.forEach(section => section.classList.remove('active'));
            navLinks.forEach(l => l.classList.remove('active'));
            
            document.getElementById(targetId).classList.add('active');
            link.classList.add('active');
        });
    });
}

function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');

    uploadBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.innerHTML = '<p class="error">กรุณาเลือกไฟล์ CSV</p>';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                lotteryData = lotteryAnalysis.parseCSVData(csvData);
                uploadStatus.innerHTML = `<p class="success">อัปโหลดสำเร็จ! พบข้อมูล ${lotteryData.length} รายการ</p>`;
                
                updateHistoryTable();
                updateStatistics();
                
            } catch (error) {
                uploadStatus.innerHTML = '<p class="error">เกิดข้อผิดพลาดในการอ่านไฟล์</p>';
            }
        };
        reader.readAsText(file);
    });
}

function initializeStatistics() {
    const statBtns = document.querySelectorAll('.stat-btn');
    
    statBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            updateChart(type);
        });
    });
}

function updateChart(type) {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const report = lotteryAnalysis.generateAnalysisReport();
    
    if (currentChart) {
        currentChart.destroy();
    }

    let chartData, chartOptions;

    switch(type) {
        case 'digit':
            chartData = {
                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                datasets: [{
                    label: 'ความถี่การออก',
                    data: report.digitFrequency.digitFreq,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ความถี่การออกของแต่ละตัวเลข'
                    }
                }
            };
            break;

        case '2digit':
            const top2Digits = report.top2Digits.slice(0, 10);
            chartData = {
                labels: top2Digits.map(d => d[0]),
                datasets: [{
                    label: 'ความถี่',
                    data: top2Digits.map(d => d[1]),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'เลข 2 ตัวที่ออกบ่อย'
                    }
                }
            };
            break;

        case '3digit':
            const top3Digits = report.top3Digits.slice(0, 10);
            chartData = {
                labels: top3Digits.map(d => d[0]),
                datasets: [{
                    label: 'ความถี่',
                    data: top3Digits.map(d => d[1]),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'เลข 3 ตัวที่ออกบ่อย'
                    }
                }
            };
            break;

        case 'pattern':
            chartData = {
                labels: ['เลขคู่', 'เลขคี่'],
                datasets: [{
                    label: 'จำนวนครั้ง',
                    data: [report.patterns.lastDigitOddEven.even, report.patterns.lastDigitOddEven.odd],
                    backgroundColor: ['rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)'],
                    borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                    borderWidth: 1
                }]
            };
            chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'รูปแบบเลขท้าย (คู่/คี่)'
                    }
                }
            };
            break;
    }

    currentChart = new Chart(ctx, {
        type: type === 'pattern' ? 'doughnut' : 'bar',
        data: chartData,
        options: chartOptions
    });

    updateStatsDetails(type, report);
}

function updateStatsDetails(type, report) {
    const detailsDiv = document.getElementById('statsDetails');
    let html = '';

    switch(type) {
        case 'digit':
            const hotCold = report.hotColdNumbers;
            html = `
                <div class="stat-detail">
                    <h4>เลขร้อน (ออกบ่อย)</h4>
                    <div class="number-list hot">
                        ${hotCold.hot.map(h => `<span class="number">${h.digit}</span>`).join('')}
                    </div>
                </div>
                <div class="stat-detail">
                    <h4>เลขเย็น (ออกน้อย)</h4>
                    <div class="number-list cold">
                        ${hotCold.cold.map(c => `<span class="number">${c.digit}</span>`).join('')}
                    </div>
                </div>
            `;
            break;

        case '2digit':
            html = `
                <div class="stat-detail">
                    <h4>อันดับเลข 2 ตัวที่ออกมากที่สุด</h4>
                    <ol class="top-list">
                        ${report.top2Digits.slice(0, 5).map(d => 
                            `<li>${d[0]} - ออก ${d[1]} ครั้ง</li>`
                        ).join('')}
                    </ol>
                </div>
            `;
            break;

        case '3digit':
            html = `
                <div class="stat-detail">
                    <h4>อันดับเลข 3 ตัวที่ออกมากที่สุด</h4>
                    <ol class="top-list">
                        ${report.top3Digits.slice(0, 5).map(d => 
                            `<li>${d[0]} - ออก ${d[1]} ครั้ง</li>`
                        ).join('')}
                    </ol>
                </div>
            `;
            break;

        case 'pattern':
            html = `
                <div class="stat-detail">
                    <h4>สถิติรูปแบบการออก</h4>
                    <ul class="pattern-list">
                        <li>มีเลขติดกัน: ${report.patterns.consecutive} ครั้ง</li>
                        <li>มีเลขซ้ำ: ${report.patterns.repeated} ครั้ง</li>
                        <li>เลขท้ายคู่: ${report.patterns.lastDigitOddEven.even} ครั้ง</li>
                        <li>เลขท้ายคี่: ${report.patterns.lastDigitOddEven.odd} ครั้ง</li>
                    </ul>
                </div>
            `;
            break;
    }

    detailsDiv.innerHTML = html;
}

function initializeHistory() {
    const searchBtn = document.getElementById('searchBtn');
    const monthFilter = document.getElementById('monthFilter');
    const numberSearch = document.getElementById('numberSearch');

    searchBtn.addEventListener('click', () => {
        filterHistory(monthFilter.value, numberSearch.value);
    });

    monthFilter.addEventListener('change', () => {
        filterHistory(monthFilter.value, numberSearch.value);
    });
}

function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';

    lotteryData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date || row['วันที่'] || ''}</td>
            <td class="highlight">${row.first_prize || row['รางวัลที่1'] || ''}</td>
            <td>${row['3digit_prefix'] || row['เลขหน้า3ตัว'] || ''}</td>
            <td>${row['3digit_suffix'] || row['เลขท้าย3ตัว'] || ''}</td>
            <td>${row['2digit'] || row['เลขท้าย2ตัว'] || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterHistory(month, searchNumber) {
    const tbody = document.getElementById('historyBody');
    const rows = tbody.getElementsByTagName('tr');

    for (let row of rows) {
        let show = true;
        const dateCell = row.cells[0].textContent;
        const allCells = Array.from(row.cells).map(cell => cell.textContent);

        if (month) {
            const rowDate = new Date(dateCell);
            const filterDate = new Date(month);
            if (rowDate.getMonth() !== filterDate.getMonth() || 
                rowDate.getFullYear() !== filterDate.getFullYear()) {
                show = false;
            }
        }

        if (searchNumber && show) {
            const found = allCells.some(cell => cell.includes(searchNumber));
            if (!found) {
                show = false;
            }
        }

        row.style.display = show ? '' : 'none';
    }
}

function updateStatistics() {
    if (lotteryData.length > 0) {
        updateChart('digit');
    }
}

function loadSampleData() {
    const sampleCSV = `date,first_prize,3digit_prefix,3digit_suffix,2digit
2024-12-16,123456,123 456,789 012,34
2024-12-01,234567,234 567,890 123,45
2024-11-16,345678,345 678,901 234,56
2024-11-01,456789,456 789,012 345,67
2024-10-16,567890,567 890,123 456,78
2024-10-01,678901,678 901,234 567,89
2024-09-16,789012,789 012,345 678,90
2024-09-01,890123,890 123,456 789,01
2024-08-16,901234,901 234,567 890,12
2024-08-01,012345,012 345,678 901,23`;

    lotteryData = lotteryAnalysis.parseCSVData(sampleCSV);
    updateHistoryTable();
    updateStatistics();
}