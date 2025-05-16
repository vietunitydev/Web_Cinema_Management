// Class hỗ trợ các tính năng API như filtering, sorting, pagination
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Lọc theo các trường
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        if (queryObj.title) {
            queryObj.title = { $regex: queryObj.title, $options: 'i' };
        }

        Object.keys(queryObj).forEach(key => {
            if (queryObj[key] === '') {
                delete queryObj[key];
            }
        });

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        this.queryObj = queryObj;

        return this;
    }

    // Sắp xếp kết quả
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Mặc định sắp xếp theo thời gian tạo mới nhất
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    // Giới hạn các trường trả về
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Mặc định loại bỏ trường __v
            this.query = this.query.select('-__v');
        }

        return this;
    }

    // Phân trang
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;