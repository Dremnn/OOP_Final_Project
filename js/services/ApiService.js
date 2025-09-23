// Dữ liệu đã được chuẩn hóa tên thuộc tính để khớp với constructor của class
const highlandsData = [
    { id: 'HL01', name: 'Phin Sữa Đá', price: 35000, description: 'Hương vị cà phê Việt Nam đích thực.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/PHIN_SUA_DA.png', type: 'drink', size: 'S, M, L' },
    { id: 'HL02', name: 'Trà Sen Vàng', price: 45000, description: 'Kết hợp trà Oolong, hạt sen, củ năng.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/TRASENVANG.png', type: 'drink', size: 'S, M, L' },
    { id: 'HL03', name: 'Freeze Trà Xanh', price: 59000, description: 'Thức uống đá xay mát lạnh.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/FREEZE-TRA-XANH.png', type: 'drink', size: 'M, L' },
    { id: 'HL04', name: 'Bánh Mì Que Pate', price: 19000, description: 'Bánh mì giòn rụm, pate đậm đà.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/banhmi.png', type: 'food', isVegetarian: false },
    { id: 'HL05', name: 'Bánh Phô Mai Chanh Dây', price: 35000, description: 'Vị chua ngọt hài hoà, béo ngậy.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/banh-pho-mai-chanh-day.png', type: 'food', isVegetarian: true },
    { id: 'HL06', name: 'Cà Phê Sữa Đá', price: 35000, description: 'Ly cà phê sữa đá quen thuộc.', imageUrl: 'https://static.highlandscoffee.com.vn/menu/CA-PHE-SUA-DA.png', type: 'drink', size: 'S, M, L' }
];

export class ApiService {
    static #delay = (ms) => new Promise(res => setTimeout(res, ms));

    static async getProducts() {
        await this.#delay(500);
        return highlandsData;
    }
}

