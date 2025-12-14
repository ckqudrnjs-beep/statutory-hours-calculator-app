document.getElementById('calculateBtn').addEventListener('click', calculateLaborHours);

function calculateLaborHours() {
    // 1. 입력값 가져오기
    const baseWage = parseFloat(document.getElementById('baseWage').value) || 0;
    const weekdayHours = parseFloat(document.getElementById('weekdayHours').value) || 0; // 주 40시간 내 평일 주간 근로
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0; // 연장 근로
    const nightHours = parseFloat(document.getElementById('nightHours').value) || 0; // 야간 근로
    const holidayHours = parseFloat(document.getElementById('holidayHours').value) || 0; // 휴일 근로

    // 2. 총 근로 시간 계산 (52시간 준수 여부 판단용)
    // 주 52시간 계산 시, 휴일 근로도 포함됨 (단, 휴일 근로의 경우 1주 12시간 연장 한도에는 미포함됨을 주의해야 함. 여기서는 단순 총 합산만)
    const totalWorkingHours = weekdayHours + overtimeHours + nightHours + holidayHours;

    // 3. 수당 계산 (할증률 반영)
    let totalPay = 0;

    // 3-1. 주간 기본 수당 (평일 40시간 내)
    totalPay += weekdayHours * baseWage;

    // 3-2. 연장 근로 수당 (1.5배: 기본 1배 + 가산 0.5배)
    // 연장, 야간, 휴일은 모두 '가산 수당'이 붙으므로, 기본 시급에 할증률을 곱하여 계산
    totalPay += overtimeHours * baseWage * 1.5;

    // 3-3. 야간 근로 수당 (1.5배: 기본 1배 + 야간 가산 0.5배)
    // 연장 야간 중복 시 2.0배가 될 수 있으나, 여기서는 단순 야간 할증만 반영
    totalPay += nightHours * baseWage * 1.5;

    // 3-4. 휴일 근로 수당 (1.5배 또는 2.0배 - 여기서는 8시간 이하 1.5배로 가정)
    // 8시간 초과 시 2.0배이지만, 계산 단순화를 위해 1.5배로 통일
    totalPay += holidayHours * baseWage * 1.5;

    // 🚨 4. 주휴수당 계산 (Weekly Holiday Pay - 추가된 로직) 🚨
    let weeklyHolidayPay = 0;
    
    // 주휴수당 조건: 주 15시간 이상 근무 시 비례하여 지급
    if (weekdayHours >= 15) {
        // 주휴수당은 '주 40시간'을 기준으로 8시간을 지급함.
        // 주 40시간 미만 근무 시, (실제 근로시간 / 40) * 8시간으로 비례 계산.
        const effectiveHours = Math.min(40, weekdayHours); // 주 40시간 이상 근무해도 40시간까지만 반영
        const proportionalHours = (effectiveHours / 40) * 8; 
        weeklyHolidayPay = proportionalHours * baseWage;
        totalPay += weeklyHolidayPay;
    }
    
    // 5. 52시간 준수 여부 확인
    let complianceStatus = '';
    if (totalWorkingHours > 52) {
        complianceStatus = `<span class="status-violation">52시간 초과 (총 ${totalWorkingHours}시간)</span>`;
    } else {
        complianceStatus = `<span class="status-compliant">52시간 준수 (총 ${totalWorkingHours}시간)</span>`;
    }

    // 6. 결과 출력
    document.getElementById('totalHours').textContent = totalWorkingHours.toFixed(1) + ' 시간';
    document.getElementById('complianceStatus').innerHTML = complianceStatus;
    
    // 💰 주휴수당 포함 최종 수당 표시
    document.getElementById('totalPay').textContent = formatCurrency(totalPay) + ' 원';
}

function formatCurrency(amount) {
    return amount.toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
