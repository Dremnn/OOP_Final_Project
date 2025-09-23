export default class Order {
    constructor(id, items, total, date, status = 'Đang xử lý') {
        this.id = id;
        this.items = items;
        this.total = total;
        this.date = date;
        this.status = status;
    }
}
