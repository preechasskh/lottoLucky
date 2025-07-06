class LotteryAnalysis {
    constructor() {
        this.data = [];
        this.processedData = null;
    }

    parseCSVData(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }

        this.data = data;
        return data;
    }

    analyzeDigitFrequency() {
        const digitFreq = Array(10).fill(0);
        const positionFreq = Array(6).fill(null).map(() => Array(10).fill(0));

        this.data.forEach(row => {
            const firstPrize = row['first_prize'] || row['รางวัลที่1'] || '';
            if (firstPrize && firstPrize.length === 6) {
                for (let i = 0; i < 6; i++) {
                    const digit = parseInt(firstPrize[i]);
                    if (!isNaN(digit)) {
                        digitFreq[digit]++;
                        positionFreq[i][digit]++;
                    }
                }
            }
        });

        return { digitFreq, positionFreq };
    }

    analyze2DigitPatterns() {
        const twoDigitFreq = {};
        
        this.data.forEach(row => {
            const twoDigit = row['2digit'] || row['เลขท้าย2ตัว'] || '';
            if (twoDigit) {
                twoDigitFreq[twoDigit] = (twoDigitFreq[twoDigit] || 0) + 1;
            }
        });

        const sortedPatterns = Object.entries(twoDigitFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        return sortedPatterns;
    }

    analyze3DigitPatterns() {
        const threeDigitFreq = {};
        
        this.data.forEach(row => {
            const prefix = row['3digit_prefix'] || row['เลขหน้า3ตัว'] || '';
            const suffix = row['3digit_suffix'] || row['เลขท้าย3ตัว'] || '';
            
            if (prefix) {
                const prefixes = prefix.split(/[,\s]+/);
                prefixes.forEach(p => {
                    if (p) threeDigitFreq[p] = (threeDigitFreq[p] || 0) + 1;
                });
            }
            
            if (suffix) {
                const suffixes = suffix.split(/[,\s]+/);
                suffixes.forEach(s => {
                    if (s) threeDigitFreq[s] = (threeDigitFreq[s] || 0) + 1;
                });
            }
        });

        const sortedPatterns = Object.entries(threeDigitFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        return sortedPatterns;
    }

    analyzePatterns() {
        const patterns = {
            consecutive: 0,
            repeated: 0,
            sumPatterns: {},
            lastDigitOddEven: { odd: 0, even: 0 }
        };

        this.data.forEach(row => {
            const firstPrize = row['first_prize'] || row['รางวัลที่1'] || '';
            if (firstPrize && firstPrize.length === 6) {
                // Check consecutive digits
                for (let i = 0; i < 5; i++) {
                    if (parseInt(firstPrize[i]) + 1 === parseInt(firstPrize[i + 1])) {
                        patterns.consecutive++;
                        break;
                    }
                }

                // Check repeated digits
                const digits = firstPrize.split('');
                const uniqueDigits = new Set(digits);
                if (uniqueDigits.size < digits.length) {
                    patterns.repeated++;
                }

                // Sum of digits
                const sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
                patterns.sumPatterns[sum] = (patterns.sumPatterns[sum] || 0) + 1;

                // Last digit odd/even
                const lastDigit = parseInt(firstPrize[5]);
                if (lastDigit % 2 === 0) {
                    patterns.lastDigitOddEven.even++;
                } else {
                    patterns.lastDigitOddEven.odd++;
                }
            }
        });

        return patterns;
    }

    getTimeBasedAnalysis() {
        const monthlyFreq = {};
        const dayOfWeekFreq = {};
        
        this.data.forEach(row => {
            const dateStr = row['date'] || row['วันที่'] || '';
            if (dateStr) {
                const date = new Date(dateStr);
                if (!isNaN(date)) {
                    const month = date.getMonth();
                    const dayOfWeek = date.getDay();
                    
                    monthlyFreq[month] = (monthlyFreq[month] || 0) + 1;
                    dayOfWeekFreq[dayOfWeek] = (dayOfWeekFreq[dayOfWeek] || 0) + 1;
                }
            }
        });

        return { monthlyFreq, dayOfWeekFreq };
    }

    getHotColdNumbers() {
        const { digitFreq } = this.analyzeDigitFrequency();
        const avgFreq = digitFreq.reduce((a, b) => a + b, 0) / digitFreq.length;
        
        const hot = [];
        const cold = [];
        
        digitFreq.forEach((freq, digit) => {
            if (freq > avgFreq * 1.2) {
                hot.push({ digit, frequency: freq });
            } else if (freq < avgFreq * 0.8) {
                cold.push({ digit, frequency: freq });
            }
        });

        return { hot, cold, avgFreq };
    }

    generateAnalysisReport() {
        const digitAnalysis = this.analyzeDigitFrequency();
        const twoDigit = this.analyze2DigitPatterns();
        const threeDigit = this.analyze3DigitPatterns();
        const patterns = this.analyzePatterns();
        const timeAnalysis = this.getTimeBasedAnalysis();
        const hotCold = this.getHotColdNumbers();

        return {
            totalRecords: this.data.length,
            digitFrequency: digitAnalysis,
            top2Digits: twoDigit,
            top3Digits: threeDigit,
            patterns,
            timeBasedAnalysis: timeAnalysis,
            hotColdNumbers: hotCold
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LotteryAnalysis;
}