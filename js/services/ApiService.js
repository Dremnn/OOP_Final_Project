// Service này mô phỏng việc gọi API để lấy dữ liệu sản phẩm của Highlands Coffee.
// Dữ liệu và hình ảnh được lấy trực tiếp từ website của Highlands.
const highlandsProducts = [
    { id: 'HL01', name: 'Phin Sữa Đá', price: 35000, desc: 'Hương vị cà phê Việt Nam đích thực, đậm đà và hài hòa.', img: 'https://static.highlandscoffee.com.vn/menu/PHIN_SUA_DA.png' },
    { id: 'HL02', name: 'Trà Sen Vàng', price: 45000, desc: 'Sự kết hợp tinh tế giữa trà Oolong, hạt sen và củ năng.', img: 'https://static.highlandscoffee.com.vn/menu/TRASENVANG.png' },
    { id: 'HL03', name: 'Freeze Trà Xanh', price: 59000, desc: 'Thức uống đá xay mát lạnh với vị trà xanh thơm lừng.', img: 'https://static.highlandscoffee.com.vn/menu/FREEZE-TRA-XANH.png' },
    { id: 'HL04', name: 'Bánh Mì Que Pate', price: 19000, desc: 'Bánh mì giòn rụm cùng nhân pate đậm đà truyền thống.', img: 'https://static.highlandscoffee.com.vn/menu/banhmi.png' },
    { id: 'HL05', name: 'Phindi Hạnh Nhân', price: 45000, desc: 'Cà phê Phindi độc đáo kết hợp cùng sữa hạnh nhân béo ngậy.', img: 'https://static.highlandscoffee.com.vn/menu/PHINDI-HANH-NHAN.png' },
    { id: 'HL06', name: 'Cà Phê Sữa Đá', price: 35000, desc: 'Ly cà phê sữa đá quen thuộc, đánh thức mọi giác quan.', img: 'https://static.highlandscoffee.com.vn/menu/CA-PHE-SUA-DA.png' }
];

export class ApiService {
    // Phương thức tĩnh private để giả lập độ trễ mạng
    static #delay = (ms) => new Promise(res => setTimeout(res, ms));

    /**
     * Lấy danh sách sản phẩm.
     * @returns {Promise<Array<Object>>} - Danh sách sản phẩm.
     */
    static async getProducts() {
        await this.#delay(500); // Chờ 0.5 giây để mô phỏng việc tải
        return highlandsProducts;
    }
}

