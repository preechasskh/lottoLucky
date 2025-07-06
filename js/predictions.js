class LotteryPredictor {
    constructor(analysisReport) {
        this.report = analysisReport;
        this.initializePredictions();
    }

    initializePredictions() {
        const generateBtn = document.getElementById('generatePredictions');
        generateBtn.addEventListener('click', () => {
            this.generateAllPredictions();
        });
    }

    generateAllPredictions() {
        const predictions = {
            firstPrize: this.predictFirstPrize(),
            threeDigit: this.predictThreeDigit(),
            twoDigit: this.predictTwoDigit()
        };

        this.displayPredictions(predictions);
    }

    predictFirstPrize() {
        const predictions = [];
        const { positionFreq } = this.report.digitFrequency;
        const patterns = this.report.patterns;
        
        // Method 1: Position-based frequency
        for (let i = 0; i < 5; i++) {
            let sixDigit = '';
            for (let pos = 0; pos < 6; pos++) {
                const topDigits = this.getTopDigitsForPosition(positionFreq[pos]);
                sixDigit += topDigits[i % topDigits.length];
            }
            predictions.push(sixDigit);
        }

        // Method 2: Pattern-based generation
        const hotNumbers = this.report.hotColdNumbers.hot.map(h => h.digit);
        const coldNumbers = this.report.hotColdNumbers.cold.map(h => h.digit);
        
        // Mix hot and cold numbers
        for (let i = 0; i < 3; i++) {
            let sixDigit = '';
            for (let j = 0; j < 6; j++) {
                if (j % 2 === 0 && hotNumbers.length > 0) {
                    sixDigit += hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
                } else if (coldNumbers.length > 0) {
                    sixDigit += coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
                } else {
                    sixDigit += Math.floor(Math.random() * 10);
                }
            }
            predictions.push(sixDigit);
        }

        // Method 3: Statistical patterns
        const lastDigitTrend = patterns.lastDigitOddEven.odd > patterns.lastDigitOddEven.even;
        for (let i = 0; i < 2; i++) {
            let sixDigit = this.generateByPattern(lastDigitTrend, patterns);
            predictions.push(sixDigit);
        }

        return [...new Set(predictions)].slice(0, 10);
    }

    predictThreeDigit() {
        const predictions = [];
        const top3Digits = this.report.top3Digits;
        
        // Add top historical 3-digit numbers
        top3Digits.slice(0, 5).forEach(d => predictions.push(d[0]));
        
        // Generate based on hot numbers
        const hotNumbers = this.report.hotColdNumbers.hot.map(h => h.digit);
        for (let i = 0; i < 5; i++) {
            let threeDigit = '';
            for (let j = 0; j < 3; j++) {
                if (hotNumbers.length > 0) {
                    threeDigit += hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
                } else {
                    threeDigit += Math.floor(Math.random() * 10);
                }
            }
            predictions.push(threeDigit.padStart(3, '0'));
        }
        
        // Add sequence patterns
        predictions.push('123', '456', '789', '111', '222');
        
        return [...new Set(predictions)].slice(0, 10);
    }

    predictTwoDigit() {
        const predictions = [];
        const top2Digits = this.report.top2Digits;
        
        // Add top historical 2-digit numbers
        top2Digits.slice(0, 5).forEach(d => predictions.push(d[0]));
        
        // Generate mirror numbers
        for (let i = 0; i < 10; i++) {
            predictions.push(`${i}${i}`);
        }
        
        // Generate based on hot numbers
        const hotNumbers = this.report.hotColdNumbers.hot.map(h => h.digit);
        for (let i = 0; i < hotNumbers.length && predictions.length < 20; i++) {
            for (let j = 0; j < hotNumbers.length && predictions.length < 20; j++) {
                predictions.push(`${hotNumbers[i]}${hotNumbers[j]}`);
            }
        }
        
        return [...new Set(predictions)].slice(0, 15);
    }

    getTopDigitsForPosition(positionFreq) {
        const sorted = positionFreq
            .map((freq, digit) => ({ digit, freq }))
            .sort((a, b) => b.freq - a.freq)
            .slice(0, 5);
        return sorted.map(item => item.digit);
    }

    generateByPattern(preferOdd, patterns) {
        let sixDigit = '';
        const hotNumbers = this.report.hotColdNumbers.hot.map(h => h.digit);
        
        for (let i = 0; i < 5; i++) {
            if (hotNumbers.length > 0) {
                sixDigit += hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
            } else {
                sixDigit += Math.floor(Math.random() * 10);
            }
        }
        
        // Last digit based on odd/even trend
        if (preferOdd) {
            sixDigit += [1, 3, 5, 7, 9][Math.floor(Math.random() * 5)];
        } else {
            sixDigit += [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];
        }
        
        return sixDigit;
    }

    displayPredictions(predictions) {
        // Display first prize predictions
        const firstPrizeDiv = document.getElementById('firstPrizePredictions');
        firstPrizeDiv.innerHTML = predictions.firstPrize.map(num => 
            `<div class="prediction-number large">${num}</div>`
        ).join('');

        // Display 3-digit predictions
        const threeDigitDiv = document.getElementById('threedigitPredictions');
        threeDigitDiv.innerHTML = predictions.threeDigit.map(num => 
            `<div class="prediction-number medium">${num}</div>`
        ).join('');

        // Display 2-digit predictions
        const twoDigitDiv = document.getElementById('twodigitPredictions');
        twoDigitDiv.innerHTML = predictions.twoDigit.map(num => 
            `<div class="prediction-number small">${num}</div>`
        ).join('');
    }
}

// Initialize predictor when data is loaded
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generatePredictions');
    generateBtn.addEventListener('click', () => {
        if (lotteryData.length > 0) {
            const report = lotteryAnalysis.generateAnalysisReport();
            const predictor = new LotteryPredictor(report);
            predictor.generateAllPredictions();
        } else {
            alert('กรุณาอัปโหลดข้อมูลหวยก่อนทำการทำนาย');
        }
    });
});