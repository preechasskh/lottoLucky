class LotteryPredictor {
    constructor(analysisReport) {
        this.report = analysisReport;
        this.initializePredictions();
        this.initializeAdvancedTools();
    }

    initializePredictions() {
        const generateBtn = document.getElementById('generatePredictions');
        generateBtn.addEventListener('click', () => {
            this.generateAllPredictions();
        });
    }

    initializeAdvancedTools() {
        const dreamBookBtn = document.getElementById('dreamBookBtn');
        const numerologyBtn = document.getElementById('numerologyBtn');
        const savePredictionBtn = document.getElementById('savePredictionBtn');

        if (dreamBookBtn) {
            dreamBookBtn.addEventListener('click', () => {
                this.showDreamBook();
            });
        }

        if (numerologyBtn) {
            numerologyBtn.addEventListener('click', () => {
                this.showNumerology();
            });
        }

        if (savePredictionBtn) {
            savePredictionBtn.addEventListener('click', () => {
                this.savePredictions();
            });
        }
    }

    generateAllPredictions() {
        const predictions = {
            firstPrize: this.predictFirstPrize(),
            threeDigit: this.predictThreeDigit(),
            twoDigit: this.predictTwoDigit(),
            advanced: this.advancedPrediction()
        };

        this.currentPredictions = predictions;
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

    advancedPrediction() {
        const advanced = {
            markovChain: this.markovChainPrediction(),
            neuralNetwork: this.neuralNetworkPrediction(),
            fibonacci: this.fibonacciPrediction(),
            primeNumbers: this.primePrediction()
        };
        return advanced;
    }

    markovChainPrediction() {
        // Markov chain based on digit transitions
        const transitions = this.report.advancedStats?.digitTransitions || {};
        const predictions = [];
        
        // Find most likely transitions
        const sortedTransitions = Object.entries(transitions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        
        let prediction = '';
        sortedTransitions.forEach(([transition]) => {
            const digit = transition.split('->')[1];
            prediction += digit;
        });
        
        if (prediction.length === 6) {
            predictions.push(prediction);
        }
        
        // Generate variations
        for (let i = 0; i < 4; i++) {
            predictions.push(this.generateByPattern(false, this.report.patterns));
        }
        
        return predictions.slice(0, 5);
    }

    neuralNetworkPrediction() {
        // Simplified neural network simulation
        const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
        const predictions = [];
        
        for (let i = 0; i < 5; i++) {
            let prediction = '';
            for (let pos = 0; pos < 6; pos++) {
                const posFreq = this.report.digitFrequency.positionFreq[pos];
                const weightedScores = posFreq.map((freq, digit) => ({
                    digit,
                    score: freq * weights[Math.floor(Math.random() * weights.length)]
                }));
                
                weightedScores.sort((a, b) => b.score - a.score);
                prediction += weightedScores[i % 3].digit;
            }
            predictions.push(prediction);
        }
        
        return predictions;
    }

    fibonacciPrediction() {
        // Generate predictions based on Fibonacci sequence
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const predictions = [];
        
        for (let i = 0; i < 3; i++) {
            let prediction = '';
            for (let j = 0; j < 6; j++) {
                prediction += fib[(i + j) % fib.length] % 10;
            }
            predictions.push(prediction);
        }
        
        return predictions;
    }

    primePrediction() {
        // Use prime numbers pattern
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const predictions = [];
        
        for (let i = 0; i < 3; i++) {
            let prediction = '';
            for (let j = 0; j < 6; j++) {
                prediction += primes[(i * 2 + j) % primes.length] % 10;
            }
            predictions.push(prediction);
        }
        
        return predictions;
    }

    showDreamBook() {
        const modal = this.createModal('ตำราฝัน - แปลความหมายเป็นตัวเลข', `
            <div class="dream-book">
                <h4>พิมพ์คำที่ฝันเห็น:</h4>
                <input type="text" id="dreamInput" placeholder="เช่น งู, น้ำ, ทอง..." />
                <button id="interpretDream" class="btn-primary">แปลความหมาย</button>
                <div id="dreamResult"></div>
                
                <h4>ตัวอย่างการแปลฝัน:</h4>
                <ul class="dream-examples">
                    <li>งู = 01, 21, 41</li>
                    <li>น้ำ = 02, 22, 42</li>
                    <li>ทอง = 16, 61, 86</li>
                    <li>ไฟ = 07, 27, 47</li>
                    <li>ต้นไม้ = 08, 38, 88</li>
                    <li>รถ = 04, 24, 84</li>
                    <li>บ้าน = 03, 33, 83</li>
                    <li>เงิน = 15, 51, 95</li>
                </ul>
            </div>
        `);

        document.getElementById('interpretDream').addEventListener('click', () => {
            const dream = document.getElementById('dreamInput').value;
            const result = this.interpretDream(dream);
            document.getElementById('dreamResult').innerHTML = result;
        });
    }

    interpretDream(dream) {
        const dreamDict = {
            'งู': ['01', '21', '41', '61', '81'],
            'น้ำ': ['02', '22', '42', '62', '82'],
            'ทอง': ['16', '61', '86', '96', '56'],
            'ไฟ': ['07', '27', '47', '67', '87'],
            'ต้นไม้': ['08', '38', '88', '58', '98'],
            'รถ': ['04', '24', '84', '64', '94'],
            'บ้าน': ['03', '33', '83', '63', '93'],
            'เงิน': ['15', '51', '95', '75', '35'],
            'คน': ['09', '29', '49', '69', '89'],
            'สัตว์': ['10', '30', '50', '70', '90']
        };

        let numbers = [];
        for (let key in dreamDict) {
            if (dream.includes(key)) {
                numbers.push(...dreamDict[key]);
            }
        }

        if (numbers.length === 0) {
            // Generate based on text hash
            let hash = 0;
            for (let i = 0; i < dream.length; i++) {
                hash = ((hash << 5) - hash) + dream.charCodeAt(i);
                hash = hash & hash;
            }
            numbers = [
                Math.abs(hash % 100).toString().padStart(2, '0'),
                Math.abs((hash * 7) % 100).toString().padStart(2, '0'),
                Math.abs((hash * 13) % 100).toString().padStart(2, '0')
            ];
        }

        return `
            <div class="dream-interpretation">
                <h5>ตัวเลขจากความฝัน "${dream}":</h5>
                <div class="dream-numbers">
                    ${numbers.slice(0, 5).map(n => `<span class="dream-number">${n}</span>`).join('')}
                </div>
            </div>
        `;
    }

    showNumerology() {
        const modal = this.createModal('เลขศาสตร์ - คำนวณเลขมงคล', `
            <div class="numerology">
                <h4>กรอกข้อมูลส่วนตัว:</h4>
                <input type="text" id="numName" placeholder="ชื่อ-นามสกุล" />
                <input type="date" id="numDate" />
                <button id="calculateNum" class="btn-primary">คำนวณ</button>
                <div id="numResult"></div>
                
                <h4>หลักเลขศาสตร์:</h4>
                <ul>
                    <li>เลขชีวิต (Life Path) - จากวันเกิด</li>
                    <li>เลขจิตวิญญาณ (Soul Number) - จากสระในชื่อ</li>
                    <li>เลขบุคลิก (Personality) - จากพยัญชนะ</li>
                    <li>เลขพลังชื่อ (Name Number) - จากชื่อเต็ม</li>
                </ul>
            </div>
        `);

        document.getElementById('calculateNum').addEventListener('click', () => {
            const name = document.getElementById('numName').value;
            const date = document.getElementById('numDate').value;
            if (name && date) {
                const result = this.calculateNumerology(name, new Date(date));
                document.getElementById('numResult').innerHTML = result;
            }
        });
    }

    calculateNumerology(name, birthDate) {
        // Life Path Number
        const day = birthDate.getDate();
        const month = birthDate.getMonth() + 1;
        const year = birthDate.getFullYear();
        let lifePath = this.reduceToSingleDigit(day + month + year);

        // Name Number
        let nameValue = 0;
        const cleanName = name.replace(/\s+/g, '').toLowerCase();
        for (let char of cleanName) {
            nameValue += char.charCodeAt(0) % 9 || 9;
        }
        const nameNumber = this.reduceToSingleDigit(nameValue);

        // Generate lucky numbers
        const luckyNumbers = [
            lifePath.toString().padStart(2, '0'),
            nameNumber.toString().padStart(2, '0'),
            (lifePath * 11).toString().slice(-2),
            (nameNumber * 11).toString().slice(-2),
            ((lifePath + nameNumber) * 7).toString().slice(-2)
        ];

        return `
            <div class="numerology-result">
                <h5>ผลการคำนวณเลขศาสตร์:</h5>
                <p>เลขชีวิต: ${lifePath}</p>
                <p>เลขพลังชื่อ: ${nameNumber}</p>
                <h5>เลขนำโชค:</h5>
                <div class="lucky-numbers">
                    ${luckyNumbers.map(n => `<span class="num-lucky">${n}</span>`).join('')}
                </div>
            </div>
        `;
    }

    reduceToSingleDigit(num) {
        while (num > 9 && num !== 11 && num !== 22) {
            num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }

    savePredictions() {
        if (!this.currentPredictions) {
            showError('กรุณาสร้างการทำนายก่อน');
            return;
        }

        const saved = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
        const newSave = {
            id: Date.now(),
            date: new Date().toISOString(),
            predictions: this.currentPredictions,
            confidence: this.calculateConfidence()
        };

        saved.unshift(newSave);
        if (saved.length > 10) saved.pop(); // Keep only last 10

        localStorage.setItem('savedPredictions', JSON.stringify(saved));
        showSuccess('บันทึกการทำนายสำเร็จ!');
        this.showSavedPredictions();
    }

    showSavedPredictions() {
        const saved = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
        const modal = this.createModal('การทำนายที่บันทึกไว้', `
            <div class="saved-predictions">
                ${saved.map(item => `
                    <div class="saved-item">
                        <h5>${new Date(item.date).toLocaleString('th-TH')}</h5>
                        <p>ความมั่นใจ: ${(item.confidence * 100).toFixed(0)}%</p>
                        <div class="saved-numbers">
                            ${item.predictions.firstPrize.slice(0, 3).map(n => 
                                `<span class="saved-number">${n}</span>`
                            ).join('')}
                        </div>
                    </div>
                `).join('')}
                ${saved.length === 0 ? '<p>ยังไม่มีการทำนายที่บันทึกไว้</p>' : ''}
            </div>
        `);
    }

    calculateConfidence() {
        if (!lotteryAnalysis.data || lotteryAnalysis.data.length < 10) return 0.3;
        if (lotteryAnalysis.data.length < 50) return 0.5;
        if (lotteryAnalysis.data.length < 100) return 0.7;
        return 0.85;
    }

    createModal(title, content) {
        const existing = document.getElementById('predictionModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'predictionModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
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

        // Show confidence score
        const confidence = this.calculateConfidence();
        const confidenceHtml = `
            <div class="confidence-meter">
                <h4>ความแม่นยำโดยประมาณ</h4>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
                </div>
                <p>${(confidence * 100).toFixed(0)}% (จากข้อมูล ${lotteryData.length} งวด)</p>
            </div>
        `;
        
        const predictionResults = document.getElementById('predictionResults');
        if (!predictionResults.querySelector('.confidence-meter')) {
            predictionResults.insertAdjacentHTML('beforeend', confidenceHtml);
        }
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