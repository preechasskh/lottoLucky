class LuckyNumberGenerator {
    constructor() {
        this.luckyForm = document.getElementById('luckyForm');
        this.luckyResults = document.getElementById('luckyResults');
        this.initialize();
    }

    initialize() {
        this.luckyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateLuckyNumbers();
        });
    }

    generateLuckyNumbers() {
        const fullName = document.getElementById('fullName').value;
        const birthDate = new Date(document.getElementById('birthDate').value);
        
        if (!fullName || isNaN(birthDate)) {
            this.luckyResults.innerHTML = '<p class="error">กรุณากรอกข้อมูลให้ครบถ้วน</p>';
            return;
        }

        const nameNumbers = this.calculateNameNumbers(fullName);
        const birthNumbers = this.calculateBirthNumbers(birthDate);
        const combinedNumbers = this.combineWithStatistics(nameNumbers, birthNumbers);
        
        this.displayResults(combinedNumbers, fullName, birthDate);
    }

    calculateNameNumbers(name) {
        const numbers = [];
        const cleanName = name.replace(/\s+/g, '').toLowerCase();
        
        // Calculate name value using Thai alphabet mapping
        const thaiAlphabet = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
        const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz';
        
        let nameValue = 0;
        for (let char of cleanName) {
            let value = 0;
            if (thaiAlphabet.includes(char)) {
                value = thaiAlphabet.indexOf(char) + 1;
            } else if (englishAlphabet.includes(char)) {
                value = englishAlphabet.indexOf(char) + 1;
            }
            nameValue += value;
        }
        
        // Generate numbers based on name value
        numbers.push(this.reduceToSingleDigit(nameValue));
        numbers.push(nameValue % 100); // 2-digit
        numbers.push(nameValue % 1000); // 3-digit
        
        // Create 6-digit number from name
        const nameDigits = nameValue.toString().padStart(6, '0').slice(-6);
        numbers.push(nameDigits);
        
        return numbers;
    }

    calculateBirthNumbers(birthDate) {
        const numbers = [];
        const day = birthDate.getDate();
        const month = birthDate.getMonth() + 1;
        const year = birthDate.getFullYear();
        const buddhistYear = year + 543; // Convert to Buddhist calendar
        
        // Life path number
        const lifePathSum = day + month + year;
        numbers.push(this.reduceToSingleDigit(lifePathSum));
        
        // Birth date combinations
        numbers.push(day * 10 + month); // Day + Month as 2-digit
        numbers.push(parseInt(`${day}${month}${year % 100}`)); // DMY as number
        
        // Special 6-digit from birth date
        const birthDigits = `${day.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${(buddhistYear % 100).toString().padStart(2, '0')}`;
        numbers.push(birthDigits);
        
        // Age-based lucky number
        const age = new Date().getFullYear() - year;
        numbers.push(age);
        
        return numbers;
    }

    reduceToSingleDigit(num) {
        while (num > 9) {
            num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }

    combineWithStatistics(nameNumbers, birthNumbers) {
        const report = lotteryAnalysis.generateAnalysisReport();
        const hotNumbers = report.hotColdNumbers.hot.map(h => h.digit);
        
        // Combine personal numbers with hot numbers
        const luckySet = {
            singleDigit: [],
            twoDigit: [],
            threeDigit: [],
            sixDigit: []
        };
        
        // Single digits
        luckySet.singleDigit.push(nameNumbers[0], birthNumbers[0]);
        hotNumbers.slice(0, 3).forEach(n => luckySet.singleDigit.push(n));
        
        // Two digits
        const personalTwo = [nameNumbers[1], birthNumbers[1], birthNumbers[4]];
        luckySet.twoDigit = personalTwo.map(n => n.toString().padStart(2, '0'));
        
        // Three digits
        const threeDigitBase = [nameNumbers[2], birthNumbers[2]];
        luckySet.threeDigit = threeDigitBase.map(n => n.toString().padStart(3, '0'));
        
        // Six digits
        luckySet.sixDigit.push(nameNumbers[3], birthNumbers[3]);
        
        // Add statistical predictions
        const topTwo = report.top2Digits.slice(0, 2).map(d => d[0]);
        const topThree = report.top3Digits.slice(0, 2).map(d => d[0]);
        
        luckySet.twoDigit.push(...topTwo);
        luckySet.threeDigit.push(...topThree);
        
        // Generate additional 6-digit numbers
        for (let i = 0; i < 3; i++) {
            const generated = this.generateSixDigit(luckySet.singleDigit, hotNumbers);
            luckySet.sixDigit.push(generated);
        }
        
        return luckySet;
    }

    generateSixDigit(singles, hotNumbers) {
        let sixDigit = '';
        const allNumbers = [...singles, ...hotNumbers];
        
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * allNumbers.length);
            sixDigit += allNumbers[randomIndex].toString();
        }
        
        return sixDigit;
    }

    displayResults(luckyNumbers, name, birthDate) {
        const birthDateStr = birthDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let html = `
            <div class="lucky-header">
                <h3>เลขมงคลสำหรับ ${name}</h3>
                <p>วันเกิด: ${birthDateStr}</p>
            </div>
            
            <div class="lucky-grid">
                <div class="lucky-section">
                    <h4>เลขศิริมงคล (1 หลัก)</h4>
                    <div class="number-display single">
                        ${[...new Set(luckyNumbers.singleDigit)].map(n => 
                            `<span class="lucky-number">${n}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="lucky-section">
                    <h4>เลขมงคล 2 ตัว</h4>
                    <div class="number-display two-digit">
                        ${[...new Set(luckyNumbers.twoDigit)].slice(0, 5).map(n => 
                            `<span class="lucky-number">${n}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="lucky-section">
                    <h4>เลขมงคล 3 ตัว</h4>
                    <div class="number-display three-digit">
                        ${[...new Set(luckyNumbers.threeDigit)].slice(0, 4).map(n => 
                            `<span class="lucky-number">${n}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="lucky-section full-width">
                    <h4>เลขมงคล 6 หลัก (รางวัลที่ 1)</h4>
                    <div class="number-display six-digit">
                        ${[...new Set(luckyNumbers.sixDigit)].slice(0, 5).map(n => 
                            `<span class="lucky-number big">${n}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="lucky-advice">
                <h4>คำแนะนำ</h4>
                <ul>
                    <li>เลขมงคลเหล่านี้คำนวณจากชื่อและวันเกิดของคุณ</li>
                    <li>ผสมผสานกับสถิติการออกรางวัลในอดีต</li>
                    <li>ใช้เป็นแนวทางประกอบการตัดสินใจ</li>
                    <li>โปรดเล่นอย่างมีสติและพอประมาณ</li>
                </ul>
            </div>
        `;
        
        this.luckyResults.innerHTML = html;
    }
}

// Initialize lucky number generator
document.addEventListener('DOMContentLoaded', function() {
    new LuckyNumberGenerator();
});