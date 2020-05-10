const advancedResults = (model, populate) => async (req, res, next) => {
    //Contains filtering and sorting via the query string
    //ex : ?careers[in]=Data Science&select=name,careers&sort=-name
    let query;
    let reqQuery = { ...req.query }; //Makes a copy of query object 

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop through excluded params and remove them from reqQuery
    //Reminder : objectName.propertyName or objectName["propertyName"]
    removeFields.forEach(param => delete reqQuery[param]);

    //To enable advanced filtering key words such as lte, gte... we have to put a $ :
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(lte|lt|gt|gte|in)\b/g, match => `$${match}`); //in: within list

    //Finding resource
    query = model.find(JSON.parse(queryStr));

    /*The idea here is to first get the whole resource with all filters, and then...
    Select only the fields we need.
    This is done with query.select(name1 name2), but we want to replace " " by "," : */
    if (req.query.select) {
        const fields = req.query.select.replace(/,/g, ' ');
        query.select(fields);
    }

    //Then we allow a custom sorting :
    if (req.query.sort) {
        const sortBy = req.query.sort.replace(/,/g, ' ');
        query.sort(sortBy);
    } else { //Default sorting...
        query.sort('-createdAt');
    }

    if (populate) {
        query = query.populate(populate); //populate with a virtual attribute 
    }

    //Simulate pagination by limiting the number of displayed results
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit //end-start = limit
    const total = await model.countDocuments();

    //and skipping certain results :
    query.skip(startIndex).limit(limit);

    //Executing the query :
    const results = await query;

    let pagination = {};

    if (total > endIndex) {
        pagination = {
            next: page + 1,
            page
        }
    }
    if (startIndex > 1) {
        pagination = {
            prev: page - 1,
            page
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };

    next();
};

module.exports = advancedResults;