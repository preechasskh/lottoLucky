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
        const advanced = this.getAdvancedStatistics();

        return {
            totalRecords: this.data.length,
            digitFrequency: digitAnalysis,
            top2Digits: twoDigit,
            top3Digits: threeDigit,
            patterns,
            timeBasedAnalysis: timeAnalysis,
            hotColdNumbers: hotCold,
            advancedStats: advanced
        };
    }

    getAdvancedStatistics() {
        const stats = {
            digitPairFrequency: {},
            digitTransitions: {},
            sumDistribution: {},
            gapAnalysis: {},
            cycleAnalysis: {},
            correlation: {}
        };

        // Analyze digit pairs
        this.data.forEach(row => {
            const firstPrize = row['first_prize'] || row['รางวัลที่1'] || '';
            if (firstPrize && firstPrize.length === 6) {
                // Digit pair frequency
                for (let i = 0; i < 5; i++) {
                    const pair = firstPrize.substr(i, 2);
                    stats.digitPairFrequency[pair] = (stats.digitPairFrequency[pair] || 0) + 1;
                }

                // Sum distribution
                const sum = firstPrize.split('').reduce((acc, d) => acc + parseInt(d), 0);
                stats.sumDistribution[sum] = (stats.sumDistribution[sum] || 0) + 1;
            }
        });

        // Analyze gaps between same numbers
        const numberOccurrences = {};
        this.data.forEach((row, index) => {
            const firstPrize = row['first_prize'] || row['รางวัลที่1'] || '';
            if (firstPrize) {
                if (!numberOccurrences[firstPrize]) {
                    numberOccurrences[firstPrize] = [];
                }
                numberOccurrences[firstPrize].push(index);
            }
        });

        // Calculate average gaps
        Object.entries(numberOccurrences).forEach(([num, indices]) => {
            if (indices.length > 1) {
                const gaps = [];
                for (let i = 1; i < indices.length; i++) {
                    gaps.push(indices[i] - indices[i-1]);
                }
                const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
                stats.gapAnalysis[num] = {
                    occurrences: indices.length,
                    averageGap: avgGap.toFixed(2),
                    lastSeen: this.data.length - indices[indices.length - 1]
                };
            }
        });

        // Digit transition analysis
        this.data.forEach((row, index) => {
            if (index > 0) {
                const current = row['first_prize'] || row['รางวัลที่1'] || '';
                const previous = this.data[index-1]['first_prize'] || this.data[index-1]['รางวัลที่1'] || '';
                
                if (current && previous && current.length === 6 && previous.length === 6) {
                    for (let i = 0; i < 6; i++) {
                        const transition = `${previous[i]}->${current[i]}`;
                        stats.digitTransitions[transition] = (stats.digitTransitions[transition] || 0) + 1;
                    }
                }
            }
        });

        return stats;
    }

    calculateStandardDeviation(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
        return Math.sqrt(variance);
    }

    getPredictiveMetrics() {
        const metrics = {
            nextLikelyDigits: [],
            cyclePrediction: {},
            trendDirection: {},
            confidenceScore: 0
        };

        // Calculate trend for each digit position
        const { positionFreq } = this.analyzeDigitFrequency();
        positionFreq.forEach((freqs, position) => {
            const recentTrend = this.calculateRecentTrend(position);
            metrics.trendDirection[position] = recentTrend;
            
            // Predict next likely digits based on trend
            const prediction = this.predictNextDigit(freqs, recentTrend);
            metrics.nextLikelyDigits.push(prediction);
        });

        // Calculate confidence based on data consistency
        metrics.confidenceScore = this.calculateConfidence();

        return metrics;
    }

    calculateRecentTrend(position) {
        // Analyze last 20 draws for trend
        const recentData = this.data.slice(0, Math.min(20, this.data.length));
        const digitCounts = Array(10).fill(0);
        
        recentData.forEach(row => {
            const firstPrize = row['first_prize'] || row['รางวัลที่1'] || '';
            if (firstPrize && firstPrize.length === 6) {
                const digit = parseInt(firstPrize[position]);
                if (!isNaN(digit)) {
                    digitCounts[digit]++;
                }
            }
        });

        return digitCounts;
    }

    predictNextDigit(overallFreq, recentTrend) {
        // Combine overall frequency with recent trend
        const combined = overallFreq.map((freq, digit) => {
            const recentWeight = 0.6;
            const overallWeight = 0.4;
            return (recentTrend[digit] * recentWeight + freq * overallWeight);
        });

        // Find top 3 likely digits
        const indexed = combined.map((score, digit) => ({ digit, score }));
        indexed.sort((a, b) => b.score - a.score);
        
        return indexed.slice(0, 3).map(item => item.digit);
    }

    calculateConfidence() {
        // Calculate based on data consistency and patterns
        if (this.data.length < 10) return 0.2;
        if (this.data.length < 50) return 0.5;
        if (this.data.length < 100) return 0.7;
        return 0.85;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LotteryAnalysis;
}