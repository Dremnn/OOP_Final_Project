// Service này cung cấp các phương thức để làm việc với IndexedDB,
// giúp trừu tượng hóa sự phức tạp của IndexedDB API.
export class DBService {
    static #db;
    static #DB_NAME = 'HighlandsDB';
    static #DB_VERSION = 1;

    /**
     * Khởi tạo và mở kết nối đến IndexedDB.
     * @returns {Promise<IDBDatabase>} - Đối tượng database.
     */
    static initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#DB_NAME, this.#DB_VERSION);

            // Được gọi khi cần nâng cấp schema (tạo object store)
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('orders')) db.createObjectStore('orders', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'username' });
            };
            request.onsuccess = (event) => {
                this.#db = event.target.result;
                resolve(this.#db);
            };
            request.onerror = (event) => reject(event.target.errorCode);
        });
    }

    /**
     * Lấy một object store với mode cho trước ('readonly' hoặc 'readwrite').
     * @param {string} storeName - Tên object store.
     * @param {'readonly' | 'readwrite'} mode - Chế độ transaction.
     * @returns {IDBObjectStore}
     */
    static #getStore(storeName, mode) {
        return this.#db.transaction(storeName, mode).objectStore(storeName);
    }
    
    /**
     * Lưu một mảng dữ liệu vào một object store.
     * @param {string} storeName - Tên object store.
     * @param {Array<Object>} data - Dữ liệu cần lưu.
     */
    static async saveData(storeName, data) {
         return new Promise((resolve, reject) => {
            const store = this.#getStore(storeName, 'readwrite');
            const transaction = store.transaction;
            data.forEach(item => store.put(item));
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }
    
    /**
     * Lấy một record từ object store bằng key.
     * @param {string} storeName - Tên object store.
     * @param {string} key - Key của record.
     */
    static async getData(storeName, key) {
         return new Promise((resolve, reject) => {
            const request = this.#getStore(storeName, 'readonly').get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
    
    /**
     * Lấy tất cả dữ liệu từ một object store.
     * @param {string} storeName - Tên object store.
     */
    static async getAllData(storeName) {
        return new Promise((resolve, reject) => {
            const request = this.#getStore(storeName, 'readonly').getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }
}

