class LotteryAPI {
    constructor() {
        // Using CORS proxy for API calls from GitHub Pages
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        this.apiEndpoints = {
            // Thai lottery APIs (these are example endpoints - replace with actual working APIs)
            latest: 'https://www.glo.or.th/api/lottery/getLatestResult',
            history: 'https://www.glo.or.th/api/lottery/getHistory',
            // Alternative API endpoints
            sanook: 'https://www.sanook.com/lotto/check/',
            thairath: 'https://www.thairath.co.th/lottery/api'
        };
        this.cachedData = this.loadFromCache();
    }

    async fetchLatestResult() {
        try {
            showLoading('กำลังดึงข้อมูลผลหวยล่าสุด...');
            
            // Try to fetch from multiple sources
            let data = await this.fetchFromPrimaryAPI();
            
            if (!data) {
                data = await this.fetchFromBackupAPI();
            }
            
            if (!data) {
                // Use cached data if API fails
                data = this.getLatestFromCache();
            }
            
            hideLoading();
            return data;
        } catch (error) {
            console.error('Error fetching latest result:', error);
            hideLoading();
            showError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่');
            return null;
        }
    }

    async fetchFromPrimaryAPI() {
        // Simulated API response format
        // In production, replace with actual API call
        try {
            // Example of actual API call (commented out)
            // const response = await fetch(this.corsProxy + encodeURIComponent(this.apiEndpoints.latest));
            // const data = await response.json();
            
            // Simulated response
            const today = new Date();
            const mockData = {
                date: today.toISOString().split('T')[0],
                drawDate: this.formatThaiDate(today),
                period: this.getPeriod(today),
                results: {
                    firstPrize: this.generateRandomNumber(6),
                    threedigitPrefix: [this.generateRandomNumber(3), this.generateRandomNumber(3)],
                    threedigitSuffix: [this.generateRandomNumber(3), this.generateRandomNumber(3)],
                    twodigit: this.generateRandomNumber(2),
                    nearbyFirst: {
                        upper: [
                            (parseInt(this.lastFirstPrize) + 1).toString().padStart(6, '0'),
                            (parseInt(this.lastFirstPrize) + 2).toString().padStart(6, '0')
                        ],
                        lower: [
                            (parseInt(this.lastFirstPrize) - 1).toString().padStart(6, '0'),
                            (parseInt(this.lastFirstPrize) - 2).toString().padStart(6, '0')
                        ]
                    },
                    secondPrize: Array(5).fill(null).map(() => this.generateRandomNumber(6)),
                    thirdPrize: Array(10).fill(null).map(() => this.generateRandomNumber(6)),
                    fourthPrize: Array(50).fill(null).map(() => this.generateRandomNumber(6)),
                    fifthPrize: Array(100).fill(null).map(() => this.generateRandomNumber(6))
                }
            };
            
            this.lastFirstPrize = mockData.results.firstPrize;
            return mockData;
        } catch (error) {
            console.error('Primary API error:', error);
            return null;
        }
    }

    async fetchFromBackupAPI() {
        // Backup API implementation
        // This would scrape data from a lottery website
        try {
            // In production, implement web scraping or use a backup API
            return null;
        } catch (error) {
            console.error('Backup API error:', error);
            return null;
        }
    }

    async fetchHistoricalData(startDate, endDate) {
        try {
            showLoading('กำลังดึงข้อมูลย้อนหลัง...');
            
            // Generate historical data for demo
            const historicalData = this.generateHistoricalData(startDate, endDate);
            
            // Save to cache
            this.saveToCache(historicalData);
            
            hideLoading();
            return historicalData;
        } catch (error) {
            console.error('Error fetching historical data:', error);
            hideLoading();
            showError('ไม่สามารถดึงข้อมูลย้อนหลังได้');
            return [];
        }
    }

