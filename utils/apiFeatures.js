class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {
            // nothing just empty result.
        }

        this.query = this.query.find({...keyword})
        return this;
    }

    filter(){
        const queryCopy = { ...this.queryStr }

        const removeList = ['keyword', 'limit', 'page']
        removeList.forEach(element => delete queryCopy[element]);

        // console.log(queryCopy);

        let queryStr = JSON.stringify(queryCopy);
        // console.log(queryStr);
        
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        
        // this.query = this.query.find(queryCopy);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage){
        const current = Number(this.query.page) || 1;
        const skip = resPerPage * (current - 1);

        this.query = this.query.limit(resPerPage).skip(skip)
        return this
    }
}

module.exports = APIFeatures;