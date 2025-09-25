class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        // Add demo products if none exist
        if (this.products.length === 0) {
            this._addDemoProducts();
        }
    }
    
    _addDemoProducts() {
        const demoProducts = [
            new Product(this._generateId(), 'Cà Phê Đen', 25000, 'https://placehold.co/300x200/634832/FFFFFF?text=Cà+Phê+Đen', 'Cà phê đen đá đậm vị, không đường, dành cho người sành cà phê.'),
            new Product(this._generateId(), 'Cà Phê Sữa', 30000, 'https://placehold.co/300x200/A87D5A/FFFFFF?text=Cà+Phê+Sữa', 'Hương vị cà phê đậm đà hòa quyện cùng vị ngọt béo của sữa đặc.'),
            new Product(this._generateId(), 'Bạc Xỉu', 32000, 'https://placehold.co/300x200/D2B48C/333333?text=Bạc+Xỉu', 'Nhiều sữa hơn cà phê, lựa chọn nhẹ nhàng cho buổi sáng tỉnh táo.'),
            new Product(this._generateId(), 'Trà Đào Cam Sả', 45000, 'https://placehold.co/300x200/FFC300/333333?text=Trà+Đào', 'Trà đào thanh mát kết hợp cùng vị chua nhẹ của cam và hương thơm của sả.'),
            new Product(this._generateId(), 'Trà Vải', 42000, 'https://placehold.co/300x200/FF7F7F/FFFFFF?text=Trà+Vải', 'Hương vị ngọt ngào của trái vải tươi trong nền trà thơm dịu.'),
            new Product(this._generateId(), 'Matcha Latte', 50000, 'https://placehold.co/300x200/88B04B/FFFFFF?text=Matcha', 'Bột matcha Nhật Bản cao cấp hòa quyện cùng sữa tươi tạo nên lớp bọt mịn.')
        ];
        this.products.push(...demoProducts);
        this._saveProducts();
    }

    _saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    _generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    getProducts() {
        return this.products;
    }
    
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    addProduct(name, price, image, description) {
        const id = this._generateId();
        const newProduct = new Product(id, name, parseFloat(price), image, description);
        this.products.push(newProduct);
        this._saveProducts();
        return newProduct;
    }

    updateProduct(id, name, price, image, description) {
        const productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex > -1) {
            this.products[productIndex].name = name;
            this.products[productIndex].price = parseFloat(price);
            this.products[productIndex].image = image;
            this.products[productIndex].description = description;
            this._saveProducts();
            return this.products[productIndex];
        }
        throw new Error('Không tìm thấy sản phẩm.');
    }

    deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        if (this.products.length === initialLength) {
            throw new Error('Không tìm thấy sản phẩm để xóa.');
        }
        this._saveProducts();
    }
}
