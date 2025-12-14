document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 기본값으로 한 번 계산 실행
    calculateWorkingHours(); 
    
    // 버튼 클릭 이벤트 리스너 설정
    document.getElementById('calculateBtn').addEventListener('click', calculateWorkingHours);

    // 입력 필드 변경 시 자동 계산 (UX 개선)
    const inputs = document.querySelectorAll('.input-section input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateWorkingHours);
    });
});

function calculateWorkingHours() {
    // 1. 입력 값 가져오기
    const workDays = parseInt(document.getElementById('workDays').value) || 0; // 주간 근무 일수
    const startTime = parseInt(document.getElementById('dailyStartTime').value) || 0; // 시작 시
    const endTime = parseInt(document.getElementById('dailyEndTime').value) || 0; // 종료 시
    const breakMinutes = parseInt(document.getElementById('dailyBreak').value) || 0; // 일일 휴게 시간 (분)

    // 유효성 검사
    if (workDays < 1 || startTime >= endTime) {
        updateResults(0, 0, false, true); // 유효성 실패 플래그
        return;
    }

    // 2. 일일 근무시간 계산 (분 단위)
    // 하루 총 시간 차이 (분) = (종료 시 - 시작 시) * 60
    const totalDailyMinutes = (endTime - startTime) * 60; 
    
    // 순수 일일 근로 시간 (분) = 총 시간 차이 - 휴게 시간
    let netDailyWorkingMinutes = totalDailyMinutes - breakMinutes;

    // 근무 시간이 음수이거나 0보다 작을 경우 0으로 처리
    if (netDailyWorkingMinutes < 0) {
        netDailyWorkingMinutes = 0;
    }

    // 3. 주간 근무시간 계산
    const weeklyWorkingMinutes = netDailyWorkingMinutes * workDays;
    const weeklyWorkingHours = weeklyWorkingMinutes / 60; // 시간 단위로 변환
    
    // 4. 초과 근무 및 위반 여부 판정
    const standardHours = 40; // 법정 기준 근로시간
    const maxHours = 52; // 주 52시간 상한제
    
    let overtimeHours = 0;
    let isViolation = false;

    if (weeklyWorkingHours > standardHours) {
        overtimeHours = weeklyWorkingHours - standardHours; // 40시간 초과분
    }
    
    if (weeklyWorkingHours > maxHours) {
        isViolation = true; // 52시간 초과 시 위반
    }

    // 5. 결과 업데이트
    updateResults(weeklyWorkingHours, overtimeHours, isViolation, false);
}

// 결과 영역 업데이트 함수
function updateResults(weeklyHours, overtimeHours, isViolation, isValid = false) {
    const weeklyHoursRounded = weeklyHours.toFixed(1);
    const overtimeHoursRounded = overtimeHours.toFixed(1);

    document.getElementById('weeklyHours').textContent = `${weeklyHoursRounded} 시간`;
    document.getElementById('overtimeHours').textContent = `${overtimeHoursRounded} 시간`;

    const statusElement = document.getElementById('complianceStatus');
    const detailElement = document.getElementById('statusDetail');

    if (isValid) {
         statusElement.textContent = '입력 오류';
         statusElement.className = 'status-violation';
         detailElement.innerHTML = `<p class="status-violation">❌ **오류:** 근무 시작 시간은 종료 시간보다 빨라야 하며, 모든 입력값은 유효해야 합니다.</p>`;
         return;
    }

    if (isViolation) {
        statusElement.textContent = '주 52시간 초과 (법 위반)';
        statusElement.className = 'status-violation';
        detailElement.innerHTML = `<p class="status-violation">🚨 **경고:** 주간 근로시간이 ${weeklyHoursRounded}시간으로 법정 상한선 52시간을 초과합니다. 연장 근무 시간을 재조정해야 합니다.</p>`;
    } else if (weeklyHours > 0) {
        statusElement.textContent = '주 52시간 준수';
        statusElement.className = 'status-compliant';
        if (overtimeHours > 0) {
             detailElement.innerHTML = `<p class="status-compliant">✅ **양호:** 법정 연장 근무 허용 시간(12시간) 내에서 근로시간을 준수하고 있습니다. (연장 ${overtimeHoursRounded}시간)</p>`;
        } else {
             detailElement.innerHTML = `<p class="status-compliant">✅ **양호:** 법정 기준 근로시간(40시간) 내에서 준수하고 있습니다.</p>`;
        }
    } else {
        statusElement.textContent = '미확인';
        statusElement.className = '';
        detailElement.innerHTML = `<p>입력값을 기준으로 주간 근로시간을 계산합니다.</p>`;
    }
}