const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');

// Danh sách các toán tử cần kiểm tra
const operators = ['+', '-', '*', '/'];

// --- HÀM TÍNH TOÁN AN TOÀN (GIỮ NGUYÊN) ---
function safeCalculate(expression) {
    let tokens = expression.match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
    if (!tokens) return "";

    // Xử lý NHÂN và CHIA
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            let num1 = parseFloat(tokens[i - 1]);
            let num2 = parseFloat(tokens[i + 1]);
            let result;

            if (tokens[i] === '*') result = num1 * num2;
            if (tokens[i] === '/') result = num1 / num2;

            tokens.splice(i - 1, 3, result);
            i--; 
        }
    }

    // Xử lý CỘNG và TRỪ
    let finalResult = parseFloat(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextNum = parseFloat(tokens[i + 1]);

        if (operator === '+') finalResult += nextNum;
        if (operator === '-') finalResult -= nextNum;
    }

    return finalResult;
}

// --- HÀM XỬ LÝ LOGIC CHUNG (Dùng cho cả Chuột và Bàn phím) ---
function handleInput(value, action) {
    const currentContent = display.value;
    const lastChar = currentContent.slice(-1);

    // 1. Xử lý khi nhập số hoặc toán tử
    if (value) {
        // Kiểm tra logic toán tử
        if (operators.includes(value)) {
            // Chặn nhập toán tử đầu tiên (trừ khi muốn xử lý số âm, nhưng ở đây ta chặn đơn giản)
            if (currentContent === '' && (value === '*' || value === '/')) {
                return; 
            }

            // Thay thế toán tử nếu nhập liên tiếp (ví dụ: 5+ rồi bấm - thành 5-)
            if (operators.includes(lastChar)) {
                display.value = currentContent.slice(0, -1) + value;
                return;
            }
        }
        
        // Logic chặn nhiều dấu chấm trong một số (Optional - Tùy chọn thêm để chặt chẽ hơn)
        if (value === '.') {
             // Tách các số ra, lấy số cuối cùng đang nhập để kiểm tra xem đã có dấu chấm chưa
             const parts = currentContent.split(/[+\-*/]/);
             const currentNum = parts[parts.length - 1];
             if (currentNum.includes('.')) return;
        }

        display.value += value;
    }

    // 2. Các chức năng hành động
    if (action === 'clear') {
        display.value = '';
    } 
    else if (action === 'delete') {
        display.value = currentContent.toString().slice(0, -1);
    } 
    else if (action === 'calculate') {
        if (operators.includes(lastChar)) return; // Không tính nếu kết thúc bằng toán tử
        
        try {
            if (currentContent.trim() === "") return;
            // Gọi hàm tính toán an toàn
            const result = safeCalculate(currentContent);
            display.value = result;

            if (String(result).replace(/\./g, '') === '884844') {
                setTimeout(() => display.value = "CHOKEVY", 2000);
            }
        } catch (error) {
            display.value = "Error";
            setTimeout(() => display.value = "", 1500);
        }
    }
}

// --- SỰ KIỆN CLICK CHUỘT ---
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Gọi hàm xử lý chung
        handleInput(btn.dataset.value, btn.dataset.action);
        
        // Bỏ focus khỏi nút để khi bấm Enter không bị kích hoạt lại nút đó
        btn.blur(); 
    });
});

// --- SỰ KIỆN BÀN PHÍM (MỚI) ---
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // 1. Cho phép số (0-9), toán tử (+ - * /) và dấu chấm (.)
    // Regex: /[0-9.]/ kiểm tra số và chấm
    if (/[0-9.]/.test(key) || operators.includes(key)) {
        event.preventDefault(); // Ngăn hành vi mặc định (ví dụ dấu / ở Firefox là tìm kiếm nhanh)
        handleInput(key, undefined);
    }

    // 2. Phím Enter hoặc dấu Bằng (=) để tính toán
    else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Ngăn submit form
        handleInput(undefined, 'calculate');
    }

    // 3. Phím Backspace để xóa 1 ký tự (DE)
    else if (key === 'Backspace') {
        handleInput(undefined, 'delete');
    }

    // 4. Phím Escape (Esc) để xóa hết (AC)
    else if (key === 'Escape') {
        handleInput(undefined, 'clear');
    }
});

// --- SỰ KIỆN DÁN (PASTE) ---
document.addEventListener('paste', (event) => {
    // 1. Ngăn hành vi dán mặc định của trình duyệt (để ta tự xử lý)
    event.preventDefault();

    // 2. Lấy dữ liệu text từ clipboard
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');

    // 3. Kiểm tra tính hợp lệ bằng Regular Expression (Regex)
    // Giải thích Regex /^[0-9+\-*/.]+$/:
    // ^         : Bắt đầu chuỗi
    // [ ... ]   : Chỉ cho phép các ký tự nằm trong ngoặc này
    // 0-9       : Các số từ 0 đến 9
    // + \- * /  : Các toán tử (dấu trừ cần thêm \ phía trước)
    // .         : Dấu chấm
    // +         : Ít nhất 1 ký tự trở lên
    // $         : Kết thúc chuỗi
    
    const isValid = /^[0-9+\-*/.]+$/.test(pasteData);

    // 4. Xử lý hiển thị
    if (isValid) {
        // Nếu chuỗi hoàn toàn sạch (chỉ chứa số và toán tử), nối vào màn hình
        display.value += pasteData;
    } else {
        // Nếu chứa bất kỳ ký tự nào khác (chữ cái, @, #, dấu cách...), KHÔNG làm gì cả
        console.warn("Nội dung dán chứa ký tự không hợp lệ:", pasteData);
    }
});