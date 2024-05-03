class Features{
     constructor(query, queryStr){
        this.query=query;
        this.queryStr=queryStr;
     }

     search(){
        const keyword=this.queryStr.keyword&&
        {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            },
        };

        // console.log(keyword);
        this.query=this.query.find({...keyword});
        return this;  //returning this class itself
     }

     filter(){
        const queryStrCopy={...this.queryStr};
        // console.log(queryStrCopy);

        //CATEGORY
        //removing these from the querystring 
        const filterQueryCopy=["keyword", "page", "limit"];

        filterQueryCopy.forEach((key)=> delete queryStrCopy[key]);
        // console.log(queryStrCopy);


        //PRICE and RATINGS
        let querystr=JSON.stringify(queryStrCopy);
        querystr=querystr.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`);
        // console.log(queryStr);


        this.query=this.query.find(JSON.parse(querystr));
        // console.log(this.query);
        return this;
     }

     pagination(productsPerPage){
        const currPage=Number(this.queryStr.page) || 1;
        // console.log(this.queryStr);
        const skipProducts= productsPerPage * (currPage-1);

        this.query=this.query.limit(productsPerPage).skip(skipProducts);
        return this;

     }
}
module.exports=Features