    generateHistoricalData(startDate, endDate) {
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Generate data for 1st and 16th of each month
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getDate() === 1 || d.getDate() === 16) {
                data.push({
                    date: d.toISOString().split('T')[0],
                    first_prize: this.generateRandomNumber(6),
                    '3digit_prefix': `${this.generateRandomNumber(3)} ${this.generateRandomNumber(3)}`,
                    '3digit_suffix': `${this.generateRandomNumber(3)} ${this.generateRandomNumber(3)}`,
                    '2digit': this.generateRandomNumber(2)
                });
            }
        }
        
        return data.reverse(); // Most recent first
    }

    async searchByNumber(number) {
        try {
            showLoading(`กำลังค้นหาเลข ${number}...`);
            
            // Search in cached data
            const results = this.cachedData.filter(item => {
                const searchStr = number.toString();
                return item.first_prize.includes(searchStr) ||
                       item['3digit_prefix'].includes(searchStr) ||
                       item['3digit_suffix'].includes(searchStr) ||
                       item['2digit'].includes(searchStr);
            });
            
            hideLoading();
            return results;
        } catch (error) {
            console.error('Error searching number:', error);
            hideLoading();
            return [];
        }
    }

    async checkWinning(numbers, drawDate) {
        try {
            showLoading('กำลังตรวจสอบผลรางวัล...');
            
            // Find the draw data
            const drawData = this.cachedData.find(item => item.date === drawDate);
            
            if (!drawData) {
                hideLoading();
                showError('ไม่พบข้อมูลการออกรางวัลในวันที่เลือก');
                return null;
            }
            
            const results = {
                date: drawDate,
                checks: []
            };
            
            numbers.forEach(num => {
                const numStr = num.toString();
                let prize = null;
                let amount = 0;
                
                // Check first prize
                if (drawData.first_prize === numStr && numStr.length === 6) {
                    prize = 'รางวัลที่ 1';
                    amount = 6000000;
                }
                // Check 3-digit prefix
                else if (drawData['3digit_prefix'].includes(numStr) && numStr.length === 3) {
                    prize = 'เลขหน้า 3 ตัว';
                    amount = 4000;
                }
                // Check 3-digit suffix
                else if (drawData['3digit_suffix'].includes(numStr) && numStr.length === 3) {
                    prize = 'เลขท้าย 3 ตัว';
                    amount = 4000;
                }
                // Check 2-digit
                else if (drawData['2digit'] === numStr && numStr.length === 2) {
                    prize = 'เลขท้าย 2 ตัว';
                    amount = 2000;
                }
                
                results.checks.push({
                    number: numStr,
                    prize: prize,
                    amount: amount,
                    isWinner: prize !== null
                });
            });
            
            hideLoading();
            return results;
        } catch (error) {
            console.error('Error checking winning:', error);
            hideLoading();
            showError('เกิดข้อผิดพลาดในการตรวจสอบ');
            return null;
        }
    }

    // Helper methods
    generateRandomNumber(digits) {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    formatThaiDate(date) {
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
            'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
            'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // Buddhist year
        
        return `${day} ${month} ${year}`;
    }

    getPeriod(date) {
        const day = date.getDate();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        if (day <= 15) {
            return `งวดวันที่ 1 ${month} ${year}`;
        } else {
            return `งวดวันที่ 16 ${month} ${year}`;
        }
    }

    // Cache management
    saveToCache(data) {
        try {
            const existing = this.loadFromCache();
            const merged = this.mergeData(existing, data);
            localStorage.setItem('lotteryData', JSON.stringify(merged));
            localStorage.setItem('lastUpdate', new Date().toISOString());
            this.cachedData = merged;
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem('lotteryData');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Error loading from cache:', error);
            return [];
        }
    }

    mergeData(existing, newData) {
        const merged = [...existing];
        
        newData.forEach(item => {
            const index = merged.findIndex(e => e.date === item.date);
            if (index === -1) {
                merged.push(item);
            } else {
                merged[index] = item; // Update existing
            }
        });
        
        return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getLatestFromCache() {
        if (this.cachedData && this.cachedData.length > 0) {
            return this.cachedData[0];
        }
        return null;
    }

    clearCache() {
        localStorage.removeItem('lotteryData');
        localStorage.removeItem('lastUpdate');
        this.cachedData = [];
    }

    getCacheInfo() {
        const lastUpdate = localStorage.getItem('lastUpdate');
        return {
            count: this.cachedData.length,
            lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
            size: JSON.stringify(this.cachedData).length
        };
    }
}

// Loading and error UI helpers
function showLoading(message = 'กำลังโหลด...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'apiLoading';
    loadingDiv.className = 'api-loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('apiLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error';
    errorDiv.innerHTML = `
        <p>❌ ${message}</p>
        <button onclick="this.parentElement.remove()">ปิด</button>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'api-success';
    successDiv.innerHTML = `
        <p>✅ ${message}</p>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Initialize API
const lotteryAPI = new LotteryAPI();