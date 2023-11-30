class APIFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    filter() {
        // Build Query
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el];
        });

        // Advance filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.mongooseQuery.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        }
        else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        }
        else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    }
    
    paginate() {
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        const skipPages = (page - 1) * limit;
        this.mongooseQuery = this.mongooseQuery.skip(skipPages).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
